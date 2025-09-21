import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { useArtist } from "../../API/ArtistContext";
import ProfileFormHeader from "../components/ProfileFormHeader";
import Review from "../../../../../public/assets/images/review.png";
import MusicBg from "../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../public/assets/images/elipse2.png";
import axiosApi from "../../../../conf/axios"; // Assuming axiosApi is set up to point to your API

const ProfileStatus = () => {
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [artistData, setArtistData] = useState(null); // To store artist data from the API
  const location = useLocation();
  const status = location.state?.status || null; // prefer router state
  const ophidFromState = location.state?.ophid;
  const id = localStorage.getItem("artist_id");
  // const { artist } = useArtist(); // Not needed here
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const effectiveId = ophidFromState || id;
        if (!effectiveId) {
          setLoading(false);
          return;
        }
        const url = `/auth/get-artist-detail/${effectiveId}`;
        console.log("GET:", url);
        const artistResponse = await axiosApi.get(url);
        console.log("Response:", {
          status: artistResponse?.status,
          data: artistResponse?.data,
          headers: artistResponse?.headers,
        });
        const artist = artistResponse;
        console.log(artist,"artist");
        
        setArtistData(artist);
        setLoading(false);

        if (artist.data?.onboarding_status === 0 || artist.data?.onboarding_status === 5) {
          navigate("/auth/create-profile/personal-details", {
            state: { rejectReason: artist.data?.reject_reason || "No reason provided." },
          });
        } else if (artist.data?.onboarding_status === 1) {
          navigate("/auth/create-profile/professional-details", {
            state: { rejectReason: artist.data?.reject_reason || "No reason provided." },
          });
        } else if (artist.data?.onboarding_status === 2) {
          navigate("/auth/create-profile/documentation-details", {
            state: { rejectReason: artist.data?.reject_reason || "No reason provided." },
          });
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    run();
  }, [id, navigate, ophidFromState]);
  // Show a loading message while the request is in progress
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error message if the API request failed
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen relative bg-black text-white ">
      <img
        src={MusicBg}
        className="absolute top-[30%] sm:-top-[10%]"
        alt="Music Background"
      />
      <img
        src={Elipse}
        className="absolute -top-[10%] w-[500px]"
        alt="Elipse"
      />
      <ProfileFormHeader title="PROFILE STATUS" />
      <div className="min-h-[calc(100vh-70px)] bg-opacity-70 z-10 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center flex justify-center items-center flex-col space-y-6">
          {/* Icon with animation */}
          <img src={Review} className="w-[100px]" alt="Review Icon" />

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-wider">
            {status === "approved"
              ? "YOUR PROFILE IS SUCCESSFULLY CREATED"
              : status === "rejected"
              ? `YOUR PROFILE IS REJECTED. Reason: ${
                  artistData?.reject_reason || "No reason provided."
                }`
              : "YOUR PROFILE IS UNDER REVIEW"}
          </h1>

          {/* Back to Home Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token")
              navigate("/auth/login")
            }}
            className="mt-8 z-[1000] px-16 py-3 bg-[#5DC9DE] hover:font-bold hover:cursor-pointer text-black rounded-full font-medium  transition-colors duration-200"
          >
            {status === "success"
              ? "Explore Artist Portal"
              : status === "rejected"
              ? "Contact Admin"
              : "Back To Home"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatus;