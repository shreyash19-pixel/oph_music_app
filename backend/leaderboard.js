const viewWeight = 1000;
const songWeight = 500;

const calculateScore = (views, song) => {
  return (views / viewWeight) + (song * songWeight);
};

function generateArtists(numArtists = 10000) {
  const artists = {};

  for (let i = 1; i <= numArtists; i++) {
    const name = `artist${i}`;
    artists[name] = {
      views: Math.floor(Math.random() * (1_000_000 - 1_000 + 1)) + 1_000, // 1,000 – 1,000,000
      song: Math.floor(Math.random() * (20 - 1 + 1)) + 1                 // 1 – 20
    };
  }

  return artists;
}


const artists = generateArtists(10000);

// ✅ Start timer for score calculation only
console.time("Score calculation time");

const artistScores = Object.entries(artists).map(([name, data]) => {
  const score = calculateScore(data.views, data.song);
  return { name, score };
});

artistScores.sort((a, b) => b.score - a.score);

const scoreMap = new Map();
artistScores.forEach(artist => {
  scoreMap.set(artist.name, artist.score);
});

console.timeEnd("Score calculation time"); // ✅ End timer

console.log("Top 5 artists:", artistScores.slice(0, 5));
console.log("Score of artist5000:", scoreMap.get("artist5000"));
