import React, { useState } from "react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ArtistRankingSection = ({ data, selectedMonth }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedMonth || "January");

  const handleMonthChange = (event) => {
    setCurrentMonth(event.target.value);
  };

  const artists = data[currentMonth] || [];

  const handleProfileClick = (artistId) => {
    // Add your view profile logic here
    console.log(`Viewing profile for artist with id: ${artistId}`);
  };

  return (
    <div className="bg-black text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-cyan-400 text-2xl font-bold">{currentMonth}</h2>
      </div>

      {/* Header */}
      <div className="flex items-center text-gray-400 text-sm uppercase mb-4 px-4">
        <div className="flex-1">#</div>
        <div className="flex-1">Artist</div>
        <div className="flex-1">Stage Name</div>
        <div className="flex-1 hidden sm:block">Location</div>
        <div className="flex-1 text-center">Songs</div>
        <div className="flex-1 text-center">Reach</div>
        <div className="flex-1 hidden sm:block

        text-center">Profile</div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {artists.length > 0 ? (
          artists.map((artist, index) => (
            <div
              key={artist.id}
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-900/30 transition-colors"
              onClick={() => handleProfileClick(artist.id)} // Make the row clickable
            >
              <div className="flex-1">
                <span
                  className={`text-lg font-bold ${
                    index < 3 ? "text-cyan-400" : "text-gray-400"
                  }`}
                >
                  {artist.id}
                </span>
              </div>

              <div className="flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={"/assets/images/leaderboardArtist.png"}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 text-gray-300">{artist.name}</div>
              <div className="flex-1 text-gray-300 hidden sm:block">
                {artist.location}
              </div>
              <div className="flex-1 text-center text-gray-300">
                {artist.songs}
              </div>
              <div className="flex-1 text-center text-gray-300">
                {artist.reach}
              </div>
              {/* Hidden on small screens */}
              <div className="flex-1  justify-center hidden sm:block">
                <button className="px-4 py-1 text-sm text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">
            No data available for this month.
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtistRankingSection;
