const db = require("../DB/connect");

const getIncome = async (ophid) => {
    const [rows] = await db.execute(
        `SELECT
            sm.OPH_ID,
            COUNT(DISTINCT sm.song_id) AS distinct_song_count,
            COUNT(sm.song_id) AS total_song_count,
            IFNULL(SUM(sm.youtube_revenue), 0) AS total_youtube_revenue,
            IFNULL(am.total_audio_revenue, 0) AS total_audio_revenue,
            IFNULL(SUM(sm.youtube_revenue), 0) + IFNULL(am.total_audio_revenue, 0) AS total_revenue
         FROM
            OphData.song_social_metrics sm
         LEFT JOIN (
            SELECT
                OPH_ID,
                SUM(audio_platform_revenue) AS total_audio_revenue
            FROM
                OphData.song_audio_metrics
            GROUP BY
                OPH_ID
         ) am
            ON sm.OPH_ID = am.OPH_ID
         WHERE sm.OPH_ID = ?
         GROUP BY sm.OPH_ID;`,
        [ophid]
      );
      return rows;
};

module.exports = { getIncome };