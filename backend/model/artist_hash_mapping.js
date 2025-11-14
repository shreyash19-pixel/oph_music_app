const db = require("../DB/connect");
const crypto = require("crypto");

// Secret key for hashing - should be in environment variables
const HASH_SECRET = process.env.HASH_SECRET || "oph-music-app-secret-key-change-in-production";

/**
 * Generate a hash for an OPH ID
 * @param {string} ophId - The OPH ID to hash
 * @returns {string} - The generated hash
 */
const generateHash = (ophId) => {
  return crypto
    .createHash("sha256")
    .update(ophId + HASH_SECRET)
    .digest("hex");
};

/**
 * Get or create a hash for an OPH ID
 * If hash exists and is active, return it. Otherwise, create a new one.
 * @param {string} ophId - The OPH ID
 * @returns {Promise<string>} - The hash for the OPH ID
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

    // Generate new hash
    const hash = generateHash(ophId);

    // Insert into database
    await db.execute(
      "INSERT INTO artist_hash_mapping (oph_id, hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE hash = VALUES(hash), is_active = 1, expires_at = NULL",
      [ophId, hash]
    );

    return hash;
  } catch (error) {
    throw new Error(`Error generating hash: ${error.message}`);
  }
};

/**
 * Get OPH ID from hash
 * @param {string} hash - The hash to lookup
 * @returns {Promise<string|null>} - The OPH ID or null if not found
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
 * @param {string} hash - The hash to invalidate
 * @returns {Promise<boolean>} - True if successful
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
 * @param {string} ophId - The OPH ID
 * @returns {Promise<boolean>} - True if successful
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

module.exports = {
  generateHash,
  getOrCreateHash,
  getOphIdFromHash,
  invalidateHash,
  invalidateHashesForOphId,
};

