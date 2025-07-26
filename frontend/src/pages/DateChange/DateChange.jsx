import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axiosApi from "../../conf/axios";

import { toast, Bounce, ToastContainer } from "react-toastify";

import { useArtist } from "../auth/API/ArtistContext";

export default function DateChangeForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [formData, setFormData] = useState({
    contentId: location.state?.contentId || "",
    oldDate: location.state?.date || "",
    newDate: "",
    reason: "",
  });
  const { headers, ophid } = useArtist();

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await axiosApi.get(
          "/bookings",
          {
            headers: headers,
          }
        );
 
        if (response.data.success) {
                
          // Extract just the dates from the response
          const dates = response.data.data.map(
            (item) => item.current_booking_date?.split("T")[0]
          );
         
          setBlockedDates(dates);
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    };

    fetchBlockedDates();    
  }, []);

  const isBlockedDate = (date) => {
    if (!date && blockedDates.length === 0) return false;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return false;

    console.log(parsedDate);
    

    const formattedDate = parsedDate.toISOString().split("T")[0];    
    // Exclude the current date being changed from blocked dates check
 
  
    return blockedDates.some(
      (blockedDate) =>
        blockedDate === formattedDate && formattedDate !== formData.oldDate
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (isBlockedDate(formData.newDate)) {
      toast.error("Date already booked");
      return;
    }
    if (formData.newDate === formData.oldDate) {
      toast.error("New date cannot be the same as the old date");
      return;
    }

    setIsProcessing(true);
    try {
      // const response = await axiosApi.post(
      //   "/date-block/change",
      //   {
      //     old_date: formData.oldDate,
      //     new_date: formData.newDate,
      //     reason: formData.reason,
      //     content_id: formData.contentId,
      //   },
      //   {
      //     headers: headers,
      //   }
      // );
 
      navigate("/auth/payment", {
        state: {
          old_booking_date: formData.oldDate,
          new_booking_date: formData.newDate,
          returnPath: "/dashboard/time-calendar",
          amount: 100,
          heading: "Payment Required",
          from: "Release date change",
        },
      });

    } catch (error) {
      console.error("Error changing date:", error);
      toast.error("Error changing date. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 py-6">
      <div className="max-w-xl">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          DATE CHANGE
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block">
              OPH ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contentId"
              value={ophid}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="block">
              Current Blocked Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="oldDate"
                value={formData.oldDate}
                disabled
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block">
              New Blocked Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="newDate"
                value={formData.newDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                onKeyDown={(e) => e.preventDefault()}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                style={{
                  backgroundColor: isBlockedDate(formData.newDate)
                    ? "rgba(255,0,0,0.1)"
                    : "transparent",
                  colorScheme: "dark",
                }}
              />
            </div>
            {isBlockedDate(formData.newDate) && (
              <span className="text-red-500 text-sm">
                Selected date is blocked. Please choose another date.
                <Link to="/dashboard/time-calendar">
                  <span className="underline ms-2">
                    Click to See Available Dates
                  </span>
                </Link>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="block">
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-cyan-400 min-h-[100px]"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || isBlockedDate(formData.newDate)}
            className="w-full bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors mt-8 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Change Date"}
          </button>
        </form>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
}
