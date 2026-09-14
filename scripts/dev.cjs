#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("child_process");

const rawArgs = process.argv.slice(2);
const nextArgs = ["dev"];

let host = "0.0.0.0";
let port = "3000";
const passthrough = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  if (arg === "--host" || arg === "-H" || arg === "--hostname") {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      host = rawArgs[++i];
    }
  } else if (arg.startsWith("--host=")) {
    host = arg.split("=")[1];
  } else if (arg.startsWith("--hostname=")) {
    host = arg.split("=")[1];
  } else if (arg === "--port" || arg === "-p") {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      port = rawArgs[++i];
    }
  } else if (arg.startsWith("--port=")) {
    port = arg.split("=")[1];
  } else if (
    arg === "--turbo" ||
    arg === "--turbopack" ||
    arg === "--webpack" ||
    arg === "--disable-source-maps" ||
    arg === "--no-server-fast-refresh"
  ) {
    passthrough.push(arg);
  } else {
    // Pass through directories or recognized paths, ignore unknown tool flags
    if (!arg.startsWith("-")) {
      passthrough.push(arg);
    }
  }
}

nextArgs.push("-H", host, "-p", port, ...passthrough);

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...nextArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
