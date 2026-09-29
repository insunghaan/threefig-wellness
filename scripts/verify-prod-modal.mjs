import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/in-sunghan/.gemini/antigravity/brain/5d1228ac-0777-416b-8604-52a7224b7a5c';

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
        if (data.error) {
          reject(new Error(data.error.message || JSON.stringify(data.error)));
        } else {
          resolve(data.result);
        }
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function captureScreenshot(client, outputPath) {
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });
  fs.writeFileSync(outputPath, Buffer.from(result.data, 'base64'));
  console.log('Saved screenshot:', outputPath);
}

async function run() {
  const server = spawn('npm', ['start', '--', '-p', '3005'], {
    cwd: process.cwd(),
    stdio: 'ignore',
  });

  // Wait for server to come up
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      await new Promise((res, rej) => {
        const req = http.get('http://127.0.0.1:3005/teaser4', (r) => {
          if (r.statusCode === 200) res();
          else rej(new Error('Status ' + r.statusCode));
        });
        req.on('error', rej);
      });
      console.log('Production server is up on 3005!');
      break;
    } catch (e) {}
  }

  const port = 9226;
  const userDataDir = `/tmp/chrome-t4-prod-${Date.now()}`;
  const chromeProcess = runChrome([
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  try {
    await sleep(2000);
    const wsUrl = await getCDPTarget(port);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // 1. Capture Desktop Landing
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3005/teaser4' });
    await sleep(2500);
    const desktopLandingFile = path.join(ARTIFACTS_DIR, 'teaser4-desktop-landing.png');
    await captureScreenshot(client, desktopLandingFile);

    // 2. Open Desktop Modal via ?signup=1
    console.log('Opening desktop modal via ?signup=1...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3005/teaser4?signup=1' });
    await sleep(2500);

    const desktopModalFile = path.join(ARTIFACTS_DIR, 'teaser4-desktop-modal.png');
    await captureScreenshot(client, desktopModalFile);

    // 3. Mobile Modal Test
    console.log('Testing Mobile Modal...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });
    await client.send('Page.navigate', { url: 'http://127.0.0.1:3005/teaser4?signup=1' });
    await sleep(2500);

    const mobileModalFile = path.join(ARTIFACTS_DIR, 'teaser4-mobile-modal.png');
    await captureScreenshot(client, mobileModalFile);

    await client.close();
    console.log('All screenshots captured successfully!');
  } finally {
    chromeProcess.kill('SIGTERM');
    server.kill('SIGTERM');
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch(console.error);
