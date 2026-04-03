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
 * Navigate to public artist detail; increments traffic for that ophId first.
 * @param {Function} navigate - React Router navigate function
 * @param {string} ophId - The OPH ID
 * @param {object|null} authHeaders - optional; pass useArtist().headers when available
 */
export const navigateToArtistDetail = async (
  navigate,
  ophId,
  authHeaders = null
) => {
  await incrementProfileTraffic(ophId, authHeaders);
  try {
    const token = await getArtistHash(ophId);
    if (token) {
      navigate(`/collaboration-artist-detail?artist=${encodeURIComponent(token)}`);
    } else {
      navigate(`/collaboration-artist-detail?id=${encodeURIComponent(ophId)}`);
    }
  } catch (error) {
    console.error("Error navigating to artist detail:", error);
    navigate(`/collaboration-artist-detail?id=${encodeURIComponent(ophId)}`);
  }
};

