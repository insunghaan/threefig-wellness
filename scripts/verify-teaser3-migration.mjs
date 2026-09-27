import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9262;
const USER_DATA_DIR = "/tmp/chrome-teaser3-qa-" + Date.now();
const OUTPUT_DIR = path.join(process.cwd(), "scratch", "migration-verification");

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

    async function evaluate(expression) {
      const res = await pageSend("Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      return res.result?.value;
    }

    console.log("--- 1. VERIFY PROTECTED ROUTES (/ and /teaser2) ---");
    // Verify protected routes at desktop and mobile
    for (const [w, h, mobile, suffix] of [
      [1440, 900, false, "desktop_1440"],
      [390, 844, true, "mobile_390"],
    ]) {
      await setViewport(w, h, mobile);

      // Route /
      await pageSend("Page.navigate", { url: "http://localhost:3000/" });
      await sleep(1500);
      await capture(`after_main_root_${suffix}.png`);

      // Route /teaser2
      await pageSend("Page.navigate", { url: "http://localhost:3000/teaser2" });
      await sleep(1500);
      await capture(`after_teaser2_${suffix}.png`);
    }

    console.log("--- 2. VERIFY TEASER3 DESKTOP (1440x900) ---");
    await setViewport(1440, 900, false);
    await pageSend("Page.navigate", { url: "http://localhost:3000/teaser3" });
    await sleep(1800);
    await capture("teaser3_desktop_hero.png");

    // Scroll to What You Get
    await evaluate(`document.getElementById("what-you-get")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(800);
    await capture("teaser3_desktop_what_you_get.png");

    // Scroll to How It Works
    await evaluate(`document.getElementById("how-it-works")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(800);
    await capture("teaser3_desktop_how_it_works.png");

    // Scroll to Brand & The Ring
    await evaluate(`document.getElementById("ring")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(800);
    await capture("teaser3_desktop_the_ring.png");

    // Scroll to Science
    await evaluate(`document.getElementById("science")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(800);
    await capture("teaser3_desktop_science.png");

    // Click on Science Topic to verify modal
    await evaluate(`document.querySelector(".teaser3-science-row")?.click()`);
    await sleep(600);
    await capture("teaser3_desktop_science_modal.png");

    // Close Science modal
    await evaluate(`document.querySelector(".teaser3-modal-dismiss-btn, .teaser3-modal-close-icon-btn")?.click()`);
    await sleep(400);

    // Scroll to FAQ & Testimonials
    await evaluate(`document.getElementById("faq")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(800);
    await capture("teaser3_desktop_testimonials_faq.png");

    // Scroll to Final Benefits & Footer
    await evaluate(`document.getElementById("benefits")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(800);
    await capture("teaser3_desktop_benefits_footer.png");

    // Click Privacy & Analytics button to verify dialog
    await evaluate(`document.querySelector(".teaser3-footer-privacy-btn")?.click()`);
    await sleep(500);
    await capture("teaser3_desktop_privacy_modal.png");

    // Close Privacy modal
    await evaluate(`document.querySelector('[data-slot="dialog-close"], button[aria-label="Close"]')?.click()`);
    await sleep(400);

    console.log("--- 3. VERIFY TEASER3 MOBILE (390x844) ---");
    await setViewport(390, 844, true);
    await pageSend("Page.navigate", { url: "http://localhost:3000/teaser3" });
    await sleep(1800);

    // Initial mobile view: only scroll cue visible, floating CTA dock hidden
    await capture("teaser3_mobile_01_landing.png");
    const mobileInitialState = await evaluate(`(() => {
      const cue = document.querySelector(".teaser3-mobile-cue-fixed");
      const dock = document.querySelector(".teaser3-mobile-dock");
      return {
        cueVisible: cue ? cue.classList.contains("is-visible") : false,
        dockRevealed: dock ? dock.classList.contains("is-revealed") : false,
      };
    })()`);
    console.log("Mobile Initial State:", mobileInitialState);

    // Scroll 150px: cue hides, floating CTA reveals
    await evaluate(`window.scrollBy({ top: 150, behavior: "instant" })`);
    await sleep(600);
    await capture("teaser3_mobile_02_scrolled_floating_cta.png");
    const mobileScrolledState = await evaluate(`(() => {
      const cue = document.querySelector(".teaser3-mobile-cue-fixed");
      const dock = document.querySelector(".teaser3-mobile-dock");
      return {
        cueVisible: cue ? cue.classList.contains("is-visible") : false,
        dockRevealed: dock ? dock.classList.contains("is-revealed") : false,
      };
    })()`);
    console.log("Mobile Scrolled State:", mobileScrolledState);

    // Scroll to Section A (What you get)
    await evaluate(`document.getElementById("what-you-get")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(600);
    await capture("teaser3_mobile_03_what_you_get.png");

    // Scroll to Section B (How it works)
    await evaluate(`document.getElementById("how-it-works")?.scrollIntoView({ behavior: "instant" })`);
    await sleep(600);
    await capture("teaser3_mobile_04_how_it_works.png");

    // Scroll to Final Benefits CTA (Handoff Target)
    await evaluate(`document.querySelector(".teaser3-benefits-actions")?.scrollIntoView({ behavior: "instant", block: "center" })`);
    await sleep(800);
    await capture("teaser3_mobile_05_final_cta_handoff.png");
    const mobileHandoffState = await evaluate(`(() => {
      const dock = document.querySelector(".teaser3-mobile-dock");
      return {
        dockRevealed: dock ? dock.classList.contains("is-revealed") : false,
        dockCollapsed: dock ? dock.classList.contains("is-collapsed") : false,
      };
    })()`);
    console.log("Mobile Handoff State (at Final CTA):", mobileHandoffState);

    // Test Waitlist Popup from Final Benefits CTA
    await evaluate(`document.querySelector(".teaser3-benefits-btn")?.click()`);
    await sleep(600);
    await capture("teaser3_mobile_06_waitlist_dialog.png");

    console.log("All Teaser3 verification steps completed successfully!");
  } finally {
    try {
      chrome.kill("SIGKILL");
    } catch (e) {}
    try {
      await fs.rm(USER_DATA_DIR, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
