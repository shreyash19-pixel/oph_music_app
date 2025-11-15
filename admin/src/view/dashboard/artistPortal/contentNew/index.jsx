import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { toast } from "react-hot-toast";

const ContentNew = () => {
  const { ophid, songId } = useParams();

  const languages = [
    { name: "English", id: 1 },
    { name: "Hindi", id: 2 },
    { name: "Marathi", id: 3 },
  ];

  const [content, setContent] = useState({});
  const [audio, setAudio] = useState({});
  const [video, setVideo] = useState({});
  const [imageUrls, setImageUrls] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [secondaryArtists, setSecondaryArtists] = useState([]);

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
        });

        // Fetch secondary artists separately
        try {
          const secondaryRes = await axiosApi.get(`/secondary-artists-by-song/${songId}`);
          if (secondaryRes.data.success && secondaryRes.data.data) {
            setSecondaryArtists(secondaryRes.data.data);
          }
        } catch (err) {
          console.error("Error fetching secondary artists:", err);
          setSecondaryArtists([]);
        }

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
          languages={languages}
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
              {secondaryArtists.length > 0 ? (
                <div className="space-y-4">
                  {secondaryArtists.map((artist, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg bg-gray-50 space-y-3"
                    >
                      <div className="flex items-start gap-4">
                        {artist.artistPictureUrl && (
                          <img
                            src={artist.artistPictureUrl}
                            alt={artist.artist_name || "Artist"}
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <strong className="text-gray-700">Artist Type:</strong>
                              <div className="text-gray-900">{artist.artist_type || "—"}</div>
                            </div>
                            <div>
                              <strong className="text-gray-700">Artist Name:</strong>
                              <div className="text-gray-900">{artist.artist_name || "—"}</div>
                            </div>
                            <div>
                              <strong className="text-gray-700">Legal Name:</strong>
                              <div className="text-gray-900">{artist.Legal_name || "—"}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2 border-t">
                            {artist.SpotifyLink && (
                              <a
                                href={artist.SpotifyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Spotify ↗
                              </a>
                            )}
                            {artist.InstagramLink && (
                              <a
                                href={artist.InstagramLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                              >
                                Instagram ↗
                              </a>
                            )}
                            {artist.FacebookLink && (
                              <a
                                href={artist.FacebookLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Facebook ↗
                              </a>
                            )}
                            {artist.AppleMusicLink && (
                              <a
                                href={artist.AppleMusicLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Apple Music ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
  languages = [],
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
              // Special handling: show language name based on id for Audio section
              section === "Audio" && field === "language" ? (
                <input
                  type="text"
                  value={(languages.find(l => String(l.id) === String(data.language))?.name) || data.language || ""}
                  readOnly
                  className="w-full p-2 border rounded-md text-black bg-gray-100"
                />
              ) : (
                <input
                  type="text" // ← forces DD MMM YYYY to show properly
                  value={data[field]}
                  readOnly
                  className="w-full p-2 border rounded-md text-black bg-gray-100"
                />
              )
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
