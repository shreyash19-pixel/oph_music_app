import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";

const NewSongsIndividual = () => {
  const { ophid, songId } = useParams();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(`/get-special-artist-song-details`, {
          params: { ophid, songId },
        });

        const song = res.data.data[0];
        setData(res.data.data[0]);
        // Set Content
        setContent({
          song_name: song.song_name || "",
          views: song.views || "",
          credits: song.credits || "",
          duration: song.duration || "",
          proof: song.proof || "",
          audio_url: song.audio_url || "",
          status: song.status || "",
          reject_reason: song.reject_reason || "",
        });
      } catch (err) {
        console.error("Error fetching song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [ophid, songId]);

  const handleAction = (type) => {
    setConfirmAction(type);
  };

  const confirmAndHandle = async (type, reason) => {
    if (type === "rejected" && reason === "") {
      alert("Please mention rejection reason");
      return;
    }

    try {
      const response = await axiosApi.post(
        "/verify-special-artist-songs",
        {
          ophid: ophid,
          songId: songId,
          type: type,
          reason: reason,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        navigate("/special-artist-songs");
      }
    } catch (err) {
      console.error(err.message);
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
          <strong>OphID:</strong> {ophid} &nbsp; | &nbsp;{" "}
          <strong>SongID:</strong> {songId}
        </div>

        <SectionBlock
          section="Song"
          data={content}
          fields={[
            "song_name",
            "views",
            "credits",
            "duration",
            "proof",
            "audio_url",
          ]}
          showActions={true}
          statuses={data.status}
          reasons={data.reject_reason}
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
  const [reasonText, setReasonText] = useState(reasons || "");

  useEffect(() => {
    setReasonText(reasons || "");
  }, [reasons]);

  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">
        {section} Details
      </h2>

      {showActions && (
        <div className="text-sm italic mb-2">
          Status: {statuses ? statuses : "under review"}
        </div>
      )}

      {fields
        .filter((field) => data[field] !== null && data[field] !== undefined)
        .map((field) => (
          <Field key={field} label={field}>
            {field === "song_name" ||
            field === "views" ||
            field === "credits" ||
            field === "duration" ||
            field === "proof" ? (
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
              onClick={() => handleAction("rejected")}
              disabled={statuses === "rejected" || reasonText === ""}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction("approved")}
              disabled={statuses === "rejected"}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          </div>
        </>
      )}

      {confirmAction && (
        <ConfirmBlock
          section={section}
          type={confirmAction}
          reason={reasonText}
          onConfirm={confirmAndHandle}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default NewSongsIndividual;
