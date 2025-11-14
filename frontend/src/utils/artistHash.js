import axiosApi from "../conf/axios";

// Cache to store hashes to avoid repeated API calls
const hashCache = new Map();

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
 * Navigate to artist detail page using hash
 * @param {Function} navigate - React Router navigate function
 * @param {string} ophId - The OPH ID
 */
export const navigateToArtistDetail = async (navigate, ophId) => {
  try {
    const hash = await getArtistHash(ophId);
    if (hash) {
      navigate(`/public-artist-detail?hash=${hash}`);
    } else {
      // Fallback to id if hash generation fails
      navigate(`/public-artist-detail?id=${ophId}`);
    }
  } catch (error) {
    console.error("Error navigating to artist detail:", error);
    // Fallback to id
    navigate(`/public-artist-detail?id=${ophId}`);
  }
};

