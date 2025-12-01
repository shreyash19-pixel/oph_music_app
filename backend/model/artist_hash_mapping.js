const db = require("../DB/connect");
const crypto = require("crypto");

/**
 * Sanitize string for URL usage
 */
const sanitizeForUrl = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Generate a short random hash (6 characters)
 */
const generateRandomHash = () => {
  return crypto.randomBytes(3).toString('hex').substring(0, 6);
};

/**
 * Generate a structured hash for an OPH ID
 * Format: stagename-profession-abc123
 */
const generateStructuredHash = (stageName, profession) => {
  const sanitizedStageName = sanitizeForUrl(stageName) || "artist";
  const sanitizedProfession = sanitizeForUrl(profession) || "artist";
  const randomHash = generateRandomHash();
  
  return `${sanitizedStageName}-${sanitizedProfession}-${randomHash}`;
};

/**
 * Get or create a hash for an OPH ID
 * If hash exists and is active, return it. Otherwise, create a new one.
 * Format: stagename-profession-abc123
 */
const getOrCreateHash = async (ophId) => {
  try {
    // Check if hash already exists for this OPH ID
    const [existing] = await db.execute(
      "SELECT hash FROM artist_hash_mapping WHERE oph_id = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())",
      [ophId]
    );

    if (existing && existing.length > 0) {
      return existing[0].hash;
    }

    // Fetch stage_name and profession from database
    const [artistData] = await db.execute(
      `SELECT ud.stage_name, pd.Profession 
       FROM user_details ud 
       LEFT JOIN professional_details pd ON ud.ophid = pd.OPH_ID 
       WHERE ud.ophid = ?`,
      [ophId]
    );

    if (!artistData || artistData.length === 0) {
      throw new Error(`Artist not found for OPH ID: ${ophId}`);
    }

    const stageName = artistData[0].stage_name || "";
    const profession = artistData[0].Profession || "";

    // Generate hash with random suffix
    let hash = generateStructuredHash(stageName, profession);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness by regenerating if hash exists
    while (attempts < maxAttempts) {
      const [existingHash] = await db.execute(
        "SELECT oph_id FROM artist_hash_mapping WHERE hash = ? AND is_active = 1 AND oph_id != ?",
        [hash, ophId]
      );

      if (!existingHash || existingHash.length === 0) {
        // Hash is unique, break the loop
        break;
      }

      // Hash exists, regenerate with new random hash
      hash = generateStructuredHash(stageName, profession);
      attempts++;
    }

    // Insert into database
    try {
      await db.execute(
        "INSERT INTO artist_hash_mapping (oph_id, hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE hash = VALUES(hash), is_active = 1, expires_at = NULL",
        [ophId, hash]
      );
    } catch (error) {
      // If unique constraint violation, regenerate hash
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        hash = generateStructuredHash(stageName, profession);
        await db.execute(
          "INSERT INTO artist_hash_mapping (oph_id, hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE hash = VALUES(hash), is_active = 1, expires_at = NULL",
          [ophId, hash]
        );
      } else {
        throw error;
      }
    }

    return hash;
  } catch (error) {
    throw new Error(`Error generating hash: ${error.message}`);
  }
};

/**
 * Get OPH ID from hash
 */
const getOphIdFromHash = async (hash) => {
  try {
    const [rows] = await db.execute(
      "SELECT oph_id FROM artist_hash_mapping WHERE hash = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())",
      [hash]
    );

    if (rows && rows.length > 0) {
      return rows[0].oph_id;
    }

    return null;
  } catch (error) {
    throw new Error(`Error looking up hash: ${error.message}`);
  }
};

/**
 * Invalidate a hash (soft delete)
 */
const invalidateHash = async (hash) => {
  try {
    await db.execute(
      "UPDATE artist_hash_mapping SET is_active = 0 WHERE hash = ?",
      [hash]
    );
    return true;
  } catch (error) {
    throw new Error(`Error invalidating hash: ${error.message}`);
  }
};

/**
 * Invalidate all hashes for an OPH ID
 */
const invalidateHashesForOphId = async (ophId) => {
  try {
    await db.execute(
      "UPDATE artist_hash_mapping SET is_active = 0 WHERE oph_id = ?",
      [ophId]
    );
    return true;
  } catch (error) {
    throw new Error(`Error invalidating hashes: ${error.message}`);
  }
};

/**
 * Regenerate hash for an OPH ID (invalidates old and creates new)
 * Useful when stage_name or profession changes
 */
const regenerateHash = async (ophId) => {
  try {
    // Invalidate existing hash
    await invalidateHashesForOphId(ophId);
    
    // Generate new hash
    return await getOrCreateHash(ophId);
  } catch (error) {
    throw new Error(`Error regenerating hash: ${error.message}`);
  }
};

module.exports = {
  generateStructuredHash,
  getOrCreateHash,
  getOphIdFromHash,
  invalidateHash,
  invalidateHashesForOphId,
  regenerateHash,
};

