console.time("totalTime");

// --------------------- Constants --------------------- //
const NUM_TEST_ARTISTS = 10000;

// Weights
const TRAFFIC_WEIGHT = 0.20;
const SONGS_WEIGHT = 0.15;
const VIEW_WEIGHT = 0.30;
const EVENT_WEIGHT = 0.20;
const AVG_VIEW_WEIGHT = 0.15;

// --------------------- Generate Test Data --------------------- //
console.time("dataGeneration");

const generateTestArtists = (num) => {
    const data = {};
    for (let i = 1; i <= num; i++) {
        data[`artist${i}`] = {
            traffic: Math.floor(Math.random() * 5000),
            songs: Math.floor(Math.random() * 10) + 1,
            view: Math.floor(Math.random() * 100000),
            event: Math.floor(Math.random() * 15) + 1,
            avgView: Math.floor(Math.random() * 1000) + 50
        };
    }
    return data;
};

const artistData = generateTestArtists(NUM_TEST_ARTISTS);

console.timeEnd("dataGeneration");

// --------------------- Calculate Max Values --------------------- //
console.time("maxCalculation");

const calculateMaxValues = (artists) => {
    const maxValues = {};
    for (const artistKey in artists) {
        const artist = artists[artistKey];
        for (const field in artist) {
            if (!maxValues[field] || artist[field] > maxValues[field].value) {
                maxValues[field] = { value: artist[field], artist: artistKey };
            }
        }
    }
    return maxValues;
};

const maxValues = calculateMaxValues(artistData);

console.timeEnd("maxCalculation");

// --------------------- Normalize Scores --------------------- //
console.time("scoreCalculation");

const normalizeScores = (artist, maxValues) => {
    return {
        traffic: (artist.traffic / maxValues.traffic.value) * 100,
        songs: (artist.songs / maxValues.songs.value) * 100,
        view: (artist.view / maxValues.view.value) * 100,
        event: (artist.event / maxValues.event.value) * 100,
        avgView: (artist.avgView / maxValues.avgView.value) * 100,
    };
};

const artistMap = new Map();

for (const artistKey in artistData) {
    const rawData = artistData[artistKey];
    const normalized = normalizeScores(rawData, maxValues);
    artistMap.set(artistKey, {
        ...rawData,
        score: normalized
    });
}

console.timeEnd("scoreCalculation");

// --------------------- Calculate Weighted Scores & Sort --------------------- //
console.time("finalScoreCalculation");

const artistScores = [];

for (const [artistName, artistEntry] of artistMap.entries()) {
    const s = artistEntry.score;

    const weightedScore =
        (s.traffic * TRAFFIC_WEIGHT) +
        (s.songs * SONGS_WEIGHT) +
        (s.view * VIEW_WEIGHT) +
        (s.event * EVENT_WEIGHT) +
        (s.avgView * AVG_VIEW_WEIGHT);

    artistScores.push({
        artist: artistName,
        score: weightedScore
    });
}

artistScores.sort((a, b) => b.score - a.score);

console.timeEnd("finalScoreCalculation");

// --------------------- Total Time --------------------- //
console.timeEnd("totalTime");

// --------------------- Example Output --------------------- //
console.log("Top 5 artists by weighted score:");
console.log(artistScores.slice(0, 5));
