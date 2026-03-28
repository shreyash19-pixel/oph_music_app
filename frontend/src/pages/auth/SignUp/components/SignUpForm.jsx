import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { signupUser } from "../../API/profile";
import { FaPauseCircle } from "react-icons/fa";
import axiosApi from "../../../../conf/axios";
import PlayBtn from "../../../../../public/assets/images/playButton.png";
import Struggle from "../../../../../public/assets/images/struggle.png";
import Elipse from "../../../../../public/assets/images/elipse.png";
import Elipse2 from "../../../../../public/assets/images/elipse2.png";
import { useArtist } from "../../API/ArtistContext";
import CustomVideoPlayer from "../../../../components/CustomVideoPlayer/CustomVideoPlayer";
const SignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [videoModal, setVideoModal] = useState(false);

  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const fetchPageMedia = async () => {
    try {
      const response = await axiosApi.get("/page-media?page_name=signup");
      if (response.data.success && response.data.data) {
        setVideo(response.data.data.video_url);
        setThumbnail(response.data.data.thumbnail_url);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const { login } = useArtist();
  const [formData, setFormData] = useState({
    name: "",
    stageName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    artistType: "",
    step: "/auth/payment",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    if (location.state?.status === "cancelled") {
      toast.error(
        "Payment is mandatory. Please complete the payment to continue."
      );
      navigate("/auth/login", { replace: true, state: {} });
    } else if (location.state?.status === "success") {
      toast.success("Payment successful.");
      navigate("/dashboard", { replace: true, state: {} });
    }
  }, [location.state, navigate]);
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.stageName.trim())
      newErrors.stageName = "Stage name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (!/^\d{10}$/.test(formData.contactNumber))
      newErrors.contactNumber = "Must be 10 digits";

    if (!formData.artistType.trim())
      newErrors.artistType = "Artist type is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(formData.password)
    )
      newErrors.password =
        "Include uppercase, lowercase, number, and special character";

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getFieldError = (name, value, formData) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        break;
      case "stageName":
        if (!value.trim()) return "Stage name is required";
        break;
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        break;
      case "contactNumber":
        if (!value) return "Contact number is required";
        if (!/^\d{10}$/.test(value)) return "Must be 10 digits";
        break;
      case "artistType":
        if (!value) return "Artist type is required";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(value))
          return "Include uppercase, lowercase, number, and special character";
        break;
      case "confirmPassword":
        if (value !== formData.password) return "Passwords do not match";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };

      // Validate this field
      const error = getFieldError(name, value, updatedFormData);

      // Also revalidate confirmPassword if password is changing
      const confirmPasswordError =
        name === "password"
          ? getFieldError(
              "confirmPassword",
              updatedFormData.confirmPassword,
              updatedFormData
            )
          : errors.confirmPassword;

      // Set updated errors
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
        ...(name === "password" && { confirmPassword: confirmPasswordError }),
      }));

      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    try {
      const response = await signupUser(formData);
      console.log(response);

      if (response.success) {
        // Hydrate auth context immediately (avoid refresh-required state)
        login(response.token);
        navigate("/auth/payment", {
          state: {
            from: "Registration",
            user_type: formData.artistType,
            backPath : "/auth/signup"
          },
          replace: true,
        });
      }
    } catch (e) {
      console.log(e);

      toast.error(e.response.data.message);
    }
  };

  useEffect(() => {
    fetchPageMedia();
  }, []);

  return (
    <>
      <div
        className="min-h-screen pt-40 pb-20 xl:px-16 lg:px-10 px-6   bg-cover bg-center relative
                  "
      >
        <div className="w-full container mx-auto py-8 relative z-10 flex flex-col lg:flex-row  gap-8">
          {/* Form Section */}
          <div
            className="lg:w-1/2 bg-contain bg-no-repeat "
            style={{ backgroundImage: `url(${Struggle})` }}
          >
            <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
              SIGN UP
            </h1>
            <p className="text-gray-400 mb-8 text-sm">
              OPH Community, along with all artists and fans, warmly welcomes
              you. Once you sign up, you’ll become a valued member of our music
              family.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Full Name:<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Martin"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Stage Name:<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="stageName"
                  value={formData.stageName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Enter Stage Name"
                />
                {errors.stageName && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.stageName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Email:<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="abc@gmail.com"
                />
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Contact Number:<span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select className="px-4 py-2 rounded-l-full bg-gray-800/50 border border-r-0 border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400">
                    <option>IND +91</option>
                  </select>
                  <input
                    type="tel"
                    max={10}
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-r-full bg-gray-800/50 border border-l-0 border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    placeholder="0000 0000 00"
                  />
                </div>
                {errors.contactNumber && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.contactNumber}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Artist Type :<span className="text-red-500">*</span>
                </label>
                <select
                  name="artistType"
                  id="artistType"
                  value={formData.artistType}
                  onChange={handleChange}
                  className="w-full px-4  py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="">Select Artist Type</option>
                  <option value="Independent artist">Independent artist</option>
                  <option value="Special artist">Special artist</option>
                </select>
                {errors.artistType && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.artistType}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-10"
                    placeholder="••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M6.58 6.58l10.84 10.84M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Confirm Password:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-10"
                    placeholder="••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M6.58 6.58l10.84 10.84M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-medium rounded-full transition-colors duration-200"
              >
                Create Account
              </button>
            </form>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/2  mt-5 lg:mt-0 relative">
            <div className="aspect-[3/4] lg:aspect-[5/6] overflow-hidden rounded-lg relative">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Sign Up"
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              {video && (
                <button
                  onClick={() => setVideoModal(true)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent focus:outline-none z-10"
                >
                  <img src={PlayBtn} alt="Play" className="w-32 h-32" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="container w-full h-[1px] mx-auto bg-[#959494] my-10 opacity-30 relative"></div>

        {/* Video Modal */}
        {videoModal && (
          <div
            className="fixed inset-0 -top-[5%] bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={() => setVideoModal(false)}
          >
            <div
              className="relative w-[90%] md:w-[60%] lg:w-[50%] max-h-[80%] bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setVideoModal(false)}
                className="absolute top-4 right-4 text-white text-2xl font-bold z-50"
              >
                ✕
              </button>

              {/* Video */}
              <CustomVideoPlayer
                id="signup-video-player"
                src={video}
                className="w-full h-auto max-h-[70vh] rounded-lg"
                autoPlay
                pauseOtherVideos={true}
              />
            </div>
          </div>
        )}

        <img src={Elipse} className="absolute h-[600px] right-0" alt="" />
        <img
          src={Elipse2}
          className="absolute h-[600px] top-[500px] left-0"
          alt=""
        />
        <img
          src={Elipse2}
          className="absolute h-[600px] top-[1000px] left-0"
          alt=""
        />
        <img src={Elipse} className="absolute h-[600px] right-0" alt="" />
        <img
          src={Elipse2}
          className="absolute h-[600px] bottom-[1500px] left-0"
          alt=""
        />

        <h1 className="text-4xl text-center text-white font-bold">
          <span className="text-[#5DC9DE]">ABOUT:</span> WHAT WE PROVIDE TO
          ASSIST
        </h1>
        <h2 className="text-center mt-4 text-[#9BA3B7]">
          NOW - NO WORRIES ON ANYTHING JUST MAKE YOUR MUSIC PEACEFULLY - LEAVE
          THE REST TO INDIA'S ONLY REAL MUSIC COMMUNITY.
        </h2>
        <div className="pt-16">
          <h2 className="uppercase text-2xl font-semibold">OPH COMMUNITY</h2>
          <h2 className="uppercase text-lg font-semibold mt-3 text-[#5DC9DE]">
            One stop solution for artist journey to success.
          </h2>
          <ol className="list-none mt-4 space-y-2 ">
            <h3 className="before:content-['-']  drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Fully Technology Driven Music Community Platform
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Personal Portal
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Live Data
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Live Ranking
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              {" "}
              100% Ownership of Artist
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Network & Connection Platform
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              {" "}
              Event Direct Access
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Pre - Booking Platform for Music Releases
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Key Performance Indicator (KPI) Installed in Platform
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Leader Board Function
            </h3>
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Learning & Resources Platform
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              No Middleman - Direct Access with Collaborators
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              100% Artist Community Platform
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              0 Monthly & Yearly Charges
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              {" "}
              Reward Winning Function Every Month
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              No Limit on Withdrawals
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              {" "}
              Call & Chat Support
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Every Status Update on Artist Personal Portal
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              Lifetime Membership
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              100% Revenue from both Audio & Video will Go to the Artist
            </h3>{" "}
            <h3 className="before:content-['-'] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] before:mr-2">
              One Stop Solution for Every Music Artists Journey
            </h3>
          </ol>
          <div className="relative">
            <h2 className="mt-8 text-[#5DC9DE] text-2xl font-bold">
              + Everything Included Mentioned below (Free of Cost by OPH
              COMMUNITY) Only for our Talenteh3Indian Music Artist
            </h2>
          </div>
          <h2 className="mt-8 text-2xl font-semibold">
            1. Marketing Functions:
          </h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>100% Google Ads marketing by the OPH Community</h3>
            <h3>100% Facebook Ads marketing by the OPH Community</h3>
            <h3>
              All creatives and artist branding will be managed by the OPH
              Community
            </h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>

          <h2 className="mt-8 text-2xl font-semibold">2. Creative Funhion</h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>Teaser</h3>
            <h3>Song Reel</h3>
            <h3>Poster</h3>
            <h3>Distribution Poster</h3>
            <h3>Thumbnail</h3>
            <h3>Artist Story</h3>
          </ul>
          <p className="text-gray-400 mt-4">
            This will be{" "}
            <span className="text-[#5DC9DE]">created by the OPH Community</span>
          </p>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-8 text-2xl font-semibold">
            3. Distribution Audio Functions:
          </h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>
              Distribution across all music platforms (including Indian
              platforms)
            </h3>
            <h3>Artist profile linking on Instagram</h3>
            <h3>
              Creation of new profiles on Apple Music and Spotify (if the artist
              doesn't already have one)
            </h3>
            <h3>Caller tunes will be made available</h3>
            <h3>Image design will be handled by the OPH Community</h3>
            <h3>
              All data will be accessible through the Artist Portal, managed by
              the OPH Community.
            </h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-8 text-2xl font-semibold">4. Ownership:</h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>
              Full ownership will remain with the artist, with no interference.
            </h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-8 text-2xl font-semibold">5. TV Release:</h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>
              The artist's music video will have the opportunity to be released
              on TV platforms across various channels.
            </h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-8 text-2xl font-semibold">6. Revenue Model:</h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>
              100% of the revenue from both audio and video will go to the
              artist.
            </h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-8 text-2xl font-semibold">
            7. Withdrawal Threshold:
          </h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>
              No limit or threshold on the withdrawal amount. Artists can
              withdraw any amount, even as low as ₹100.
            </h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-8 text-2xl font-semibold">8. Exposure:</h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>
              The artist's EPK and profile will be displayed on the official OPH
              Community website, providing connections and networking
              opportunities.
            </h3>
          </ul>
          <h2 className="mt-8 text-2xl font-semibold">9. Support:</h2>
          <ul className="list-disc px-5 mt-4 text-gray-400  space-y-2">
            <h3>Call Support</h3>
            <h3>Chat Support</h3>
            <h3>Ticket Raising System</h3>
            <h3>Access To a Personal Port</h3>
          </ul>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <p className="underline text-[#5DC9DE] font-bold text-2xl ">
            First Time Ever in India – Only for Limited Thousand Artist
          </p>
          <p className="mt-6">
            One Time Artist Documentation Registration fees –{" "}
            <span className="text-[#5DC9DE]">2,999 for lifetime Access</span>
          </p>
          <p className="mt-2">
            Only Per Song Registration fees{" "}
            <span className="text-[#5DC9DE]">– 799</span>
          </p>
          <h1 className="text-center mt-16 font-semibold px-4 lg:px-48 text-xl lg:text-xl uppercase">
            Now – No hassle for Anything just Make your Music Peacefully –<br />{" "}
            Rest live on India's Only Real Music Community
          </h1>
          <div className="container w-full h-[1px] mx-auto bg-[#666666] my-10 opacity-30 relative"></div>
          <h2 className="mt-20 text-center text-xl font-bold">OPH COMMUNITY</h2>
          <p className="text-gray-400 text-center mt-4">
            One stop solution for artist journey to success.
          </p>
          {/* <p className="text-center px-2 py-3 rounded-full bg-cyan-300 text-black">
              Lets Start
             </p> */}
          <div className="w-full flex justify-center">
            <button
              className="px-8 py-3 rounded-full text-black mt-5 bg-[#5DC9DE]"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} //scroll to top
            >
              Lets Start
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpForm;
