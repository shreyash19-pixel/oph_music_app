import React from "react";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import { useState } from "react";
const VerifyBookingDates = () => {
  const location = useLocation();
  const release_date = location.state.selectedDate;
  const [transactions, setTransactions] = useState([]);
  const [confirmReject, setConfirmReject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState(null);
  const navigate = useNavigate();

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosApi.get("/get-transaction-details", {
        params: { release_date },
      });

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const transactionData = response.data.data[0];
        console.log("Transaction data received:", transactionData);
        setTransactions(transactionData);
      } else {
        console.error("No transaction data found for date:", release_date);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (release_date) {
      fetchBookingDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release_date]);

  const handleDecision = async (dec) => {
    console.log(dec);

    if (dec === "rejected" && reason === null) {
      alert("Enter a rejection reason");
      return;
    }

    // Send as JSON instead of FormData
    const fromSource =
      transactions?.From ||
      transactions?.from ||
      transactions?.from_source ||
      "Date booking";

    const requestData = {
      decision: dec,
      reason: reason || null,
      release_date: release_date,
      from: fromSource,
    };

    console.log("Sending payment verification request:", requestData);

    try {
      const response = await axiosApi.post(
        "/payment-verification",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data.success) {
        if (dec === "rejected") {
          toast.error("Date rejected");
        } else {
          toast.success("Date approved");
        }
        navigate("/calendar");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div>
      <ArtistSidebar>
        <div className="w-full max-w-[450px] flex flex-col gap-[14px] border border-gray-300 shadow-sm rounded-lg p-4">
          <p>
            <strong>OPHID # : </strong>
            {transactions.OPH_ID}
          </p>
          <p>
            <strong>Transaction ID : </strong>
            {transactions.Transaction_ID}
          </p>
          <p>
            <strong>For : </strong>
            {transactions.From}
          </p>

          {(() => {
            const fromSource = transactions?.From || transactions?.from_source || transactions?.from || "";
            const isReleaseDateChange = fromSource.toLowerCase().includes("release date change");
            
            // Check for previous_booking_date in various possible field names
            const previousDate = transactions?.previous_booking_date || 
                                transactions?.Previous_booking_date ||
                                transactions?.previousBookingDate;
            
            const currentDate = transactions?.current_booking_date || 
                               transactions?.Current_booking_date ||
                               transactions?.currentBookingDate ||
                               release_date;
            
            // Check if previous date is valid (not null, not epoch 0, not empty string)
            const hasPreviousDate = previousDate && 
                                   previousDate !== null && 
                                   previousDate !== "" &&
                                   previousDate !== "1970-01-01" &&
                                   previousDate !== "1970-01-01T00:00:00.000Z" &&
                                   new Date(previousDate).getTime() > 0;
            
            console.log("Date display check:", {
              fromSource,
              isReleaseDateChange,
              hasPreviousDate,
              previousDate,
              currentDate,
              allTransactionKeys: Object.keys(transactions || {})
            });

            if (isReleaseDateChange && hasPreviousDate) {
              return (
                <>
                  <p>
                    <strong>Old Date : </strong>
                    {new Date(previousDate).toLocaleDateString(
                      "en-IN",
                      {
                        timeZone: "Asia/Kolkata",
                      }
                    )}
                  </p>
                  <p>
                    <strong>New Date : </strong>
                    {new Date(currentDate).toLocaleDateString(
                      "en-IN",
                      {
                        timeZone: "Asia/Kolkata",
                      }
                    )}
                  </p>
                </>
              );
            } else if (isReleaseDateChange) {
              // Release date change but no previous date - show new date with note
              return (
                <>
                  <p>
                    <strong>New Date : </strong>
                    {new Date(currentDate).toLocaleDateString(
                      "en-IN",
                      {
                        timeZone: "Asia/Kolkata",
                      }
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    (Previous date not available)
                  </p>
                </>
              );
            } else {
              return (
                <p>
                  <strong>Date : </strong>
                  {new Date(currentDate).toLocaleDateString(
                    "en-IN",
                    {
                      timeZone: "Asia/Kolkata",
                    }
                  )}
                </p>
              );
            }
          })()}

          {(() => {
            // Show reason from calender table if it exists (for pending date changes)
            // Otherwise show reject_reason from payments table (for rejected payments)
            const calenderReason = transactions?.reason || transactions?.Reason;
            const paymentRejectReason = transactions?.reject_reason || transactions?.rejectReason;
            const displayReason = calenderReason || paymentRejectReason;
            
            if (displayReason) {
              return (
                <p>
                  <strong>Reason : </strong>
                  {displayReason}
                </p>
              );
            }
            return null;
          })()}

          {confirmReject && (
            <div>
              <textarea
                className="w-full min-h-20 border border-gray-300 rounded-lg p-[10px]"
                placeholder="Enter reason for rejection"
                onChange={(e) => setReason(e.target.value)}
              ></textarea>

              <div className="mt-[12px] w-full flex">
                <button
                  className="w-full bg-[#8B0000] px-[14px] py-[8px] text-white rounded-md shadow-sm"
                  onClick={() => handleDecision("rejected")}
                >
                  Confirm Reject
                </button>

                <button
                  className="w-full bg-[#808080] px-[14px] py-[8px] text-white rounded-md shadow-sm ml-2"
                  onClick={() => setConfirmReject(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!confirmReject && (
            <div className="mt-[12px] w-full flex">
              <button
                className="w-full bg-[#FF0000] px-[14px] py-[8px] text-white rounded-md shadow-sm"
                onClick={() => setConfirmReject(true)}
              >
                Reject
              </button>

              <button
                className="w-full bg-[#008000] px-[14px] py-[8px] text-white rounded-md shadow-sm ml-2"
                onClick={() => handleDecision("approved")}
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </ArtistSidebar>
    </div>
  );
};

export default VerifyBookingDates;
