import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../../conf/axios";
import { Bounce, toast, ToastContainer } from "react-toastify";

const instagramRegex =
  /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/;
const IndividualEvent = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [singleEvent, setSingleEvent] = useState(null);
  const [timers, setTimers] = useState({});
  const [professions, setProfessions] = useState([]);
  const [isEventInFuture, setIsEventInFuture] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const fetchSingleEvent = async () => {
    setLoading(true);
    try {
      const response = await axiosApi.get(`/events/events/${id}`);
      setSingleEvent(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/; // Ensures exactly 10 digits
    return phoneRegex.test(phone);
  };
  const dateFormat = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // Ensure UTC
    });
  };
  const fetchProfessions = async () => {
    try {
      const response = await axiosApi.get("/professions");
      setProfessions(response.data.data);
      console.log(professions);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchSingleEvent();
    fetchProfessions();
  }, []);
  useEffect(() => {
    if (singleEvent) {
      const updateTimers = () => {
        const now = new Date();
        const eventDate = new Date(singleEvent.event_date_time);
        const timeDiff = eventDate - now;
        let newTimers;
        if (timeDiff <= 0) {
          newTimers = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        } else {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);
          newTimers = { days, hours, minutes, seconds };
        }
        setTimers(newTimers);
      };

      // Only set interval if modal is not open
      if (!isModalOpen) {
        updateTimers();
        const interval = setInterval(updateTimers, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [singleEvent, isModalOpen]); // Add isModalOpen to dependency array

  useEffect(() => {
    if (singleEvent) {
      const now = new Date();
      const eventDate = new Date(singleEvent.event_date_time);
      setIsEventInFuture(eventDate > now);
    }
  }, [singleEvent]);

  // Registration Modal Component
  const RegistrationModal = () => {
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      instagram_handle: "",
      phone: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return; // Prevent multiple submissions
      console.log("Form submitted:", formData);
      if (!instagramRegex.test(formData.instagram_handle)) {
        toast.error(
          "Invalid Instagram URL! Please enter a valid profile link.",
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          }
        );
        return; // Stop form submission
      }
      if (!isValidEmail(formData.email)) {
        toast.error("Invalid Email Address!", {
          position: "top-right",
          theme: "dark",
        });
        return;
      }

      if (!isValidPhoneNumber(formData.phone)) {
        toast.error("Invalid Phone Number! Must be 10 digits.", {
          position: "top-right",
          theme: "dark",
        });
        return;
      }
      setIsSubmitting(true); // Set submitting state

      try {
        const response = await axiosApi.post(
          `/events/bookings/${id}`,
          formData
        );
        if (response.status == 201) {
          toast.success("Registration Successfull", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          setIsModalOpen(false);
          // Navigate to payment page with required data
          navigate("/payment", {
            state: {
              amount: singleEvent.fees, // Event registration fee
              returnPath: `/events/online-music-events`,
              heading: "Event Registration Fee",
              // Add any other required parameters
              planIds:[3],
              event_id: id,
              bookingId: response.data.id, // If your API returns the booking ID
            },
          });
        } else {
          toast.error("Something went wrong", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
        }
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      } finally {
        setIsSubmitting(false); // Reset submitting state
      }
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    return (
      <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg max-w-md w-full mx-4">
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                Register for Event
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name*"
                  required
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name*"
                  required
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address*"
                required
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <input
                type="text"
                name="instagram_handle"
                placeholder="Instagram Handle*"
                required
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                value={formData.instagram_handle}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-2">
              <select className="w-16 p-2 border border-gray-600 rounded bg-gray-700 text-white">
                <option value="+1">+91</option>
              </select>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number*"
                required
                className="flex-1 p-2 border border-gray-600 rounded bg-gray-700 text-white"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <select
                name="profession_id"
                required
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
                onChange={handleChange}
              >
                {professions &&
                  professions.map((profession, ind) => {
                    return (
                      <option key={ind} value={profession.id}>
                        {profession.name}
                      </option>
                    );
                  })}
              </select>
            </div>

            {singleEvent.status == 1 ? (
              <button
                type="submit"
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-2 px-4 rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                type="submit"
                disabled
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-2 px-4 rounded"
              >
                Registration Expired
              </button>
            )}
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {loading && (
        <div className="text-center h-[90vh] w-full py-32">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-[#5DC9DE] mx-auto"></div>
          <p className="mt-2 text-[#5DC9DE]">
            🎵 "Hold tight! The beats are warming up..." 🎧
          </p>
        </div>
      )}
      {!loading && singleEvent && (
        <div className="relative px-4 md:px-10 xl:px-16  text-white h-auto min-h-screen overflow-hidden">
          {/* Background with gradient */}
          <div
            className="absolute  inset-0 bg-black"
            style={{
              background: `linear-gradient(to bottom,
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 0) 60%,
                rgba(0, 0, 0, 1) 100%),
                url(${singleEvent.thumbnail_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "70vh",
            }}
          />

          {/* Solid black overlay for bottom half */}
          <div className="absolute inset-0 bg-black" style={{ top: "70vh" }} />

          {/* Content */}
          <div className="relative z-10 container mx-auto my-10 pt-[250px] sm:pt-[400px]">
            {/* Timer */}
            <div className="flex sm:flex-row flex-col gap-4 mb-6">
              <div className="flex gap-4">
                <div className="bg-white/5 backdrop-blur-none border p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{timers.days}</div>
                  <div className="text-sm text-gray-300">Days</div>
                </div>
                <div className="bg-white/5 backdrop-blur-none border p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{timers.hours}</div>
                  <div className="text-sm text-gray-300">Hours</div>
                </div>
                <div
                  className="bg-white/5 backdrop-blur-none border
 p-4 rounded-lg text-center"
                >
                  <div className="text-3xl  font-bold">{timers.minutes}</div>
                  <div className="text-sm text-gray-300">Minute</div>
                </div>
                <div className="bg-white/5 backdrop-blur-none border p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{timers.seconds}</div>
                  <div className="text-sm text-gray-300">Second</div>
                </div>
              </div>

              {/* Prize Amount */}
              <div className="sm:ml-auto backdrop-blur-sm border px-3 sm:px-6 rounded-lg bg-transparent w-[100%] lg:w-auto  p-6 transition-colors bg-gradient-to-b from-white/20 to-white/5 border-t border-l border-r border-white/20 border-b-transparent shadow-lg">
                <span className="text-xl lg:text-sm text-gray-300">
                  CHANCE TO WIN
                </span>
                <span className="text-2xl ms-4 font-bold text-emerald-400">
                  ₹{singleEvent.reward_amount ? singleEvent.reward_amount : "0"}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-4">
              {/* <span className="text-gray-400">#Competition</span>
              <span className="text-gray-400">#Music</span>
              <span className="text-gray-400">#Winners</span> */}
              {singleEvent.hashtags?.map((tag, index) => (
                <span key={index} className="text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title and Description */}
            <h1 className="text-4xl font-bold mb-4 uppercase">
              {singleEvent.name}
            </h1>
            <p className="text-gray-300 mb-6 max-w-3xl">
              {singleEvent.short_desc}
            </p>

            {/* Event Details */}
            <div className="space-y-4 mb-8">
              <div className="text-amber-400">
                Registration Date:{" "}
                <span className="text-white">
                  {dateFormat(singleEvent.regn_start)} -{" "}
                  {dateFormat(singleEvent.regn_end)}
                </span>
              </div>
              <div className="text-gray-300">
                Participated Users:{" "}
                <span className="text-white">{singleEvent.total_bookings}</span>
              </div>
              <div className="text-emerald-400">
                {dateFormat(singleEvent.event_date_time)} -{" "}
                {singleEvent.location}
              </div>
            </div>

            {/* Additional Description */}
            <div className="space-y-4 text-gray-300 mb-8 max-w-4xl">
              {singleEvent.long_desc}
            </div>

            {/* Registration */}
            <div className="flex items-center gap-8">
              <div>
                <div className="text-white-400">Registration Fees</div>
                <div className="text-3xl font-bold text-[#5DC9DE]">
                  ₹{singleEvent.fees}
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className={`bg-[#5DC9DE] text-black text-sm lg:text-2xl px-6 py-3 rounded-full font-semibold drop-shadow-[0_0_20px_white] ${
                  isEventInFuture
                    ? "hover:font-bold transition delay-300"
                    : "opacity-50 cursor-not-allowed"
                }`}
                disabled={!isEventInFuture}
              >
                Book Your Spot Now
              </button>
            </div>
          </div>

          {/* Modal and Toast */}
          <ToastContainer className="z-[100000]" />
          {isModalOpen && <RegistrationModal />}
        </div>
      )}
    </>
  );
};

export default IndividualEvent;
