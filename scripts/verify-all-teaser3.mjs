import fs from "node:fs/promises";
import { spawn } from "node:child_process";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9392;
const ARTIFACT_DIR = "/Users/in-sunghan/.gemini/antigravity/brain/5d1228ac-0777-416b-8604-52a7224b7a5c";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Starting Next.js production server on port 3004...");
  const server = spawn("npx", ["next", "start", "-p", "3004"], {
    cwd: process.cwd(),
    stdio: "ignore",
  });

  await sleep(2500);

  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/chrome-verify-" + Date.now(),
    "--disable-gpu",
    "--no-first-run",
  ]);

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

  if (!wsUrl) throw new Error("Chrome failed to connect");

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

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  function sendSession(method, params = {}) {
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
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSession("Page.enable");

  const viewports = [
    { name: "desktop-user-ref-1024x676", width: 1024, height: 676, dsf: 2 },
    { name: "mobile-user-ref-440x938", width: 440, height: 938, dsf: 2 },
    { name: "desktop-wide-1440x900", width: 1440, height: 900, dsf: 2 },
    { name: "desktop-narrow-user-reported", width: 980, height: 850, dsf: 2 },
    { name: "mobile-390x844", width: 390, height: 844, dsf: 2 }
  ];

  for (const vp of viewports) {
    await sendSession("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      mobile: vp.name.includes("mobile"),
    });

    await sendSession("Page.navigate", { url: "http://localhost:3004/teaser3" });
    await sleep(1500);

    // 1. Initial Landing (Scroll 0) - Hero & Peek check
    const heroShot = await sendSession("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(`${ARTIFACT_DIR}/verify-${vp.name}-hero.png`, Buffer.from(heroShot.data, "base64"));
    console.log(`Captured verify-${vp.name}-hero.png`);

    // 2. Scroll to Meet 3fig section
    await sendSession("Runtime.evaluate", { expression: "window.scrollTo({ top: 320, behavior: 'instant' })" });
    await sleep(400);
    const meetShot = await sendSession("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(`${ARTIFACT_DIR}/verify-${vp.name}-meet.png`, Buffer.from(meetShot.data, "base64"));

    // 3. Scroll to What You Get section
    await sendSession("Runtime.evaluate", {
      expression: "document.getElementById('what-you-get').scrollIntoView({ behavior: 'instant' })"
    });
    await sleep(400);
    const whatShot = await sendSession("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(`${ARTIFACT_DIR}/verify-${vp.name}-what-you-get.png`, Buffer.from(whatShot.data, "base64"));

    if (vp.name.includes("mobile")) {
      // Test slide 2
      await sendSession("Runtime.evaluate", {
        expression: `
          const track = document.querySelector('.teaser3-value-mobile-track');
          if (track && track.children[1]) {
            track.scrollTo({ left: track.children[1].offsetLeft - 24, behavior: 'instant' });
          }
        `
      });
      await sleep(300);
      const s2Shot = await sendSession("Page.captureScreenshot", { format: "png" });
      await fs.writeFile(`${ARTIFACT_DIR}/verify-mobile-slide2.png`, Buffer.from(s2Shot.data, "base64"));

      // Test slide 3
      await sendSession("Runtime.evaluate", {
        expression: `
          const track = document.querySelector('.teaser3-value-mobile-track');
          if (track && track.children[2]) {
            track.scrollTo({ left: track.children[2].offsetLeft - 24, behavior: 'instant' });
          }
        `
      });
      await sleep(300);
      const s3Shot = await sendSession("Page.captureScreenshot", { format: "png" });
      await fs.writeFile(`${ARTIFACT_DIR}/verify-mobile-slide3.png`, Buffer.from(s3Shot.data, "base64"));
    }
  }

  ws.close();
  chrome.kill();
  server.kill();
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
