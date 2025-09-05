import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useArtist } from "../auth/API/ArtistContext";
import axiosApi from "../../conf/axios";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";

const PaymentScreen = () => {
  const { logout, headers, ophid } = useArtist();
  const navigate = useNavigate();
  const location = useLocation();
  const [trans, setTrans] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [costingData, setCostingData] = useState([]);
  const [matchedCosting, setMatchedCosting] = useState(null);
  const from = location.state.from;
  const song_id = location.state.song_id;
  const event_id = location.state.event_id;
  const [oph_id, setoph_id] = useState("");
  
  // Debug log for lyricalVid flag
  console.log("PaymentScreen - lyricalVid flag:", lyricalVid);

  const {
    amount = 0,
    returnPath = "/",
    heading = "Payment Required",
    lyricalVid = false,
  } = location.state || {};

  // Function to fetch costing data and match with 'from' field
  const fetchCostingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosApi.get("/get_costing");
      
      if (response.data.success) {
        // Handle both array and single object responses
        const costingData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        setCostingData(costingData);
        
        // Match the 'from' field with costing data 'name' field
        // If lyricalVid is true, use "lyrical video" data regardless of 'from' value
        // If no 'from' is provided, default to "Registration"
        // Handle "Registration" and "Song Registration" as separate cases
        let searchName;
        if (lyricalVid) {
          searchName = "lyrical video";
        } else {
          // Handle case when no 'from' is provided - default to Registration
          if (!from) {
            searchName = "registration";
          } else {
            searchName = from.toLowerCase();
            if (searchName === "song repayment") {
              searchName = "song registration";
            }
            // Date booking also uses Song Registration data
            if (searchName === "date booking") {
              searchName = "song registration";
            }
            // Handle "Release date change" as a separate case
            if (searchName === "release date change") {
              searchName = "release date change";
            }
            // "registration" stays as "registration"
            // "song registration" stays as "song registration"
          }
        }
        
        const matched = costingData.find(item => 
          item.name && item.name.toLowerCase() === searchName
        );
        
        if (matched) {
          setMatchedCosting(matched);
          console.log(`Using costing data for: ${from || 'default'} (lyricalVid: ${lyricalVid}) -> ${matched.name} (Amount: ${matched.cost})`);
        } else {
          // Fallback to default amounts if no match found
          console.warn(`No costing data found for: ${from || 'default'} (lyricalVid: ${lyricalVid}) - using fallback amounts`);
        }
      }
    } catch (err) {
      console.error("Error fetching costing data:", err);
      toast.error("Failed to fetch payment information");
    } finally {
      setLoading(false);
    }
  }, [from, lyricalVid]);

  // Function to get the appropriate amount based on the matched costing data or fallback
  const getDisplayAmount = () => {
    if (matchedCosting) {
      // Parse cost as number (handles string format like "799.00")
      return parseFloat(matchedCosting.cost);
    }
    
    // Fallback to hardcoded amounts if no costing data match
    if (lyricalVid) {
      return 499; // Lyrical video amount
    } else if (!from || from === "Registration") {
      return 500; // Registration amount (default or explicit)
    } else if (from === "Song Repayment" || from === "Song Registration" || from === "Date booking") {
      return 799; // Song Registration amount (used by multiple services)
    } else if (from === "Event Registeration") {
      return 1000;
    } else if (from === "Release date change") {
      return 300;
    } else if (from === "Special artist song registration") {
      return 800;
    }
    return amount; // Default to the passed amount
  };

  // Function to get the QR code image
  const getQRCodeImage = () => {
    if (matchedCosting && matchedCosting.qr_image_path) {
      return matchedCosting.qr_image_path;
    }
    return "/qr.png"; // Fallback to default QR code
  };

  useEffect(() => {
    if (ophid) {
      setoph_id(ophid);
    }
  }, [ophid]);

  useEffect(() => {
    fetchCostingData();
  }, [fetchCostingData]);

  const handlePaymentSuccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = {
        OPH_ID: ophid,
        Transaction_ID: trans,
        Review: 0,
        Status: "under Review",
        step: "/auth/create-profile/personal-details",
        from: from,
        song_id: song_id,
        event_id: event_id,
        release_date: location.state.date || location.state.booking_date || null,
        lyricalVid: lyricalVid
      };

      const apiPath =
        from === "Song Repayment" ? "/song-payment" : "/auth/payment";

      const response = await axiosApi.post(apiPath, formData);

      if (response.data.success && from == "Date booking") {
        {
          const CalenderRes = await axiosApi.post(
            "/booking",
            {
              oph_id: ophid,
              booking_date: location.state.date,
              song_name: null,
              project_type: null,
            },
            { headers: headers }
          );

          if (CalenderRes.data.success) {
            navigate("/dashboard/success", {
              state: {
                heading: "Your date blocked successfully!",
                btnText: "View Calendar",
                redirectTo: "/dashboard/time-calendar",
              },
            });
          }
        }
      } else if (response.data.success && from == "Release date change") {
        {
          const CalenderRes = await axiosApi.post(
            "/change-release-date",
            {
              oph_id: ophid,
              old_booking_date: location.state.old_booking_date,
              new_booking_date: location.state.new_booking_date,
            },
            { headers: headers }
          );

          if (CalenderRes.data.success) {
            navigate("/dashboard/success", {
              state: {
                heading: "Your date blocked successfully!",
                btnText: "View Calendar",
                redirectTo: "/dashboard/time-calendar",
              },
            });
          }
        }
      } else if (response.data.success && from == "Song Registration") {
        {
          const CalenderRes = await axiosApi.post(
            "/booking",
            {
              oph_id: ophid,
              booking_date: location.state.booking_date,
              song_name: location.state.songName,
              project_type: location.state.project_type,
              lyricalVid: lyricalVid,
            },
            { headers: headers }
          );

          if (CalenderRes.data.success) {
            navigate("/dashboard/success", {
              state: {
                heading: "Your Song Registration has been done successfully!",
                btnText: "Register another song",
                redirectTo: "/dashboard/upload-song",
              },
            });
          }
        }
      } else if (response.data.success && from === "Song Repayment") {
        navigate("/dashboard/success", {
          state: {
            heading: "Your Song Registration has been done successfully!",
            btnText: "View Song Registration",
            redirectTo: "/dashboard/upload-song",
          },
        });
      } else if (response.data.success && from === "Event Registeration") {
        {
          const eventResponse = await axiosApi.post(
            "/event_part",
            { OPH_ID: oph_id, event_id: location.state.event_id },
            {
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
            }
          );

          if (eventResponse.status === 201) {
            navigate("/dashboard/success", {
              state: {
                heading: "Your Event Spot has been booked Successfully.",
                btnText: "Back to Home",
                redirectTo: "/dashboard/events",
              },
            });
          }
        }
      } else if (response.data.success && from === "Special artist song registration") {
        {
          navigate('/dashboard/pending', {
            state: {
              heading: "Your request is under review",
              btnText: "Back to Home",
              redirectTo: "/dashboard"
            }
          })

        }
      }

      else if (response.data.success) {
        const path = `/auth/create-profile/personal-details`;
        navigate(path);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (returnPath.includes("auth")) {
      logout();
    }
    navigate(returnPath, {
      state: {
        status: "cancelled",
      },
      replace: true,
    });
  };

  return (
    <div className="relative">
      {loading && <Loading />}
      <div className="bg-black min-h-[calc(100vh-70px)] text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] text-center">
          {heading} <span className="text-cyan-400">₹{getDisplayAmount()}/-</span>
        </h1>

        <div className="flex flex-col items-center gap-6 max-w-md w-full">
          <img
            src={getQRCodeImage()}
            alt="QR Code"
            className="w-48 h-48 drop-shadow-[0_0_15px_rgb(252 253 253 / 45%))]"
          />

          <h2 className="text-xl text-center">SCAN QR AND PAY WITH UPI</h2>

          <div className="text-gray-400 text-sm text-center">
            Scan QR code, complete payment and enter the transaction ID below
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handlePaymentSuccess} className="w-full space-y-4">
            <input
              type="text"
              placeholder="Enter Transaction ID"
              value={trans}
              onChange={(e) => setTrans(e.target.value)}
              className="w-full bg-gray-800 rounded-md px-4 py-3 text-white"
              required
              disabled={loading}
            />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full border border-cyan-400 text-cyan-400 py-3 rounded-md"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full bg-cyan-400 text-black py-3 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;

