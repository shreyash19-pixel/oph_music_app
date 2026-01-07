import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../conf/axios";
import getToken from "../../utils/getToken";
import { useArtist } from "../auth/API/ArtistContext";

export default function UploadSongs() {
  const navigate = useNavigate();
  const [pendingContent, setPendingContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ophid, headers } = useArtist();

  useEffect(() => {
    const fetchPendingContent = async () => {
      try {
        const response = await axiosApi.get('/pending-song-registeration', {
          headers: headers,
          params: { ophid }
        });

        if (response.data.success) {
          console.log('Fetched pending songs:', response.data.data);
          setPendingContent(response.data.data || {});
        }
      } catch (err) {
        console.error('Error fetching pending content:', err);
        setError('Failed to load pending content');
      } finally {
        setIsLoading(false);
      }
    };

    // only fetch if both values are available
    if (ophid && headers && headers.Authorization) {
      fetchPendingContent();
    }
  }, [ophid, headers]);

  // Get the most recently updated pending content
  // pendingContent is an object with song_id as keys, convert to array
  const submittedSongs = pendingContent && typeof pendingContent === 'object' && Object.keys(pendingContent).length > 0 
    ? Object.values(pendingContent).map(song => ({
        name: song.Song_name,
        status: song.status || 'draft',
        id: song.song_id,
        reject_reason: song.reject_reason,
        next_page: song.next_page || '/dashboard/upload-song/audio-metadata/',
        projectType: song.projectType,
        release_date: song.release_date,
        lyrical_services: song.lyrical_services,
        firstRejectedStep: song.firstRejectedStep
      })) 
    : [];

  
  const handleProjectClick = (projectType) => {
    ;

    localStorage.setItem("projectType", projectType);
    // Navigate to the appropriate project type page
    navigate("/dashboard/upload-song/register-song", {
      state: {
        projectType
      }
    });
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    const colorMap = {
      'draft': 'text-yellow-400 border-yellow-400/30',
      'under review': 'text-cyan-400 border-cyan-400/30',
      'rejected': 'text-red-400 border-red-400/30',
      'approved (pending)': 'text-green-400 border-green-400/30',
      'Published': 'text-green-400 border-green-400/30'
    };
    return colorMap[status] || 'text-gray-400 border-gray-400/30';
  };

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 p-6">
      <div className="max-w-2xl space-y-8">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">UPLOAD SONGS</h1>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-400">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={() => handleProjectClick("new project")}
            className="w-full px-6 py-3 rounded-full border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            New Project
          </button>

          <button
            onClick={() => handleProjectClick("hybrid project")}
            className="w-full px-6 py-3 rounded-full border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            Hybrid Project
          </button>

          <button
            onClick={() => handleProjectClick("paid in advance")}
            className="w-full px-6 py-3 rounded-full border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            Paid in Advance
          </button>
        </div>
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">YOUR SONGS</h1>

        {/* Submitted Song Section */}
        {submittedSongs.length > 0 ? submittedSongs.map((song) => (
          <div
            key={song.id} // Add key prop here
            className="bg-gray-800/50 rounded-lg p-4 cursor-pointer"
            
            onClick={(e) => {
              if (['draft', 'rejected'].includes(song.status)) {
                // Just navigate - status will be updated to "under review" only when user submits metadata
                navigate(song.next_page, {
                  state: {
                    song_id: song.id,
                    songName: song.name,
                    release_date: song.release_date,
                    project_type: song.projectType,
                    lyrical_services: song.lyrical_services,
                    isFixingRejected: song.status === 'rejected' // Pass flag to indicate we're fixing rejected item
                  }
                });
                localStorage.setItem("projectType", song.projectType);
              } else {
                e.preventDefault();
              }
            }}
          >
            <div className="flex justify-between items-center">
              <div className="">

                <p className="text-sm text-gray-400">Submitted Song:</p>
                <p className="text-lg">{song.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1 rounded-full text-sm border ${getStatusColor(song.status)}`}>
                  {song.status}
                </span>
              </div>

            </div>
            {/* Show rejection message if status is Rejected */}
            {song.status === "rejected" && (
              <p className="text-red-400 mt-2">{song.firstRejectedStep}</p>
            )}
          </div>
        )) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No songs found. Start by creating a new project.</p>
          </div>
        )}
      </div>
    </div>
  );
}