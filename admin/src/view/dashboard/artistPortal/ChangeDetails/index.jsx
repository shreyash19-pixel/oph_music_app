import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { toast } from "react-hot-toast";

const ChangeDetailsIndividual = () => {
  const { ophid, field } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const navigate = useNavigate()

  const handleAction = (action) => {
    setConfirmAction(action);
  };

  const confirmAndHandle = async (section, type, reason, content) => {
    if (type === "rejected" && reason === "") {
      alert("Please mention the rejection reason");
      return;
    } else {
      try {
        const response = await axiosApi.post(
          "/set-special-artist-details-decision",
          {
            ophid: ophid,
            section: section,
            type: type,
            reason: reason,
            content: content,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          navigate("/change-details")
        }
      } catch (err) {
        console.error(err.message);
      }
    }

    setConfirmAction(null);
  };

  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(
          `/get-individual-special-artists-details`,
          {
            params: { ophid, field },
          }
        );
        setData(res.data.data[0]);
      } catch (err) {
        console.error("Error fetching song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [ophid, field]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">
        <div className="mb-6 text-lg text-gray-600">
          <strong>OphID:</strong> {ophid}
        </div>

        <SectionBlock
          content={data.content}
          section={data.field}
          fields={data.field}
          statuses={data.status}
          reasons={data.reason}
          handleAction={handleAction}
          confirmAction={confirmAction}
          setConfirmAction={setConfirmAction}
          confirmAndHandle={confirmAndHandle}
        />
      </div>
    </div>
  );
};

const ConfirmBlock = ({
  section,
  type,
  reason,
  onConfirm,
  onCancel,
  content,
}) => (
  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mt-4">
    <span className="text-gray-800">
      Are you sure you want to {type.toLowerCase()} {section} section?
    </span>
    <div className="space-x-2">
      <button
        onClick={() => onConfirm(section, type, reason, content)}
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

const Field = ({ label, children }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1 capitalize">
      {label.replace(/_/g, " ")}
    </label>
    {children}
  </div>
);

const SectionBlock = ({
  content,
  section,
  fields,
  statuses,
  reasons,
  handleAction,
  confirmAction,
  setConfirmAction,
  confirmAndHandle,
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

      <div className="text-sm italic mb-2">
        Status: {statuses ? statuses : "under review"}
      </div>

      {fields && (
        <Field label={fields}>
          {fields === "Bio" || fields === "Change Artist Story"  || fields === "Artist Story" ? (
            <p className="w-full p-2 border rounded-md text-black bg-gray-100">
              {content}
            </p>
          ) : fields === "Video Bio" || fields === "Artist Story Vid" ? (
            <video controls className="w-full max-w-xs rounded border mb-2">
              <source src={content} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          ) : (
            <img
              src={content}
              alt={fields}
              className="w-full max-w-xs rounded border"
            />
          )}
        </Field>
      )}

      <>
        <textarea
          readOnly={statuses === "rejected"}
          value={reasonText}
          onChange={(e) => {
            setReasonText(e.target.value);
          }}
          placeholder="Enter reason (required if reject)..."
          className="w-full h-24 text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d3c44]"
        />
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleAction("rejected")}
            disabled={reasonText === "" || statuses === "rejected"}
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

      {confirmAction && (
        <ConfirmBlock
          section={section}
          type={confirmAction}
          reason={reasonText}
          content={content}
          onConfirm={confirmAndHandle}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default ChangeDetailsIndividual;
