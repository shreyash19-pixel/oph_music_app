const db = require("../../DB/connect");

const getAllAudioPlatforms = async () => {
  const [rows] = await db.query("SELECT * FROM audio_platforms ");
  return rows;
};

const addAudioPlatform = async (name) => {
  const [result] = await db.query(
    "INSERT INTO audio_platforms (name) VALUES (?)",
    [name],
  );
  return { id: result.insertId, name };
};

// delete by id
const deleteAudioPlatformById = async (id) => {
  const [result] = await db.query("DELETE FROM audio_platforms WHERE id = ?", [
    id,
  ]);
  return result.affectedRows;
};

const sanitize = (obj) => {
  const out = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = typeof obj[k] === "undefined" ? null : obj[k];
    }
  }
  return out;
};

const createSongAudioMetric = async (payload) => {
  const p = sanitize(payload);

  const sql = `
    INSERT INTO song_audio_metrics
      (song_id, OPH_ID, song_name, audio_platform_name, audio_platform_streams, audio_platform_revenue, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const params = [
    p.song_id,
    p.OPH_ID,
    p.song_name,
    p.audio_platform_name,
    // ensure streams is a number (or 0)
    typeof p.audio_platform_streams === "number"
      ? p.audio_platform_streams
      : parseInt(p.audio_platform_streams || 0),
    // revenue stored as string/decimal; allow null
    typeof p.audio_platform_revenue === "number"
      ? p.audio_platform_revenue
      : p.audio_platform_revenue,
  ];

  const [result] = await db.execute(sql, params);
  
  // If audio_platform_revenue is provided and > 0, try to insert into artist_income table
  // This is optional - fails gracefully if table doesn't exist
  const revenue = parseFloat(p.audio_platform_revenue);
  if (revenue && revenue > 0) {
    try {
      await db.execute(
        `INSERT INTO artist_income (oph_id, song_id, song_name, income_type, amount, description, created_at)
         VALUES (?, ?, ?, 'audio_platform_revenue', ?, ?, NOW())`,
        [p.OPH_ID, p.song_id, p.song_name, revenue, `${p.audio_platform_name} revenue`]
      );
    } catch (err) {
      console.log('Note: artist_income table insert skipped (table may not exist yet)');
    }
  }
  
  // result.insertId contains the newly created id
  const [rows] = await db.execute(
    "SELECT * FROM song_audio_metrics WHERE id = ?",
    [result.insertId],
  );
  return rows[0] || null;
};

const getSongAudioMetrics = async () => {
  const [rows] = await db.execute(
    `SELECT *
        FROM song_audio_metrics
        `,
  );
  return rows;
};

const getAllSongAudioMetrics = async () => {
  const [rows] = await db.execute(
    `SELECT t.*
        FROM song_audio_metrics t
        JOIN (
            SELECT song_id, MIN(id) AS min_id
            FROM song_audio_metrics
            GROUP BY song_id
        ) x ON t.song_id = x.song_id AND t.id = x.min_id;
        `,
  );
  return rows;
};

const getAllBySongId = async (songId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM song_audio_metrics
     WHERE song_id = ?
     ORDER BY id DESC;`,
    [songId],
  );
  return rows;
};

const updateSongAudioMetric = async (payload) => {
  const p = sanitize(payload);

  // Build set clause dynamically (only update provided keys except id/song_id)
  const allowed = [
    "OPH_ID",
    "song_name",
    "audio_platform_name",
    "audio_platform_streams",
    "audio_platform_revenue",
  ];
  const setParts = [];
  const params = [];

  for (const key of allowed) {
    if (p[key] !== null) {
      // coerce streams to number
      if (key === "audio_platform_streams") {
        const n =
          typeof p.audio_platform_streams === "number"
            ? p.audio_platform_streams
            : parseInt(p.audio_platform_streams || 0);
        setParts.push("audio_platform_streams = ?");
        params.push(n);
      } else if (key === "audio_platform_revenue") {
        // keep as string with 2 decimals if numeric-like
        const rev =
          typeof p.audio_platform_revenue === "number"
            ? Number(p.audio_platform_revenue).toFixed(2)
            : p.audio_platform_revenue;
        setParts.push("audio_platform_revenue = ?");
        params.push(rev);
      } else {
        setParts.push(`${key} = ?`);
        params.push(p[key]);
      }
    }
  }

  if (setParts.length === 0) {
    // nothing to update
    return null;
  }

  // Always update updated_at
  setParts.push("updated_at = NOW()");

  let whereSql = "";
  let whereParams = [];

  if (p.id) {
    whereSql = "WHERE id = ?";
    whereParams = [p.id];
  } else if (
    p.song_id &&
    typeof p.audio_platform_name !== "undefined" &&
    p.audio_platform_name !== null
  ) {
    // prefer exact match on audio_platform_name (empty string allowed)
    whereSql = "WHERE song_id = ? AND audio_platform_name = ?";
    whereParams = [p.song_id, p.audio_platform_name];
  } else {
    // Not enough info to target a record
    throw new Error(
      "Missing id or (song_id and audio_platform_name) to update",
    );
  }

  const sql = `UPDATE song_audio_metrics SET ${setParts.join(", ")} ${whereSql}`;
  const execParams = [...params, ...whereParams];

  const [result] = await db.execute(sql, execParams);

  // If update affected rows, fetch latest record
  if (result && result.affectedRows > 0) {
    // If id available use it; otherwise select by song_id+platform and pick latest
    if (p.id) {
      const [rows] = await db.execute(
        "SELECT * FROM song_audio_metrics WHERE id = ?",
        [p.id],
      );
      return rows[0] || null;
    } else {
      const [rows] = await db.execute(
        "SELECT * FROM song_audio_metrics WHERE song_id = ? AND audio_platform_name = ? ORDER BY id DESC LIMIT 1",
        [p.song_id, p.audio_platform_name],
      );
      return rows[0] || null;
    }
  }

  return null;
};

module.exports = {
  getAllSongAudioMetrics,
  getSongAudioMetrics,
  getAllBySongId,
  createSongAudioMetric,
  updateSongAudioMetric,
  getAllAudioPlatforms,
  addAudioPlatform,
  deleteAudioPlatformById,
};
