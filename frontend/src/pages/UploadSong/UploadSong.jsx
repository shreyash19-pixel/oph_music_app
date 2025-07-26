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
        const token = getToken();

        const response = await axiosApi.get('/pending-song-registeration', {
          headers: headers,
          params: { ophid }
        });

        if (response.data.success) {
          console.log(response);
          setPendingContent(response.data.data);
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
  const submittedSongs = pendingContent.length > 0 ? pendingContent.map(song => ({
    name: song.Song_name,
    status: song.status,
    id: song.song_id,
    reject_reason: song.reject_reason,
    next_page: song.current_page,
    projectType: song.project_type
  })) : null;

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
      'Draft': 'text-yellow-400 border-yellow-400/30',
      'Under Review': 'text-cyan-400 border-cyan-400/30',
      'Rejected': 'text-red-400 border-red-400/30',
      'Approved (pending)': 'text-green-400 border-green-400/30',
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
        {submittedSongs && submittedSongs.map((song) => (
          <div
            key={song.id} // Add key prop here
            className="bg-gray-800/50 rounded-lg p-4 cursor-pointer"
            onClick={() => {
              ['Draft', 'Approved', 'Pending'].includes(song.status) ? navigate(`/dashboard/upload-song/audio-metadata/${song.id}`, {
                state: {
                  songName: song.name,
                }
              }) : ['Rejected'].includes(song.status) ? navigate(`/dashboard/upload-song/register-song`) : null
              localStorage.setItem("projectType", song.projectType)
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
                <span className="text-sm text-gray-400">
                  {song.created_at}
                </span>
              </div>

            </div>
            {/* Show rejection reason if status is Rejected */}
            {song.status === "Approved (pending)" &&
              // song.status_text === "Audio/Video Meta Data Rejected" && 
              (
                <p className="text-red-400 mt-2">Audio/Video Meta Data Rejected</p>
              )}
            {song.status === 'Rejected' && (
              <p className="text-red-400 mt-2">Reason: {song.reject_reason}</p>
            )}
          </div>

        ))}
      </div>
    </div>
  );
}