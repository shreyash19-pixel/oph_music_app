const db = require("../../DB/connect");

const getSpecialArtistRequestedDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM special_artist_details WHERE status != 'approved'");
  return rows;
};

const getIndividualSpecialArtistDetails = async (ophid, field) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_details WHERE ophid = ? AND field = ? AND status = 'under review'",
    [ophid, field]
  );
  return rows;
};

const setArtistDetails = async (ophid, section, type, reason, content) => {
  let rows;

  if (type === "approved") {
    if (section === "Bio") {
      [rows] = await db.execute(
        "UPDATE professional_details SET Bio = ? WHERE OPH_ID = ?",
        [content, ophid]
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section]
      );
    } else if (section === "Artist Story") {
      [rows] = await db.execute(
        "UPDATE user_details SET artist_story = ? WHERE ophid = ?",
        [content, ophid]
      );
      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section]
      );
    } else if (section === "Video Bio") {
      [rows] = await db.execute(
        "UPDATE professional_details SET VideoURL = ? WHERE OPH_ID = ?",
        [content, ophid]
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section]
      );
    } else if (section === "Artist Story Video") {
      [rows] = await db.execute(
        "UPDATE user_details SET artist_story_video = ? WHERE ophid = ?",
        [content, ophid]
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section]
      );
    } else if (section === "Artist Photo") {
      [rows] = await db.execute(
        "UPDATE user_details SET personal_photo = ? WHERE ophid = ?",
        [content, ophid]
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section]
      );
    } else if (section === "Image update") {
      [rows] = await db.execute(
        "SELECT PhotoURLs FROM professional_details WHERE OPH_ID = ?",
        [ophid]
      );

      let getData = JSON.parse(rows[0].PhotoURLs);

      getData.push(content)[rows] = await db.execute(
        "UPDATE professional_details SET PhotoURLs = ? WHERE OPH_ID = ?",
        [getData, ophid]
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section]
      );
    }
  }

  if (type === "rejected") {
    [rows] = await db.execute(
      "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
      [type, reason, ophid, section]
    );
  }

  return rows;
};

module.exports = {
  getSpecialArtistRequestedDetails,
  getIndividualSpecialArtistDetails,
  setArtistDetails,
};
