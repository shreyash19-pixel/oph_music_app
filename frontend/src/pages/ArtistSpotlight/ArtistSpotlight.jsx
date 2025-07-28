import React, { useEffect, useState } from "react";
import { Play, ChevronDown, Pause } from "lucide-react";
import axiosApi from "../../conf/axios";
import { useSelector } from "react-redux";

function Leaderboard({ leaderboardData, artist_id }) {
  return (
    <div className="overflow-x-auto">
    <table className="w-[100%] border-separate border-spacing-y-2">
  <thead>
    <tr className="text-center text-gray-400 rounded-2xl border-gray-800 rounded-2xl">
      <th className="py-2 px-3 lg:px-4">#</th>
      <th className="py-2 px-3 lg:px-4">ARTIST</th>
      <th className="py-2 px-3 lg:px-4">STAGE NAME</th>
      <th className="py-2 hidden lg:block px-3 lg:px-4">LOCATION</th>
      <th className="py-2 px-3 lg:px-4">SONGS</th>
      <th className="py-2 px-3 lg:px-4">REACH</th>
      <th className="py-2 hidden lg:block px-3 lg:px-4">PROFILE</th>
    </tr>
  </thead>
  <tbody>
    {leaderboardData.map((artist) => (
      <tr
        onClick={() => {
          window.open(`${import.meta.env.VITE_WEBSITE_URL}artists/${artist.artist_id}`, '_blank');
        }}
        key={artist.rank}
        className={`rounded-2xl text-center border-gray-800 rounded-full overflow-hidden ${
          artist.artist_id == artist_id ? "bg-[#6F4FA0]" : ""
        }`}
      >
        <td className="px-3 lg:px-4 py-2">
          <span
            className={`w-8 h-8 flex items-center justify-center text-md font-bold text-black ${
              artist.rank === 1
                ? "bg-yellow-400"
                : artist.rank === 2
                ? "bg-emerald-400"
                : artist.rank === 3
                ? "bg-cyan-400"
                : "bg-transparent text-white"
            }`}
          >
            {String(artist.rank).padStart(2, '0')}
          </span>
        </td>
        <td className="py-2 flex items-center justify-center px-3 lg:px-4">
          <img
            src={`${artist.profile_img_url}?height=40&width=40`}
            alt={artist.stage_name}
            className="w-8 h-8 rounded-full"
          />
        </td>
        <td className="py-2 px-3 lg:px-4">{artist.stage_name}</td>
        <td className="py-2 hidden lg:block px-3 lg:px-4">{artist.location}</td>
        <td className="py-2 px-3 lg:px-4">{artist.total_songs}</td>
        <td className="py-2 px-3 lg:px-4">{artist.total_reach}</td>
        <td className="py-2 hidden lg:block px-3 lg:px-4">
          <button className="px-3 lg:px-4 py-2 bg-[#6F4FA0] rounded-full text-sm hover:bg-[#6F4FA0] transition-colors">
            View Profile
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
}

function Songs({ id, otherSongs }) {
  const [audio, setAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null); // State for currently playing song ID
  const [artistSongs, setArtistSongs] = useState(null);
  const fetchSongRankingsById = async () => {
    try {
      if (id) {
        const response = await axiosApi.get(`/content/rankings?artist_id=${id}`)
        if (response.status == 200) {
          setArtistSongs(response.data.data)
        }
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  const handlePlayPause = (song) => {
    if (playingSongId === song.content_id) {
      // Toggle play/pause for the same song
      if (!audio?.paused) {
        audio?.pause();
        setPlayingSongId(null);
      } else {
        audio?.play()?.catch((error) => {
          console.error('Audio play failed:', error);
        });
        setPlayingSongId(song.content_id);
      }
    } else {
      // New song selected
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.audio_file_url);
      newAudio.play().catch((error) => {
        console.error('Audio play failed:', error);
      });
      setAudio(newAudio);
      setPlayingSongId(song.content_id);
    }
  };
  useEffect(() => {
    fetchSongRankingsById();
  }, [])

  return (
    <div className="space-y-6">
      {/* Current Song */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 px-2 lg:px-4">#</th>
              <th className="py-2 px-2 lg:px-4">SONGS NAME</th>
              <th className="py-2 px-2 lg:px-4">PLAYS</th>
              <th className="py-2 px-2 hidden lg:block lg:px-4">TIME</th>
              <th className="py-2 px-2 lg:px-4">PLAY</th>
            </tr>
          </thead>
          <tbody>
            {artistSongs &&
              artistSongs.map((artist, index) => (
                <tr key={index}>
                  <td className="py-4 px-2 lg:px-4">
                    <span className="bg-green-500 px-2 py-1 text-sm">
                      {artist.rank}
                    </span>
                  </td>
                  <td className="py-4 px-2 lg:px-4">
                    <div
                      onClick={() => {
                        window.open(`${import.meta.env.VITE_WEBSITE_URL}content/${artist.content_id}`, '_blank');
                      }}
                    >
                      <div>{artist.name}</div>
                      <div className="text-sm text-gray-400">
                        {artist.secondary_artists.map((art, ind) =>
                          ind !== artist.secondary_artists.length - 1
                            ? art + ", "
                            : art
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 lg:px-4">{artist.total_reach}</td>
                  <td className="py-4 lg:block hidden px-2 lg:px-4">05:12</td>
                  <td className="py-4 px-2 lg:px-4">
                    <button
                      className="p-2 bg-[#6F4FA0] rounded-full hover:bg-[#6F4FA0] transition-colors"
                      onClick={() => handlePlayPause(artist)}
                    >
                      {playingSongId === artist.content_id && !audio?.paused ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Other Songs Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold lg:px-0 px-6 text-cyan-400">Other Songs</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="py-2 px-2 lg:px-4">#</th>
              <th className="py-2 px-2 lg:px-4">SONGS NAME</th>
              <th className="py-2 px-2 lg:px-4">PLAYS</th>
              <th className="py-2 px-2 hidden lg:block lg:px-4">TIME</th>
              <th className="py-2 px-2 lg:px-4">PLAY</th>
            </tr>
          </thead>
          <tbody>
            {otherSongs &&
              otherSongs.slice(0, 5).map((artist, index) => (
                <tr key={artist.content_id}>
                  <td className="py-4 px-2 lg:px-4">
                    <span className="px-2 py-1 rounded text-sm">
                      {artist.rank}
                    </span>
                  </td>
                  <td className="py-4 px-2 lg:px-4">
                    <div>
                      <div>{artist.name}</div>
                      <div className="text-sm text-gray-400">
                        {artist.secondary_artists.map((art, ind) =>
                          ind !== artist.secondary_artists.length - 1
                            ? art + ", "
                            : art
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 lg:px-4">{artist.total_reach}</td>
                  <td className="py-4 lg:block hidden px-2 lg:px-4">05:12</td>
                  <td className="py-4 px-2 lg:px-4">
                    <button
                      className="p-2 bg-[#6F4FA0] rounded-full hover:bg-[#6F4FA0] transition-colors"
                      onClick={() => handlePlayPause(artist)}
                    >
                      {playingSongId === artist.content_id && !audio?.paused ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ArtistSpotlight() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const leaderboard = useSelector((state) => state.newRelease.leaderboard);
  const [artist_id, setArtistID] = useState(null);
  const [songsById, setSongsById] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [artist, setArtist] = useState(null);

  const fetchArtistSpotlight = async () => {
    setIsLoading(true);
    try {
      const response = await axiosApi.get('/website-configs/highlighted-story');
      if (response.status === 200) {
        setArtist(response.data.data);
        setArtistID(response.data.data.id);
      }
    } catch (err) {
      setError("Failed to Load Artist Spotlight");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSongRankings = async () => {
    try {
      const response = await axiosApi.get(`/content/rankings`);
      if (response.status == 200) {
        setSongs(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(() => {
  //   fetchArtistSpotlight();
  //   fetchSongRankings();
  // }, []);

  return (
    <>
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 rounded-2xl-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2 text-cyan-400">Loading Artist Spotlight...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500/20 rounded hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}
      {!isLoading && !error && (
        <div className="min-h-[calc(100vh-70px)] text-gray-100 p-0 lg:p-6">
          <div className="max-w-8xl mx-auto space-y-8">
            {/* Artist Header */}
            <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] lg:px-0 px-6 lg:py-0 pt-6">ARTIST SPOTLIGHT</h1>
            <div className="flex justify-start items-center gap-4 px-6">
  {/* Artist Image with Rank Badge */}
  <div className="relative">
    <img
      src={artist.profile_img_url}
      alt={artist.stage_name}
      className="w-32 h-32 rounded-full border-4 border-[#5DC9DE] object-cover"
    />
    {/* Rank Badge */}
    <span className="absolute bottom-0 right-0 bg-[#6F4FA0] lg:w-9 w-6 h-6 lg:h-9 transform -rotate-12 flex items-center justify-center text-sm font-bold">
🌟
    </span>
  </div>

  {/* Artist Info */}
  <div className="text-left">
    <h2 className="text-lg font-bold text-white">{artist.name}</h2>
    <p className="text-gray-400">Stage Name: <span className="text-[#5DC9DE]">{artist.stage_name}</span></p>
  </div>
</div>



            <div className="px-6">
                    <p className="text-gray-400">Profession: {artist.profession_name}</p>
                    <p className="text-gray-500 mt-4">
                      {artist.highlighted_desc}
                    </p>
                  </div>
            {/* Tab Buttons */}
                        <div className="flex justify-between sm:px-3 items-center">
              <div>
                <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] lg:px-0 px-6 lg:py-0 pt-6 uppercase">{activeTab}</h1>
              </div>
              <div className="flex lg:px-0 gap-4 px-3">
                <button
                  className={`hover:text-cyan-400 ${activeTab === "leaderboard" ? "text-cyan-400 border-cyan-400" : "text-gray-400"}`}
                  onClick={() => setActiveTab("leaderboard")}
                >
                  ARTISTS
                </button>
                <button
                  className={` hover:text-cyan-400 ${activeTab === "songs" ? "text-cyan-400 border-cyan-400" : "text-gray-400"}`}
                  onClick={() => setActiveTab("songs")}
                >
                  SONGS
                </button>
              </div>
            </div>

            {/* Render Active Tab */}
            {activeTab === "leaderboard" ? (
              <Leaderboard leaderboardData={leaderboard} artist_id={artist_id} />
            ) : (
              <Songs id={artist_id} otherSongs={songs} />
            )}

            {/* Note Section */}
            <div className="space-y-4 lg:px-0 px-6">
              <h3 className="text-xl font-semibold text-cyan-400">
                Note (How to improve ranking):
              </h3>
              <p className="text-gray-500">
                Lorem ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy text
                ever since the 1500s, when an unknown printer took Lorem Ipsum.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}