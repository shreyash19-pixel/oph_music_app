// components/ArtistRankingTable.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ArtistRankingTable = ({ data = [], title = "Ranking" }) => {
  const navigate = useNavigate();

  const formatListeners = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M+`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K+`;
    return `${views}+`;
  };

  const handleProfileClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  return (
    <div className="bg-black text-white p-6 sm:p-10 xl:px-16 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-cyan-400 text-2xl font-bold uppercase">
          {title}
        </h2>
      </div>

      {/* Header */}
      <div className="flex items-center text-gray-400 text-sm uppercase mb-4 px-4">
        <div className="flex-1">Artist</div>
        <div className="flex-1">Stage Name</div>
        <div className="flex-1 text-center">Reach</div>
        <div className="flex-1 hidden sm:block text-center">Profile</div>
      </div>

      <div className="space-y-2">
        {data.length > 0 ? (
          data.map((artist, index) => (
            <div
              key={artist.id}
              className="flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-900/30"
              onClick={() => handleProfileClick(artist.id)}
            >
              {/* <div className="flex-1 text-gray-300 font-bold">
                <span
                  className={`${
                    index === 0
                      ? "bg-amber-400 text-black"
                      : index === 1
                      ? "bg-green-400 text-black"
                      : index === 2
                      ? "bg-cyan-400 text-black"
                      : "text-white"
                  } px-3 py-1 rounded-full`}
                >
                  {artist.rank < 10 ? `0${artist.rank}` : artist.rank}
                </span>
              </div> */}

              <div className="flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={artist.profile_img_url}
                    alt={artist.stage_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 text-gray-300">{artist.stage_name}</div>
              
              <div className="flex-1 text-center text-gray-300">
                {formatListeners(artist.total_reach || artist.total_views)}
              </div>
              <div className="flex-1 hidden sm:flex justify-center">
                <Link to={`/artists/${artist.id}`}>
                  <button
              onClick={() => handleProfileClick(artist.id)}

                    className="px-4 py-1 text-sm text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black"
                  >
                    View Profile
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No artists found.</p>
        )}
      </div>
    </div>
  );
};

export default ArtistRankingTable;
