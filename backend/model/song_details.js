const db = require("../DB/connect");

const getSongDetails = async (ophid, songId) => {
  const [content] = await db.execute(
    `SELECT DISTINCT sre.song_name, sre.primary_artist, sr.release_date, vd.image_url, ud.stage_name, ud.full_name
FROM song_release sre
LEFT JOIN user_details ud ON ud.oph_id = sre.oph_id
LEFT JOIN songs_register sr ON sre.songId = sr.song_id 
LEFT JOIN video_details vd ON sr.song_id = vd.song_id
WHERE sre.oph_id = ? AND sre.songId = ?`,
    [ophid, songId]
  );

  const [secondary_artist] = await db.execute(
    `SELECT DISTINCT sre.oph_id, sa.artist_type, sa.artist_name FROM song_release sre LEFT JOIN secondary_artist sa ON sre.songId = sa.song_id WHERE 
    sre.oph_id = ? AND sre.songId = ?
    `,
    [ophid, songId]
  );

  const saMap = {};

  secondary_artist.forEach((row) => {
    if (!saMap[row.oph_id]) {
      saMap[row.oph_id] = {
        featuring: [],
        lyricist: [],
        producer: [],
        composer: [],
      };
    }

    switch (row.artist_type) {
      case "Featuring Artist":
        saMap[row.oph_id].featuring.push(row.artist_name);
        break;
      case "Lyricist Artist":
        saMap[row.oph_id].lyricist.push(row.artist_name);
        break;
      case "Producer Artist":
        saMap[row.oph_id].producer.push(row.artist_name);
        break;
      case "Composer Artist":
        saMap[row.oph_id].composer.push(row.artist_name);
        break;
    }
  });

  const [release_details] = await db.execute(
    `SELECT DISTINCT 
     release_time, youtube_release_time, spotify_release_time, apple_release_time, 
     instagram_release_time, facebook_release_time, 
     share_url, youtube_url, spotify_url, apple_url, instagram_url, facebook_url 
   FROM song_release 
   WHERE oph_id = ? AND songId = ?`,
    [ophid, songId]
  );

  const releaseDetailsMap = [];

  if (release_details.length > 0) {
    const rd = release_details[0];

    releaseDetailsMap.push(
      {
        stream_name: "Song Release Timing",
        release_time: rd.release_time,
        link: rd.share_url,
        status: rd.release_time ? 1 : 0
      },
      {
        stream_name: "Music Video Release Timing YouTube",
        release_time: rd.youtube_release_time,
        link: rd.youtube_url,
        status: rd.release_time ? 1 : 0
      },
      {
        stream_name: "Spotify Release Timing",
        release_time: rd.spotify_release_time,
        link: rd.spotify_url,
        status: rd.release_time ? 1 : 0
      },
      {
        stream_name: "Apple Music Release Timing",
        release_time: rd.apple_release_time,
        link: rd.apple_url,
        status: rd.release_time ? 1 : 0
      },
      {
        stream_name: "Instagram Reels Timing",
        release_time: rd.instagram_release_time,
        link: rd.instagram_url,
        status: rd.release_time ? 1 : 0
      },
      {
        stream_name: "Facebook Reels Timing",
        release_time: rd.facebook_release_time,
        link: rd.facebook_url,
        status: rd.release_time ? 1 : 0
      }
    );
  }

  console.log(saMap[ophid]);
  

  const songMap = {
    content: content[0],
    secondary_artists: saMap[ophid],
    release_details: releaseDetailsMap,
  };

  return songMap;
};

module.exports = { getSongDetails };
