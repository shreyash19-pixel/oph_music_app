import React, { useState } from "react";
import axiosApi from "../../../../conf/axios";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { TiTick } from "react-icons/ti";
import { Link } from "react-router-dom";
import ContactBG from "../../../../../public/assets/images/music_bg.png";
import Glow from "../../../../../public/assets/images/contact-elipise.png";

// Same rules as Events HeroSection / IndividualEvent registration (username or profile URL)
const instagramUsernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._]{0,29})$/;
const instagramUrlRegex =
  /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(?:\?[^#\s]*)?$/;

function HeroSection() {
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    instagram_handle: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/; // Ensures exactly 10 digits
    return phoneRegex.test(phone);
  };

  const closeModal = () => {
    setModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      toast.error("Invalid Email Address!", {
        position: "top-right",
        theme: "dark",
      });
      return;
    }

    const igTrimmed = formData.instagram_handle?.trim() ?? "";
    const usernameCandidate =
      igTrimmed.startsWith("@") && !instagramUrlRegex.test(igTrimmed)
        ? igTrimmed.slice(1).trim()
        : igTrimmed;
    const isValidInstagram =
      instagramUrlRegex.test(igTrimmed) ||
      instagramUsernameRegex.test(usernameCandidate);

    if (!isValidInstagram) {
      toast.error(
        "Invalid Instagram! Please enter a valid Instagram username or profile link.",
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
        },
      );
      return;
    }

    if (!isValidPhoneNumber(formData.phone)) {
      toast.error("Invalid Phone Number! Must be 10 digits.", {
        position: "top-right",
        theme: "dark",
      });
      return;
    }

    const payload = {
      ...formData,
      instagram_handle: instagramUrlRegex.test(igTrimmed)
        ? igTrimmed
        : usernameCandidate,
    };

    try {
      const response = await axiosApi.post("/contact_us", payload);
      if (response.status === 201) {
        setModal(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          instagram_handle: "",
          description: "",
        });
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("OOPS! Something went wrong", {
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
  };

  return (
    <div
      className="w-full min-h-screen pt-36 pb-12 md:pt-44 md:pb-20 flex items-center justify-center bg-cover bg-center relative box-border"
      style={{ backgroundImage: `url(${ContactBG})` }}
    >
      <img
        src={Glow}
        className="absolute left-0 top-0 max-w-xs md:max-w-md pointer-events-none opacity-40 z-0"
        alt=""
      />

      <div className="flex flex-col lg:flex-row items-stretch justify-between w-full h-full px-4 sm:px-8 md:px-16 max-w-7xl mx-auto z-10 gap-10">
        {/* Left Side Content Column */}
        <div className="flex flex-col w-full lg:w-1/2 text-left justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[36px] text-white uppercase font-black leading-tight tracking-wide">
            Fill out this form to get updates, detailed info, and{" "}
            <span className="text-[#5DC9DE]">
              stay connected with the OPH Community
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#9BA3B7] mt-4 font-medium leading-relaxed">
            Give us a call, and if the call doesn&apos;t connect, please fill
            out the form. We will get in touch with you within 24 hours.
          </p>

          <div className="w-full h-[1px] opacity-20 bg-white my-6"></div>

          <div className="flex flex-col text-sm sm:text-base md:text-lg">
            <span className="text-white font-bold uppercase tracking-wider text-xs text-gray-400 mb-2">
              OPH Contact Details:
            </span>
            <div className="flex flex-col gap-2">
              <a
                href="tel:+918976592947"
                className="text-[#2DDA89] hover:underline text-lg font-black tracking-wider w-max"
              >
                +91 8976592947
              </a>
              <a
                href="tel:+918433792947"
                className="text-[#2DDA89] hover:underline text-lg font-black tracking-wider w-max"
              >
                +91 8433792947
              </a>
            </div>
          </div>
        </div>

        {/* Right Side Form Column */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl flex flex-col gap-4 bg-black/50 backdrop-blur-md p-5 sm:p-8 rounded-2xl border border-white/10 shadow-2xl"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-full bg-gray-900/90 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-full bg-gray-900/90 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="abc@gmail.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="contact"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left"
              >
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contact"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-full bg-gray-900/90 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="1234567890"
                required
              />
            </div>

            <div>
              <label
                htmlFor="insta"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left"
              >
                Instagram Handle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="insta"
                name="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-full bg-gray-900/90 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="username or profile link"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left"
              >
                Description
              </label>
              <textarea
                rows={3}
                id="description"
                name="description"
                maxLength={1000}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                placeholder="Your description here..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="border border-[#5DC9DE] text-black bg-[#5DC9DE] py-3 rounded-full w-full font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/10 hover:bg-transparent hover:text-[#5DC9DE] transition-all duration-200"
              >
                Submit Details
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer className="z-[100000]" />

      {/* Responsive Success Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#2C3141] w-full max-w-xl flex justify-center flex-col items-center rounded-2xl p-6 sm:p-10 text-white text-center border border-white/5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/success.svg"
              className="w-16 h-16 mb-4"
              alt="tick"
            />
            <p className="mt-2 text-sm sm:text-base md:text-lg font-medium px-2 sm:px-6 leading-relaxed">
              Thank you for submitting your details! You’ll receive regular
              updates and detailed information directly to your email. Stay
              connected with the OPH Community!
            </p>
            <Link to={"/"} className="w-full sm:w-auto">
              <button className="w-full sm:px-14 mt-8 py-3 bg-[#5DC9DE] text-[#181B24] font-bold uppercase rounded-full text-xs sm:text-sm tracking-wide shadow-md hover:bg-opacity-90 transition-all">
                Back To Home
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroSection;
