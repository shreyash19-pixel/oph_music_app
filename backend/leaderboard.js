import Backendaxios from "./utils/backendAxios.js";
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


async function leaderboardGenerate() {
try {
    const res = await Backendaxios.get('/leaderboard_data');
    console.log(res.data);

    const data = res.data;

    console.time("Score calculation time");

    const artistScores = data.map(entry => {
      const views = entry.total_views;
      const score = calculateScore(views, entry.song_count);
      return { ...entry, score };  // Add score to entry
    });

    artistScores.sort((a, b) => b.score - a.score);

    const scoreMap = new Map();
    artistScores.forEach(artist => {
      scoreMap.set(artist.OPH_ID, artist.score);
    });

    console.timeEnd("Score calculation time");
    console.log("Top 5 OPH_IDs:", artistScores.slice(0, 5));

    // Post each artist's score to the /update_leaderboard endpoint
    for (const artist of artistScores) {
      try {
        await Backendaxios.post('/update_leaderboard', {
          OPH_ID: artist.OPH_ID,
          song_count: artist.song_count,
          total_views: artist.total_views,
          score: artist.score
        });
      } catch (postErr) {
        console.error(`Failed to update score for ${artist.OPH_ID}:`, postErr.message);
      }
    }

    return artistScores;
  } catch (error) {
    console.error("Error fetching data:");
    console.error("Status:", error?.response?.status);
    console.error("Response:", error?.response?.data);
    console.error("Message:", error.message);
    return [];
  }
}


leaderboardGenerate();