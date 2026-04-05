import Backendaxios from "./utils/backendAxios.js";
import { fileURLToPath } from "url";
import path from "path";
const viewWeight = 1000;
const songWeight = 500;

const calculateScore = (views, song) => {
  return (views / viewWeight) + (song * songWeight);
};

// function generateArtists(numArtists = 10000) {
//   const artists = {};

//   for (let i = 1; i <= numArtists; i++) {
//     const name = `artist${i}`;
//     artists[name] = {
//       views: Math.floor(Math.random() * (1_000_000 - 1_000 + 1)) + 1_000, // 1,000 – 1,000,000
//       song: Math.floor(Math.random() * (20 - 1 + 1)) + 1                 // 1 – 20
//     };
//   }

//   return artists;
// }


// const artists = generateArtists(10000);

// ✅ Start timer for score calculation only
// console.time("Score calculation time");

// const artistScores = Object.entries(artists).map(([name, data]) => {
//   const score = calculateScore(data.views, data.song);
//   return { name, score };
// });

// artistScores.sort((a, b) => b.score - a.score);

// const scoreMap = new Map();
// artistScores.forEach(artist => {
//   scoreMap.set(artist.name, artist.score);
// });

// console.timeEnd("Score calculation time"); // ✅ End timer

// console.log("Top 5 artists:", artistScores.slice(0, 5));
// console.log("Score of artist5000:", scoreMap.get("artist5000"));


function ophKey(entry) {
  return entry.OPH_ID ?? entry.oph_id;
}

/** Independent artists use OPH IDs like OPH-CAN-IA-01 (segment `-IA-`). */
function isIndependentArtistOphId(ophId) {
  if (ophId == null || ophId === "") return false;
  return String(ophId).toUpperCase().includes("-IA-");
}

async function leaderboardGenerate() {
  const res = await Backendaxios.get("/leaderboard_data");
  const metricsThrough =
    res.headers?.["x-leaderboard-metrics-through"] ??
    res.headers?.["X-Leaderboard-Metrics-Through"];
  console.log(
    "[leaderboard] API rows:",
    Array.isArray(res.data) ? res.data.length : 0,
    "| song_social_metrics newest updated_at (UTC):",
    metricsThrough ?? "(header missing)"
  );
  console.log(res.data);

  const data = Array.isArray(res.data) ? res.data : [];
  const independentOnly = data.filter((entry) =>
    isIndependentArtistOphId(ophKey(entry)),
  );

  console.time("Score calculation time");

  const artistScores = independentOnly.map((entry) => {
    const views = entry.total_views;
    const score = calculateScore(views, entry.song_count);
    return { ...entry, score };
  });

  artistScores.sort((a, b) => b.score - a.score);

  const scoreMap = new Map();
  artistScores.forEach((artist) => {
    scoreMap.set(ophKey(artist), artist.score);
  });

  console.timeEnd("Score calculation time");
  console.log("Top 5 OPH_IDs:", artistScores.slice(0, 5));

  let postFailures = 0;
  for (const artist of artistScores) {
    const id = ophKey(artist);
    try {
      await Backendaxios.post("/update_leaderboard", {
        OPH_ID: id,
        song_count: artist.song_count,
        total_views: artist.total_views,
        score: artist.score,
      });
    } catch (postErr) {
      postFailures += 1;
      console.error(`Failed to update score for ${id}:`, postErr.message);
    }
  }

  if (postFailures > 0) {
    throw new Error(
      `Leaderboard: ${postFailures} of ${artistScores.length} POST /update_leaderboard call(s) failed`
    );
  }

  return artistScores;
}

export default async function runLeaderboardTask() {
  try {
    await leaderboardGenerate();
  } catch (error) {
    console.error("Error fetching data:");
    console.error("Status:", error?.response?.status);
    console.error("Response:", error?.response?.data);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    if (!error?.response) {
      console.error(
        "No HTTP response — is the API running? Expected baseURL:",
        Backendaxios.defaults.baseURL
      );
    }
    throw error;
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  runLeaderboardTask().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}