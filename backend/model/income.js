const db = require("../DB/connect");

// Get income summary: song_social_metrics + song_audio_metrics + artist_income
// artist_income holds revenue from Content Analysis, Audio Platform, and Event prizes
const getIncome = async (ophid) => {
    const oph = String(ophid || "").trim();
    if (!oph) return [];

    // 1) Song count + revenue from song_social_metrics and song_audio_metrics
    const [metricsRows] = await db.execute(
        `SELECT
            sm.OPH_ID,
            COUNT(DISTINCT sm.song_id) AS distinct_song_count,
            COUNT(sm.song_id) AS total_song_count,
            IFNULL(SUM(sm.youtube_revenue), 0) AS metrics_youtube,
            IFNULL(am.total_audio_revenue, 0) AS metrics_audio
         FROM song_social_metrics sm
         LEFT JOIN (
            SELECT OPH_ID, SUM(audio_platform_revenue) AS total_audio_revenue
            FROM song_audio_metrics
            GROUP BY OPH_ID
         ) am ON sm.OPH_ID = am.OPH_ID
         WHERE sm.OPH_ID = ?
         GROUP BY sm.OPH_ID`,
        [oph]
    );

    // 2) Revenue from artist_income (Content Analysis, Audio Platform, Event prizes)
    let aiYoutube = 0, aiAudio = 0, aiEvents = 0, aiOther = 0;
    try {
        const [aiRows] = await db.execute(
            `SELECT income_type, IFNULL(SUM(amount), 0) AS total
             FROM artist_income
             WHERE oph_id = ?
             GROUP BY income_type`,
            [oph]
        );
        (aiRows || []).forEach((r) => {
            const t = parseFloat(r.total) || 0;
            if (r.income_type === "youtube_revenue") aiYoutube = t;
            else if (r.income_type === "audio_platform_revenue") aiAudio = t;
            else if (r.income_type === "Events") aiEvents = t;
            else aiOther += t;
        });
    } catch {
        // artist_income table may not exist
    }

    const metrics = metricsRows[0];
    if (!metrics) {
        // No songs in metrics; return row from artist_income only
        const totalYoutube = aiYoutube;
        const totalAudio = aiAudio;
        const totalRevenue = totalYoutube + totalAudio + aiEvents + aiOther;
        if (totalRevenue === 0) return [];
        return [{
            OPH_ID: oph,
            distinct_song_count: 0,
            total_song_count: 0,
            total_youtube_revenue: totalYoutube,
            total_audio_revenue: totalAudio,
            total_events_revenue: aiEvents + aiOther,
            total_revenue: totalRevenue,
        }];
    }

    // Combine song metrics + artist_income
    const metricsYoutube = parseFloat(metrics.metrics_youtube) || 0;
    const metricsAudio = parseFloat(metrics.metrics_audio) || 0;
    // Use max(metrics, artist_income) per type to avoid double-count when same revenue is in both
    const totalYoutube = Math.max(metricsYoutube, aiYoutube);
    const totalAudio = Math.max(metricsAudio, aiAudio);
    const totalRevenue = totalYoutube + totalAudio + aiEvents + aiOther;

    return [{
        OPH_ID: metrics.OPH_ID,
        distinct_song_count: metrics.distinct_song_count,
        total_song_count: metrics.total_song_count,
        total_youtube_revenue: totalYoutube,
        total_audio_revenue: totalAudio,
        total_events_revenue: aiEvents + aiOther,
        total_revenue: totalRevenue,
    }];
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
                OPH_ID as oph_id,
                NULL as song_id,
                NULL as song_name,
                'withdrawal' as source,
                withdraw_amount as amount,
                status,
                reason as description,
                created_at
            FROM withdraw 
            WHERE OPH_ID = ?

            ORDER BY created_at DESC`,
            [ophid, ophid]
        );
        return rows;
    } catch (error) {
        // If artist_income table doesn't exist, just return withdrawals
        const [rows] = await db.execute(
            `SELECT 
                'withdraw' as type,
                OPH_ID as oph_id,
                NULL as song_id,
                NULL as song_name,
                'withdrawal' as source,
                withdraw_amount as amount,
                status,
                reason as description,
                created_at
            FROM withdraw 
            WHERE OPH_ID = ?
            ORDER BY created_at DESC`,
            [ophid]
        );
        return rows;
    }
};

module.exports = { getIncome, getTransactionHistory };