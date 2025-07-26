import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useArtist } from "../auth/API/ArtistContext";
import axiosApi from "../../conf/axios";
import Loading from "../../components/Loading";
import { useParams } from "react-router-dom";

const PaymentScreen = () => {
  const { logout, headers, ophid } = useArtist();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [trans, setTrans] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const from = location.state.from;
  const [oph_id, setoph_id] = useState("")

  const {
    amount = 0,
    planIds = [],
    paymentIds = [],
    returnPath = "/create-profile/personal-details",
    heading = "Payment Required",
  } = location.state || {};

  useEffect(() => {
    if (ophid) {
      setoph_id(ophid)
    }
  }, [ophid])

  const handlePaymentSuccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = {
        OPH_ID: ophid,
        Transaction_ID: trans,
        Review: 0,
        Status: "Under Review",
        step: "/auth/create-profile/personal-details",
        from: from,
      };

      const response = await axiosApi.post("/auth/payment", formData);


      if (response.data.success && from == "Date booking") {
        {
          const CalenderRes = await axiosApi.post(
            "/booking",
            { oph_id: ophid, booking_date: location.state.date },
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
      }
      else if (response.data.success && from == "Release date change") {
        {
          const CalenderRes = await axiosApi.post(
            "/change-release-date",
            { oph_id: ophid, old_booking_date: location.state.old_booking_date, new_booking_date: location.state.new_booking_date },
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
      }

      else if (response.data.success && from == "Song Registration") {
        {
          navigate("/dashboard/success", {
            state: {
              heading: "Your date blocked successfully!",
              btnText: "Register another song",
              redirectTo: "/dashboard/upload-song",
            },
          });
        }
      }

      else if (response.data.success && from === "Event Registeration") {
        {

          const eventResponse = await axiosApi.post("/event/enroll-event", { ophid: oph_id, event_id: location.state.event_id },
            {
              headers: {
                "Content-Type": "application/json",
                ...headers
              }
            }
          )

          if (eventResponse.data.success) {

            navigate("/dashboard/success", {
              state: {
                heading: "Your Event Spot has been booked Successfully.",
                btnText: "Back to Home",
                redirectTo: "/dashboard/events",
              },
            });
          }
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
          {heading} <span className="text-cyan-400">₹{amount}/-</span>
        </h1>

        <div className="flex flex-col items-center gap-6 max-w-md w-full">
          <img
            src="/qr.png"
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
