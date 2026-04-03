const db = require("../../DB/connect");

const getMetricsSummary = async () => {
  const [rows] = await db.execute(`
    SELECT
    sm.OPH_ID,
    COUNT(DISTINCT sm.song_id) AS song_count,
    SUM(sm.youtube_views) AS total_views,
    SEC_TO_TIME(
        ROUND(
            SUM(TIME_TO_SEC(sm.youtube_avg_view_duration)) / COUNT(DISTINCT sm.song_id)
        )
    ) AS avg_view_duration,
    SUM(sm.insta_engagement) AS total_insta_engagement,
    IFNULL(ud.traffic, 0) AS user_traffic,
    IFNULL(ep.accepted_event_count, 0) AS total_accepted_events
FROM
    OphData.song_social_metrics sm
LEFT JOIN (
    SELECT
        OPH_ID,
        COUNT(*) AS accepted_event_count
    FROM
        event_participants
    WHERE
        status = 'accepted'
    GROUP BY
        OPH_ID
) ep ON sm.OPH_ID = ep.OPH_ID
LEFT JOIN
    user_details ud ON sm.OPH_ID = ud.oph_id
GROUP BY
    sm.OPH_ID;

`);

  return rows;
};

const KpiScore = async (
  OPH_ID,
  user_traffic,
  song_count,
  total_views,
  avg_view_duration,
  total_accepted_events,
  score,
) => {
  const query = `
    INSERT INTO KPI_score (
      oph_id, user_traffic, song_count, total_views,
      avg_view_duration, total_accepted_events, score
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_traffic = VALUES(user_traffic),
      song_count = VALUES(song_count),
      total_views = VALUES(total_views),
      avg_view_duration = VALUES(avg_view_duration),
      total_accepted_events = VALUES(total_accepted_events),
      score = VALUES(score)
  `;

  await db.execute(query, [
    OPH_ID,
    user_traffic,
    song_count,
    total_views,
    avg_view_duration,
    total_accepted_events,
    score,
  ]);
};

const getArtistSearchFilterOptions = async () => {
  const visible = `
    IFNULL(ud.is_active, 1) = 1
    AND (
      UPPER(ud.oph_id) LIKE '%-SA-%'
      OR LOWER(TRIM(IFNULL(app.overall_status, ''))) IN ('completed', 'approved')
    )
  `;

  const [profRows] = await db.execute(
    `
    SELECT DISTINCT TRIM(pd.profession) AS val
    FROM user_details ud
    LEFT JOIN application_status app ON ud.oph_id = app.oph_id
    LEFT JOIN professional_details pd ON ud.oph_id = pd.OPH_ID
    WHERE ${visible}
      AND pd.profession IS NOT NULL AND TRIM(pd.profession) <> ''
    ORDER BY val ASC
    `,
  );

  const [locRows] = await db.execute(
    `
    SELECT DISTINCT TRIM(ud.location) AS val
    FROM user_details ud
    LEFT JOIN application_status app ON ud.oph_id = app.oph_id
    WHERE ${visible}
      AND ud.location IS NOT NULL AND TRIM(ud.location) <> ''
    ORDER BY val ASC
    `,
  );

  return {
    professions: profRows.map((r) => r.val).filter(Boolean),
    locations: locRows.map((r) => r.val).filter(Boolean),
  };
};

const getTopSearchedArtists = async (
  searchQuery,
  page = 1,
  perPage = 10,
  filterOpts = {},
) => {
  const raw = String(searchQuery ?? "").trim();
  const profession = String(filterOpts.profession ?? "").trim();
  const location = String(filterOpts.location ?? "").trim();
  const p = Math.max(1, parseInt(page, 10) || 1);
  const per = Math.min(50, Math.max(1, parseInt(perPage, 10) || 10));
  const offset = (p - 1) * per;

  if (!raw && !profession && !location) {
    return {
      rows: [],
      total: 0,
      page: 1,
      perPage: per,
      totalPages: 0,
    };
  }

  const likeParams = [];
  let textSearchSql = "";
  if (raw) {
    const esc = raw
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");
    const key = `%${esc}%`;
    for (let i = 0; i < 8; i++) likeParams.push(key);
    textSearchSql = `
      AND (
        LOWER(IFNULL(ud.oph_id, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(ud.stage_name, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(ud.full_name, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(ud.location, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(ud.email, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(ud.contact_number, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(ud.artist_type, '')) LIKE LOWER(?)
        OR LOWER(IFNULL(pd.profession, '')) LIKE LOWER(?)
      )`;
  }

  let filterSql = "";
  const filterParams = [];
  if (profession) {
    filterSql += " AND LOWER(TRIM(IFNULL(pd.profession, ''))) = LOWER(?)";
    filterParams.push(profession);
  }
  if (location) {
    filterSql += " AND LOWER(TRIM(IFNULL(ud.location, ''))) = LOWER(?)";
    filterParams.push(location);
  }

  const paramArray = [...likeParams, ...filterParams];

  const fromWhere = `
    FROM user_details ud
    LEFT JOIN application_status app
      ON ud.oph_id = app.oph_id
    LEFT JOIN professional_details pd
      ON ud.oph_id = pd.OPH_ID
    LEFT JOIN KPI_score kpi
      ON ud.oph_id = kpi.oph_id
    WHERE
      IFNULL(ud.is_active, 1) = 1
      AND (
        UPPER(ud.oph_id) LIKE '%-SA-%'
        OR LOWER(TRIM(IFNULL(app.overall_status, ''))) IN ('completed', 'approved')
      )
      ${textSearchSql}
      ${filterSql}
  `;

  const [countRows] = await db.execute(
    `SELECT COUNT(DISTINCT ud.oph_id) AS total ${fromWhere}`,
    paramArray,
  );
  const total = Number(countRows[0]?.total) || 0;

  const [rows] = await db.query(
    `
    SELECT DISTINCT
      ud.oph_id,
      ud.personal_photo,
      ud.full_name,
      ud.stage_name,
      pd.profession,
      ud.location,
      IFNULL(kpi.total_views, 0) AS total_views
    ${fromWhere}
    ORDER BY IFNULL(kpi.total_views, 0) DESC, ud.stage_name ASC
    LIMIT ${per} OFFSET ${offset}
    `,
    paramArray,
  );

  const totalPages = total > 0 ? Math.ceil(total / per) : 0;

  return {
    rows,
    total,
    page: p,
    perPage: per,
    totalPages,
  };
};

const getTopArtists = async (page = 1, perPage = 6) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const per = Math.min(100, Math.max(1, parseInt(perPage, 10) || 6));
  const offset = (p - 1) * per;

  const [countRows] = await db.execute(`
    SELECT COUNT(DISTINCT ud.oph_id) AS total
    FROM user_details ud
    INNER JOIN application_status app
      ON ud.oph_id = app.oph_id
      AND LOWER(TRIM(app.overall_status)) IN ('completed', 'approved')
  `);
  const total = Number(countRows[0]?.total) || 0;

  const [rows] = await db.query(
    `
    SELECT
      ud.oph_id,
      pf.profession,
      ud.location,
      ud.personal_photo,
      ud.stage_name,
      IFNULL(kpi.total_views, 0) AS total_views
    FROM user_details ud
    INNER JOIN application_status app
      ON ud.oph_id = app.oph_id
      AND LOWER(TRIM(app.overall_status)) IN ('completed', 'approved')
    LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.oph_id
    LEFT JOIN professional_details pf ON ud.oph_id = pf.OPH_ID
    ORDER BY IFNULL(kpi.score, 0) DESC, IFNULL(kpi.total_views, 0) DESC, ud.stage_name ASC
    LIMIT ${per} OFFSET ${offset}
    `,
  );

  return { rows, total };
};

const getSpecialArtist = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM application_status WHERE LOWER(TRIM(overall_status)) IN ('completed', 'approved')",
  );
  return rows;
};

const getArtistProfile = async (ophid) => {
  const [rows] = await db.execute(
    "WITH CTEArtistProfile AS ( SELECT ud.oph_id, ud.personal_photo, ud.stage_name, ud.full_name, pd.Profession, sa.artist_name,ud.location, kpi.total_views, pd.Bio,sr.song_id ,sr.Song_name,ssm.youtube_views,ad.audio_url , sr.`status` song_registeration_status, ad.`status` audio_details_status , vd.`status` video_details_status FROM user_details ud LEFT JOIN professional_details pd ON ud.oph_id = pd.OPH_ID LEFT JOIN songs_register sr ON ud.oph_id = sr.OPH_ID JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN song_social_metrics ssm ON sr.song_id = ssm.song_id LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.OPH_ID WHERE ud.oph_id = ?) SELECT * FROM CTEArtistProfile WHERE song_registeration_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved'",
    [ophid],
  );

  const [song_count] = await db.execute(
    "WITH CTEArtistSongCount AS (SELECT sr.oph_id, sr.`status` song_registration_status , ad.`status` audio_details_status, vd.`status` video_details_status FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id WHERE sr.oph_id = ?) SELECT oph_id, COUNT(oph_id) song_count FROM CTEArtistSongCount WHERE song_registration_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved' GROUP BY oph_id",
    [ophid],
  );

  let totalSongs = 0;

  if (song_count && song_count.length > 0 && song_count[0].song_count) {
    totalSongs = song_count[0].song_count;
  }
  const songMap = {};

  rows.forEach((row) => {
    const rowOphId = row.oph_id;

    if (!songMap[rowOphId]) {
      songMap[rowOphId] = {
        personal_photo: row.personal_photo,
        stage_name: row.stage_name,
        name: row.full_name,
        full_name: row.full_name,
        profession: row.Profession,
        location: row.location,
        total_views: row.total_views,
        bio: row.Bio,
        total_content: parseInt(totalSongs),
        songs: [],
      };
    }

    const existingSong = songMap[rowOphId].songs.find(
      (song) => song.name === row.Song_name,
    );

    if (existingSong) {
      if (
        row.artist_name &&
        !existingSong.featuring_artists.includes(row.artist_name)
      ) {
        existingSong.featuring_artists.push(row.artist_name);
      }
    } else {
      songMap[rowOphId].songs.push({
        name: row.Song_name,
        song_id: row.song_id,
        youtube_views: row.youtube_views,
        audio_file_url: row.audio_url,
        featuring_artists: row.artist_name ? [row.artist_name] : [],
      });
    }
  });

  if (songMap[ophid]) {
    return songMap[ophid];
  }

  // /get-top-artist lists all fully registered artists (Independent -IA- and Special -SA-);
  // detail view still returns a profile even if the strict triple-approved song CTE is empty.
  const [fallback] = await db.execute(
    `SELECT ud.oph_id, ud.personal_photo, ud.stage_name, ud.full_name, pd.Profession, ud.location, pd.Bio,
            IFNULL(kpi.total_views, 0) AS total_views
     FROM user_details ud
     INNER JOIN application_status app ON ud.oph_id = app.oph_id
       AND LOWER(TRIM(app.overall_status)) IN ('completed', 'approved')
     LEFT JOIN professional_details pd ON ud.oph_id = pd.OPH_ID
     LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.OPH_ID
     WHERE ud.oph_id = ?
     LIMIT 1`,
    [ophid],
  );
  if (!fallback || fallback.length === 0) {
    return null;
  }
  const u = fallback[0];
  return {
    personal_photo: u.personal_photo,
    stage_name: u.stage_name,
    name: u.full_name,
    full_name: u.full_name,
    profession: u.Profession,
    location: u.location,
    total_views: u.total_views,
    bio: u.Bio,
    total_content: parseInt(totalSongs, 10) || 0,
    songs: [],
  };
};

// Fetch all KPI scores, sorted by score descending
const getAllKpiScores = async () => {
  const [rows] = await db.execute(`
    WITH CTEKPI AS (
      SELECT
        ud.oph_id,
        ud.full_name,
        ud.stage_name,
        ud.personal_photo,
        ad.Song_name,
        ad.primary_artist,
        ad.audio_url,
        sa.artist_name,
        IFNULL(kpi.score, 0) AS score,
        sr.song_id,
        sr.status AS song_register_status,
        ad.status AS audio_details_status,
        vd.status AS video_details_status
      FROM user_details ud
      INNER JOIN application_status app
        ON ud.oph_id = app.oph_id
        AND LOWER(TRIM(app.overall_status)) IN ('completed', 'approved')
      LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.oph_id
      LEFT JOIN songs_register sr ON ud.oph_id = sr.oph_id
      LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id
      LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
      LEFT JOIN video_details vd ON sr.song_id = vd.song_id
      LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id
      WHERE sr.song_id IS NOT NULL
        AND ad.audio_url IS NOT NULL
        AND TRIM(ad.audio_url) <> ''
        AND (
          LOWER(TRIM(COALESCE(sas.overall_status, ''))) = 'approved'
          OR (
            sr.status = 'Approved'
            AND ad.status = 'approved'
            AND vd.status = 'approved'
          )
        )
    )
    SELECT *
    FROM CTEKPI`);

  const songMap = {};

  rows.forEach((row) => {
    if (!row.song_id) return;

    const ophid = row.oph_id;

    if (!songMap[ophid]) {
      songMap[ophid] = {
        oph_id: row.oph_id,
        fullName: row.full_name,
        stageName: row.stage_name,
        personalPhoto: row.personal_photo,
        primaryArtist: row.stage_name || row.full_name,
        kpiScore: row.score,
        songs: [],
      };
    }

    const existingSong = songMap[ophid].songs.find(
      (song) => song.songId === row.song_id,
    );

    if (existingSong) {
      if (
        row.artist_name &&
        !existingSong.secondaryArtist.includes(row.artist_name)
      ) {
        existingSong.secondaryArtist.push(row.artist_name);
      }
    } else {
      songMap[ophid].songs.push({
        songId: row.song_id,
        songName: row.Song_name,
        primaryArtist: row.primary_artist,
        audioUrl: row.audio_url,
        secondaryArtist: row.artist_name ? [row.artist_name] : [],
      });
    }
  });

  return songMap;
};

const fetchmonthly = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM KPI_score");
    return rows;
  } catch (error) {
    console.error("DB Error in fetchMonthly:", error);
    throw error;
  }
};

const getKpiRunMetadata = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM kpi_run_metadata WHERE id = 1 LIMIT 1",
  );
  return rows[0] || null;
};

const getArtistKpiProfileRow = async (ophId) => {
  const [rows] = await db.execute(
    `SELECT
      ud.oph_id AS oph_id,
      ud.full_name AS full_name,
      ud.stage_name AS stage_name,
      ud.personal_photo AS personal_photo,
      ud.location AS location,
      k.user_traffic AS kpi_user_traffic,
      k.song_count AS kpi_song_count,
      k.total_views AS kpi_total_views,
      k.avg_view_duration AS kpi_avg_view_duration,
      k.total_accepted_events AS kpi_total_accepted_events,
      k.score AS kpi_score
    FROM user_details ud
    LEFT JOIN KPI_score k ON ud.oph_id = k.oph_id
    WHERE ud.oph_id = ?`,
    [ophId],
  );
  return rows[0] || null;
};

const getArtistSongSocialMetricsAggregated = async (ophId) => {
  const [rows] = await db.execute(
    `SELECT
      sm.song_id AS song_id,
      MAX(COALESCE(sm.song_name, sr.Song_name)) AS song_name,
      SUM(COALESCE(sm.youtube_views, 0)) AS youtube_views,
      SUM(COALESCE(sm.youtube_engagement, 0)) AS youtube_engagement,
      SEC_TO_TIME(
        ROUND(
          SUM(TIME_TO_SEC(COALESCE(sm.youtube_avg_view_duration, '00:00:00')))
          / NULLIF(COUNT(*), 0)
        )
      ) AS youtube_avg_view_duration,
      SUM(COALESCE(sm.youtube_revenue, 0)) AS youtube_revenue,
      SUM(COALESCE(sm.insta_engagement, 0)) AS insta_engagement,
      MAX(sm.updated_at) AS last_updated
    FROM song_social_metrics sm
    LEFT JOIN songs_register sr
      ON sm.song_id = sr.song_id AND sr.oph_id = ?
    WHERE sm.OPH_ID = ?
    GROUP BY sm.song_id
    ORDER BY sm.song_id`,
    [ophId, ophId],
  );
  return rows;
};

const getCollabArtistKpiDetail = async (ophId) => {
  const profile = await getArtistKpiProfileRow(ophId);
  if (!profile) return null;
  const songMetrics = await getArtistSongSocialMetricsAggregated(ophId);
  return { profile, songMetrics };
};

const upsertKpiRunMetadata = async ({
  run_at,
  max_user_traffic,
  max_song_count,
  max_total_views,
  max_total_accepted_events,
  max_avg_view_seconds,
  max_kpi_score,
  artist_count,
}) => {
  await db.execute(
    `INSERT INTO kpi_run_metadata (
      id, run_at, max_user_traffic, max_song_count, max_total_views,
      max_total_accepted_events, max_avg_view_seconds, max_kpi_score, artist_count
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      run_at = VALUES(run_at),
      max_user_traffic = VALUES(max_user_traffic),
      max_song_count = VALUES(max_song_count),
      max_total_views = VALUES(max_total_views),
      max_total_accepted_events = VALUES(max_total_accepted_events),
      max_avg_view_seconds = VALUES(max_avg_view_seconds),
      max_kpi_score = VALUES(max_kpi_score),
      artist_count = VALUES(artist_count)`,
    [
      run_at,
      max_user_traffic,
      max_song_count,
      max_total_views,
      max_total_accepted_events,
      max_avg_view_seconds,
      max_kpi_score,
      artist_count,
    ],
  );
};

module.exports = {
  getMetricsSummary,
  getAllKpiScores,
  KpiScore,
  getArtistSearchFilterOptions,
  getTopSearchedArtists,
  getTopArtists,
  getArtistProfile,
  fetchmonthly,
  getKpiRunMetadata,
  upsertKpiRunMetadata,
  getCollabArtistKpiDetail,
};
