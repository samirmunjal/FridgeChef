#!/usr/bin/env node
/**
 * Build script: exports FridgeChef as a static web SPA using Expo.
 * Output goes to dist/ — served by server/serve.js in production.
 */

const { spawnSync } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const result = spawnSync(
  "pnpm",
  ["exec", "expo", "export", "--platform", "web"],
  {
    stdio: "inherit",
    cwd: projectRoot,
  },
);

process.exit(result.status ?? 0);
