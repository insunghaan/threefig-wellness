import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9255;
const SCREENSHOT_DIR = path.resolve("scratch/dialog-screenshots");

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

const chrome = spawn(CHROME_PATH, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/chrome-test-" + Date.now(),
  "--disable-gpu",
  "--no-first-run",
]);

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("Connecting to Headless Chrome...");
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
    throw new Error("Failed to connect to Chrome remote debugging port.");
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
  await pageSend("DOM.enable");
  await pageSend("Runtime.enable");

  console.log("\n--- TEST 1: EMAIL DRAFT PRESERVATION & EXIT OFFER FLOW ---");
  await pageSend("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await pageSend("Page.navigate", { url: "http://localhost:3000/teaser3" });
  await sleep(1500);

  // Open dialog via mobile button
  await pageSend("Runtime.evaluate", {
    expression: `
      sessionStorage.removeItem("t3_exit_shown");
      document.querySelector(".teaser3-mobile-btn").click();
    `,
  });
  await sleep(400);

  // Type partial email
  const typedEmail = "partial-user@domain";
  await pageSend("Runtime.evaluate", {
    expression: `
      const input = document.getElementById("t3-waitlist-email");
      input.focus();
      // Use native input setter so React state updates
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeSetter.call(input, "${typedEmail}");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    `,
  });
  await sleep(200);

  // Trigger exit offer by clicking close button (X)
  await pageSend("Runtime.evaluate", {
    expression: `document.querySelector(".teaser3-dialog-close").click();`,
  });
  await sleep(400);

  const exitOfferResult = await pageSend("Runtime.evaluate", {
    expression: `
      JSON.stringify({
        hasExitTitle: Boolean(document.querySelector(".teaser3-dialog-title")?.textContent.includes("Start with 20% off")),
        hasClaimButton: Boolean(document.querySelector(".teaser3-dialog-btn-primary")?.textContent.includes("Claim my offer"))
      })
    `,
  });
  console.log("Exit offer view reached:", exitOfferResult.result.value);

  // Click "Claim my offer"
  await pageSend("Runtime.evaluate", {
    expression: `
      const btn = Array.from(document.querySelectorAll(".teaser3-dialog-btn-primary")).find(b => b.textContent.includes("Claim my offer"));
      btn?.click();
    `,
  });
  await sleep(400);

  // Verify email input retains typedEmail and condition mentions 20% discount
  const draftSurviveResult = await pageSend("Runtime.evaluate", {
    expression: `
      JSON.stringify({
        retainedEmail: document.getElementById("t3-waitlist-email")?.value,
        isEmailFocused: document.activeElement === document.getElementById("t3-waitlist-email"),
        conditionText: document.querySelector(".teaser3-dialog-condition p")?.textContent
      })
    `,
  });
  console.log("After 'Claim my offer':", draftSurviveResult.result.value);

  // Capture screenshot of signup with retained draft
  const draftShot = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(SCREENSHOT_DIR, "verify_draft_retained_390x844.png"), Buffer.from(draftShot.data, "base64"));

  console.log("\n--- TEST 2: DISMISS & REOPEN DURING SAME VISIT ---");
  // Close the dialog completely via close button (sessionStorage already has t3_exit_shown = 1)
  await pageSend("Runtime.evaluate", {
    expression: `document.querySelector(".teaser3-dialog-close").click();`,
  });
  await sleep(400);

  // Reopen via mobile button
  await pageSend("Runtime.evaluate", {
    expression: `document.querySelector(".teaser3-mobile-btn").click();`,
  });
  await sleep(400);

  const reopenResult = await pageSend("Runtime.evaluate", {
    expression: `
      JSON.stringify({
        emailAfterReopen: document.getElementById("t3-waitlist-email")?.value
      })
    `,
  });
  console.log("After dismissing & reopening dialog:", reopenResult.result.value);

  console.log("\n--- TEST 3: SAFE-AREA PADDING SINGLE APPLICATION ---");
  const paddingResult = await pageSend("Runtime.evaluate", {
    expression: `
      (() => {
        const content = document.querySelector(".teaser3-dialog-content");
        const inner = document.querySelector(".teaser3-dialog-inner");
        const csContent = window.getComputedStyle(content);
        const csInner = window.getComputedStyle(inner);
        return JSON.stringify({
          contentPaddingBottom: csContent.paddingBottom,
          innerPaddingBottom: csInner.paddingBottom
        });
      })()
    `,
  });
  console.log("Bottom padding breakdown:", paddingResult.result.value);

  console.log("\n--- TEST 4: FOCUS RESTORATION AFTER FINAL DISMISSAL ---");
  // Dismiss dialog
  await pageSend("Runtime.evaluate", {
    expression: `document.querySelector(".teaser3-dialog-close").click();`,
  });
  await sleep(400);

  const focusResult = await pageSend("Runtime.evaluate", {
    expression: `
      JSON.stringify({
        activeElementTag: document.activeElement?.tagName,
        activeElementClass: document.activeElement?.className,
        isMobileBtn: document.activeElement === document.querySelector(".teaser3-mobile-btn"),
        isDockInteractive: !document.querySelector(".teaser3-mobile-dock").classList.contains("is-hidden")
      })
    `,
  });
  console.log("Focus after final dismissal:", focusResult.result.value);

  console.log("\n--- TEST 5: SCROLL-DISCOVERY CUE CONTRACT & VISIBILITY ---");
  // Check default state: no next section in teaser3 -> cue must remain hidden
  const defaultCueState = await pageSend("Runtime.evaluate", {
    expression: `
      JSON.stringify({
        cueInDOM: Boolean(document.querySelector(".teaser3-scroll-cue")),
        hasDestination: Boolean(document.getElementById("teaser3-content") || document.querySelector("[data-scroll-destination]"))
      })
    `,
  });
  console.log("Default cue state (pending next section):", defaultCueState.result.value);

  // Now simulate future next section presence via developer contract
  await pageSend("Runtime.evaluate", {
    expression: `
      // Add destination section to fulfill contract
      const nextSec = document.createElement("section");
      nextSec.id = "teaser3-content";
      nextSec.setAttribute("data-scroll-destination", "teaser3-content");
      nextSec.style.height = "500px";
      nextSec.style.background = "#faf8f5";
      nextSec.innerHTML = "<h2 style='padding: 40px;'>Next Section Content</h2>";
      document.body.appendChild(nextSec);
    `,
  });
  await sleep(400);

  const contractFulfilledState = await pageSend("Runtime.evaluate", {
    expression: `
      (() => {
        const cue = document.querySelector(".teaser3-scroll-cue");
        return JSON.stringify({
          cueFound: Boolean(cue),
          cueText: cue?.textContent?.trim(),
          hasArrow: Boolean(cue?.querySelector(".teaser3-scroll-cue-arrow")),
          arrowAnimation: window.getComputedStyle(cue?.querySelector(".teaser3-scroll-cue-arrow") || document.body).animationName
        });
      })()
    `,
  });
  console.log("Cue state with next section present:", contractFulfilledState.result.value);

  // Capture screenshot of mobile with cue visible
  const mobileCueShot = await pageSend("Page.captureScreenshot", { format: "png" });
  await fs.writeFile(path.join(SCREENSHOT_DIR, "verify_mobile_cue_390x844.png"), Buffer.from(mobileCueShot.data, "base64"));

  // Test 24px scroll hides cue
  await pageSend("Runtime.evaluate", {
    expression: `window.scrollTo({ top: 40 });`,
  });
  await sleep(300);

  const scrolledState = await pageSend("Runtime.evaluate", {
    expression: `
      (() => {
        const wrap = document.querySelector(".teaser3-mobile-cue-wrap");
        return JSON.stringify({
          isWrapHidden: wrap?.classList.contains("is-hidden")
        });
      })()
    `,
  });
  console.log("Cue state after 40px scroll:", scrolledState.result.value);

  // Scroll back to top: must REMAIN hidden
  await pageSend("Runtime.evaluate", {
    expression: `window.scrollTo({ top: 0 });`,
  });
  await sleep(300);

  const scrolledBackState = await pageSend("Runtime.evaluate", {
    expression: `
      (() => {
        const wrap = document.querySelector(".teaser3-mobile-cue-wrap");
        return JSON.stringify({
          isWrapHiddenAfterScrollBack: wrap?.classList.contains("is-hidden")
        });
      })()
    `,
  });
  console.log("Cue state after scrolling back up:", scrolledBackState.result.value);

  console.log("\n--- TEST 6: MULTI-VIEWPORT VERIFICATION ---");
  const viewports = [
    { name: "360x640", width: 360, height: 640, mobile: true },
    { name: "390x667", width: 390, height: 667, mobile: true },
    { name: "390x844", width: 390, height: 844, mobile: true },
    { name: "390x932", width: 390, height: 932, mobile: true },
    { name: "1440x900", width: 1440, height: 900, mobile: false },
  ];

  for (const vp of viewports) {
    await pageSend("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.mobile,
    });
    // Navigate fresh with preview_cue=1 so we can inspect both dialog and cue on each viewport
    await pageSend("Page.navigate", { url: "http://localhost:3000/teaser3?preview_cue=1" });
    await sleep(1000);

    // Capture hero with cue
    const heroShot = await pageSend("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(path.join(SCREENSHOT_DIR, `verify_hero_${vp.name}.png`), Buffer.from(heroShot.data, "base64"));

    // Open waitlist dialog
    await pageSend("Runtime.evaluate", {
      expression: `
        sessionStorage.removeItem("t3_exit_shown");
        const btn = document.querySelector("${vp.mobile ? ".teaser3-mobile-btn" : ".teaser3-desktop-btn"}");
        btn?.click();
      `,
    });
    await sleep(500);

    const dialogShot = await pageSend("Page.captureScreenshot", { format: "png" });
    await fs.writeFile(path.join(SCREENSHOT_DIR, `verify_dialog_${vp.name}.png`), Buffer.from(dialogShot.data, "base64"));

    console.log(`Captured ${vp.name} hero and dialog.`);
  }

  pageWs.close();
  ws.close();
  chrome.kill();
  console.log("\nVerification completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  chrome.kill();
  process.exit(1);
});
