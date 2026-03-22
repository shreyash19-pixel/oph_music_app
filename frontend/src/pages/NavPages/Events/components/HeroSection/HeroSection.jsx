import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosApi from "../../../../../conf/axios";
import { isRegistrationOpenByDateTime, isRegistrationNotStartedYetByDateTime } from "../../../../../utils/date";

// Accept either Instagram username or full profile URL (same as Contact / secondary artist)
// URL regex allows optional query params (e.g. ?igsh=...) from share links
const instagramUsernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._]{0,29})$/;
const instagramUrlRegex = /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(?:\?[^#\s]*)?$/;

export default function HeroSection({ professions = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Optional: show only on home-like paths; remove this if you always want it visible
  const showOnPaths = ["/", "/home"];
  // if you want the hero visible everywhere, remove next line:
  // if (!showOnPaths.includes(location.pathname)) return null;

  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingEventId, setBookingEventId] = useState(null);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState([]);

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhoneNumber = (phone) => /^\d{10}$/.test(phone);

  const settings = {
    dots: true,
    fade: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    waitForAnimate: false,
    autoplay: !isModalOpen,
    autoplaySpeed: 2500,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
  };


  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        
        const res = await axiosApi.get("/events_status");

        const raw = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data?.events ?? []);
        const mapped = raw
          .filter((e) => e?.event_type === "upcoming")
          .map((e) => ({
            
            id: e.event_id,
            name: e.EventName,
            event_date_time: e.dateTime, 
            location: (e.location || "").trim(),
            description: e.description,
            hashtags: e.hashtags,
            fees: Number(e.registrationFee_normal) || 0,
            registrationFee_offer_availableFor:
              e.registrationFee_offer_availableFor,
            registrationFee_offer_discount: e.registrationFee_offer_discount,
            registrationStart: e.registrationStart,
            registrationEnd: e.registrationEnd,
            reward_amount:
              Number(String(e.winnerReward).replace(/,/g, "")) || 0,
            thumbnail_url: e.image || e.thumbnail_url || "",
            raw: e,
          }));

        if (!cancelled) setUpcomingEvents(mapped);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch upcoming events:", err);
          toast.error("Unable to load upcoming events", {
            position: "top-right",
            theme: "dark",
            transition: Bounce,
          });
          setUpcomingEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Timers: compute countdown for each listed event
  useEffect(() => {
    if (!upcomingEvents || upcomingEvents.length === 0) {
      setTimers([]);
      return;
    }

    const updateTimers = () => {
      const now = new Date();
      const newTimers = upcomingEvents.map((event) => {
        // Some APIs may already provide timezone-normalized ISO; new Date(...) handles ISO Z correctly.
        const eventDate = new Date(event.event_date_time);
        const diff = eventDate - now;
        if (isNaN(eventDate) || diff <= 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return { days, hours, minutes, seconds };
      });
      setTimers(newTimers);
    };

    if (!isModalOpen) {
      updateTimers();
      const id = setInterval(updateTimers, 1000);
      return () => clearInterval(id);
    }
  }, [upcomingEvents, isModalOpen]);

  // Booking modal triggers - only allow when registration is open
  const handleBookSpot = (event, eventId) => {
    if (!isRegistrationOpenByDateTime(event)) {
      if (isRegistrationNotStartedYetByDateTime(event)) {
        toast.info("Registration has not started yet for this event.", {
          position: "top-right",
          theme: "dark",
          transition: Bounce,
        });
      } else {
        toast.info("Registration has closed for this event.", {
          position: "top-right",
          theme: "dark",
          transition: Bounce,
        });
      }
      return;
    }
    setBookingEventId(eventId);
    setIsModalOpen(true);
  };

  const dateFormat = (dateIso) => {
    const dt = new Date(dateIso);
    if (isNaN(dt)) return "";
    return dt.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  /* ===== Registration Modal Component ===== */
  const RegistrationModal = () => {
    const [form, setForm] = useState({
      first_name: "",
      last_name: "",
      email: "",
      instagram_handle: "",
      phone: "",
      profession_id: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onChange = (e) =>
      setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const onSubmit = async (ev) => {
      ev.preventDefault();
      if (isSubmitting) return;

      // Basic validations - Instagram: username or profile URL (same as secondary artist on AudioMetadata)
      const isValidInstagram =
        instagramUsernameRegex.test(form.instagram_handle?.trim()) ||
        instagramUrlRegex.test(form.instagram_handle?.trim());
      if (!isValidInstagram) {
        toast.error(
          "Invalid Instagram! Please enter a valid Instagram username or profile link.",
          {
            position: "top-right",
            autoClose: 4000,
            theme: "dark",
            transition: Bounce,
          }
        );
        return;
      }
      if (!isValidEmail(form.email)) {
        toast.error("Invalid Email!", { position: "top-right", theme: "dark" });
        return;
      }
      if (!isValidPhoneNumber(form.phone)) {
        toast.error("Invalid Phone! Must be 10 digits.", {
          position: "top-right",
          theme: "dark",
        });
        return;
      }

      const current = upcomingEvents.find((e) => e.id === bookingEventId) || {};
      if (!isRegistrationOpenByDateTime(current)) {
        toast.error(
          isRegistrationNotStartedYetByDateTime(current)
            ? "Registration has not started yet for this event."
            : "Registration has closed for this event.",
          { position: "top-right", theme: "dark", transition: Bounce }
        );
        return;
      }

      setIsSubmitting(true);
      try {
        toast.success("Redirecting to payment...", {
          position: "top-right",
          theme: "dark",
          transition: Bounce,
        });
        setIsModalOpen(false);

        // Navigate to payment screen - booking_details creates event_bookings only on payment submit
        navigate("/auth/payment", {
          state: {
            OPH_ID: `${form.first_name} ${form.last_name}`.trim(),
            event_id: current.id,
            returnPath: "/events/online-music-events",
            heading: "Complete Event Registration",
            from: "Event Registration",
            outside_user: true,
            booking_details: {
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              phone: form.phone,
              instagram_handle: form.instagram_handle,
              profession_id: form.profession_id,
            },
          },
        });
      } catch (err) {
        console.error("Navigation error:", err);
        toast.error("Failed to redirect to payment", {
          position: "top-right",
          theme: "dark",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg max-w-md w-full mx-4">
          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-semibold">
                Register for Event
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4">
              <input
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                required
                placeholder="First name*"
                className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
              <input
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                required
                placeholder="Last name*"
                className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>

            <input
              name="email"
              value={form.email}
              onChange={onChange}
              required
              type="email"
              placeholder="Email*"
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
            <input
              name="instagram_handle"
              value={form.instagram_handle}
              onChange={onChange}
              required
              placeholder="username or https://instagram.com/username"
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <div className="flex gap-2">
              <select className="w-16 p-2 rounded bg-gray-700 text-white border border-gray-600">
                <option>+91</option>
              </select>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                required
                placeholder="Phone*"
                className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>

            <select
              name="profession_id"
              value={form.profession_id}
              onChange={onChange}
              required
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="">Select Profession</option>
              {professions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              disabled={isSubmitting}
              className="w-full bg-cyan-400 text-black py-2 rounded font-medium"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  /* ===== Render ===== */
  return (
    <>
      <ToastContainer />
      {loading && (
        <div className="text-center h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-[#5DC9DE] mb-4" />
          <div className="text-[#5DC9DE]">Loading upcoming events...</div>
        </div>
      )}

      {!loading && upcomingEvents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400">No upcoming events right now.</p>
        </div>
      )}

      {!loading && upcomingEvents.length > 0 && (
        <div className="relative">
          {/* Prev / Next */}
          <button
            className="absolute top-1/2 left-4 z-50 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full hidden sm:block"
            onClick={() => sliderRef.current && sliderRef.current.slickPrev()}
            aria-label="Previous"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            className="absolute top-1/2 right-4 z-50 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full hidden sm:block"
            onClick={() => sliderRef.current && sliderRef.current.slickNext()}
            aria-label="Next"
          >
            <ArrowRight size={20} />
          </button>

          <Slider ref={sliderRef} {...settings}>
            {upcomingEvents.map((event, idx) => (
              <div key={event.id ?? idx} className="relative h-screen">
                <img
                  src={event.thumbnail_url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/90" />

                <div
                  className="absolute inset-0 flex sm:items-end items-center sm:pb-24 pb-10 cursor-pointer"
                  onClick={() => {
                    // prevent navigation if user was dragging the slider
                    if (!isDragging) navigate(`/events/${event.id}`);
                  }}
                >
                  <div className="container mx-auto px-4 xl:px-16 w-full flex flex-col lg:flex-row justify-between items-center">
                    <div className="flex flex-col">
                      <div className="text-sm lg:text-lg text-[#5DC9DE] mb-2">
                        {dateFormat(event.event_date_time)} - {event.location}
                      </div>

                      <h1
                        className="uppercase font-extrabold text-3xl lg:text-6xl text-white hover:text-[#5DC9DE]"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDragging) navigate(`/events/${event.id}`);
                        }}
                      >
                        {event.name}
                      </h1>

                      <div className="flex gap-3 mt-4">
                        {timers[idx] && (
                          <>
                            <CountdownBox
                              value={timers[idx].days}
                              label="Days"
                            />
                            <CountdownBox
                              value={timers[idx].hours}
                              label="Hours"
                            />
                            <CountdownBox
                              value={timers[idx].minutes}
                              label="Minutes"
                            />
                            <CountdownBox
                              value={timers[idx].seconds}
                              label="Seconds"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 lg:mt-0">
                      <div className="flex flex-col items-center bg-gradient-to-b from-[#FFFFFF26] to-[#FFFFFF00] w-[285px] h-[118px] rounded-xl py-5 backdrop-blur-[12px]">
                        <span className="text-[18px] uppercase text-white">
                          Chance to Win
                        </span>
                        <span className="text-[#2DDA89] text-[40px] font-extrabold">
                          ₹{event.reward_amount ?? 0}
                        </span>

                        <div
                          className={`mt-4 px-6 py-2 rounded-3xl text-black text-lg font-semibold ${
                            isRegistrationOpenByDateTime(event)
                              ? "bg-[#5DC9DE] cursor-pointer hover:bg-[#4db8cc]"
                              : "bg-gray-500 cursor-not-allowed opacity-70"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSpot(event, event.id);
                          }}
                          title={
                            isRegistrationNotStartedYetByDateTime(event)
                              ? "Registration has not started yet"
                              : !isRegistrationOpenByDateTime(event)
                                ? "Registration has closed"
                                : undefined
                          }
                        >
                          Book Your Spot Now
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          {isModalOpen && <RegistrationModal />}
        </div>
      )}
    </>
  );
}

/* ===== CountdownBox subcomponent ===== */
function CountdownBox({ value, label }) {
  return (
    <div className="border rounded-md p-3 bg-gradient-to-b from-[#FFFFFF33] to-[#FFFFFF00] w-[80px] sm:w-[92px]">
      <div className="text-white text-2xl lg:text-4xl text-center">{value}</div>
      <div className="text-[#9BA3B7] text-center text-sm lg:text-base">
        {label}
      </div>
    </div>
  );
}
