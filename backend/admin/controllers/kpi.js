const SongSocialMetrics = require('../model/kpi');
const { readFromS3 } = require("../../utils");
const getKPI = async (req, res) => {
  try {
    const { OPH_ID } = req.query; // make sure client passes ?OPH_ID=...
    if (!OPH_ID) {
      return res
        .status(400)
        .json({ success: false, message: "OPH_ID required" });
    }

    const Key = "monthly_kpi/kpi_metrics.json";
    const s3Data = await readFromS3(Key);

   const matchedRecords = [];

   for (const year of Object.keys(s3Data)) {
     for (const month of Object.keys(s3Data[year])) {
       const records = s3Data[year][month];

       if (records.length > 0) {
         // filter by OPH_ID before enriching
         const filtered = records.filter((r) => r.oph_id === OPH_ID);

         if (filtered.length > 0) {
           const enriched = filtered.map((r) => ({
             ...r,
             year,
             month,
           }));

           matchedRecords.push(...enriched);
         }
       }
     }
   }



    res.status(200).json({
      success: true,
      s3Metrics: matchedRecords,
    });
  } catch (error) {
    console.error("Error fetching Metric:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const getSongMetricsSummary = async (req, res) => {
  try {
    const metrics = await SongSocialMetrics.getMetricsSummary();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching song metrics summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });

  }
};


const insertOrUpdateKpiScore = async (req, res) => {
  try {
    const {
      OPH_ID,
      user_traffic,
      song_count,
      total_views,
      avg_view_duration,
      total_accepted_events,
      score
    } = req.body;

    if (!OPH_ID) {
      return res.status(400).json({ error: "Missing OPH_ID" });
    }

    await SongSocialMetrics.KpiScore(
      OPH_ID,
      user_traffic,
      song_count,
      total_views,
      avg_view_duration,
      total_accepted_events,
      score
    );

    res.status(200).json({ message: "Score inserted/updated successfully." });
  } catch (error) {
    console.error("Error inserting/updating KPI score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getArtistSearchFiltersController = async (req, res) => {
  try {
    const data = await SongSocialMetrics.getArtistSearchFilterOptions();
    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getTopSearchedArtistsController = async (req, res) => {
  try {
    const {
      q,
      page,
      per_page: perPageQ,
      perPage: perPageCamel,
      profession,
      location,
    } = req.query;

    const qTrim = String(q ?? "").trim();
    const profTrim = String(profession ?? "").trim();
    const locTrim = String(location ?? "").trim();

    if (!qTrim && !profTrim && !locTrim) {
      return res.status(400).json({
        success: false,
        message:
          "Provide search text (q) and/or profession and/or location filters",
      });
    }

    const perRaw = perPageQ ?? perPageCamel;
    const result = await SongSocialMetrics.getTopSearchedArtists(
      qTrim,
      page,
      perRaw,
      { profession: profTrim, location: locTrim },
    );

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result.rows,
      total: result.total,
      page: result.page,
      perPage: result.perPage,
      totalPages: result.totalPages,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const getTopArtistsController = async (req, res) => {

  try {

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page, 10) || 6));
    const { rows, total } = await SongSocialMetrics.getTopArtists(page, perPage);
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: rows,
      pagination: totalPages,
      total,
    });

  }

  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }

}


const getCollabArtistKpiDetailController = async (req, res) => {
  try {
    const { ophId } = req.params;
    if (!ophId || !String(ophId).trim()) {
      return res.status(400).json({
        success: false,
        message: "ophId is required",
      });
    }

    const detail = await SongSocialMetrics.getCollabArtistKpiDetail(
      String(ophId).trim(),
    );

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Artist not found",
      });
    }

    let lastKpiRun = null;
    try {
      lastKpiRun = await SongSocialMetrics.getKpiRunMetadata();
    } catch (metaErr) {
      console.warn("KPI run metadata unavailable:", metaErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: {
        profile: detail.profile,
        songMetrics: detail.songMetrics,
        lastKpiRun,
      },
    });
  } catch (error) {
    console.error("Error fetching collab artist KPI detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const fetchAllKpiScores = async (req, res) => {
  try {
    const scores = await SongSocialMetrics.getAllKpiScores();
    let lastKpiRun = null;
    try {
      lastKpiRun = await SongSocialMetrics.getKpiRunMetadata();
    } catch (metaErr) {
      console.warn("KPI run metadata unavailable:", metaErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: scores,
      lastKpiRun,
    });
  } catch (error) {
    console.error("Error fetching KPI scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const insertKpiRunMetadata = async (req, res) => {
  try {
    const {
      run_at,
      max_user_traffic,
      max_song_count,
      max_total_views,
      max_total_accepted_events,
      max_avg_view_seconds,
      max_kpi_score,
      artist_count,
    } = req.body;

    if (run_at == null) {
      return res.status(400).json({ error: "Missing run_at" });
    }

    await SongSocialMetrics.upsertKpiRunMetadata({
      run_at: new Date(run_at),
      max_user_traffic: Number(max_user_traffic) || 0,
      max_song_count: Number(max_song_count) || 0,
      max_total_views: Number(max_total_views) || 0,
      max_total_accepted_events: Number(max_total_accepted_events) || 0,
      max_avg_view_seconds: Number(max_avg_view_seconds) || 0,
      max_kpi_score: Number(max_kpi_score) || 0,
      artist_count: Number(artist_count) || 0,
    });

    res.status(200).json({ message: "KPI run metadata saved." });
  } catch (error) {
    console.error("Error saving KPI run metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getArtistProfile = async (req, res) => {

  try{

    const {id} = req.query

    if(!id)
    {
      return res.status(400).json({
        success: false,
        message: "Missing required field"
      })
    }

    const response = await SongSocialMetrics.getArtistProfile(id)
    
    if(response)
    {
      return res.status(200).json({
        success:true,
        message: "Data fetched successfully",
        data: response
      })
    }

    return res.status(404).json({
      success: false,
      message: "Artist details not found",
      data: null,
    })

  }

  catch (err){
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }

}

const fetchmonthly = async (req, res) => {

  try {

    const response = await SongSocialMetrics.fetchmonthly()

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response
      })
    }

  }

  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }



};

const getSpecialArtistMonthlyMetrics = async (req, res) => {
  try {
    const rows = await SongSocialMetrics.getApprovedSpecialArtistTrafficAndEvents();
    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching special artist monthly metrics:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

module.exports = {
  getSongMetricsSummary,
  fetchAllKpiScores,
  insertOrUpdateKpiScore,
  insertKpiRunMetadata,
  getCollabArtistKpiDetailController,
  getArtistSearchFiltersController,
  getTopSearchedArtistsController,
  getTopArtistsController,
  getArtistProfile,
  fetchmonthly,
  getKPI,
  getSpecialArtistMonthlyMetrics,
};
