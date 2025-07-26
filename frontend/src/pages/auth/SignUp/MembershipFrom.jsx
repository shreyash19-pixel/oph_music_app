import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useArtist } from "../API/ArtistContext";
import "../../../../src/index.css"; // Import CSS for styling
import axiosApi from "../../../conf/axios";
import { toast } from "react-hot-toast";
import MusicBg from "../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../public/assets/images/elipse2.png";
import ProfileFormHeader from "./components/ProfileFormHeader";

const MembershipForm = ({ id }) => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  const { artist, headers, ophid } = useArtist();

  const navigate = useNavigate();

  useEffect(() => {

    const fetchMembershipForm = async () => {
      try {


        // const artist_id = JSON.parse(localStorage.getItem("userData")).artist.id;
        // console.log("Artist ID:", JSON.parse(localStorage.getItem("userData")).artist.id);
        const response = await axiosApi.get(`auth/membership?ophid=${ophid}`, { headers });
        console.log("API Response:", response.data);
        if (typeof response.data === "string") {
          setContent(response.data);
        } else {
          setError("Received an unexpected response. Please check the API endpoint.");
        }
      } catch (error) {
        console.error("Error fetching membership form:", error);
        setError("Error fetching membership form. Please try again later.");
      }
    };
    if (ophid) {
      fetchMembershipForm();
    }
  }, [ophid]);

  return (

    <>
      <div className="relative bg-cover bg-center">


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
          <ProfileFormHeader title="Membership Form" />
          <div className="min-h-[calc(100vh-800px)] mt-20  text-white p-6 flex flex-col items-center mx-auto">

          </div>
          <div className="w-100 overflow-x-hidden">
            <h2 className="form-title">Membership Form</h2>
            {error ? (
              <p className="error-message">{error}</p>
            ) : content ? (
              // Option 1: Render using iframe to prevent styling conflicts
              <iframe
                title="Membership Form"
                srcDoc={content}
                className="membership-form-iframe"
              />
            ) : (
              <p className="loading-message">Loading form...</p>
            )}

            <button
              onClick={() => {
                toast.success("Documentation details updated successfully");
                navigate(`/auth/profile-status?ophid=${ophid}`);
              }}
              className="w-full my-4 bg-cyan-400 text-black rounded py-3 font-medium hover:bg-cyan-300 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

    </>);
};

export default MembershipForm;
