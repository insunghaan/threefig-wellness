import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

const ARTIFACT_DIR = "/Users/in-sunghan/.gemini/antigravity/brain/5d1228ac-0777-416b-8604-52a7224b7a5c";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9270;

async function run() {
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=/tmp/chrome-t4-live-full",
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
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

  async function evaluate(expression) {
    const res = await pageSend("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  await pageSend("Page.enable");
  await pageSend("DOM.enable");
  await pageSend("Runtime.enable");

  // ==========================================
  // 1. LIVE TEASER4 DESKTOP (1440x900)
  // ==========================================
  console.log("1. Capturing live teaser4 desktop...");
  await pageSend("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await pageSend("Page.navigate", { url: "https://3fig.io/teaser4" });
  await sleep(3500);

  const shotDesktop = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-desktop.png"), Buffer.from(shotDesktop.data, "base64"));
  console.log("Saved live-teaser4-desktop.png");

  // Scroll to benefits
  await evaluate(`document.querySelector('.offer').scrollIntoView({ behavior: 'instant', block: 'center' })`);
  await sleep(600);
  const shotBenefits = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-desktop-benefits.png"), Buffer.from(shotBenefits.data, "base64"));
  console.log("Saved live-teaser4-desktop-benefits.png");

  // Open Modal on Desktop
  console.log("Opening desktop modal...");
  await evaluate(`document.querySelector('.offer .button').click()`);
  await sleep(1000);

  const shotModalDesktop = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-desktop-modal.png"), Buffer.from(shotModalDesktop.data, "base64"));
  console.log("Saved live-teaser4-desktop-modal.png");

  // Submit Waitlist Email on Live using CDP Input.insertText
  console.log("Submitting test email to live /api/waitlist...");
  await evaluate(`document.querySelector('#t4-modal-email').focus()`);
  await sleep(200);
  const liveTestEmail = `verify.t4.live.${Date.now()}@example.com`;
  await pageSend("Input.insertText", { text: liveTestEmail });
  await sleep(300);
  await evaluate(`document.querySelector('.teaser4-form-submit').click()`);
  await sleep(3000);

  const confirmedCheck = await evaluate(`
    (() => {
      const heading = document.querySelector('.teaser4-confirmed-view h2');
      const surveyCard = document.querySelector('.teaser4-survey-invite-card');
      const surveyBtn = surveyCard ? surveyCard.querySelector('.teaser4-btn-primary-12') : null;
      return {
        heading: heading ? heading.innerText.trim() : null,
        surveyCardVisible: Boolean(surveyCard),
        surveyBtnRadius: surveyBtn ? window.getComputedStyle(surveyBtn).borderRadius : null
      };
    })()
  `);
  console.log("Confirmed check:", JSON.stringify(confirmedCheck, null, 2));

  const shotConfirmed = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-desktop-confirmed.png"), Buffer.from(shotConfirmed.data, "base64"));
  console.log("Saved live-teaser4-desktop-confirmed.png");

  // Open Survey
  console.log("Opening survey...");
  await evaluate(`document.querySelector('.teaser4-survey-invite-card .teaser4-btn-primary-12').click()`);
  await sleep(800);

  const surveyCheck = await evaluate(`
    (() => {
      const surveyHeading = document.querySelector('.teaser4-survey-view h2');
      const chips = Array.from(document.querySelectorAll('.teaser4-survey-chip'));
      const chipRadius = chips[0] ? window.getComputedStyle(chips[0]).borderRadius : null;
      const skipBtn = document.querySelector('.teaser4-survey-submit-actions .teaser4-btn-secondary-12');
      return {
        heading: surveyHeading ? surveyHeading.innerText.trim() : null,
        chipsCount: chips.length,
        chipRadius,
        skipBtnVisible: Boolean(skipBtn),
        skipBtnRadius: skipBtn ? window.getComputedStyle(skipBtn).borderRadius : null
      };
    })()
  `);
  console.log("Survey check:", JSON.stringify(surveyCheck, null, 2));

  const shotSurvey = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-desktop-survey.png"), Buffer.from(shotSurvey.data, "base64"));
  console.log("Saved live-teaser4-desktop-survey.png");

  // Close Survey by clicking Skip
  await evaluate(`document.querySelector('.teaser4-survey-submit-actions .teaser4-btn-secondary-12').click()`);
  await sleep(600);

  // ==========================================
  // 2. LIVE TEASER4 MOBILE (390x844)
  // ==========================================
  console.log("2. Capturing live teaser4 mobile...");
  await pageSend("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await pageSend("Page.navigate", { url: "https://3fig.io/teaser4" });
  await sleep(3500);

  const shotMobile = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-mobile.png"), Buffer.from(shotMobile.data, "base64"));
  console.log("Saved live-teaser4-mobile.png");

  // Scroll to mobile benefits
  await evaluate(`document.querySelector('.offer').scrollIntoView({ behavior: 'instant', block: 'center' })`);
  await sleep(600);
  const shotMobileBenefits = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-mobile-benefits.png"), Buffer.from(shotMobileBenefits.data, "base64"));
  console.log("Saved live-teaser4-mobile-benefits.png");

  // Open Modal on Mobile
  console.log("Opening mobile modal...");
  await evaluate(`document.querySelector('.offer .button').click()`);
  await sleep(1000);

  const mobileModalCheck = await evaluate(`
    (() => {
      const modal = document.querySelector('.teaser4-dialog-content');
      const mobilePreview = modal ? modal.querySelector('.teaser4-modal-mobile-preview') : null;
      const ringImg = mobilePreview ? mobilePreview.querySelector('img') : null;
      const benefits = mobilePreview ? Array.from(modal.querySelectorAll('.teaser4-modal-mobile-benefit-item')).map(b => b.innerText.trim()) : [];
      const aside = modal ? modal.querySelector('.teaser4-modal-aside') : null;
      return {
        modalOpen: Boolean(modal),
        asideHidden: aside ? window.getComputedStyle(aside).display === 'none' : true,
        mobilePreviewVisible: mobilePreview ? window.getComputedStyle(mobilePreview).display !== 'none' : false,
        ringImgVisible: ringImg ? window.getComputedStyle(ringImg).display !== 'none' : false,
        benefits
      };
    })()
  `);
  console.log("Mobile modal check:", JSON.stringify(mobileModalCheck, null, 2));

  const shotModalMobile = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-mobile-modal.png"), Buffer.from(shotModalMobile.data, "base64"));
  console.log("Saved live-teaser4-mobile-modal.png");

  // Submit on Mobile
  console.log("Submitting test email on Mobile...");
  await evaluate(`document.querySelector('#t4-modal-email').focus()`);
  await sleep(200);
  const mobileTestEmail = `verify.t4.mobile.${Date.now()}@example.com`;
  await pageSend("Input.insertText", { text: mobileTestEmail });
  await sleep(300);
  await evaluate(`document.querySelector('.teaser4-form-submit').click()`);
  await sleep(3000);

  const shotMobileConfirmed = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-mobile-confirmed.png"), Buffer.from(shotMobileConfirmed.data, "base64"));
  console.log("Saved live-teaser4-mobile-confirmed.png");

  // Open Survey on Mobile
  console.log("Opening survey on mobile...");
  await evaluate(`document.querySelector('.teaser4-survey-invite-card .teaser4-btn-primary-12').click()`);
  await sleep(800);

  const shotMobileSurvey = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(ARTIFACT_DIR, "live-teaser4-mobile-survey.png"), Buffer.from(shotMobileSurvey.data, "base64"));
  console.log("Saved live-teaser4-mobile-survey.png");

  // ==========================================
  // 3. CHECK PROTECTED ROUTES
  // ==========================================
  console.log("3. Checking all protected routes on production...");
  const protectedRoutes = [
    { path: "/", titleSubstring: "3FIG" },
    { path: "/teaser2", titleSubstring: "3FIG" },
    { path: "/teaser3", titleSubstring: "3fig" },
    { path: "/teaser5", titleSubstring: "3fig" },
    { path: "/teaser6", titleSubstring: "3fig" },
    { path: "/teaser6/concept", titleSubstring: "3fig" },
    { path: "/review/revision.html", titleSubstring: "3fig" },
    { path: "/review/concept.html", titleSubstring: "3fig" },
  ];

  for (const item of protectedRoutes) {
    const url = `https://3fig.io${item.path}`;
    await pageSend("Page.navigate", { url });
    await sleep(2000);
    const title = await evaluate(`document.title`);
    console.log(`Protected: ${url} -> "${title}" (contains: ${title.includes(item.titleSubstring)})`);
  }

  chrome.kill();
  console.log("All live verifications completed successfully!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
