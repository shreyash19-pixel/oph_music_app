import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";

const SpIncomeStatIndividual = () => {
  const { user } = useAuth();
  const canApproveReject = user?.role !== ROLES.SALES_MEMBER;
  const { ophid } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const navigate = useNavigate();

  const handleAction = (action) => {
    setConfirmAction(action);
  };

  const confirmAndHandle = async () => {
    try {
      const response = await axiosApi.post(
        "/set-special-artists-income-status",
        { ophid: ophid, status: confirmAction },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        navigate("/special-artist-income-status");
      }
    } catch (err) {
      console.error(err.message);
    }

    setConfirmAction(null);
  };

  useEffect(() => {
    const fetchArtistIncomeStatus = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(
          `/get-individual-special-artists-income`,
          {
            params: { ophid },
          },
        );
        setData(res.data.data[0]);
      } catch (err) {
        console.error("Error fetching song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistIncomeStatus();
  }, [ophid]);

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
          section="Special Artist Income status"
          statuses={data.status}
          handleAction={handleAction}
          confirmAction={confirmAction}
          setConfirmAction={setConfirmAction}
          confirmAndHandle={confirmAndHandle}
          canApproveReject={canApproveReject}
        />
      </div>
    </div>
  );
};

const ConfirmBlock = ({ section, type, onConfirm, onCancel }) => (
  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mt-4">
    <span className="text-gray-800">
      Are you sure you want to {type.toLowerCase()} {section} section?
    </span>
    <div className="space-x-2">
      <button
        onClick={() => onConfirm(section, type)}
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
  statuses,
  handleAction,
  confirmAction,
  setConfirmAction,
  confirmAndHandle,
  canApproveReject = true,
}) => {
  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">
        {section} Details
      </h2>

      <div className="text-sm italic mb-2">
        Status: {statuses ? statuses : "requested"}
      </div>

      {canApproveReject ? (
        <>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleAction("locked")}
              disabled={statuses === "unlocked"}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction("unlocked")}
              disabled={statuses === "unlocked"}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          </div>
          {confirmAction && (
            <ConfirmBlock
              section={section}
              type={confirmAction}
              onConfirm={confirmAndHandle}
              onCancel={() => setConfirmAction(null)}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-gray-600">
          You can review this status; approving or rejecting is limited to sales head and other authorized roles.
        </p>
      )}
    </div>
  );
};

export default SpIncomeStatIndividual;
