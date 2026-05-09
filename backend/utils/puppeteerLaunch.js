/**
 * Single place for Puppeteer/Chromium launch. Puppeteer's bundled Chrome is x86_64;
 * on ARM64 Linux it fails ("ELF: not found"). Prefer system Chromium or env paths.
 *
 * Env:
 *   PUPPETEER_EXECUTABLE_PATH or CHROMIUM_PATH — full path to chromium/chrome binary
 *
 * Server (Ubuntu/Debian x86_64 or ARM64) — avoid Snap for PDF generation:
 *   sudo apt install -y chromium-browser   # or: chromium
 *   export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
 * Or Google Chrome:
 *   wget the .deb from Google and install; then:
 *   export PUPPETEER_EXECUTABLE_PATH=/opt/google/chrome/chrome
 *
 * If you must use env only (PM2 ecosystem.config.js):
 *   env: { PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium" }
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

let chromiumSparticuz = null;
try {
  chromiumSparticuz = require("@sparticuz/chromium");
} catch (_) {
  /* optional in some installs */
}

/** Snap Chromium is last — it often fails under PM2/systemd (dbus, cgroup). Prefer apt .deb Chrome/Chromium. */
const DEFAULT_CHROMIUM_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROMIUM_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/opt/google/chrome/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/lib/chromium/chromium",
  "/usr/lib/chromium-browser/chromium-browser",
  "/usr/lib64/chromium-browser/chromium-browser",
  "/snap/bin/chromium",
];

function resolveLocalChromiumPath(extraCandidates = []) {
  const candidates = [...extraCandidates, ...DEFAULT_CHROMIUM_CANDIDATES].filter(Boolean);

  for (const p of candidates) {
    try {
      if (!p || !fs.existsSync(p)) continue;
      const st = fs.statSync(p);
      if (st.isFile() || st.isSymbolicLink()) return path.resolve(p);
    } catch (_) {
      /* ignore */
    }
  }
  return null;
}

const HEADLESS_SAFE_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--no-first-run",
  "--disable-background-networking",
  "--mute-audio",
  "--disable-sync",
  "--metrics-recording-only",
];

function buildLaunchArgs(executablePath, extra = []) {
  const args = [...HEADLESS_SAFE_ARGS, ...extra];
  const p = executablePath ? String(executablePath) : "";
  if (p.includes("/snap/")) {
    console.warn(
      "[puppeteer] Snap Chromium detected — often crashes under PM2 (dbus/cgroup). " +
        "Install Chromium via apt and set PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium (see backend/utils/puppeteerLaunch.js header).",
    );
  }
  return args;
}

/**
 * @param {object} [options]
 * @param {string} [options.logPrefix] - e.g. "[membership]" for log lines
 * @param {string[]} [options.extraLaunchOptions] - merged into puppeteer.launch (e.g. defaultViewport)
 * @param {string[]} [options.extraChromiumCandidates] - extra paths to try first
 * @returns {Promise<import('puppeteer').Browser>}
 */
async function launchChromiumBrowser(options = {}) {
  const logPrefix = options.logPrefix || "[puppeteer]";
  const extraCandidates = options.extraChromiumCandidates || [];

  const localChrome = resolveLocalChromiumPath(extraCandidates);
  if (localChrome) {
    console.log(`${logPrefix} Using Chromium at ${localChrome} (native for this CPU)`);
    return puppeteer.launch({
      executablePath: localChrome,
      args: buildLaunchArgs(localChrome),
      headless: true,
      ignoreHTTPSErrors: true,
      ...options.extraLaunchOptions,
    });
  }

  const isLinux = process.platform === "linux";
  const isLinuxArm64 = isLinux && process.arch === "arm64";
  const isAwsLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  // @sparticuz/chromium is a Linux (Lambda) build — never use it on macOS/Windows (spawn ENOEXEC / errno -8).
  // On Linux arm64 without Lambda, use system Chromium instead.
  const trySparticuz =
    chromiumSparticuz &&
    isLinux &&
    (!isLinuxArm64 || isAwsLambda);

  if (trySparticuz) {
    try {
      const executablePath = await chromiumSparticuz.executablePath().catch(() => null);
      if (executablePath) {
        console.log(`${logPrefix} Using @sparticuz/chromium`);
        return puppeteer.launch({
          args: [
            ...(chromiumSparticuz.args || []),
            ...HEADLESS_SAFE_ARGS,
          ],
          defaultViewport: chromiumSparticuz.defaultViewport,
          executablePath,
          headless: chromiumSparticuz.headless ?? true,
          ignoreHTTPSErrors: true,
          ...options.extraLaunchOptions,
        });
      }
    } catch (e) {
      console.warn(`${logPrefix} @sparticuz/chromium failed:`, e.message);
    }
  } else if (isLinuxArm64 && chromiumSparticuz) {
    console.warn(
      `${logPrefix} Skipping @sparticuz/chromium on Linux ARM64 (use system Chromium or Lambda only)`
    );
  }

  if (isLinuxArm64) {
    throw new Error(
      `${logPrefix} ARM64 Linux: install native Chromium, e.g. \`sudo apt install -y chromium-browser\` ` +
        "or `chromium`, then set PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium. " +
        "Puppeteer's bundled Chrome is x86_64 and will not run on this CPU."
    );
  }

  console.warn(
    `${logPrefix} Falling back to Puppeteer bundled Chrome (set PUPPETEER_EXECUTABLE_PATH if this fails)`
  );
  return puppeteer.launch({
    args: buildLaunchArgs(null),
    headless: true,
    ignoreHTTPSErrors: true,
    ...options.extraLaunchOptions,
  });
}

module.exports = {
  launchChromiumBrowser,
  resolveLocalChromiumPath,
  HEADLESS_SAFE_ARGS,
  buildLaunchArgs,
};
