import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9260;
const ARTIFACT_DIR = "/Users/in-sunghan/.gemini/antigravity/brain/5d1228ac-0777-416b-8604-52a7224b7a5c";

const chrome = spawn(CHROME_PATH, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/chrome-t4-baseline-" + Date.now(),
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

  const routes = [
    { name: "baseline-home-desktop", url: "http://localhost:3000/", width: 1440, height: 900 },
    { name: "baseline-teaser2-desktop", url: "http://localhost:3000/teaser2", width: 1440, height: 900 },
    { name: "baseline-teaser3-desktop", url: "http://localhost:3000/teaser3", width: 1440, height: 900 },
    { name: "baseline-teaser5-desktop", url: "http://localhost:3000/teaser5", width: 1440, height: 900 },
    { name: "baseline-teaser6-desktop", url: "http://localhost:3000/teaser6", width: 1440, height: 900 },
    { name: "baseline-teaser6-concept-desktop", url: "http://localhost:3000/teaser6/concept", width: 1440, height: 900 },
    { name: "baseline-review-revision-desktop", url: "https://3fig.io/review/revision.html", width: 1440, height: 900 },
    { name: "baseline-review-revision-mobile", url: "https://3fig.io/review/revision.html", width: 390, height: 844 },
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.name} from ${r.url}...`);
    await pageSend("Emulation.setDeviceMetricsOverride", {
      width: r.width,
      height: r.height,
      deviceScaleFactor: 2,
      mobile: r.width < 768,
    });
    await pageSend("Page.navigate", { url: r.url });
    await sleep(1500);

    const { data } = await pageSend("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(data, "base64");
    const outPath = path.join(ARTIFACT_DIR, `${r.name}.png`);
    await fs.writeFile(outPath, buffer);
    console.log(`Saved ${outPath}`);
  }

  chrome.kill();
  console.log("Baselines captured successfully!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
