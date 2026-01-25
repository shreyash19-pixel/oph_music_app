const db = require("../DB/connect");

// Get income summary from original tables (song_social_metrics + song_audio_metrics)
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
            song_social_metrics sm
         LEFT JOIN (
            SELECT
                OPH_ID,
                SUM(audio_platform_revenue) AS total_audio_revenue
            FROM
                song_audio_metrics
            GROUP BY
                OPH_ID
         ) am
            ON sm.OPH_ID = am.OPH_ID
         WHERE sm.OPH_ID = ?
         GROUP BY sm.OPH_ID`,
        [ophid]
    );
    return rows;
};

// Get combined transaction history (income from artist_income + withdrawals)
// Falls back gracefully if artist_income table doesn't exist
const getTransactionHistory = async (ophid) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                'income' as type,
                oph_id,
                song_id,
                song_name,
                income_type as source,
                amount,
                NULL as status,
                description,
                created_at
            FROM artist_income 
            WHERE oph_id = ?

            UNION ALL

            SELECT 
                'withdraw' as type,
                ophID as oph_id,
                NULL as song_id,
                NULL as song_name,
                'withdrawal' as source,
                withdraw_amount as amount,
                status,
                reason as description,
                created_at
            FROM withdraw 
            WHERE ophID = ?

            ORDER BY created_at DESC`,
            [ophid, ophid]
        );
        return rows;
    } catch (error) {
        // If artist_income table doesn't exist, just return withdrawals
        const [rows] = await db.execute(
            `SELECT 
                'withdraw' as type,
                ophID as oph_id,
                NULL as song_id,
                NULL as song_name,
                'withdrawal' as source,
                withdraw_amount as amount,
                status,
                reason as description,
                created_at
            FROM withdraw 
            WHERE ophID = ?
            ORDER BY created_at DESC`,
            [ophid]
        );
        return rows;
    }
};

module.exports = { getIncome, getTransactionHistory };