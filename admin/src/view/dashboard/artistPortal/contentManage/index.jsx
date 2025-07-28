import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios"; // Adjust if needed
import { Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

const ContentManage = () => {
  const { ophid, songId } = useParams();

  const [loading, setLoading] = useState(true);
  const hasInteracted = useRef({ Content: false, Audio: false, Video: false });

  const [content, setContent] = useState({
    project_type: "",
    video_type: "",
    release_date: "",
  });

  const [audio, setAudio] = useState({
    song_name: "",
    language: "",
    genre: "",
    sub_genre: "",
    mood: "",
    lyrics: "",
    primary_artist: "",
    secondary_artists: [],
    audio_url: "",
  });

  const [video, setVideo] = useState({
    credits: "",
    image: "",
    video: "",
  });



  useEffect(() => {
    const fetchSongData = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(`/song-approved/${ophid}/${songId}`);
        const song = res.data.song;

        // Convert to yyyy-mm-dd format for input[type=date]
        const formattedReleaseDate = song.release_date
          ? new Date(song.release_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "";

        if (!hasInteracted.current.Content) {
          setContent({
            project_type: song.project_type || "",
            CP_Line: song.primary_artist || "",
            PLine: song.primary_artist || "",
            release_date: formattedReleaseDate,
          });
        }

        if (!hasInteracted.current.Audio) {
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

          setAudio({
            song_name: song.audio_song_name || "",
            language: song.language || "",
            genre: song.genre || "",
            sub_genre: song.sub_genre || "",
            mood: song.mood || "",
            lyrics: song.lyrics || "",
            primary_artist: song.primary_artist || "",
            secondary_artists: secondaryArtists,
            audio_url: song.audio_url || "",
          });
        }

        let parsedImage = "";
        try {
          const imgArray = JSON.parse(song.image_url);
          if (Array.isArray(imgArray)) {
            parsedImage = imgArray[0];
          }
        } catch (err) {
          console.error("Failed to parse image_url", err);
        }

        if (!hasInteracted.current.Video) {
          setVideo({
            credits: song.credits || "",
            image: parsedImage || "",
            video: song.video_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching approved song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [ophid, songId]);

  const handleSectionChange = (section, setStateFn) => (e) => {
    hasInteracted.current[section] = true;
    const { name, value } = e.target;
    setStateFn((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

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
          onChange={handleSectionChange("Content", setContent)}
        />

        <SectionBlock
          section="Audio"
          data={audio}
          fields={[
            "song_name",
            "language",
            "genre",
            "sub_genre",
            "mood",
            "lyrics",
            "primary_artist",
            "audio_url",
          ]}
          onChange={handleSectionChange("Audio", setAudio)}
          renderExtra={() =>
            audio.secondary_artists?.length > 0 && (
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Secondary Artists</h3>
                {audio.secondary_artists.map((artist, idx) => (
                  <div key={idx} className="p-3 border rounded bg-gray-100 text-sm space-y-1">
                    <div><strong>Type:</strong> {artist.artist_type}</div>
                    <div><strong>Artist Name:</strong> {artist.artist_name}</div>
                    <div><strong>Legal Name:</strong> {artist.legal_name}</div>
                  </div>
                ))}
              </div>
            )
          }
        />

        <SectionBlock
          section="Video"
          data={video}
          fields={["credits"]}
          onChange={handleSectionChange("Video", setVideo)}
          renderExtra={() => (
            <div className="space-y-4">
              {video.image ? (
                <img
                  src={video.image}
                  alt="Thumbnail"
                  className="w-[200px] h-[200px] object-cover rounded shadow"
                />
              ) : (
                <img
                  src="https://avatars.githubusercontent.com/u/49544693?v=4"
                  alt="No Thumbnail"
                  className="w-[200px] h-[200px] object-cover rounded shadow"
                />
              )}
              {video.video && (
                <video
                  src={video.video}
                  controls
                  className="w-full rounded border"
                />
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

const SectionBlock = ({ section, data, fields, onChange, renderExtra }) => {
  const [unlockedFields, setUnlockedFields] = useState({
    Content: {},
    Audio: {},
    Video: {},
  });

  const showConfirmationToast = (onConfirm) => {
  toast(
    (t) => (
      <div>
        <div className="text-sm text-gray-900">Are you sure you want to save?</div>
        <div className="mt-3 flex justify-center gap-4">
          <button
            className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33] transition"
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 transition"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </div>
      </div>
    ),
    { duration: 5000 }
  );
};

  const [initialData] = useState({ ...data });

  const toggleLock = (field) => {
    setUnlockedFields((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section]?.[field],
      },
    }));
  };

  // const handleSubmit = () => {
  //   const changes = {};
  //   for (const key of fields) {
  //     if (initialData[key] !== data[key]) {
  //       changes[key] = {
  //         old: initialData[key],
  //         new: data[key],
  //       };
  //     }
  //   }
  //   console.log(`🔄 [${section}] Changes Submitted:`, changes);
  // };

//   const handleSubmit = () => {
//   console.log(`📤 [${section}] Submitted Data:`, data);
// };

const handleSubmit = () => {
  let hasChanges = false;

  for (const key of fields) {
    if (initialData[key] !== data[key]) {
      hasChanges = true;
      break;
    }
  }

  if (!hasChanges) {
    console.log(`✅ [${section}] No changes to save`);
    return;
  }

  showConfirmationToast(() => {
    console.log(`📤 [${section}] Submitted Data:`, data);
  });
};


  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">
        {section} Details
      </h2>

      {fields.map((field) => {
        const isReadOnly =
          field === "release_date" ||
          section === "Audio" && field === "secondary_artists" ||
          !unlockedFields?.[section]?.[field];

        return (
          <Field key={field} label={field}>
            <div className="flex items-center gap-2">
              {field === "lyrics" || field === "credits" ? (
                <textarea
                  name={field}
                  value={data[field]}
                  onChange={onChange}
                  readOnly={isReadOnly}
                  className={`w-full p-2 border rounded-md text-black bg-white ${isReadOnly ? "bg-gray-100" : ""}`}
                />
              ) : field.includes("audio_url") ? (
                <audio controls className="w-full max-w-xs rounded border mb-2">
                  <source src={data[field]} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <input
                  type="text"
                  name={field}
                  value={data[field]}
                  onChange={onChange}
                  readOnly={isReadOnly}
                  className={`w-full p-2 border rounded-md text-black ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
                />
              )}

              {field !== "release_date" && (
                <button
                  onClick={() => toggleLock(field)}
                  type="button"
                  className="text-gray-600 hover:text-gray-800"
                  title={isReadOnly ? "Unlock to edit" : "Lock"}
                >
                  {isReadOnly ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
              )}
            </div>
          </Field>
        );
      })}

      {renderExtra && renderExtra()}

      <div className="pt-4 text-right">
  <button
    onClick={handleSubmit}
    className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33] transition"
  >
    Save {section} Details
  </button>
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

export default ContentManage;
