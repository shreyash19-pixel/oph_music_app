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
  const [timers, setTimers] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [professions, setProfessions] = useState([]);
  const [isEventInFuture, setIsEventInFuture] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  // fetch single event by id: /events/:id
  const fetchSingleEvent = async () => {
    setLoading(true);
    try {
      const response = await axiosApi.get(`/event/${id}`);
      console.log(response.data);
      // Normalize response to the shape used by the component.
      // API might return event object at response.data or response.data.data
      const raw = response?.data?.data ?? response?.data ?? null;
      if (!raw) {
        throw new Error("Invalid event response");
      }

      // Map API fields to the keys the component expects.
      const mapped = {
        id: raw.id ?? raw.event_id ?? id,
        name: raw.name ?? raw.title ?? raw.EventName ?? "Untitled Event",
        event_date_time:
          raw.event_date_time ??
          raw.dateTime ??
          raw.eventDateTime ??
          raw.event_date ??
          null,
        location: raw.location ?? raw.venue ?? "",
        short_desc:
          raw.short_desc ?? raw.description ?? raw.desc ?? raw.summary ?? "",
        long_desc:
          raw.long_desc ??
          raw.long_desciption ??
          raw.long_description ??
          raw.description_long ??
          "",
        hashtags: Array.isArray(raw.hashtags)
          ? raw.hashtags
          : typeof raw.hashtags === "string"
            ? // split string hashtags by spaces or commas
              raw.hashtags.split(/[\s,]+/).filter(Boolean)
            : [],
        fees:
          raw.fees ?? raw.registrationFee_normal ?? raw.registration_fee ?? 0,
        registrationStart:
          raw.registrationStart ??
          raw.regn_start ??
          raw.registration_start ??
          raw.regnStart ??
          null,
        registrationEnd:
          raw.registrationEnd ??
          raw.regn_end ??
          raw.registration_end ??
          raw.regnEnd ??
          null,
        regn_start:
          raw.registrationStart ??
          raw.regn_start ??
          raw.registration_start ??
          raw.regnStart ??
          null,
        regn_end:
          raw.registrationEnd ??
          raw.regn_end ??
          raw.registration_end ??
          raw.regnEnd ??
          null,
        reward_amount: raw.reward_amount ?? raw.winnerReward ?? raw.reward ?? 0,
        thumbnail_url: raw.thumbnail_url ?? raw.image ?? raw.thumbnail ?? "",
        total_bookings:
          raw.total_bookings ?? raw.participants ?? raw.booking_count ?? 0,
        status: raw.status ?? raw.state ?? "upcoming",
        payment_plan_id: raw.payment_plan_id ?? null,
      };

      setSingleEvent(mapped);
    } catch (err) {
      console.error("Failed to fetch event:", err);
      toast.error("Failed to load event. Try refreshing.", {
        position: "top-right",
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await axiosApi.get("/professions");
      const data = response?.data?.data ?? response?.data ?? [];
      setProfessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch professions:", err);
    }
  };

  useEffect(() => {
    fetchSingleEvent();
    fetchProfessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  console.log(JSON.stringify(singleEvent), "Event");

  // Timer update
  useEffect(() => {
    if (!singleEvent?.event_date_time) return;

    let mounted = true;
    const updateTimers = () => {
      if (!mounted) return;
      const now = new Date();
      const eventDate = new Date(singleEvent.event_date_time);
      const timeDiff = eventDate - now;
      if (timeDiff <= 0) {
        setTimers({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEventInFuture(false);
        return;
      }
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);
      setTimers({ days, hours, minutes, seconds });
      setIsEventInFuture(eventDate > now);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [singleEvent]);

  // Utility validators
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const dateFormat = (date) => {
    if (!date) return "-";
    const eventDate = new Date(date);
    return eventDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Registration Modal Component
  const RegistrationModal = () => {
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      instagram_handle: "",
      phone: "",
      profession_id: professions?.[0]?.id ?? "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      // set default profession_id once professions load
      if (professions && professions.length && !formData.profession_id) {
        setFormData((f) => ({ ...f, profession_id: professions[0].id }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [professions]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isRegistrationOpen = () => {
      // determine if registration period is open
      try {
        const start = singleEvent?.regn_start
          ? new Date(singleEvent.regn_start)
          : null;
        const end = singleEvent?.regn_end
          ? new Date(singleEvent.regn_end)
          : null;
        const now = new Date();
        if (start && end) return now >= start && now <= end;
        // fallback: if status is "upcoming" and event is in future allow
        return singleEvent?.status === "upcoming" && isEventInFuture;
      } catch {
        return false;
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      // validations
      if (!instagramRegex.test(formData.instagram_handle)) {
        toast.error(
          "Invalid Instagram URL! Please enter a valid profile link.",
          {
            position: "top-right",
            autoClose: 4000,
            theme: "dark",
            transition: Bounce,
          },
        );
        return;
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

      if (!isRegistrationOpen()) {
        toast.error("Registration is closed for this event.", {
          position: "top-right",
          theme: "dark",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          ...formData,
          profession_id: formData.profession_id,
        };

        const response = await axiosApi.post(`/events/bookings/${id}`, payload);

        if (response?.status === 201 || response?.status === 200) {
          toast.success("Registration Successful", {
            position: "top-right",
            autoClose: 4000,
            theme: "dark",
            transition: Bounce,
          });
          setIsModalOpen(false);

          navigate("/payment", {
            state: {
              amount: singleEvent.fees,
              returnPath: `/events/${singleEvent.id}`,
              heading: "Event Registration Fee",
              planIds: [singleEvent.payment_plan_id].filter(Boolean),
              event_id: id,
              from: "Event Registration",
              bookingId:
                response?.data?.id ?? response?.data?.bookingId ?? null,
            },
          });
        } else {
          toast.error("Something went wrong with registration.", {
            position: "top-right",
            theme: "dark",
          });
        }
      } catch (err) {
        console.error("Booking error:", err);
        toast.error("Something went wrong", {
          position: "top-right",
          theme: "dark",
        });
      } finally {
        setIsSubmitting(false);
      }
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
                <option value="+91">+91</option>
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
                value={formData.profession_id}
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

            {isRegistrationOpen() ? (
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
                className="w-full bg-cyan-400 text-black font-medium py-2 px-4 rounded opacity-50 cursor-not-allowed"
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
                <div className="bg-white/5 backdrop-blur-none border p-4 rounded-lg text-center">
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
                  ₹{singleEvent.reward_amount ?? "0"}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-4">
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
