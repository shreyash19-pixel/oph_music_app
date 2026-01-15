const express = require("express");
const router = express.Router();

const db = require("../DB/connect");

router.post("/increment-count/:ophid", async (req, res) => {
  const { ophid } = req.params;

  if (!ophid) {
    return res
      .status(400)
      .json({ success: false, message: "ophid is required" });
  }

  try {
    // Update query: increment form_fill_count by 1
    // Note: Route parameter is 'ophid' but database column is 'oph_id'
    // Note: form_fill_count column may need to be added to user_details table if it doesn't exist
    const [result] = await db.execute(
      `UPDATE user_details
       SET form_fill_count = COALESCE(form_fill_count, 0) + 1,
           updated_at = NOW()
       WHERE oph_id = ?`,
      [ophid],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "form_fill_count incremented" });
  } catch (error) {
    console.error("DB Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
