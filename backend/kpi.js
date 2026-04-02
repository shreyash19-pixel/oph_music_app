import Backendaxios from "./utils/backendAxios.js";
import { fileURLToPath } from "url";
import path from "path";

const TRAFFIC_WEIGHT = 0.2;
const SONGS_WEIGHT = 0.15;
const VIEW_WEIGHT = 0.3;
const EVENT_WEIGHT = 0.2;
const AVG_VIEW_WEIGHT = 0.15;

const timeToSeconds = (timeStr) => {
  const [h, m, s] = timeStr.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

const fetchKPIData = async () => {
  try {
    const res = await Backendaxios.get("/get_kpi_model");
    return res.data.map((entry) => ({
      OPH_ID: entry.OPH_ID,
      user_traffic: entry.user_traffic || 0,
      song_count: entry.song_count || 0,
      total_views: parseInt(entry.total_views, 10) || 0,
      avg_view_duration: entry.avg_view_duration || "00:00:00",
      total_accepted_events: entry.total_accepted_events || 0,
      avgViewInSeconds: timeToSeconds(entry.avg_view_duration || "00:00:00"),
    }));
  } catch (err) {
    console.error("Error fetching KPI data:", err);
    return [];
  }
};

const processArtists = async () => {
  const artistArray = await fetchKPIData();
  console.log(artistArray);
  console.timeEnd("dataFetch");

  // Max values
  const maxValues = {
    user_traffic: 0,
    song_count: 0,
    total_views: 0,
    total_accepted_events: 0,
    avgViewInSeconds: 0,
  };

  artistArray.forEach((artist) => {
    Object.keys(maxValues).forEach((key) => {
      maxValues[key] = Math.max(maxValues[key], artist[key]);
    });
  });

  const backendURL = "/insert_kpi_score"; // change this if deployed

  for (const artist of artistArray) {
    const normalized = {
      traffic: (artist.user_traffic / maxValues.user_traffic) * 100 || 0,
      songs: (artist.song_count / maxValues.song_count) * 100 || 0,
      view: (artist.total_views / maxValues.total_views) * 100 || 0,
      event:
        (artist.total_accepted_events / maxValues.total_accepted_events) *
          100 || 0,
      avgView:
        (artist.avgViewInSeconds / maxValues.avgViewInSeconds) * 100 || 0,
    };

    const score = (
      normalized.traffic * TRAFFIC_WEIGHT +
      normalized.songs * SONGS_WEIGHT +
      normalized.view * VIEW_WEIGHT +
      normalized.event * EVENT_WEIGHT +
      normalized.avgView * AVG_VIEW_WEIGHT
    ).toFixed(2);

    try {
      await Backendaxios.post(backendURL, {
        OPH_ID: artist.OPH_ID,
        user_traffic: artist.user_traffic,
        song_count: artist.song_count,
        total_views: artist.total_views,
        avg_view_duration: artist.avg_view_duration,
        total_accepted_events: artist.total_accepted_events,
        score,
      });
    } catch (err) {
      console.error(`Failed to insert KPI for ${artist.OPH_ID}`, err.message);
    }
  }

  console.log("✅ All KPI scores inserted/updated.");
};

export default async function runKpiTask() {
  console.time("totalTime");
  console.time("dataFetch");
  console.time("scoreCalculation");
  console.time("sorting");
  try {
    await processArtists();
    console.timeEnd("scoreCalculation");
    console.timeEnd("sorting");
  } finally {
    console.timeEnd("totalTime");
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  runKpiTask().catch((err) => {
    console.error("Processing failed:", err);
    process.exit(1);
  });
}
