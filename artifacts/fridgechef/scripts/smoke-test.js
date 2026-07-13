#!/usr/bin/env node
/**
 * Smoke test: builds the app, starts the server, and verifies that every
 * app route returns HTTP 200 with a valid HTML document.
 *
 * Usage:  node scripts/smoke-test.js
 * Exit:   0 = all routes passed, non-zero = build or route check failed
 */

const { spawnSync, spawn } = require("child_process");
const http = require("http");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const TEST_PORT = 19_876;

const ROUTES = [
  "/",
  "/preferences",
  "/results",
  "/favorites",
  "/shopping-list",
  "/settings",
];

// ---------------------------------------------------------------------------
// Step 1: Build
// ---------------------------------------------------------------------------
console.log("\n=== Step 1: Building the app ===\n");

const buildResult = spawnSync("node", ["scripts/build.js"], {
  stdio: "inherit",
  cwd: projectRoot,
});

if (buildResult.status !== 0) {
  console.error("\n[FAIL] Build failed — aborting smoke test.");
  process.exit(buildResult.status ?? 1);
}

console.log("\n[OK] Build succeeded.");

// ---------------------------------------------------------------------------
// Step 2: Start the server
// ---------------------------------------------------------------------------
console.log("\n=== Step 2: Starting the server ===\n");

const server = spawn("node", ["server/serve.js"], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(TEST_PORT) },
  stdio: "pipe",
});

server.stderr.on("data", (d) => process.stderr.write(d));

let serverReady = false;

server.stdout.on("data", (d) => {
  const line = d.toString();
  process.stdout.write(line);
  if (line.includes("running on port")) {
    serverReady = true;
  }
});

function killServer() {
  try {
    server.kill("SIGTERM");
  } catch (_) {}
}

// ---------------------------------------------------------------------------
// Helper: wait for server to be ready (max 15 s), then probe
// ---------------------------------------------------------------------------
function waitForServer(maxMs = 15_000, intervalMs = 200) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + maxMs;

    function probe() {
      const req = http.get(
        `http://127.0.0.1:${TEST_PORT}/status`,
        (res) => {
          res.resume();
          resolve();
        },
      );
      req.on("error", () => {
        if (Date.now() >= deadline) {
          reject(new Error("Server did not become ready in time."));
        } else {
          setTimeout(probe, intervalMs);
        }
      });
      req.end();
    }

    probe();
  });
}

// ---------------------------------------------------------------------------
// Helper: fetch a single route and validate it
// ---------------------------------------------------------------------------
function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${TEST_PORT}${route}`,
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const statusOk = res.statusCode === 200;
          const hasDoctype = body.trimStart().toLowerCase().startsWith("<!doctype html");
          if (statusOk && hasDoctype) {
            console.log(`  [PASS] ${route}  (${res.statusCode})`);
            resolve({ route, passed: true });
          } else {
            console.error(
              `  [FAIL] ${route}  status=${res.statusCode}  doctype=${hasDoctype}`,
            );
            resolve({ route, passed: false, status: res.statusCode, hasDoctype });
          }
        });
      },
    );
    req.on("error", (err) => {
      console.error(`  [FAIL] ${route}  error=${err.message}`);
      resolve({ route, passed: false, error: err.message });
    });
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Step 3: Run checks
// ---------------------------------------------------------------------------
async function main() {
  try {
    console.log("Waiting for server to accept connections…");
    await waitForServer();
    console.log("[OK] Server is ready.\n");
  } catch (err) {
    console.error(`[FAIL] ${err.message}`);
    killServer();
    process.exit(1);
  }

  console.log("=== Step 3: Checking routes ===\n");

  const results = [];
  for (const route of ROUTES) {
    results.push(await checkRoute(route));
  }

  killServer();

  const failures = results.filter((r) => !r.passed);

  console.log("\n=== Summary ===");
  console.log(`  Passed: ${results.length - failures.length}/${results.length}`);

  if (failures.length > 0) {
    console.error(`  Failed routes:`);
    for (const f of failures) {
      console.error(`    ${f.route}`);
    }
    console.error("\n[FAIL] Smoke test failed.");
    process.exit(1);
  }

  console.log("\n[PASS] All routes returned valid HTML. Build is healthy.");
  process.exit(0);
}

server.on("error", (err) => {
  console.error(`[FAIL] Could not start server: ${err.message}`);
  process.exit(1);
});

main().catch((err) => {
  console.error(`[FAIL] Unexpected error: ${err.message}`);
  killServer();
  process.exit(1);
});
