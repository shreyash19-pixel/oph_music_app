const db = require("../../DB/connect");

// ✅ Get Supporting Numbers
const getSupportingNumbers = async () => {
  const [rows] = await db.execute("SELECT * FROM supporting_numbers");
  return rows;
};

// ✅ Update or Insert Supporting Numbers
const updateSupportingNumbers = async (
  total_artists,
  total_songs,
  total_audience
) => {
  // Try to update first
  const [result] = await db.execute(
    `UPDATE supporting_numbers 
     SET total_artists = ?, total_songs = ?, total_audience = ?`,
    [total_artists, total_songs, total_audience]
  );

  // If no rows were updated, insert a new one
  if (result.affectedRows === 0) {
    await db.execute(
      `INSERT INTO supporting_numbers (total_artists, total_songs, total_audience)
       VALUES (?, ?, ?)`,
      [total_artists, total_songs, total_audience]
    );
  }

  return { success: true, message: "Supporting numbers updated successfully" };
};


module.exports = {
  getSupportingNumbers,
  updateSupportingNumbers,
};
