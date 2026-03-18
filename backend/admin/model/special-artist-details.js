const db = require("../../DB/connect");

const getSpecialArtistRequestedDetails = async () => {
  const [rows] = await db.execute(`SELECT *
FROM (
  SELECT
    sad.*,
    ROW_NUMBER() OVER (
      PARTITION BY ophid, field
      ORDER BY date DESC
    ) AS rn
  FROM special_artist_details sad
 WHERE status IS NULL
   OR (status <> 'approved' AND status <> 'rejected')
) t
WHERE rn = 1
ORDER BY date DESC`);
  return rows;
};

const getIndividualSpecialArtistDetails = async (ophid, field) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_details WHERE ophid = ? AND field = ? AND status = 'under review' ORDER BY date DESC LIMIT 1",
    [ophid, field],
  );
  return rows;
};

const setArtistDetails = async (ophid, section, type, reason, content) => {
  let rows;

  console.log("f");

  if (type === "approved") {
    if (section === "Bio") {
      [rows] = await db.execute(
        "UPDATE professional_details SET bio = ? WHERE oph_id = ?",
        [content, ophid],
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section],
      );
    } else if (section === "Artist Story") {
      [rows] = await db.execute(
        "UPDATE user_details SET artist_story = ? WHERE oph_id = ?",
        [content, ophid],
      );
      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section],
      );
    } else if (section === "Video Bio") {
      [rows] = await db.execute(
        "UPDATE professional_details SET video_url   = ? WHERE oph_id = ?",
        [content, ophid],
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section],
      );
    } else if (section === "Artist Story Vid") {
      [rows] = await db.execute(
        "UPDATE user_details SET artist_story_video = ? WHERE oph_id = ?",
        [content, ophid],
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section],
      );
    } else if (section === "Artist Photo") {
      [rows] = await db.execute(
        "UPDATE user_details SET personal_photo = ? WHERE oph_id = ?",
        [content, ophid],
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section],
      );
    } else if (section === "Image update") {
      console.log("sdsdds");
      
      [rows] = await db.execute(
        "SELECT photo_urls FROM professional_details WHERE oph_id = ?",
        [ophid],
      );

      let getData = JSON.parse(rows[0].photo_urls);

      getData.push(content)[rows] = await db.execute(
        "UPDATE professional_details SET photo_urls = ? WHERE oph_id = ?",
        [getData, ophid],
      );

      [rows] = await db.execute(
        "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
        [type, null, ophid, section],
      );
    }
  }

  if (type === "rejected") {
    [rows] = await db.execute(
      "UPDATE special_artist_details SET status = ? , reason = ? WHERE ophid = ? AND field = ?",
      [type, reason, ophid, section],
    );
  }

  return rows;
};

module.exports = {
  getSpecialArtistRequestedDetails,
  getIndividualSpecialArtistDetails,
  setArtistDetails,
};
