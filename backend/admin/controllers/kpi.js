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
         const filtered = records.filter((r) => r.OPH_ID === OPH_ID);

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

const getTopSearchedArtistsController = async (req, res) => {

  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const response = await SongSocialMetrics.getTopSearchedArtists(q)

    if (response) {
      return res.status(201).json({
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

}


const getTopArtistsController = async (req, res) => {

  try {

    const response = await SongSocialMetrics.getTopArtists()
    // const specialArtisdt
    
    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
      })
    }

  }

  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }

}


const fetchAllKpiScores = async (req, res) => {
  try {
    console.log("before");
    
    const scores = await SongSocialMetrics.getAllKpiScores();

    console.log(scores);
    

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: scores
    });
  } catch (error) {
    console.error("Error fetching KPI scores:", error);
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
    console.log(response);
    
    if(response)
    {
      return res.status(200).json({
        success:true,
        message: "Data fetched successfully",
        data: response
      })
    }

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



}

module.exports = {
  getSongMetricsSummary,
  fetchAllKpiScores,
  insertOrUpdateKpiScore,
  getTopSearchedArtistsController,
  getTopArtistsController,
  getArtistProfile,
  fetchmonthly,
  getKPI,
};
