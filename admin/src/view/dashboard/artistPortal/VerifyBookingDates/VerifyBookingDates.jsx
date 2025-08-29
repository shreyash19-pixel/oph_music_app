import React from "react";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import axiosApi from "../../../../../../frontend/src/conf/axios";
import { useState } from "react";
const VerifyBookingDates = () => {

  const location = useLocation();
  const release_date = location.state.selectedDate
  const [transactions, setTransactions] = useState([])
  const [confirmReject, setConfirmReject] = useState(false)
  const [reason, setReason] = useState(null);

  const fetchBookingDetails = async () => {

    try {
      const response = await axiosApi.get("/get-transaction-details", {
        params: { release_date }
      })

      if (response.data.success) {
        setTransactions(response.data.data[0])
      }

    } catch (err) {
      console.error(err.message);

    }
  }
  useEffect(() => {
    fetchBookingDetails()
  }, [])

  const handleDecision = async (dec) => {
    console.log(dec);

    if (dec === "rejected" && reason === null) {
      alert("Enter a rejection reason")
      return
    }

    const formData = new FormData()

    formData.append("decision", dec)
    formData.append("reason", reason)
    formData.append("release_date", release_date)

    try {
      const response = await axiosApi.post("/payment-verification", formData, {
        headers: { "Content-Type": "application/json" }
      })

      if (response.data.success) {
        console.log("success");

      }

    } catch (err) {
      console.error(err.message);

    }

  }

  return (
    <div>
      <ArtistSidebar>
        <div className="w-full max-w-[450px] flex flex-col gap-[14px] border border-gray-300 shadow-sm rounded-lg p-4">
          <p><strong>OPHID # : </strong>{transactions.OPH_ID}</p>
          <p><strong>Transaction ID : </strong>{transactions.Transaction_ID}</p>
          <p><strong>For : </strong>{transactions.From}</p>

          {confirmReject && (<div>
            <textarea
              className="w-full min-h-20 border border-gray-300 rounded-lg p-[10px]"
              placeholder="Enter reason for rejection" onChange={(e) => setReason(e.target.value)} >
            </textarea>

            <div className="mt-[12px] w-full flex">
              <button className="w-full bg-[#8B0000] px-[14px] py-[8px] text-white rounded-md shadow-sm" onClick={() => handleDecision("rejected")}>
                Confirm Reject
              </button>

              <button className="w-full bg-[#808080] px-[14px] py-[8px] text-white rounded-md shadow-sm ml-2" onClick={() => setConfirmReject(false)}>
                Cancel
              </button>
            </div>
          </div>)}

          {!confirmReject && (<div className="mt-[12px] w-full flex">
            <button className="w-full bg-[#FF0000] px-[14px] py-[8px] text-white rounded-md shadow-sm" onClick={() => setConfirmReject(true)}>
              Reject
            </button>

            <button className="w-full bg-[#008000] px-[14px] py-[8px] text-white rounded-md shadow-sm ml-2" onClick={() => handleDecision("approved")}>
              Approve
            </button>
          </div>)}
        </div>
      </ArtistSidebar>
    </div>
  );
};

export default VerifyBookingDates;
