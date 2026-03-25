/**
 * Single place for Puppeteer/Chromium launch. Puppeteer's bundled Chrome is x86_64;
 * on ARM64 Linux it fails ("ELF: not found"). Prefer system Chromium or env paths.
 *
 * Env:
 *   PUPPETEER_EXECUTABLE_PATH or CHROMIUM_PATH — full path to chromium/chrome binary
 *
 * Server (Ubuntu/Debian ARM64):
 *   sudo apt install -y chromium-browser  # or chromium
 *   export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
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

const DEFAULT_CHROMIUM_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/snap/bin/chromium",
  "/usr/lib/chromium/chromium",
  "/usr/lib64/chromium-browser/chromium-browser",
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
];

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
      args: HEADLESS_SAFE_ARGS,
      headless: true,
      ignoreHTTPSErrors: true,
      ...options.extraLaunchOptions,
    });
  }

  const isLinuxArm64 = process.platform === "linux" && process.arch === "arm64";
  const isAwsLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  // @sparticuz/chromium targets Lambda/serverless; on ARM64 VPS it can point at wrong arch — skip unless Lambda
  const trySparticuz = chromiumSparticuz && (!isLinuxArm64 || isAwsLambda);

  if (trySparticuz) {
    try {
      const executablePath = await chromiumSparticuz.executablePath().catch(() => null);
      if (executablePath) {
        console.log(`${logPrefix} Using @sparticuz/chromium`);
        return puppeteer.launch({
          args: [...chromiumSparticuz.args, ...HEADLESS_SAFE_ARGS],
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
    args: HEADLESS_SAFE_ARGS,
    headless: true,
    ignoreHTTPSErrors: true,
    ...options.extraLaunchOptions,
  });
}

module.exports = {
  launchChromiumBrowser,
  resolveLocalChromiumPath,
  HEADLESS_SAFE_ARGS,
};
