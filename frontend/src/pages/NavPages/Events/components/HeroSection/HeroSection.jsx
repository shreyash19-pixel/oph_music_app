import { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react"; // Import icons
import { Bounce, toast, ToastContainer } from "react-toastify";
import axiosApi from "../../../../../conf/axios";

const instagramRegex =
  /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/;

function HeroSection({ professions }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(null);
  // const [professions,setProfessions] = useState([])
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/; // Ensures exactly 10 digits
    return phoneRegex.test(phone);
  };
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

  const upcomingEvents = useSelector((state) => state.event.upcomingEvents);
  const [timers, setTimers] = useState([]);
  const loading = useSelector((state) => state.event.loading);

  const handleBookSpot = (id) => {
    debugger;
    setIsModalOpen(true);
    setId(id);
  };

  useEffect(() => {
    // if(isModalOpen){
    //   setIsDragging(true);
    // }
    // else{
    //   setIsDragging(false);
    // }
    if (upcomingEvents && upcomingEvents.length > 0) {
      const updateTimers = () => {
        const newTimers = upcomingEvents.map((event) => {
          const now = new Date();
          const eventDate = new Date(event.event_date_time);
          const timeDiff = eventDate - now;

          if (timeDiff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
          }

          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);

          return { days, hours, minutes, seconds };
        });

        setTimers(newTimers);
      };

      if (!isModalOpen) {
        updateTimers();
        const interval = setInterval(updateTimers, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [upcomingEvents, isModalOpen]);

  const dateFormat = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // <-- Change made here
    });
  };
  

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

      setIsSubmitting(true); // Set submitting state to true

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
          console.log(response.data[0].id);

          // Find the current event to get the fee
          const currentEvent = upcomingEvents.find((event) => event.id === id);
          console.log(currentEvent,"currentevent");
          
          // Navigate to payment page with required data
          navigate("/payment", {
            state: {
              amount: currentEvent.fees, // Event registration fee
              returnPath: `/events/online-music-events`, // Redirect to event page after payment
              event_id: currentEvent.id,
              heading: "Event Registration Fee",
              eventId: id,
              planIds: [currentEvent.payment_plan_id], 
              bookingId: response.data.id, 
              event_booking_id: response.data[0].id
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
      } catch (error) {
        console.error("Error during registration:", error);
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
    // useEffect(()=>{
    //   fetchProfessions()
    // },[])

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
                onClick={() => {
                  setIsModalOpen(false);
                }}
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

            <button
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
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
      {!loading && (
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            className="absolute top-1/2 left-5 z-50 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full hidden sm:block"
            onClick={() => sliderRef.current.slickPrev()}
          >
            <ArrowLeft size={24} />
          </button>

          <button
            className="absolute top-1/2 right-5 z-50 transform -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full hidden sm:block"
            onClick={() => sliderRef.current.slickNext()}
          >
            <ArrowRight size={24} />
          </button>

          <Slider ref={sliderRef} {...settings}>
            {upcomingEvents &&
              upcomingEvents.map((event, index) => (
                <div className="relative h-screen" key={index}>
                  {/* Image */}
                  <img
                    src={event.thumbnail_url}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/90" />

                  {/* Content */}
                  <div
                    className="absolute inset-0 flex sm:items-end items-center sm:pb-24 pb-0 h"
                    onClick={() => {
                      if (!isDragging) navigate(`/events/${event.id}`);
                    }}
                  >
                    <div className="container md:px-6 mx-auto w-full px-4 xl:px-16 md:pb-0 pb-10 flex flex-col lg:flex-row gap-14 sm:gap-0 justify-between items-center">
                      <div className="flex flex-col ">
                        <div className="text-[14px] lg:text-[20px] sm:px-0 pe-7 text-[#5DC9DE]">
                          {dateFormat(event.event_date_time)} - {event.location}
                        </div>
                        <div className="uppercase font-extrabold text-[28px] lg:text-[55px] text-white">
                          <h1
                            className="hover:text-[#5DC9DE] hover:cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents the parent onClick
                              if (!isDragging) navigate(`/events/${event.id}`);
                            }}
                          >
                            {event.name}
                          </h1>
                        </div>
                        <div className="flex gap-2 sm:gap-5">
                          {timers[index] && (
                            <>
                              <CountdownBox
                                value={timers[index].days}
                                label="Days"
                              />
                              <CountdownBox
                                value={timers[index].hours}
                                label="Hours"
                              />
                              <CountdownBox
                                value={timers[index].minutes}
                                label="Minutes"
                              />
                              <CountdownBox
                                value={timers[index].seconds}
                                label="Seconds"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Prize Box */}
                      <div className="mt-5">
                        <div className="flex flex-col items-center bg-gradient-to-b from-[#FFFFFF26] to-[#FFFFFF00] w-[285px] h-[118.62px] rounded-xl py-5 border-1 backdrop-blur-[12px]">
                          <span className="text-[21px] uppercase text-white">
                            Chance to Win
                          </span>
                          <span className="text-[#2DDA89] text-[48px] font-extrabold">
                            ₹{event.reward_amount ? event.reward_amount : "0"}
                          </span>
                          <div
                            className="my-8 px-6 z-40 py-3 hover:font-bold transition delay-300 bg-[#5DC9DE] rounded-3xl cursor-pointer text-black text-lg font-semibold drop-shadow-[0_0_20px_white]"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents navigation when clicking inside the button
                              handleBookSpot(event.id); // Call the booking function
                            }}
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

const CountdownBox = ({ value, label }) => (
  <div className="border-[.5px] rounded-md p-3 bg-gradient-to-b flex flex-col from-[#FFFFFF33] to-[#FFFFFF00] sm:w-[92px] w-[80px] mt-6">
    <span className="lg:text-[40px] text-white">{value}</span>
    <span
      className="lg:text-[19px] text-[#9BA3B7]
"
    >
      {label}
    </span>
  </div>
);

export default HeroSection;
