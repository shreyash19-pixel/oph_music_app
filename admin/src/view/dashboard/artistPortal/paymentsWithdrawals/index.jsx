import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";

export default function Withdraw(){
  const { withdrawal_id , ophID} = useParams();
  const [withdrawData, setWithdrawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryMap, setSummaryMap] = useState({});

useEffect(() => {
  axiosApi
    .get(`/getWithdrawAdmin?withdrawal_id=${withdrawal_id}`)
    .then((res) => {
      if (res.data && Array.isArray(res.data.data)) {
        setWithdrawData(res.data.data);
      } else {
        setWithdrawData([]);
      }
    })
    .catch((err) => {
      console.error("Error fetching Withdraw:", err);
      setWithdrawData([]);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);
  
  const handleStatusChange = async (withdrawal_id, action) => {
    const data = summaryMap[withdrawal_id] || {};

    if (action === "reject") {
      if (!data.reason || data.reason.trim() === "") {
        alert("Please provide a reason for rejection.");
        return;
      }
    }

    try {
      await axiosApi.post("/updateWithdrawStatus", {
        withdrawal_id,
        action,
        reason: action === "reject" ? data.reason : null,
      });
      alert(`Withdrawal ${action}ed successfully`);

      // Optionally refetch or update local state
      setWithdrawData((prev) =>
        prev.filter((item) => item.withdrawal_id !== withdrawal_id)
      );
    } catch (err) {
      console.error(`Failed to ${action} withdrawal:`, err);
      alert("Something went wrong.");
    }
  };

  const handleSummaryChange = (withdrawal_id, field, value) => {
    setSummaryMap((prev) => ({
      ...prev,
      [withdrawal_id]: {
        ...prev[withdrawal_id],
        [field]: value,
      },
    }));
  };


  return (
    <div style={containerStyle}>
      
      {loading ? (
        <p>Loading withdrawals...</p>
      ) : withdrawData.length === 0 ? (
        <p>No withdrawal requests found.</p>
      ) : (
        withdrawData.map((withdraw) => {
          const withdrawalId = withdraw.withdrawal_id;

          return (
            <div key={withdrawalId} style={cardStyle}>
              <div style={contentStyle}>
                <p>
                  <strong>OPHID #:</strong> {withdraw.ophID}
                </p>
                <p>
                  <strong>Withdraw Amount:</strong> {withdraw.withdraw_amount}
                </p>
                <p>
                  <strong>Withdraw ID:</strong> {withdraw.withdrawal_id}
                </p>

                {/* Show reason input only when rejecting */}
                <div style={{ marginTop: "10px" }}>
                  {summaryMap[withdrawalId]?.action === "reject" ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <label htmlFor={`reason-${withdrawalId}`}>
                        <strong>Rejection Reason:</strong>
                      </label>
                      <textarea
                        id={`reason-${withdrawalId}`}
                        rows={3}
                        value={summaryMap[withdrawalId]?.reason || ""}
                        onChange={(e) =>
                          handleSummaryChange(
                            withdrawalId,
                            "reason",
                            e.target.value
                          )
                        }
                        placeholder="Enter reason for rejection"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontSize: "14px",
                          color: "#000",
                        }}
                      ></textarea>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          style={{
                            ...replyButtonStyle,
                            backgroundColor: "darkred",
                            flex: 1,
                          }}
                          onClick={() =>
                            handleStatusChange(withdrawalId, "reject")
                          }
                        >
                          Confirm Reject
                        </button>

                        <button
                          style={{
                            ...replyButtonStyle,
                            backgroundColor: "gray",
                            flex: 1,
                          }}
                          onClick={() =>
                            handleSummaryChange(withdrawalId, "action", null)
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", gap: "10px", maxWidth: "30px" }}
                    >
                      <button
                        style={{
                          ...replyButtonStyle,
                          backgroundColor: "red",
                          flex: 1,
                        }}
                        onClick={() =>
                          handleSummaryChange(withdrawalId, "action", "reject")
                        }
                      >
                        Reject
                      </button>

                      <button
                        style={{
                          ...replyButtonStyle,
                          backgroundColor: "green",
                          flex: 1,
                        }}
                        onClick={() =>
                          handleStatusChange(withdrawalId, "approve")
                        }
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );


};

const containerStyle = {
  maxWidth: "1000px",
  margin: "2rem auto",
  padding: "1rem",
  display: "flex",
  flexDirection : "column",
  alignItems : "center"
};

const cardStyle = {
  display: "flex",
  alignItems: "flex-center",
  justifyContent : "center",
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "1rem",
  marginBottom: "1.5rem",
  backgroundColor: "#fff",
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  width: "500px",
};

const imageWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginRight: "1.5rem",
  width: "150px",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  objectFit: "cover",
  borderRadius: "8px",
};

const contentStyle = {
  flex: 1,
};

const replyButtonStyle = {
  marginTop: "10px",
  padding: "8px 14px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

