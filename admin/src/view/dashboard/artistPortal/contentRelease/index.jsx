import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import toast from "react-hot-toast";

const ContentReleaseInd = () => {
  const { ophid, songId } = useParams();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [releaseData, setReleaseData] = useState({
    release_time: "",
    youtube_release_time: "",
    spotify_release_time: "",
    apple_release_time: "",
    instagram_release_time: "",
    facebook_release_time: "",
    share_url: "",
    youtube_url: "",
    spotify_url: "",
    apple_url: "",
    instagram_url: "",
    facebook_url: "",
  });

  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(`/get-individual-song-release-list`, {
          params: { ophid, songId },
        });

        const song = res.data.data[0];
        // Set Content
        setContent({
          song_name: song.song_name || "",
          primary_artist: song.primary_artist || "",
          featuring_artist: song.featuring_artist || "",
          release_time: song.release_time || "",
          youtube_release_time: song.youtube_release_time || "",
          spotify_release_time: song.spotify_release_time || "",
          apple_release_time: song.apple_release_time || "",
          instagram_release_time: song.instagram_release_time || "",
          facebook_release_time: song.facebook_release_time || "",
          share_url: song.share_url || "",
          youtube_url: song.share_url || "",
          spotify_url: song.share_url || "",
          apple_url: song.share_url || "",
          instagram_url: song.share_url || "",
          facebook_url: song.share_url || "",
        });
      } catch (err) {
        console.error("Error fetching song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [ophid, songId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(releaseData);

    if (
      !releaseData.release_time ||
      !releaseData.youtube_release_time ||
      !releaseData.spotify_release_time ||
      !releaseData.apple_release_time ||
      !releaseData.instagram_release_time ||
      !releaseData.facebook_release_time ||
      !releaseData.share_url ||
      !releaseData.youtube_url ||
      !releaseData.spotify_url ||
      !releaseData.apple_url ||
      !releaseData.instagram_url ||
      !releaseData.facebook_url
    ) {
      toast.error("Fill all the fields");
      return;
    }

    try {
      const response = await axiosApi.post(
        "/set-song-release-data",
        {
          ophid: ophid,
          songId: songId,
          release_time: releaseData.release_time,
          youtube_release_time: releaseData.youtube_release_time,
          spotify_release_time: releaseData.spotify_release_time,
          apple_release_time: releaseData.apple_release_time,
          instagram_release_time: releaseData.instagram_release_time,
          facebook_release_time: releaseData.facebook_release_time,
          share_url: releaseData.share_url,
          youtube_url: releaseData.youtube_url,
          spotify_url: releaseData.spotify_url,
          apple_url: releaseData.apple_url,
          instagram_url: releaseData.instagram_url,
          facebook_url: releaseData.facebook_url,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Data submitted");
        navigate("/ContentRelease");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">
        <div className="mb-6 text-lg text-gray-600">
          <strong>OphID:</strong> {ophid} &nbsp; | &nbsp;{" "}
          <strong>SongID:</strong> {songId}
        </div>

        <SectionBlock
          section="Song Release"
          data={content}
          fields={[
            "song_name",
            "primary_artist",
            "featuring_artist",
            "release_time",
            "youtube_release_time",
            "spotify_release_time",
            "apple_release_time",
            "instagram_release_time",
            "facebook_release_time",
            "share_url",
            "youtube_url",
            "spotify_url",
            "apple_url",
            "instagram_url",
            "facebook_url",
          ]}
          handleSubmit={handleSubmit}
          setReleaseData={setReleaseData}
          releaseData={releaseData}
        />
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1 capitalize">
      {label.replace(/_/g, " ")}
    </label>
    {children}
  </div>
);

const ConfirmBlock = ({ section, type, reason, onConfirm, onCancel }) => (
  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mt-4">
    <span className="text-gray-800">
      Are you sure you want to {type.toLowerCase()} {section} section?
    </span>
    <div className="space-x-2">
      <button
        onClick={() => onConfirm(type, reason)}
        className={`px-4 py-2 ${
          type === "rejected" ? "bg-red-600" : "bg-green-600"
        } text-white rounded-lg shadow hover:opacity-90 transition-colors`}
      >
        Yes, {type}
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);

const SectionBlock = ({
  section,
  data,
  fields,
  handleSubmit,
  setReleaseData,
  releaseData,
}) => {
  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">
        {section} Details
      </h2>

      {fields
        .filter((field) => data[field] !== null && data[field] !== undefined)
        .map((field) => (
          <Field key={field} label={field}>
            {field === "song_name" ||
            field === "primary_artist" ||
            field === "featuring_artist" ? (
              <textarea
                value={data[field]}
                readOnly
                className="w-full p-2 border rounded-md text-black bg-gray-100"
              />
            ) : field === "youtube_release_time" ||
              field === "spotify_release_time" ||
              field === "apple_release_time" ||
              field === "instagram_release_time" ||
              field === "facebook_release_time" ||
              field === "release_time"
              ? (
              <input
                type="time"
                value={releaseData[field]}
                className="w-full p-2 border rounded-md text-black bg-gray-100"
                onChange={(e) =>
                  setReleaseData((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
              />
            ) : (
              <input
                type="text"
                value={releaseData[field]}
                className="w-full p-2 border rounded-md text-black bg-gray-100"
                onChange={(e) =>
                  setReleaseData((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
              />
            )}
          </Field>
        ))}

      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};

export default ContentReleaseInd;
