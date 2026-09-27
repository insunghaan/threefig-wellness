import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9260;
const USER_DATA_DIR = "/tmp/chrome-baseline-qa-" + Date.now();
const OUTPUT_DIR = path.join(process.cwd(), "scratch", "baseline-screenshots");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--no-sandbox",
    "--disable-gpu",
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        if (res.ok) {
          const json = await res.json();
          wsUrl = json.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
      await sleep(100);
    }

    if (!wsUrl) throw new Error("No CDP connection found");

    let msgId = 0;
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const pending = new Map();
    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++msgId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const target = await send("Target.createTarget", { url: "about:blank" });
    const pageWs = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${target.targetId}`);
    await new Promise((res, rej) => {
      pageWs.onopen = res;
      pageWs.onerror = rej;
    });

    const pagePending = new Map();
    pageWs.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && pagePending.has(data.id)) {
        const { resolve, reject } = pagePending.get(data.id);
        pagePending.delete(data.id);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      }
    };

    function pageSend(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++msgId;
        pagePending.set(id, { resolve, reject });
        pageWs.send(JSON.stringify({ id, method, params }));
      });
    }

    await pageSend("Page.enable");
    await pageSend("DOM.enable");
    await pageSend("Runtime.enable");

    async function setViewport(width, height, isMobile = false) {
      await pageSend("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: isMobile,
      });
      if (isMobile) {
        await pageSend("Emulation.setUserAgentOverride", {
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        });
      } else {
        await pageSend("Emulation.setUserAgentOverride", {
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });
      }
    }

    async function capture(filename) {
      await pageSend("Runtime.evaluate", {
        expression: `
          const badge = document.querySelector("nextjs-portal");
          if (badge) badge.style.display = "none";
          const toast = document.querySelector("[data-nextjs-toast]");
          if (toast) toast.style.display = "none";
        `,
      });
      const { data } = await pageSend("Page.captureScreenshot", {
        format: "png",
      });
      const filePath = path.join(OUTPUT_DIR, filename);
      await fs.writeFile(filePath, Buffer.from(data, "base64"));
      console.log(`Captured: ${filename}`);
    }

    const testPages = [
      { name: "main_root", path: "/" },
      { name: "teaser2", path: "/teaser2" },
      { name: "teaser3", path: "/teaser3" },
    ];

    for (const p of testPages) {
      // Desktop
      await setViewport(1440, 900, false);
      await pageSend("Page.navigate", { url: `http://localhost:3000${p.path}` });
      await sleep(1800);
      await capture(`baseline_${p.name}_desktop_1440.png`);

      // Mobile
      await setViewport(390, 844, true);
      await pageSend("Page.navigate", { url: `http://localhost:3000${p.path}` });
      await sleep(1800);
      await capture(`baseline_${p.name}_mobile_390.png`);
    }

    console.log("Baseline capture complete!");
  } finally {
    chrome.kill("SIGKILL");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
