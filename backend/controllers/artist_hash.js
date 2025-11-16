const { getOrCreateHash, regenerateHash } = require("../model/artist_hash_mapping");

/**
 * Generate or get token for an OPH ID
 * This endpoint can be used to generate tokens for OPH IDs
 * Format: stagename-profession-abc123
 */
const generateHashController = async (req, res) => {
  try {
    const { oph_id, regenerate } = req.query;

    if (!oph_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: oph_id",
      });
    }

    let hash;
    if (regenerate === "true" || regenerate === "1") {
      // Regenerate hash (invalidates old and creates new)
      hash = await regenerateHash(oph_id);
    } else {
      // Get existing or create new
      hash = await getOrCreateHash(oph_id);
    }

    return res.status(200).json({
      success: true,
      message: "Hash generated successfully",
      data: {
        oph_id,
        hash,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { generateHashController };

