import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axiosApi from "../../conf/axios";
import getToken from "../../utils/getToken";
import { useArtist } from "../auth/API/ArtistContext";
import { use } from "react";
import NavbarRight from "../../components/Navbar/NavbarRight";

export default function BlockDateForm() {
  const { headers, ophid } = useArtist();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oph_id: ophid,
    numberOfSongs: "",
    selectedDate: location.state?.selectedDate || "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (ophid) {
      setFormData((prev) => ({
        ...prev,
        oph_id: ophid,
      }));
    }
  }, [ophid]);

  // useEffect(() => {
  //   // const userData = JSON.parse(localStorage.getItem('userData'));
  //   // if (userData?.artist.oph_id) {
  //   //   setFormData(prev => ({
  //   //     ...prev,
  //   //     oph_id: userData.artist.oph_id
  //   //   }));
  //   // }

  //   // Handle payment return
  //   if (location.state?.status === "success") {
  //     const savedFormData = JSON.parse(sessionStorage.getItem('blockDateFormData'));
  //     if (savedFormData) {
  //       handleBlockDate(location.state.paymentData, savedFormData);
  //       // Clean up after successful processing
  //       sessionStorage.removeItem('blockDateFormData');
  //     }
  //   }
  // }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save form data to sessionStorage before navigation
    sessionStorage.setItem(
      "blockDateFormData",
      JSON.stringify({
        selectedDate: formData.selectedDate,
        numberOfSongs: formData.numberOfSongs,
      }),
    );

    // Navigate to payment screen with form data
    navigate("/dashboard/payment", {
      state: {
        date: formData.selectedDate,
        returnPath: "/dashboard/block-date",
        heading: "Date Blocking Fee",
        from: "Date booking",
      },
    });
  };

  const handleBlockDate = async (paymentData, dateBlockData) => {
    console.log("handleBlockDate called with:", { paymentData, dateBlockData });
    try {
      setIsProcessing(true);

      const response = await axiosApi.post(
        "/date-block/block",
        {
          expected_songs: parseInt(dateBlockData.numberOfSongs),
          date: new Date(dateBlockData.selectedDate),
          payment_id: paymentData.newPaymentIds[0],
        },
        {
          headers: headers,
        },
      );

      if (response.data.success) {
        navigate("/dashboard/success", {
          state: {
            heading: "Your date blocked successfully!",
            btnText: "View Calendar",
            redirectTo: "/dashboard/time-calendar",
          },
        });
      }
    } catch (error) {
      console.error("Error blocking date:", error);
      // Handle error appropriately
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
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[#5DC9DE] text-2xl sm:text-3xl font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            BLOCK DATE
          </h2>
          <NavbarRight />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="block">
              OPH ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="oph_id"
              value={formData.oph_id}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400 cursor-not-allowed opacity-70"
            />
          </div>

          <div className="space-y-2">
            <label className="block">
              Number of songs <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                disabled
                name="numberOfSongs"
                value={formData.numberOfSongs}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 appearance-none focus:outline-none focus:border-cyan-400 cursor-not-allowed opacity-70"
              >
                <option value="">01</option>
                {[...Array(9)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {String(i + 2).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block">
              Select Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="selectedDate"
                value={formData.selectedDate}
                disabled
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400 cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors mt-8 disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Pay & Block"}
          </button>
        </form>
      </div>
    </div>
  );
}
