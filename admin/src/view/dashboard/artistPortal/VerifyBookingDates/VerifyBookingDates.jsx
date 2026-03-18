import React from "react";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import { useState } from "react";

const TransactionBlock = ({
  tx,
  release_date,
  confirmReject,
  setConfirmReject,
  reason,
  setReason,
  onDecision,
  rejectingForTxId,
  onRejectClick,
}) => {
  const txId = tx.Transaction_ID ?? tx.transaction_id ?? "";
  const fromSource = tx.From ?? tx.from_source ?? tx.from ?? "";
  const isReleaseDateChange = fromSource.toLowerCase().includes("release date change");
  const previousDate = tx.previous_booking_date ?? tx.previousBookingDate;
  const currentDate = tx.current_booking_date ?? tx.currentBookingDate ?? release_date;
  const hasPreviousDate = previousDate && previousDate !== "" && new Date(previousDate).getTime() > 0;
  const displayReason = tx.reason ?? tx.Reason ?? tx.reject_reason ?? tx.rejectReason ?? null;
  const status = tx.Status ?? tx.status ?? "";
  const isActionable = status === "under review" || status === "pending";
  const showRejectFlow = confirmReject && rejectingForTxId === txId;

  return (
    <div className="w-full max-w-[450px] flex flex-col gap-[14px] border border-gray-300 shadow-sm rounded-lg p-4">
      <p><strong>OPHID # : </strong>{tx.OPH_ID ?? tx.oph_id ?? "—"}</p>
      <p><strong>Transaction ID : </strong>{txId || "—"}</p>
      <p><strong>For : </strong>{fromSource || "—"}</p>
      {tx.song_name && <p><strong>Song : </strong>{tx.song_name}</p>}
      {isReleaseDateChange && hasPreviousDate ? (
        <>
          <p><strong>Old Date : </strong>{new Date(previousDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <p><strong>New Date : </strong>{new Date(currentDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
        </>
      ) : isReleaseDateChange ? (
        <>
          <p><strong>New Date : </strong>{new Date(currentDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <p className="text-sm text-gray-500">(Previous date not available)</p>
        </>
      ) : (
        <p><strong>Date : </strong>{new Date(currentDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      )}
      {(tx.amount != null && tx.amount !== "") && (
        <p><strong>Amount : </strong>{parseFloat(tx.amount).toFixed(2)}</p>
      )}
      {displayReason && <p><strong>Reason : </strong>{displayReason}</p>}

      {isActionable && (
        <>
          {showRejectFlow ? (
            <div>
              <textarea
                className="w-full min-h-20 border border-gray-300 rounded-lg p-[10px]"
                placeholder="Enter reason for rejection"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="mt-[12px] w-full flex flex-col gap-2">
                {!reason.trim() && <p className="text-sm text-amber-600">Enter a reason above to enable Confirm Reject</p>}
                <div className="w-full flex">
                  <button type="button" className="w-full bg-[#8B0000] px-[14px] py-[8px] text-white rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90" disabled={!reason.trim()} onClick={() => onDecision("rejected", tx)}>Confirm Reject</button>
                  <button type="button" className="w-full bg-[#808080] px-[14px] py-[8px] text-white rounded-md shadow-sm ml-2" onClick={() => setConfirmReject(false)}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-[12px] w-full flex">
              <button className="w-full bg-[#FF0000] px-[14px] py-[8px] text-white rounded-md shadow-sm" onClick={() => onRejectClick(txId)}>Reject</button>
              <button className="w-full bg-[#008000] px-[14px] py-[8px] text-white rounded-md shadow-sm ml-2" onClick={() => onDecision("approved", tx)}>Approve</button>
            </div>
          )}
        </>
      )}
      {!isActionable && status && <p className="text-sm text-gray-500">Status: {status}</p>}
    </div>
  );
};

const VerifyBookingDates = () => {
  const location = useLocation();
  const release_date = location.state?.selectedDate;
  const [transactions, setTransactions] = useState(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectingForTxId, setRejectingForTxId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const params = { release_date };
      if (location.state?.oph_id) params.oph_id = location.state.oph_id;
      if (location.state?.song_id != null) params.song_id = location.state.song_id;
      const response = await axiosApi.get("/get-transaction-details", { params });

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const data = response.data.data;
        setTransactions(Array.isArray(data) ? data : [data]);
      } else {
        setTransactions(null);
      }
    } catch (err) {
      console.error(err.message);
      setTransactions(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (release_date) fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release_date, location.state?.oph_id, location.state?.song_id]);

  const handleDecision = async (dec, tx) => {
    if (dec === "rejected" && !String(reason || "").trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    const fromSource = tx?.From ?? tx?.from ?? tx?.from_source ?? "Date booking";
    const requestData = {
      decision: dec,
      reason: reason || null,
      release_date,
      from: fromSource,
      song_id: tx?.calendar_song_id ?? tx?.song_id,
      oph_id: tx?.OPH_ID ?? tx?.oph_id,
    };
    try {
      const response = await axiosApi.post("/payment-verification", requestData, { headers: { "Content-Type": "application/json" } });
      if (response.data.success) {
        if (dec === "rejected") toast.error("Date rejected");
        else toast.success("Date approved");
        setConfirmReject(false);
        setRejectingForTxId(null);
        setReason("");
        fetchBookingDetails();
        navigate("/calendar");
      }
    } catch (err) {
      console.error(err.message);
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const list = Array.isArray(transactions) ? transactions : transactions ? [transactions] : [];

  return (
    <div>
      <ArtistSidebar>
        <div className="flex flex-col gap-6">
          {list.length > 0 ? (
            list.map((tx) => (
              <TransactionBlock
                key={tx.Transaction_ID ?? tx.transaction_id ?? tx.song_id ?? Math.random()}
                tx={tx}
                release_date={release_date}
                confirmReject={confirmReject}
                setConfirmReject={(v) => { setConfirmReject(v); if (!v) setRejectingForTxId(null); }}
                reason={reason}
                setReason={setReason}
                onDecision={handleDecision}
                rejectingForTxId={rejectingForTxId}
                onRejectClick={(txId) => { setRejectingForTxId(txId); setConfirmReject(true); setReason(""); }}
              />
            ))
          ) : (
            <div className="w-full max-w-[450px] space-y-2 border border-gray-300 shadow-sm rounded-lg p-4">
              <p className="text-gray-600">No payment data found for this slot.</p>
              {location.state?.oph_id && <p><strong>OPHID # : </strong>{location.state.oph_id}</p>}
              {location.state?.song_id != null && <p><strong>Song ID : </strong>{location.state.song_id}</p>}
              <p><strong>Date : </strong>{release_date}</p>
            </div>
          )}
        </div>
      </ArtistSidebar>
    </div>
  );
};

export default VerifyBookingDates;
