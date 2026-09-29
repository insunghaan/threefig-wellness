import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/in-sunghan/.gemini/antigravity/brain/5d1228ac-0777-416b-8604-52a7224b7a5c';
const LOCAL_DIR = path.resolve(process.cwd(), 'public', 'screenshots-t4');

if (!fs.existsSync(LOCAL_DIR)) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

function runChrome(args) {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return spawn(chromePath, args, { stdio: 'ignore' });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCDPTarget(port) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find((t) => t.type === 'page');
          if (page && page.webSocketDebuggerUrl) {
            resolve(page.webSocketDebuggerUrl);
          } else {
            reject(new Error('No page target found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    const { WebSocket } = await import('ws');
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
    });

    this.ws.on('message', (msg) => {
      const data = JSON.parse(msg.toString());
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function captureScreen(client, filePath, fullPage = false) {
  const screenshotParams = { format: 'png' };
  if (fullPage) {
    const layout = await client.send('Page.getLayoutMetrics');
    const width = Math.ceil(layout.cssContentSize.width);
    const height = Math.ceil(layout.cssContentSize.height);
    await client.send('Emulation.setVisibleSize', { width, height });
    screenshotParams.captureBeyondViewport = true;
  }
  const result = await client.send('Page.captureScreenshot', screenshotParams);
  const buf = Buffer.from(result.data, 'base64');
  const fileName = path.basename(filePath);
  const localTarget = path.join(LOCAL_DIR, fileName);
  fs.writeFileSync(localTarget, buf);
  try {
    fs.writeFileSync(filePath, buf);
  } catch (e) {
    console.warn(`Could not copy to ${filePath}:`, e.message);
  }
  console.log(`Saved screenshot: ${fileName} -> ${localTarget} (${buf.length} bytes) exists: ${fs.existsSync(localTarget)}`);
}

async function evaluate(client, expression) {
  const res = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(JSON.stringify(res.exceptionDetails));
  }
  return res.result.value;
}

async function verify() {
  const port = 9223;
  const chromeProc = runChrome([
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      try {
        wsUrl = await getCDPTarget(port);
        break;
      } catch (e) {
        await sleep(300);
      }
    }

    if (!wsUrl) throw new Error('Could not connect to Chrome CDP');

    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    console.log('--- 1. Testing Teaser4 Desktop ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    await client.send('Page.navigate', { url: 'http://localhost:3000/teaser4' });
    await sleep(2000);

    // Verify Review Toolbar is absent
    const hasReviewBar = await evaluate(client, `Boolean(document.querySelector('.review-bar'))`);
    console.log(`Review toolbar present: ${hasReviewBar} (Expected: false)`);

    // Verify Font is Inter
    const bodyFont = await evaluate(client, `window.getComputedStyle(document.querySelector('.teaser4-root')).fontFamily`);
    console.log(`Root font family: ${bodyFont} (Expected: Inter)`);

    // Verify Buttons have 12px radius
    const buttonRadii = await evaluate(client, `
      Array.from(document.querySelectorAll('.teaser4-root .button')).map(b => ({
        text: b.innerText.trim().replace(/\\n/g, ' '),
        radius: window.getComputedStyle(b).borderRadius
      }))
    `);
    console.log('Button radii:', JSON.stringify(buttonRadii, null, 2));

    // Verify Waitlist Benefits section (no image, centered)
    const benefitsCheck = await evaluate(client, `
      const sec = document.querySelector('.teaser4-root .offer');
      const img = sec ? sec.querySelector('img') : null;
      const isImgHidden = !img || window.getComputedStyle(img).display === 'none';
      const cta = sec ? sec.querySelector('.button').innerText.trim().replace(/\\n/g, ' ') : '';
      const textAlign = sec ? window.getComputedStyle(sec).textAlign : '';
      ({
        hasVisibleImage: !isImgHidden,
        ctaText: cta,
        textAlign
      })
    `);
    console.log('Benefits section check:', JSON.stringify(benefitsCheck, null, 2));

    // Desktop Full Page Screenshot
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-desktop-full.png'), false);

    // Scroll to Waitlist Benefits section & capture
    await evaluate(client, `document.querySelector('.offer').scrollIntoView({ behavior: 'instant' })`);
    await sleep(500);
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-desktop-benefits.png'), false);

    // Open Modal
    console.log('--- Opening Waitlist Modal on Desktop ---');
    await evaluate(client, `document.querySelector('.offer .button').click()`);
    await sleep(700);

    const desktopModalCheck = await evaluate(client, `
      const modal = document.querySelector('.teaser4-dialog-content');
      const aside = modal ? modal.querySelector('.teaser4-modal-aside') : null;
      const ringImg = aside ? aside.querySelector('img') : null;
      const form = modal ? modal.querySelector('.teaser4-waitlist-form') : null;
      ({
        modalOpen: Boolean(modal),
        asideVisible: Boolean(aside && window.getComputedStyle(aside).display !== 'none'),
        ringImgVisible: Boolean(ringImg && window.getComputedStyle(ringImg).display !== 'none'),
        formVisible: Boolean(form && window.getComputedStyle(form).display !== 'none')
      })
    `);
    console.log('Desktop modal check:', JSON.stringify(desktopModalCheck, null, 2));
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-desktop-modal.png'), false);

    // Test Signup Submission on Desktop
    console.log('--- Submitting Test Email on Desktop ---');
    const testEmail = `test.pilot.${Date.now()}@example.com`;
    await evaluate(client, `
      const input = document.querySelector('#t4-modal-email');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '${testEmail}');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `);
    await sleep(300);
    await evaluate(client, `document.querySelector('.teaser4-form-submit').click()`);
    await sleep(2000);

    const confirmedCheck = await evaluate(client, `
      const confirmed = document.querySelector('.teaser4-modal-confirmed');
      const heading = confirmed ? confirmed.querySelector('h2').innerText : '';
      const surveyCard = document.querySelector('.teaser4-survey-invite-card');
      ({
        confirmedOpen: Boolean(confirmed),
        heading,
        surveyCardVisible: Boolean(surveyCard)
      })
    `);
    console.log('Confirmed view check:', JSON.stringify(confirmedCheck, null, 2));
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-desktop-confirmed.png'), false);

    // Click Take Quick Survey
    console.log('--- Navigating to Optional Survey ---');
    await evaluate(client, `document.querySelector('.teaser4-survey-invite-card .teaser4-btn-primary-12').click()`);
    await sleep(600);

    const surveyCheck = await evaluate(client, `
      const survey = document.querySelector('.teaser4-survey-content');
      const heading = survey ? survey.querySelector('h2').innerText : '';
      const chips = document.querySelectorAll('.teaser4-survey-chip');
      ({
        surveyOpen: Boolean(survey),
        heading,
        chipsCount: chips.length
      })
    `);
    console.log('Survey view check:', JSON.stringify(surveyCheck, null, 2));
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-desktop-survey.png'), false);

    // Select some survey answers
    await evaluate(client, `
      const femaleChip = Array.from(document.querySelectorAll('.teaser4-survey-chip')).find(c => c.innerText.includes('Female'));
      if (femaleChip) femaleChip.click();
      const ageChip = Array.from(document.querySelectorAll('.teaser4-survey-chip')).find(c => c.innerText.includes('25–34'));
      if (ageChip) ageChip.click();
      const featChip = Array.from(document.querySelectorAll('.teaser4-survey-chip')).find(c => c.innerText.includes('Skin Balance'));
      if (featChip) featChip.click();
    `);
    await sleep(300);

    // Close / Skip survey
    await evaluate(client, `document.querySelector('.teaser4-survey-submit-actions .teaser4-btn-secondary-12').click()`);
    await sleep(500);

    const modalClosedCheck = await evaluate(client, `Boolean(document.querySelector('.teaser4-dialog-content'))`);
    console.log(`Modal closed cleanly after skip: ${!modalClosedCheck}`);

    // --- 2. Mobile Verification ---
    console.log('--- 2. Testing Teaser4 Mobile (390x844) ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    await client.send('Page.navigate', { url: 'http://localhost:3000/teaser4' });
    await sleep(2000);

    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-mobile-hero.png'), false);

    // Scroll to Mobile Waitlist Benefits
    await evaluate(client, `document.querySelector('.offer').scrollIntoView({ behavior: 'instant' })`);
    await sleep(500);
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-mobile-benefits.png'), false);

    // Open Modal on Mobile
    console.log('--- Opening Waitlist Modal on Mobile ---');
    await evaluate(client, `document.querySelector('.offer .button').click()`);
    await sleep(700);

    const mobileModalCheck = await evaluate(client, `
      const modal = document.querySelector('.teaser4-dialog-content');
      const mobilePreview = modal ? modal.querySelector('.teaser4-modal-mobile-preview') : null;
      const ringImg = mobilePreview ? mobilePreview.querySelector('img') : null;
      const benefits = mobilePreview ? mobilePreview.querySelectorAll('.teaser4-modal-mobile-benefit-item') : [];
      ({
        modalOpen: Boolean(modal),
        mobilePreviewVisible: Boolean(mobilePreview && window.getComputedStyle(mobilePreview).display !== 'none'),
        ringImgVisible: Boolean(ringImg && window.getComputedStyle(ringImg).display !== 'none'),
        benefitCount: benefits.length
      })
    `);
    console.log('Mobile modal check:', JSON.stringify(mobileModalCheck, null, 2));
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-mobile-modal.png'), false);

    // Mobile Signup Submission
    console.log('--- Submitting Test Email on Mobile ---');
    const mobileTestEmail = `test.mobile.${Date.now()}@example.com`;
    await evaluate(client, `
      const input = document.querySelector('#t4-modal-email');
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, '${mobileTestEmail}');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    `);
    await sleep(300);
    await evaluate(client, `document.querySelector('.teaser4-form-submit').click()`);
    await sleep(2000);

    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-mobile-confirmed.png'), false);

    // Navigate to Mobile Survey
    await evaluate(client, `document.querySelector('.teaser4-survey-invite-card .teaser4-btn-primary-12').click()`);
    await sleep(600);
    await captureScreen(client, path.join(ARTIFACTS_DIR, 'verify-teaser4-mobile-survey.png'), false);

    // --- 3. Protected Routes Regression Check ---
    console.log('--- 3. Verifying Protected Routes ---');
    const protectedRoutes = ['/', '/teaser2', '/teaser3', '/teaser5', '/teaser6', '/teaser6/concept'];
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    for (const r of protectedRoutes) {
      await client.send('Page.navigate', { url: `http://localhost:3000${r}` });
      await sleep(1200);
      const title = await evaluate(client, 'document.title');
      const statusOk = await evaluate(client, '!document.body.innerText.includes("404") && !document.body.innerText.includes("Internal Server Error")');
      console.log(`Protected route ${r}: Title="${title.slice(0, 30)}...", StatusOK=${statusOk}`);
    }

    console.log('--- All verifications complete! ---');
    await client.close();
  } finally {
    chromeProc.kill();
  }
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
