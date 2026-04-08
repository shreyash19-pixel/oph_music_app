import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { toast } from "react-hot-toast";
import { formatDateTimeIST } from "../../../../utils/date";
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";

const EventPayment = () => {
  const { user } = useAuth();
  const canApproveReject =
    user?.role !== ROLES.SALES_MEMBER &&
    user?.role !== ROLES.ADMINISTRATIVE_MEMBER &&
    user?.role !== ROLES.ACCOUNTS_MEMBER;
  const { ophid, eventId: eventIdFromUrl, transactionId: transactionIdFromUrl } = useParams();
  const [artist, setArtist] = useState(null);
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null); // "Approve" or "Reject"
  const [confirmTargetPaymentId, setConfirmTargetPaymentId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const isInternalUser = (id) => id && String(id).trim().match(/^OPH-/);

  const displayNameFromOph = () =>
    decodeURIComponent(ophid || "").trim() || "External Participant";

  /** External event bookings: details live in event_bookings, joined on payment transaction_id. */
  const buildExternalArtist = (payment) => {
    const p = payment || {};
    const fullFromBooking = [p.booking_first_name, p.booking_last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const profession = (p.booking_profession || "").trim();
    return {
      full_name: fullFromBooking || displayNameFromOph(),
      // Bookings have no stage name; do not put Instagram here (shown separately).
      stage_name: "",
      instagram_handle: (p.booking_instagram_handle || "").trim(),
      email: (p.booking_email || "").trim() || "—",
      contact_num: (p.booking_phone || "").trim() || "—",
      artist_type: profession
        ? `External Participant — ${profession}`
        : "External Participant",
      location: "—",
      personal_photo: null,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setPaymentList([]);
      try {
        let userDetails = null;
        if (isInternalUser(ophid)) {
          try {
            const res = await axiosApi.get(`/user-details/${ophid}`);
            userDetails = res.data?.userDetails ?? null;
          } catch {
            userDetails = null;
          }
        }
        if (userDetails) {
          setArtist(userDetails);
        } else if (isInternalUser(ophid)) {
          setArtist(null);
        }
        // External participant: artist row filled after payments load (see below)

        const paymentRes = await axiosApi.get(
          `/payment-for-events-by-ophid/${encodeURIComponent(ophid || "")}`,
        );
        console.log(paymentRes.data);
        let paymentArray = paymentRes.data.data || [];
        
        // Map the backend response to frontend expected format
        // Handle both snake_case (from database) and PascalCase (legacy) field names
        const mappedPayments = paymentArray.map(payment => {
          // Normalize status - handle empty, null, or different cases
          let status = (payment.status || payment.Status || '').toString().toLowerCase().trim();
          if (!status || status === 'null' || status === 'undefined') {
            status = 'under review'; // Default to 'under review' if status is missing
          }

          // For rejected event payments, event_id may be NULL and the value moved to reject_for.
          // Prefer event_id, fallback to reject_for so we always know which event this payment belongs to.
          const eventId = payment.event_id ?? payment.reject_for ?? null;
          
          return {
            paymentId: payment.transaction_id || payment.Transaction_ID,
            status: status,
            createdAt: payment.created_at || payment.CreatedAt,
            paymentType: payment.from_source || payment.From || 'Event Registration',
            amount: eventId ? `Event ID: ${eventId}` : 'N/A',
            eventId: eventId, // Store event_id directly for easier access
            description: `Event Registration Payment - ${payment.from_source || payment.From || 'Event Registration'}`,
            ophId: payment.oph_id || payment.OPH_ID,
            booking_first_name: payment.booking_first_name,
            booking_last_name: payment.booking_last_name,
            booking_email: payment.booking_email,
            booking_phone: payment.booking_phone,
            booking_instagram_handle: payment.booking_instagram_handle,
            booking_profession: payment.booking_profession,
          };
        });
        
        mappedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const eventIdStr = eventIdFromUrl != null ? String(eventIdFromUrl).trim() : null;
        const paymentBelongsToEvent = (p) => {
          if (!eventIdStr) return true;
          const pid = p.eventId == null ? "" : String(p.eventId).trim();
          if (pid && (pid === eventIdStr || (Number(pid) === Number(eventIdStr) && !Number.isNaN(Number(eventIdStr))))) return true;
          if (p.amount && typeof p.amount === "string" && p.amount.includes("Event ID:")) {
            const numFromAmount = p.amount.replace(/.*Event ID:\s*(\d+).*/i, "$1").trim();
            if (numFromAmount === eventIdStr || Number(numFromAmount) === Number(eventIdStr)) return true;
          }
          return false;
        };

        // When URL has eventId (e.g. /EventPayment/OPH-CAN-IA-01/19), show only payments for that event
        const listToShow = eventIdStr
          ? mappedPayments.filter(paymentBelongsToEvent)
          : mappedPayments;
        setPaymentList(listToShow);

        // Prefer transaction_id from URL (so external/same-event rows open the exact payment clicked)
        const transactionIdStr = transactionIdFromUrl != null ? String(transactionIdFromUrl).trim() : null;
        const matchByTransactionId = transactionIdStr && listToShow.find((p) => String(p.paymentId) === transactionIdStr);
        const matchByEventId = eventIdStr && listToShow.find(paymentBelongsToEvent);
        const preselected = matchByTransactionId
          ? matchByTransactionId.paymentId
          : (matchByEventId ? matchByEventId.paymentId : (listToShow[0]?.paymentId || null));
        setSelectedPaymentId(preselected);
        setConfirmAction(null);
        setConfirmTargetPaymentId(null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ophid, eventIdFromUrl, transactionIdFromUrl]);

  useEffect(() => {
    if (loading || !ophid || isInternalUser(ophid)) return;
    if (!paymentList.length) {
      setArtist(buildExternalArtist(null));
      return;
    }
    const p =
      paymentList.find((x) => x.paymentId === selectedPaymentId) || paymentList[0];
    setArtist(buildExternalArtist(p));
  }, [loading, selectedPaymentId, paymentList, ophid]);

  const handleFinalAction = async (type) => {
    const targetPayment =
      (confirmTargetPaymentId
        ? paymentList.find((p) => p.paymentId === confirmTargetPaymentId)
        : paymentList.find((p) => p.paymentId === selectedPaymentId)) ||
      (paymentList.length > 0 ? paymentList[0] : null);

    if (!targetPayment) {
      toast.error("No payment found to process");
      return;
    }

    // Extract event_id - prefer direct eventId field, fallback to parsing from amount
    let eventId = targetPayment.eventId;
    if (!eventId && targetPayment.amount && targetPayment.amount.includes('Event ID: ')) {
      eventId = targetPayment.amount.replace('Event ID: ', '').trim();
    }
    
    // Validate eventId is present
    if (!eventId) {
      toast.error("Event ID is missing. Cannot process payment.");
      setConfirmAction(null);
      return;
    }

    if (type === "Reject") {
      const logData = {
        ophId: ophid,
        transactionId: targetPayment.paymentId,
        status: "rejected",
        reject_reason: reason || "No reason provided",
        eventId: eventId
      };
      console.log("Reject Log:", logData);

      try {
        const submit = await axiosApi.put("/update-event-payment", logData);
        
        // Debug logging to see the actual response structure
        console.log("Reject API Response:", submit);
        console.log("Response data:", submit.data);
        console.log("Response status:", submit.status);
        
        // Check if the update was successful
        const isSuccess = (
          submit.status === 200 && 
          submit.data && 
          (submit.data.success === true || submit.data.affectedRows > 0 || submit.data.message)
        );
        
        if (isSuccess) {
          toast.success(`Payment rejected successfully with reason: ${reason || "No reason provided"}`, { 
            position: "top-center",
            duration: 4000 
          });
          
          // Update local state instead of reloading
          setPaymentList(prevPayments => 
            prevPayments.map(payment => 
              payment.paymentId === targetPayment.paymentId 
                ? { ...payment, status: 'rejected' }
                : payment
            )
          );
        } else {
          console.log("Reject failed - Response details:", submit);
          const errorMsg = submit.data?.message || "Failed to reject payment - please try again";
          toast.error(errorMsg, { position: "top-center", duration: 5000 });
        }
      } catch (error) {
        console.error("Error rejecting payment:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to reject payment";
        toast.error(errorMessage, { duration: 5000 });
      }

      setReason("");
    } else if (type === "Approve") {
      // Extract event_id - prefer direct eventId field, fallback to parsing from amount
      let eventId = targetPayment.eventId;
      if (!eventId && targetPayment.amount && targetPayment.amount.includes('Event ID: ')) {
        eventId = targetPayment.amount.replace('Event ID: ', '').trim();
      }
      
      // Validate eventId is present
      if (!eventId) {
        toast.error("Event ID is missing. Cannot process payment.");
        setConfirmAction(null);
        return;
      }
      
      const logData = {
        ophId: ophid,
        transactionId: targetPayment.paymentId,
        status: "approved",
        reject_reason: null,
        eventId: eventId
      };
      console.log("Approve Log:", logData);

      try {
        const submit = await axiosApi.put("/update-event-payment", logData);
        
        // Debug logging to see the actual response structure
        console.log("Approve API Response:", submit);
        console.log("Response data:", submit.data);
        console.log("Response status:", submit.status);
        
        // Check if the update was successful
        const isSuccess = (
          submit.status === 200 && 
          submit.data && 
          (submit.data.success === true || submit.data.affectedRows > 0 || submit.data.message)
        );
        
        if (isSuccess) {
          toast.success("Payment approved successfully!", { 
            position: "top-center",
            duration: 4000 
          });
          
          // Update local state instead of reloading
          setPaymentList(prevPayments => 
            prevPayments.map(payment => 
              payment.paymentId === targetPayment.paymentId 
                ? { ...payment, status: 'approved' }
                : payment
            )
          );
        } else {
          console.log("Approve failed - Response details:", submit);
          const errorMsg = submit.data?.message || "Failed to approve payment - please try again";
          toast.error(errorMsg, { position: "top-center", duration: 5000 });
        }
      } catch (error) {
        console.error("Error approving payment:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to approve payment";
        toast.error(errorMessage, { duration: 5000 });
      }
    }

    setConfirmAction(null);
    setConfirmTargetPaymentId(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPaymentId(text);
    setTimeout(() => {
      setCopiedPaymentId(null);
    }, 2000);
  };

  const formatDateTime = (dateStr) => formatDateTimeIST(dateStr);

  const formatAmount = (amount) => {
    // For event payments, amount is actually the event ID
    return amount;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
  }

  if (!artist) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Artist not found.</div>;
  }

  // Put the selected (acting on) payment first so it shows at top
  const listWithSelectedFirst = selectedPaymentId
    ? [
        ...paymentList.filter((p) => p.paymentId === selectedPaymentId),
        ...paymentList.filter((p) => p.paymentId !== selectedPaymentId),
      ]
    : paymentList;
  const displayedPayments = showAllPayments ? listWithSelectedFirst : listWithSelectedFirst.slice(0, 1);

  // Helper function to check if payment can be acted upon
  const canTakeAction = (payment) => {
    if (!payment) return false;
    const status = (payment.status || '').toLowerCase().trim();
    // Allow actions if status is 'under review', 'pending', or empty/null
    return !status || status === 'under review' || status === 'pending';
  };

  const selectedPayment =
    paymentList.find((p) => p.paymentId === selectedPaymentId) ||
    (paymentList.length > 0 ? paymentList[0] : null);
  const isActionEnabled = canTakeAction(selectedPayment);

  const isExternalParticipant = !isInternalUser(ophid);
  const stageNameStr =
    artist.stage_name != null ? String(artist.stage_name).trim() : "";
  const showStageName =
    !isExternalParticipant ||
    (stageNameStr !== "" && stageNameStr !== "—");

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">
        <div>
          <h2 className="text-2xl font-bold text-[#0d3c44] mb-6 border-b pb-2">Artist Payment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Detail label="Full Name" value={artist.full_name} />
            {showStageName && (
              <Detail label="Stage Name" value={artist.stage_name} />
            )}
            {isExternalParticipant && artist.instagram_handle && (
              <Detail
                label="Instagram"
                value={artist.instagram_handle}
                isLink={/^https?:\/\//i.test(artist.instagram_handle)}
              />
            )}
            <Detail label="Email" value={artist.email} />
            <Detail label="Contact Number" value={artist.contact_num} />
            <Detail label="Artist Type" value={artist.artist_type} />
            <Detail label="Location" value={artist.location} />
            <div className="sm:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-1">Personal Photo</label>
              <img
                src={artist.personal_photo ? artist.personal_photo : "https://avatars.githubusercontent.com/u/49544693?v=4"}
                alt="Artist"
                className="mt-2 w-40 h-40 object-cover rounded-xl border"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-6 bg-gray-50 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Payment Requests</h3>
            {paymentList.length > 1 && (
              <button
                onClick={() => setShowAllPayments(!showAllPayments)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                {showAllPayments ? "Hide" : "Show all"}
              </button>
            )}
          </div>
          {paymentList.length > 0 ? (
            <ul className="space-y-2">
              {displayedPayments.map((payment, index) => (
                <li
                  key={payment.paymentId || index}
                  onClick={() => {
                    if (confirmAction) return;
                    setSelectedPaymentId(payment.paymentId);
                  }}
                  className={`bg-white p-4 rounded-lg border cursor-pointer ${
                    payment.paymentId === selectedPaymentId
                      ? "border-cyan-500 ring-1 ring-cyan-300"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-gray-800 font-medium break-words flex items-center gap-2">
                      Payment ID: {payment.paymentId}
                      {index === 0 && (
                        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          Recent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(payment.paymentId)}
                        className="text-blue-600 text-sm border border-blue-500 px-2 py-0.5 rounded hover:bg-blue-50"
                      >
                        Copy
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmAction) return;
                          setSelectedPaymentId(payment.paymentId);
                        }}
                        className="text-cyan-700 text-sm border border-cyan-600 px-2 py-0.5 rounded hover:bg-cyan-50"
                      >
                        Select
                      </button>
                      {copiedPaymentId === payment.paymentId && (
                        <span className="text-green-600 text-sm font-medium">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">Event ID:</span> {formatAmount(payment.amount)}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Type:</span> {payment.paymentType || 'Event Payment'}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Status:</span> 
                                              <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'under review' ? 'bg-blue-100 text-blue-800' :
                          payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status || 'pending'}
                        </span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Time:</span> {formatDateTime(payment.createdAt)}
                    </div>
                  </div>
                  {payment.description && (
                    <div className="text-gray-600 text-sm mt-2">
                      <span className="font-medium">Description:</span> {payment.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No payment requests available</div>
          )}
        </div>

        {canApproveReject ? (
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Payment Actions</h3>
            {selectedPayment && (
              <div className="text-sm text-gray-600">
                Acting on: <span className="font-semibold">{selectedPayment.paymentId}</span>{" "}
                (Event ID: <span className="font-semibold">{selectedPayment.eventId ?? "N/A"}</span>)
              </div>
            )}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason (required for rejection)..."
              disabled={!isActionEnabled}
              className="w-full h-24 text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d3c44] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setConfirmAction("Reject");
                  setConfirmTargetPaymentId(selectedPayment?.paymentId || null);
                }}
                disabled={!isActionEnabled || !reason.trim()}
                className={`px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition-colors ${
                  !isActionEnabled || !reason.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Reject Payment
              </button>
              <button
                onClick={() => {
                  setConfirmAction("Approve");
                  setConfirmTargetPaymentId(selectedPayment?.paymentId || null);
                }}
                disabled={!isActionEnabled}
                className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors ${
                  !isActionEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Approve Payment
              </button>
            </div>

            {selectedPayment && !canTakeAction(selectedPayment) && (
              <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                selectedPayment.status === 'approved'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : selectedPayment.status === 'rejected'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                Payment has been {selectedPayment.status || 'processed'}. No further actions can be taken.
              </div>
            )}

            {selectedPayment && canTakeAction(selectedPayment) && (
              <div className="mt-4 p-3 rounded-lg text-center font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Payment is {selectedPayment.status || 'pending review'}. You can approve or reject this payment.
              </div>
            )}
          </div>
        ) : (
          <p className="border-t pt-6 text-sm text-gray-600">
            You can review this payment; approving or rejecting is not available for your role.
          </p>
        )}

        {canApproveReject && confirmAction && (
          <ConfirmBlock
            type={confirmAction}
            reason={reason}
            onConfirm={() => handleFinalAction(confirmAction)}
            onCancel={() => {
              setConfirmAction(null);
              setConfirmTargetPaymentId(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const Detail = ({ label, value, isLink }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
    <div className="text-gray-900 break-words">
      {isLink && value && /^https?:\/\//i.test(String(value)) ? (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-700 underline"
        >
          {value}
        </a>
      ) : (
        value
      )}
    </div>
  </div>
);

const ConfirmBlock = ({ type, reason, onConfirm, onCancel }) => (
  <div className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
    <span className="text-gray-800">
      Are you sure you want to {type.toLowerCase()} this payment
      {type === "Reject" && reason ? ` with reason: "${reason}"` : ""}?
    </span>
    <div className="space-x-2">
      <button
        onClick={onConfirm}
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

export default EventPayment;
