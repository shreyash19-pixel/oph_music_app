import React from "react";
import semiColonIc from "../../../../../../public/assets/images/semiColonIc.png";
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
    <div className="w-full  sm:pt-0 py-5 md:py-10 lg:py-20 flex items-center justify-start bg-cover bg-center relative ps-8">
      <div className="container pt-5 mx-auto mt-24 mb-24  relative">
        <span className="absolute z-0 top-[15%] left-[3%]">
          <img src={semiColonIc} className="h-16" alt="Semicolon Icon" />
        </span>
        <div className="max-w-2xl px-4 md:px-0 pt-4 md:pt-0">
          <p className="text-lg opacity-75 text-[#9BA3B7] mb-1 z-1">
            Now you don’t need to change your career in music
          </p>
          <div className="relative">
            {/* Background Text */}
            <h1 className="absolute inset-0 text-[#6F4FA0] z-0 top-1 left-1 text-4xl lg:text-7xl leading-tight font-bold">
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
          OPH Community is a technology-driven platform that empowers artists with direct access to networking and collaboration. A trusted community platform that provides everything an artist needs to grow - all by simply joining the online music community. This opportunity is exclusively available to the first 1,000 artists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start relative z-10 pointer-events-auto">
            {/* Login Button */}
            <button
              onClick={() => navigate("/find-your-collaborator")}
              className="bg-[#5DC9DE] hover:font-bold transition delay-300 w-full lg:w-[300px] m-1 text-sm lg:text-base h-[40px] lg:h-[50px] text-black font-semibold py-3 px-8 rounded-full justify-center items-center"
            >
              FIND TO COLLABORATE
            </button>
            <button
              onClick={() => {
                window.location.href =
                 "https://ophcommunity.org/auth/signup";
              }}
              className="bg-[#5DC9DE] hover:font-bold transition delay-300 w-full lg:w-[300px] m-1 text-sm lg:text-base h-[40px] lg:h-[50px] text-black font-semibold py-3 px-8 rounded-full justify-center items-center"
            >
              START MY JOURNEY
            </button>
            {/* Sign Up Button
  <button
    onClick={() => {
      window.open(import.meta.env.VITE_PORTAL_URL + "/auth/signup", "_blank", "noopener,noreferrer");
    }}
    className="bg-gray-800 w-full lg:w-[250px] sm:ml-5 sm:mt-0 mt-4 lg:mt-0 hover:font-bold transition delay-300 text-white font-semibold py-3 px-6 h-[40px] lg:h-[50px] rounded-full justify-center items-center"
  >
    SIGN UP
  </button> */}
          </div>
        </div>
      </div>
      <span className="absolute bottom-[-75px] z-30 right-0">
        <img src={starAbsItem} alt="Star Absolute Item" />
      </span>
    </div>
  );
}

export default HeroSection;
