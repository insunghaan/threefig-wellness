import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9255;
const ARTIFACT_DIR = "/Users/in-sunghan/.gemini/antigravity/brain/5d1228ac-0777-416b-8604-52a7224b7a5c";

const chrome = spawn(CHROME_PATH, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/chrome-t6-verify-" + Date.now(),
  "--disable-gpu",
  "--no-first-run",
]);

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
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

  if (!wsUrl) {
    console.error("Chrome debugging port failed");
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      const handler = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === id) {
          ws.removeEventListener("message", handler);
          resolve(d.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const target = await send("Target.createTarget", { url: "about:blank" });
  const pageWs = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${target.targetId}`);
  await new Promise((r) => (pageWs.onopen = r));

  function pageSend(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++msgId;
      const handler = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === id) {
          pageWs.removeEventListener("message", handler);
          resolve(d.result);
        }
      };
      pageWs.addEventListener("message", handler);
      pageWs.send(JSON.stringify({ id, method, params }));
    });
  }

  await pageSend("Page.enable");
  await pageSend("Network.enable");

  const routes = [
    { name: "teaser6-rev", path: "/teaser6" },
    { name: "teaser6-concept", path: "/teaser6/concept" },
    { name: "verify-protected-home", path: "/" },
    { name: "verify-protected-teaser2", path: "/teaser2" },
    { name: "verify-protected-teaser3", path: "/teaser3" },
    { name: "verify-protected-teaser4", path: "/teaser4" },
    { name: "verify-protected-teaser5", path: "/teaser5" },
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.name} desktop...`);
    await pageSend("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await pageSend("Page.navigate", { url: `http://127.0.0.1:3000${r.path}` });
    await sleep(1800);
    const deskShot = await pageSend("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      path.join(ARTIFACT_DIR, `${r.name}-desktop.png`),
      Buffer.from(deskShot.data, "base64")
    );

    console.log(`Capturing ${r.name} mobile...`);
    await pageSend("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });
    await pageSend("Page.navigate", { url: `http://127.0.0.1:3000${r.path}` });
    await sleep(1800);
    const mobShot = await pageSend("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(
      path.join(ARTIFACT_DIR, `${r.name}-mobile.png`),
      Buffer.from(mobShot.data, "base64")
    );
  }

  // Interactive checks: Font switching on Teaser6
  console.log("Checking Font switching & modal on Teaser6...");
  await pageSend("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await pageSend("Page.navigate", { url: "http://127.0.0.1:3000/teaser6" });
  await sleep(1800);

  // Switch to Geist Sans
  await pageSend("Runtime.evaluate", {
    expression: `
      const geistBtn = document.querySelector('[data-t6-font-select="geist"]');
      if (geistBtn) geistBtn.click();
    `
  });
  await sleep(600);
  const geistShot = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(
    path.join(ARTIFACT_DIR, "teaser6-font-geist-desktop.png"),
    Buffer.from(geistShot.data, "base64")
  );

  // Switch to Sora
  await pageSend("Runtime.evaluate", {
    expression: `
      const soraBtn = document.querySelector('[data-t6-font-select="sora"]');
      if (soraBtn) soraBtn.click();
    `
  });
  await sleep(600);
  const soraShot = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(
    path.join(ARTIFACT_DIR, "teaser6-font-sora-desktop.png"),
    Buffer.from(soraShot.data, "base64")
  );

  // Open Waitlist Dialog on Teaser6
  await pageSend("Runtime.evaluate", {
    expression: `
      const btn = document.querySelector('.teaser6-desktop-btn');
      if (btn) btn.click();
    `
  });
  await sleep(800);
  const modalShot = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(
    path.join(ARTIFACT_DIR, "teaser6-waitlist-modal-desktop.png"),
    Buffer.from(modalShot.data, "base64")
  );

  // Teaser6 Concept modal check
  console.log("Checking modal on Teaser6 Concept...");
  await pageSend("Page.navigate", { url: "http://127.0.0.1:3000/teaser6/concept" });
  await sleep(1800);
  await pageSend("Runtime.evaluate", {
    expression: `
      const navCta = document.querySelector('.t6c-nav-cta');
      if (navCta) navCta.click();
    `
  });
  await sleep(800);
  const conceptModalShot = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(
    path.join(ARTIFACT_DIR, "teaser6-concept-modal-desktop.png"),
    Buffer.from(conceptModalShot.data, "base64")
  );

  chrome.kill();
  console.log("Verification finished successfully!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
