import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { toast } from "react-hot-toast";

const ContentNew = () => {
  const { ophid, songId } = useParams();

  const [content, setContent] = useState({});
  const [audio, setAudio] = useState({});
  const [video, setVideo] = useState({});
  const [imageUrls, setImageUrls] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);

  const [statuses, setStatuses] = useState({
    Content: null,
    Audio: null,
    Video: null,
  });

  const [reasons, setReasons] = useState({
    Content: "",
    Audio: "",
    Video: "",
  });

  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(`/songs-under-review/${ophid}/${songId}`);
        const song = res.data.song;

        // Set Content
        setContent({
          project_type: song.project_type || "",
          CP_Line: song.primary_artist || "",
          PLine: song.primary_artist || "",
          release_date: song.release_date
            ? new Date(song.release_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "",
        });

        // Parse secondary artists
        const secondaryArtists = [];
        if (
          song.secondary_artist_types &&
          song.secondary_artist_names &&
          song.secondary_legal_names
        ) {
          const types = song.secondary_artist_types.split(",").map((s) => s.trim());
          const names = song.secondary_artist_names.split(",").map((s) => s.trim());
          const legalNames = song.secondary_legal_names.split(",").map((s) => s.trim());

          for (let i = 0; i < types.length; i++) {
            secondaryArtists.push({
              artist_type: types[i] || "",
              artist_name: names[i] || "",
              legal_name: legalNames[i] || "",
            });
          }
        }

        // Set Audio
        setAudio({
          song_name: song.audio_song_name || "",
          language: song.language || "",
          genre: song.genre || "",
          sub_genre: song.sub_genre || "",
          mood: song.mood || "",
          lyrics: song.lyrics || "",
          primary_artist: song.primary_artist || "",
          lyricist: song.lyricist || "",
          composer: song.composer || "",
          producer: song.producer || "",
          audio_url: song.audio_url || "",
          secondary_artists: secondaryArtists,
        });

        // Set Video
        let parsedImages = [];
        if (song.image_url) {
          if (typeof song.image_url === "string" && song.image_url.startsWith("[")) {
            try {
              parsedImages = JSON.parse(song.image_url);
            } catch (e) {
              console.error("Error parsing image_url:", e);
            }
          } else if (typeof song.image_url === "string") {
            parsedImages = [song.image_url];
          }
        }

        const maxImages = 3;
        const defaultImg = "https://avatars.githubusercontent.com/u/49544693?v=4";
        const finalImages = [];

        for (let i = 0; i < maxImages; i++) {
          finalImages.push(parsedImages[i] || defaultImg);
        }

        setImageUrls(finalImages);

        setVideo({
          credits: song.credits || "",
          video: song.video_url || "",
        });

        // Set statuses
        setStatuses({
          Content: null,
          Audio: song.audio_status === "approved"
            ? "accepted"
            : song.audio_status === "rejected"
            ? "rejected"
            : null,
          Video: song.video_status === "approved"
            ? "accepted"
            : song.video_status === "rejected"
            ? "rejected"
            : null,
        });

        // Set reasons
        setReasons({
          Content: "",
          Audio: song.audio_reject_reason || "",
          Video: song.video_reject_reason || "",
        });
      } catch (err) {
        console.error("Error fetching song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [ophid, songId]);

  const handleAction = (section, type) => {
    setConfirmAction({ section, type });
  };

  const confirmAndHandle = async (section, type, reason) => {
    setStatuses((prev) => ({
      ...prev,
      [section]: type === "Reject" ? "rejected" : "accepted",
    }));

    setReasons((prev) => ({
      ...prev,
      [section]: type === "Reject" ? reason : "",
    }));

    const logObj = {
      songId,
      ophid,
      section,
      status: type === "Reject" ? "rejected" : "approved",
      reason: type === "Reject" ? reason : null,
    };

    try {
      await axiosApi.put("/songs/update-status", logObj);

      if (type === "Reject") {
        toast.error(`Rejected ${section} with reason: ${reason || "No reason provided"}`);
      } else {
        toast.success(`Accepted ${section} successfully!`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }

    setConfirmAction(null);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">
        <div className="mb-6 text-lg text-gray-600">
          <strong>OphID:</strong> {ophid} &nbsp; | &nbsp; <strong>SongID:</strong> {songId}
        </div>

        <SectionBlock
          section="Content"
          data={content}
          fields={["project_type", "CP_Line", "PLine", "release_date"]}
          showActions={false}
          statuses={statuses}
          reasons={reasons}
          setReasons={setReasons}
          handleAction={handleAction}
          confirmAction={confirmAction}
          confirmAndHandle={confirmAndHandle}
          setConfirmAction={setConfirmAction}
        />

        <SectionBlock
          section="Audio"
          data={audio}
          fields={[
            "song_name", "language", "genre", "sub_genre", "mood", "lyrics", "primary_artist",
            "audio_url",
          ]}
          statuses={statuses}
          reasons={reasons}
          setReasons={setReasons}
          handleAction={handleAction}
          confirmAction={confirmAction}
          confirmAndHandle={confirmAndHandle}
          setConfirmAction={setConfirmAction}
          renderExtra={() => (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Secondary Artists</h3>
              {audio.secondary_artists?.length > 0 ? (
                audio.secondary_artists.map((artist, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg bg-gray-100 text-sm space-y-1"
                  >
                    <div><strong>Type:</strong> {artist.artist_type}</div>
                    <div><strong>Artist Name:</strong> {artist.artist_name}</div>
                    <div><strong>Legal Name:</strong> {artist.legal_name}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No secondary artists.</p>
              )}
            </div>
          )}
        />

        <SectionBlock
          section="Video"
          data={video}
          fields={["credits"]}
          renderExtra={() => (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-40 object-cover rounded border"
                  />
                ))}
              </div>
              {video.video && (
                <video
                  src={video.video}
                  controls
                  className="w-full rounded border"
                />
              )}
            </>
          )}
          statuses={statuses}
          reasons={reasons}
          setReasons={setReasons}
          handleAction={handleAction}
          confirmAction={confirmAction}
          confirmAndHandle={confirmAndHandle}
          setConfirmAction={setConfirmAction}
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
    <span className="text-gray-800">Are you sure you want to {type.toLowerCase()} {section} section?</span>
    <div className="space-x-2">
      <button
        onClick={() => onConfirm(section, type, reason)}
        className={`px-4 py-2 ${type === "Reject" ? "bg-red-600" : "bg-green-600"} text-white rounded-lg shadow hover:opacity-90 transition-colors`}
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
  renderExtra,
  showActions = true,
  statuses,
  reasons,
  setReasons,
  handleAction,
  confirmAction,
  confirmAndHandle,
  setConfirmAction,
}) => {
  const [reasonText, setReasonText] = useState(reasons[section] || "");

  useEffect(() => {
    setReasonText(reasons[section] || "");
  }, [reasons[section]]);

  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">{section} Details</h2>

      {showActions && (
        <div className="text-sm italic mb-2">
          Status: {statuses[section] ? statuses[section] : "under review"}
        </div>
      )}

      {fields
        .filter((field) => data[field] !== null && data[field] !== undefined)
        .map((field) => (
          <Field key={field} label={field}>
            {field === "lyrics" || field === "credits" ? (
              <textarea
                value={data[field]}
                readOnly
                className="w-full p-2 border rounded-md text-black bg-gray-100"
              />
            ) : field.includes("audio_url") ? (
              <audio controls className="w-full max-w-xs rounded border mb-2">
                <source src={data[field]} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <input
                type="text" // ← forces DD MMM YYYY to show properly
                value={data[field]}
                readOnly
                className="w-full p-2 border rounded-md text-black bg-gray-100"
              />
            )}
          </Field>
        ))}

      {renderExtra && renderExtra()}

      {showActions && (
        <>
          <textarea
            value={reasonText}
            onChange={(e) => {
              setReasonText(e.target.value);
              setReasons((prev) => ({
                ...prev,
                [section]: e.target.value,
              }));
            }}
            placeholder="Enter reason (required if reject)..."
            className="w-full h-24 text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d3c44]"
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleAction(section, "Reject")}
              disabled={statuses[section] !== null}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction(section, "Accept")}
              disabled={statuses[section] !== null}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        </>
      )}

      {confirmAction && confirmAction.section === section && (
        <ConfirmBlock
          section={section}
          type={confirmAction.type}
          reason={reasonText}
          onConfirm={confirmAndHandle}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default ContentNew;
