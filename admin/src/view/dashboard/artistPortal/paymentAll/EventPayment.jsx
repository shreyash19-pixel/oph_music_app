import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import { toast } from "react-hot-toast";

const EventPayment = () => {
  const { ophid } = useParams();
  const [artist, setArtist] = useState(null);
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null); // "Approve" or "Reject"
  const [actionLocked, setActionLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get(`/user-details/${ophid}`);
        setArtist(res.data.userDetails);

        const paymentRes = await axiosApi.get(`/payment-for-events-by-ophid/${ophid}`);
        console.log(paymentRes.data);
        let paymentArray = paymentRes.data.data || [];
        
        // Map the backend response to frontend expected format
        const mappedPayments = paymentArray.map(payment => ({
          paymentId: payment.Transaction_ID,
          status: payment.Status,
          createdAt: payment.CreatedAt,
          paymentType: payment.From,
          amount: payment.event_id ? `Event ID: ${payment.event_id}` : 'N/A',
          description: `Event Registration Payment - ${payment.From}`,
          ophId: payment.OPH_ID
        }));
        
        mappedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log("Mapped payments:", mappedPayments);
        
        setPaymentList(mappedPayments);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ophid]);

  const handleFinalAction = async(type) => {
    const recentPayment = paymentList.length > 0 ? paymentList[0] : null;
    if (!recentPayment) {
      toast.error("No payment found to process");
      return;
    }

    if (type === "Reject") {
      const logData = {
        ophId: ophid,
        transactionId: recentPayment.paymentId,
        status: "rejected",
        reject_reason: reason || "No reason provided",
        eventId: recentPayment.amount.replace('Event ID: ', '') || null
      };
      console.log("Reject Log:", logData);

      try {
        const submit = await axiosApi.put("/update-event-payment", logData);
        
        // Debug logging to see the actual response structure
        console.log("Reject API Response:", submit);
        console.log("Response data:", submit.data);
        console.log("Response status:", submit.status);
        
        // Check if the stored procedure was successful - handle different response formats
        const isSuccess = (
          (submit.data && submit.data.affectedRows === 1) || 
          (submit.data && submit.data.result && submit.data.result.affectedRows === 1) ||
          (submit.status === 200 && submit.data && typeof submit.data === 'object')
        );
        
        if (isSuccess) {
          toast.success(`Payment rejected successfully with reason: ${reason || "No reason provided"}`, { duration: 20000 });
          
          // Update local state instead of reloading
          setPaymentList(prevPayments => 
            prevPayments.map(payment => 
              payment.paymentId === recentPayment.paymentId 
                ? { ...payment, status: 'rejected' }
                : payment
            )
          );
          
          // Disable action buttons
          setActionLocked(true);
        } else {
          console.log("Reject failed - Response details:", submit);
          toast.error("Failed to reject payment - please try again");
        }
      } catch (error) {
        console.error("Error rejecting payment:", error);
        toast.error("Failed to reject payment");
      }

      setReason("");
    } else if (type === "Approve") {
      const logData = {
        ophId: ophid,
        transactionId: recentPayment.paymentId,
        status: "approved",
        reject_reason: null,
        eventId: recentPayment.amount.replace('Event ID: ', '') || null
      };
      console.log("Approve Log:", logData);

      try {
        const submit = await axiosApi.put("/update-event-payment", logData);
        
        // Debug logging to see the actual response structure
        console.log("Approve API Response:", submit);
        console.log("Response data:", submit.data);
        console.log("Response status:", submit.status);
        
        // Check if the stored procedure was successful - handle different response formats
        const isSuccess = (
          (submit.data && submit.data.affectedRows === 1) || 
          (submit.data && submit.data.result && submit.data.result.affectedRows === 1) ||
          (submit.status === 200 && submit.data && typeof submit.data === 'object')
        );
        
        if (isSuccess) {
          toast.success("Payment approved successfully!", { duration: 20000 });
          
          // Update local state instead of reloading
          setPaymentList(prevPayments => 
            prevPayments.map(payment => 
              payment.paymentId === recentPayment.paymentId 
                ? { ...payment, status: 'approved' }
                : payment
            )
          );
          
          // Disable action buttons
          setActionLocked(true);
        } else {
          console.log("Approve failed - Response details:", submit);
          toast.error("Failed to approve payment - please try again");
        }
      } catch (error) {
        console.error("Error approving payment:", error);
        toast.error("Failed to approve payment");
      }
    }

    setConfirmAction(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPaymentId(text);
    setTimeout(() => {
      setCopiedPaymentId(null);
    }, 2000);
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} — ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

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

  const displayedPayments = showAllPayments ? paymentList : paymentList.slice(0, 1);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">
        <div>
          <h2 className="text-2xl font-bold text-[#0d3c44] mb-6 border-b pb-2">Artist Payment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Detail label="Full Name" value={artist.full_name} />
            <Detail label="Stage Name" value={artist.stage_name} />
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
                <li key={index} className="bg-white p-4 rounded-lg border border-gray-200">
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

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Payment Actions</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason (required for rejection)..."
            disabled={actionLocked || (paymentList[0] && !['pending', 'under review'].includes(paymentList[0].status))}
            className="w-full h-24 text-black p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d3c44] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setConfirmAction("Reject")}
              disabled={actionLocked || !reason.trim() || (paymentList[0] && !['pending', 'under review'].includes(paymentList[0].status))}
              className={`px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow hover:bg-red-700 transition-colors ${
                actionLocked || !reason.trim() || (paymentList[0] && !['pending', 'under review'].includes(paymentList[0].status)) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Reject Payment
            </button>
            <button
              onClick={() => setConfirmAction("Approve")}
              disabled={actionLocked || (paymentList[0] && !['pending', 'under review'].includes(paymentList[0].status))}
              className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition-colors ${
                actionLocked || (paymentList[0] && !['pending', 'under review'].includes(paymentList[0].status)) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Approve Payment
            </button>
          </div>
          
          {/* Show status message when payment is processed */}
          {paymentList[0] && !['pending', 'under review'].includes(paymentList[0].status) && (
            <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
              paymentList[0].status === 'approved' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              Payment has been {paymentList[0].status}. No further actions can be taken.
            </div>
          )}
          
          {/* Show message when payment is under review */}
          {paymentList[0] && paymentList[0].status === 'under review' && (
            <div className="mt-4 p-3 rounded-lg text-center font-medium bg-blue-100 text-blue-800 border border-blue-200">
              Payment is under review. You can approve or reject this payment.
            </div>
          )}
        </div>

        {confirmAction && (
          <ConfirmBlock
            type={confirmAction}
            reason={reason}
            onConfirm={() => handleFinalAction(confirmAction)}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
    <div className="text-gray-900">{value}</div>
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
