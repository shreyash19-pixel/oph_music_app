const db = require("../DB/connect");

// Get income summary from artist_income table
const getIncome = async (ophid) => {
    const [rows] = await db.execute(
        `SELECT
            oph_id AS OPH_ID,
            COUNT(DISTINCT song_id) AS distinct_song_count,
            COUNT(*) AS total_song_count,
            IFNULL(SUM(CASE WHEN income_type = 'youtube_revenue' THEN amount ELSE 0 END), 0) AS total_youtube_revenue,
            IFNULL(SUM(CASE WHEN income_type = 'audio_platform_revenue' THEN amount ELSE 0 END), 0) AS total_audio_revenue,
            IFNULL(SUM(amount), 0) AS total_revenue
         FROM artist_income
         WHERE oph_id = ?
         GROUP BY oph_id`,
        [ophid]
    );
    return rows;
};

// Get combined transaction history (income + withdrawals)
const getTransactionHistory = async (ophid) => {
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
};

module.exports = { getIncome, getTransactionHistory };