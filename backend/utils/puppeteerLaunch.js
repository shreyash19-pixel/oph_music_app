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
 *
 * Snap Chromium (/snap/bin/chromium) is NOT auto-used — it often exits under PM2 with
 * dbus/cgroup errors.
 *
 * Ubuntu often ships `/usr/bin/chromium` as a tiny shell script that runs `snap run chromium`
 * — we detect and skip those so Puppeteer does not invoke Snap.
 *
 * Install a real browser .deb and set PUPPETEER_EXECUTABLE_PATH, e.g.:
 *   Google Chrome: /opt/google/chrome/chrome or /usr/bin/google-chrome-stable
 * ARM64 Linux: Puppeteer's cache (~/.cache/puppeteer/chrome/linux_arm/...) may still point at an
 * x86_64 binary (chrome-linux64 / ld-linux-x86-64). Those are skipped via ELF arch detection — install
 * native Chromium/Chrome (aarch64) and set PUPPETEER_EXECUTABLE_PATH, or remove the bad cache folder.
 *
 * Ubuntu (incl. ARM noble): `apt install chromium` often resolves to **transitional `chromium-browser`**
 * → Snap only (`command -v chromium` → `/snap/bin/chromium` → `/usr/bin/snap`). The runnable ELF lives under
 * `/snap/chromium/<revision>/usr/lib/chromium-browser/chrome` — we discover it automatically.
 *
 * To force Snap anyway: ALLOW_SNAP_CHROMIUM=1 and set PUPPETEER_EXECUTABLE_PATH to the snap binary.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");

let chromiumSparticuz = null;
try {
  chromiumSparticuz = require("@sparticuz/chromium");
} catch (_) {
  /* optional in some installs */
}

function realpathSafe(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return p;
  }
}

/**
 * True if we should skip this candidate — Snap **CLI shims** (`/snap/bin/chromium` → snap),
 * not the real browser ELF under `/snap/chromium/<rev>/usr/lib/...` (those we launch directly).
 */
function isSnapInvokingChromium(candidatePath) {
  if (process.env.ALLOW_SNAP_CHROMIUM === "1") return false;

  const p = String(candidatePath || "");
  const resolved = realpathSafe(p);

  /* Mounted Chromium package (large ELF) — OK for Puppeteer when executed directly. */
  if (/\/snap\/chromium\/[^/]+\//.test(resolved)) {
    try {
      if (fs.existsSync(p)) {
        const st = fs.statSync(p);
        if (st.isFile() && st.size > 200000) return false;
      }
    } catch (_) {}
  }

  if (/\/snap\/bin\//.test(resolved) && /chromium|chrome/i.test(resolved)) return true;
  if (/\/usr\/bin\/snap$/i.test(resolved)) return true;

  try {
    if (!fs.existsSync(p)) return false;
    const st = fs.statSync(p);
    if (!st.isFile()) return false;
    /* Real chrome/chromium binaries are multi‑MB; Snap wrappers are tiny shell scripts. */
    if (st.size > 262144) return false;
    const head = fs.readFileSync(p, { encoding: "utf8" }).slice(0, 8192);
    if (
      /\/snap\/bin\/chromium|snap\s+run\s+chromium|chromium\.chromium/i.test(head)
    ) {
      return true;
    }
  } catch (_) {
    /* ignore */
  }
  return false;
}

/** ELF e_machine (Linux common). */
const EM_X86_64 = 62;
const EM_AARCH64 = 183;

/**
 * Read ELF64 e_machine (little-endian). Returns null if not a Linux ELF64 binary we recognize.
 */
function readElf64Machine(filePath) {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(64);
    const n = fs.readSync(fd, buf, 0, 64, 0);
    fs.closeSync(fd);
    if (n < 20) return null;
    if (buf[0] !== 0x7f || buf[1] !== 0x45 || buf[2] !== 0x4c || buf[3] !== 0x46)
      return null;
    if (buf[4] !== 2) return null; /* ELFCLASS64 only */
    const le = buf[5] === 1;
    if (!le) return null;
    return buf.readUInt16LE(18);
  } catch {
    return null;
  }
}

/**
 * Reject running x86_64 Chrome on ARM64 (and vice versa). Puppeteer cache paths like linux_arm/...
 * may still ship chrome-linux64 (amd64), which shells then exec as script → "ELF: not found".
 */
function executableMatchesHostCpu(filePath) {
  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) return true;
    /* Tiny files are wrappers/scripts — not ELF; handled by Snap detection. */
    if (st.size < 4096) return true;

    const machine = readElf64Machine(filePath);
    if (machine == null) return true;

    const arch = process.arch;
    if (arch === "arm64") {
      if (machine === EM_X86_64) return false;
      return true;
    }
    if (arch === "x64" || arch === "amd64") {
      if (machine === EM_AARCH64) return false;
      return true;
    }
    return true;
  } catch {
    return true;
  }
}

/** Puppeteer's downloaded Chrome (never Snap); may be undefined if not downloaded yet. */
function getPuppeteerBundledChromePath() {
  try {
    if (typeof puppeteer.executablePath === "function") {
      const ep = puppeteer.executablePath();
      if (ep && fs.existsSync(ep)) return ep;
    }
  } catch (_) {
    /* ignore */
  }
  return null;
}

/**
 * Resolve chromium/google-chrome via PATH — works across distros where install path differs.
 */
function chromiumCandidatesFromPathEnv() {
  if (process.platform !== "linux") return [];
  const names = [
    "chromium",
    "chromium-browser",
    "google-chrome-stable",
    "google-chrome",
  ];
  const out = [];
  const seen = new Set();
  for (const name of names) {
    try {
      let p = execSync(`command -v "${name}"`, {
        encoding: "utf8",
        timeout: 4000,
        env: process.env,
      }).trim();
      if (!p) continue;
      try {
        p = fs.realpathSync(p);
      } catch (_) {
        /* keep p */
      }
      if (seen.has(p)) continue;
      seen.add(p);
      out.push(p);
    } catch (_) {
      /* not on PATH */
    }
  }
  return out;
}

/**
 * Ubuntu transitional package installs Chromium as Snap only — real ELF is under /snap/chromium/<rev>/.
 */
function chromiumCandidatesFromSnapMount() {
  if (process.platform !== "linux") return [];
  const root = "/snap/chromium";
  if (!fs.existsSync(root)) return [];
  const rels = [
    path.join("usr", "lib", "chromium-browser", "chrome"),
    path.join("usr", "lib", "chromium-browser", "chromium-browser"),
    path.join("usr", "lib", "chromium", "chrome"),
    path.join("usr", "lib", "chromium", "chromium"),
  ];
  const out = [];
  const seen = new Set();
  const push = (abs) => {
    try {
      if (!abs || !fs.existsSync(abs)) return;
      const rp = fs.realpathSync(abs);
      if (seen.has(rp)) return;
      seen.add(rp);
      out.push(rp);
    } catch (_) {}
  };

  for (const rel of rels) {
    push(path.join(root, "current", rel));
  }

  try {
    for (const name of fs.readdirSync(root)) {
      if (name === "common" || name === "current") continue;
      const revDir = path.join(root, name);
      let st;
      try {
        st = fs.statSync(revDir);
      } catch {
        continue;
      }
      if (!st.isDirectory()) continue;
      for (const rel of rels) {
        push(path.join(revDir, rel));
      }
    }
  } catch (_) {}
  return out;
}

function buildDefaultChromiumCandidates() {
  const bundled = getPuppeteerBundledChromePath();
  /** Common Debian/Ubuntu locations (may or may not exist). */
  const linuxArm64DebPaths =
    process.platform === "linux" && process.arch === "arm64"
      ? [
          "/usr/lib/aarch64-linux-gnu/chromium/chromium",
          "/usr/lib/aarch64-linux-gnu/chromium-browser/chromium-browser",
        ]
      : [];

  return [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROMIUM_PATH,
    ...chromiumCandidatesFromSnapMount(),
    ...chromiumCandidatesFromPathEnv(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/opt/google/chrome/chrome",
    ...linuxArm64DebPaths,
    /* Prefer Puppeteer-bundled Chrome before generic paths — Ubuntu often makes /usr/bin stubs Snap wrappers. */
    bundled,
    "/usr/lib/chromium/chromium",
    "/usr/lib/chromium-browser/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/lib64/chromium-browser/chromium-browser",
  ].filter(Boolean);
}

function resolveLocalChromiumPath(extraCandidates = []) {
  const candidates = [...extraCandidates, ...buildDefaultChromiumCandidates()];

  for (const raw of candidates) {
    try {
      if (!raw || !fs.existsSync(raw)) continue;
      const st = fs.statSync(raw);
      if (!(st.isFile() || st.isSymbolicLink())) continue;

      const resolvedPath = path.resolve(raw);
      if (isSnapInvokingChromium(resolvedPath)) {
        console.warn(
          `[puppeteer] Skipping Chromium candidate (Snap / snap wrapper): ${resolvedPath}`,
        );
        continue;
      }
      if (!executableMatchesHostCpu(resolvedPath)) {
        console.warn(
          `[puppeteer] Skipping Chromium candidate (wrong CPU vs ${process.arch}, e.g. x86_64 binary on ARM64): ${resolvedPath}`,
        );
        continue;
      }
      return resolvedPath;
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
  if (/\/snap\/bin\//.test(p) || /\/usr\/bin\/snap$/i.test(p)) {
    console.warn(
      "[puppeteer] Snap CLI shim detected — use the ELF under /snap/chromium/.../usr/lib/... (see puppeteerLaunch.js).",
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

  // @sparticuz/chromium: Linux server fallback (including ARM64 Graviton/OCI) — verify ELF matches host CPU.
  const trySparticuz = chromiumSparticuz && isLinux;

  if (trySparticuz) {
    try {
      const executablePath = await chromiumSparticuz.executablePath().catch(() => null);
      if (executablePath && fs.existsSync(executablePath)) {
        if (!executableMatchesHostCpu(executablePath)) {
          console.warn(
            `${logPrefix} @sparticuz/chromium binary is wrong architecture for ${process.arch}; skipping (${executablePath})`,
          );
        } else {
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
      }
    } catch (e) {
      console.warn(`${logPrefix} @sparticuz/chromium failed:`, e.message);
    }
  }

  if (isLinuxArm64) {
    throw new Error(
      `${logPrefix} ARM64 Linux: no usable Chromium found. Install a native aarch64 browser: ` +
        "`sudo apt-get install -y chromium` then run `command -v chromium` and `dpkg -L chromium | grep -E 'bin/(chromium|chrome)$'` " +
        "to locate the ELF (paths vary — `/usr/lib/chromium/chromium` may not exist). " +
        "Set `PUPPETEER_EXECUTABLE_PATH` to that file. Or install Google Chrome ARM64 .deb. " +
        "`rm -rf ~/.cache/puppeteer/chrome` clears wrong-arch Puppeteer cache."
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
