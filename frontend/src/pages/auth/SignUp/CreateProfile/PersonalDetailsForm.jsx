import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getPersonalDetails, updatePersonalDetails } from "../../API/profile";
import ProfileFormHeader from "../components/ProfileFormHeader";
import Loading from "../../../../components/Loading";
import { useArtist } from "../../API/ArtistContext";
import { fetchVideoForScreen } from "../../../../utils/fetchVideo";
import axiosApi from "../../../../conf/axios";
import PlayBtn from "../../../../../public/assets/images/playButton.png";
import { AiOutlineUser } from "react-icons/ai";
import MusicBg from "../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../public/assets/images/elipse2.png";
import { useLocation } from "react-router-dom";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const { headers, ophid } = useArtist();
  // const [isPlaying, setIsPlaying] = useState(false); // Track video play state
  // const videoRef = useRef(null);
  // const [video, setVideo] = useState(null);
  const [rejectReason, setRejectReason] = useState(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const inputRef = useRef(null);
  // const fetchVideo = async () => {
  //   try {
  //     const response = await axiosApi.get(
  //       "artist-website-configs?param=signup_video"
  //     );
  //     setVideo(response.data.data[0]);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  // const handlePlay = () => setIsPlaying(true);
  // const handlePause = () => setIsPlaying(false);
  // const togglePlayPause = () => {
  //   if (videoRef.current) {
  //     if (isPlaying) {
  //       videoRef.current.pause();
  //     } else {
  //       videoRef.current.play();
  //     }
  //   }
  // };
  // useEffect(() => {
  //   fetchVideo();
  // }, []);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    legalName: "",
    stageName: "",
    contactNumber: "",
    location: "",
    email: "",
    profileImage: null,
  });

  const [checkSimilarData, setcheckSimilarData] = useState({
    legalName: "",
    stageName: "",
    contactNumber: "",
    location: "",
    email: "",
    profileImage: null,
  });

  useEffect(() => {
    if(ophid)
    {
      fetchPersonalDetails();
    }
  }, [ophid]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const [videoUrl, setVideoUrl] = useState(null);

  // useEffect(() => {
  //   // window.location.reload();

  //   const loadVideo = async () => {
  //     const url = await fetchVideoForScreen("personal_video");

  //     setVideoUrl(url);
  //   };
  //   loadVideo();
  // }, []);

  const fetchPersonalDetails = async () => {
    try {
      if (!headers || !headers.Authorization) {
        console.warn("Headers not ready yet");
        return;
      }

      const response = await getPersonalDetails(headers, ophid);

      if (response.success) {
        setFormData({
          profileImage: response.data.profile_pic || null,
          legalName: response.data.full_name || "",
          stageName: response.data.stage_name || "",
          contactNumber:
            response.data.contact_num.split("+91")[1] ||
            response.data.contact_num,
          email: response.data.email || "",
          location: response.data.location || "",
          step_status: response.data.step_status || "",
          current_step: response.data.current_step || ""
        });

        setcheckSimilarData({
          profileImage: response.data.profile_pic || null,
          legalName: response.data.full_name || "",
          stageName: response.data.stage_name || "",
          contactNumber:
            response.data.contact_num.split("+91")[1] ||
            response.data.contact_num,
          email: response.data.email || "",
          location: response.data.location || "",
          step_status: response.data.step_status || "",
          current_step: response.data.current_step || ""
        });

        if (response.data.reject_reason != null) {
          setRejectReason(response.data.reject_reason);
        }
      } else {
        throw new Error(response.message || "Failed to fetch personal details");
      }
    } catch (error) {
      console.error("Error fetching personal details:", error);
      toast.error(error.message || "Failed to fetch personal details");

      // If it's an authentication error, redirect to login
      if (
        error.message.includes("token") ||
        error.message.includes("Authentication")
      ) {
        navigate("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: {
            file: file,
            preview: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const checkSimilarity = () => {
    let isSimilarity = false;

    if(formData.legalName === checkSimilarData.legalName &&
      formData.stageName === checkSimilarData.stageName &&
      formData.contactNumber === checkSimilarData.contactNumber &&
      formData.location === checkSimilarData.location &&  
      formData.email === checkSimilarData.email &&
      formData.profileImage === checkSimilarData.profileImage 
      )
      {
        toast.error("Please check rejection reason and make update");
        isSimilarity = true;
      }
      return isSimilarity;
      
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    // Validation checks
    if (!formData.legalName) {
      toast.error("Please enter your legal name");
      setLoading(false);
      return;
    }
    if (!formData.stageName) {
      toast.error("Please enter your stage name");
      setLoading(false);

      return;
    }
    if (!formData.contactNumber) {
      toast.error("Please enter your phone number");
      setLoading(false);

      return;
    }
    if (!formData.email) {
      toast.error("Please enter your email");
      setLoading(false);

      return;
    }
    if (!formData.location) {
      toast.error("Please enter your location");
      setLoading(false);

      return;
    }
    if (!formData.profileImage) {
      toast.error("Please upload a profile image");
      setLoading(false);
      return;
    }

    if(formData.step_status === "rejected")
    {
      const result = checkSimilarity()
      if(result)
      {
        setLoading(false);
        return
      }
    }

    try {
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("ophid", ophid);
      formDataToSend.append("legal_name", formData.legalName);
      formDataToSend.append("stage_name", formData.stageName);
      formDataToSend.append("contact_num", formData.contactNumber);

      formDataToSend.append("location", formData.location);
      formDataToSend.append("email", formData.email);
      let stepPath;

      if (formData.step_status === "under review") {

        stepPath = "/auth/create-profile/professional-details";
      } else if (formData.step_status === "rejected") {
        stepPath = `/auth/membership-form`;
      } else {
        stepPath = "/auth/create-profile/professional-details" ;
      }
      formDataToSend.append(
        "step",
        stepPath
      );

      // Append profile image if it exists
      if (formData.profileImage?.file) {
        formDataToSend.append("profile_image", formData.profileImage.file);
      }

      const debugData = {};
      formDataToSend.forEach((value, key) => {
        debugData[key] = value;
      });

      const response = await updatePersonalDetails(formDataToSend, headers);

      if (response.success) {
        toast.success("Personal details updated successfully");
        const path = `${response.step}`;
        navigate(path);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update personal details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          profileImage: {
            file: file,
            preview: e.target.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative bg-cover bg-center">
      {loading && <Loading />}

      <img
        src={MusicBg}
        className="absolute top-[50%] -z-10 inset-0 md:top-[20%]"
        alt=""
        srcSet=""
      />
      <img
        src={Elipse}
        className="absolute top-[50%] -z-10 inset-0 w-[30%] md:top-[20%]"
        alt=""
        srcSet=""
      />

      <div className="min-h-screen z-10  bg-opacity-70 text-white p-6">
        <ProfileFormHeader title="PERSONAL DETAILS" />

        <div className="min-h-[calc(100vh-70px)] mt-20 bg-opacity-70 text-white p-6 flex flex-col items-center">
          {/* <div className="relative flex justify-center">
            {video && (
              <video
                ref={videoRef}
                src={video.value}
                onPlay={handlePlay}
                onPause={handlePause}
                onClick={togglePlayPause}
                className="w-[800px] h-[50vh]  object-cover "
                controls={false} // Disable default controls
              />
            )}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent focus:outline-none"
              >
                <img src={PlayBtn} alt="Play" className="w-32 h-32" />
              </button>
            )}
          </div> */}
          <div className="w-full max-w-md space-y-8">
            {/* Profile Image Upload */}
            <h2 className="text-cyan-400 uppercase text-2xl mt-4 font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] text-center">
              Personal Details
            </h2>
            {rejectReason && (
              <div className="text-red-500">
                <strong>Reject Reason:</strong> {rejectReason}
              </div>
            )}
            <div className="flex flex-col items-center space-y-4">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer"
                onClick={() => inputRef.current?.click()}
              >
                {formData.profileImage ? (
                  <img
                    src={
                      typeof formData.profileImage === "string"
                        ? formData.profileImage
                        : formData.profileImage.preview
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <AiOutlineUser className="text-cyan-400 text-6xl" />
                  </div>
                )}
              </div>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
                id="profile-image"
                accept="image/*"
                required
                ref={inputRef}
              />
              <label
                htmlFor="profile-image"
                className="text-white text-sm cursor-pointer hover:underline"
              >
                Upload Profile Image
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Legal Name */}
              <div className="space-y-2">
                {/* <label htmlFor="">
                  Legal Name: <span className="text-red-600">*</span>
                </label> */}
                <input
                  type="text"
                  name="legalName"
                  placeholder="Legal Name"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                />
              </div>

              {/* Stage Name */}
              <div>
                <input
                  type="text"
                  name="stageName"
                  placeholder="Stage Name"
                  value={formData.stageName}
                  onChange={handleInputChange}
                  className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)]  focus:border-[#5DC9DE] outline-none  transition duration-200"
                />
              </div>

              {/* Contact Number */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* TODO: Add a phone icon */}
                  <span className="text-gray-400 ml-2">+91</span>
                </div>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="000000000"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)]  focus:border-[#5DC9DE] outline-none  transition duration-200"
                />
              </div>

              {/* Location */}
              <div>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)]  focus:border-[#5DC9DE] outline-none  transition duration-200"
                >
                  <option value="">Select Your State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="abc@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)]  focus:border-[#5DC9DE] outline-none  transition duration-200"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full z-[1000] bg-[#5DC9DE] text-black  py-3 font-medium hover:font-semibold rounded-full transition-colors duration-200"
              >
                Continue →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
