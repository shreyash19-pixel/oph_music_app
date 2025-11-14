const { getOrCreateHash } = require("../model/artist_hash_mapping");

/**
 * Generate or get hash for an OPH ID
 * This endpoint can be used to generate hashes for OPH IDs
 */
const generateHashController = async (req, res) => {
  try {
    const { oph_id } = req.query;

    if (!oph_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: oph_id",
      });
    }

    const hash = await getOrCreateHash(oph_id);

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

