import React from "react";
import semiColonIc from "../../../../../../../frontend/src/assets/images/HeroImg.svg";
import starAbsItem from "/assets/images/starAbsItem.png";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Elipse from "../../../../../../public/assets/images/elipse.png";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);
  return (
    <div className="w-full relative sm:pt-0 py-5 md:py-10 lg:py-20 flex items-center justify-start bg-cover bg-center ps-8 min-h-screen">
      {/* Backdrop should be here */}
      <span className="absolute inset-0 z-0">
        <img
          src={semiColonIc}
          className="w-full h-full object-cover"
          alt="Semicolon Icon"
        />
      </span>

      {/* Content container */}
      <div className="container pt-5 mx-auto mt-24 mb-24 relative z-10">
        <div className="max-w-2xl px-4 md:px-0 pt-4 md:pt-0">
          <p className="text-lg opacity-75 text-[#9BA3B7] mb-1">
            Now you don’t need to change your career in music
          </p>

          <div className="relative">
            {/* Background Text */}
            <h1 className="absolute inset-0 text-[#6F4FA0] top-1 left-1 text-4xl lg:text-7xl leading-tight font-bold">
              YOUR MUSIC <br />
              YOUR RIGHTS <br />
              YOUR STAGES
            </h1>

            {/* Foreground Text */}
            <h1 className="text-4xl lg:text-7xl text-white leading-tight font-bold mb-6 relative z-10">
              YOUR MUSIC <br />
              YOUR RIGHTS <br />
              YOUR STAGES
            </h1>
          </div>

          <p className="text-sm lg:text-lg opacity-90 text-[#9BA3B7] mb-8">
            OPH Community is a technology-driven platform that empowers artists
            with direct access to networking and collaboration. A trusted
            community platform that provides everything an artist needs to grow
            – all by simply joining the online music community. This opportunity
            is exclusively available to the first 1,000 artists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start relative z-10">
            <button
              onClick={() => navigate("/find-your-collaborator")}
              className="bg-[#5DC9DE] hover:font-bold transition delay-300 w-full lg:w-[300px] m-1 text-sm lg:text-base h-[40px] lg:h-[50px] text-black font-semibold py-3 px-8 rounded-full"
            >
              FIND TO COLLABORATE
            </button>
            <button
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
              className="bg-[#5DC9DE] hover:font-bold transition delay-300 w-full lg:w-[300px] m-1 text-sm lg:text-base h-[40px] lg:h-[50px] text-black font-semibold py-3 px-8 rounded-full"
            >
              START MY JOURNEY
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Star */}
      <span className="absolute bottom-[-75px] z-30 right-0">
        <img src={starAbsItem} alt="Star Absolute Item" />
      </span>
    </div>
  );
}

export default HeroSection;
