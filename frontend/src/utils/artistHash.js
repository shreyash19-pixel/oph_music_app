import axiosApi from "../conf/axios";

// Cache to store hashes to avoid repeated API calls
const hashCache = new Map();

/**
 * OPH id from leaderboard / API rows (field names vary by endpoint and driver).
 */
export const resolveLeaderboardOphId = (artist) => {
  if (!artist || typeof artist !== "object") return "";
  const id =
    artist.oph_id ?? artist.OPH_ID ?? artist.ophid ?? artist.ophId;
  if (id == null) return "";
  const s = String(id).trim();
  return s;
};

/**
 * Get or generate hash for an OPH ID
 * @param {string} ophId - The OPH ID
 * @returns {Promise<string>} - The hash for the OPH ID
 */
export const getArtistHash = async (ophId) => {
  // Check cache first
  if (hashCache.has(ophId)) {
    return hashCache.get(ophId);
  }

  try {
    const response = await axiosApi.get(`/generate-artist-hash?oph_id=${ophId}`);
    
    if (response.data && response.data.success && response.data.data?.hash) {
      const hash = response.data.data.hash;
      // Cache the hash
      hashCache.set(ophId, hash);
      return hash;
    }
    
    throw new Error("Failed to generate hash");
  } catch (error) {
    console.error("Error generating hash:", error);
    // Fallback: return null, which will cause navigation to use id instead
    return null;
  }
};

/**
 * Get or generate hash for an OPH ID (with option to regenerate)
 * @param {string} ophId - The OPH ID
 * @param {boolean} regenerate - If true, regenerates the hash (invalidates old one)
 * @returns {Promise<string>} - The hash for the OPH ID
 */
export const getArtistHashWithRegenerate = async (ophId, regenerate = false) => {
  // If regenerating, clear cache
  if (regenerate) {
    hashCache.delete(ophId);
  } else {
    // Check cache first
    if (hashCache.has(ophId)) {
      return hashCache.get(ophId);
    }
  }

  try {
    const regenerateParam = regenerate ? "&regenerate=true" : "";
    const response = await axiosApi.get(`/generate-artist-hash?oph_id=${ophId}${regenerateParam}`);
    
    if (response.data && response.data.success && response.data.data?.hash) {
      const hash = response.data.data.hash;
      // Cache the hash
      hashCache.set(ophId, hash);
      return hash;
    }
    
    throw new Error("Failed to generate hash");
  } catch (error) {
    console.error("Error generating hash:", error);
    // Fallback: return null, which will cause navigation to use id instead
    return null;
  }
};

/**
 * Record a profile view for traffic / KPI (public POST; optional Bearer).
 * @param {string} ophId
 * @param {object|null} authHeaders - e.g. { Authorization: "Bearer ..." } when logged in
 */
export const incrementProfileTraffic = async (ophId, authHeaders = null) => {
  const oid =
    typeof ophId === "string" ? ophId.trim() : ophId != null ? String(ophId).trim() : "";
  if (!oid) return;
  try {
    await axiosApi.post(
      "/increment-traffic",
      { ophid: oid, traffic_counter: 1 },
      {
        headers: {
          ...(authHeaders?.Authorization ? authHeaders : {}),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.warn("[incrementProfileTraffic]", err?.message || err);
  }
};

/**
 * Open public artist detail in the browser. Uses a full navigation (assign) so
 * `?artist=` / `?id=` are never dropped when leaving `/dashboard/*` (React Router 7
 * can mishandle search across sibling route trees). `navigate` is kept for
 * call-site compatibility only.
 * @param {Function} _navigate - unused (legacy)
 * @param {string} ophId - The OPH ID
 * @param {object|null} authHeaders - optional; pass useArtist().headers when available
 */
export const navigateToArtistDetail = async (
  _navigate,
  ophId,
  authHeaders = null
) => {
  const oid =
    typeof ophId === "string" ? ophId.trim() : ophId != null ? String(ophId).trim() : "";
  if (!oid) return;

  await incrementProfileTraffic(oid, authHeaders);

  let search;
  try {
    const token = await getArtistHash(oid);
    search = token
      ? `artist=${encodeURIComponent(token)}`
      : `id=${encodeURIComponent(oid)}`;
  } catch (error) {
    console.error("Error navigating to artist detail:", error);
    search = `id=${encodeURIComponent(oid)}`;
  }

  const url = `${window.location.origin}/collaboration-artist-detail?${search}`;
  window.location.assign(url);
};

