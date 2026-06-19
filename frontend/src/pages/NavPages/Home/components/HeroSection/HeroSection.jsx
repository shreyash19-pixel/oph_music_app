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
    <div className="w-full relative sm:pt-0 py-10 md:py-20 flex items-center justify-center sm:justify-start bg-cover bg-center px-6 sm:px-8 md:px-16 min-h-screen">
      {/* Backdrop should be here */}
      <span className="absolute inset-0 z-0">
        <img
          src={semiColonIc}
          className="w-full h-full object-cover"
          alt="Semicolon Icon"
        />
      </span>

      {/* Content container */}
      <div className="container pt-5 mx-auto mt-16 sm:mt-24 mb-16 sm:mb-24 relative z-10">
        <div className="max-w-2xl w-full text-center sm:text-left pt-4 md:pt-0">
          <p className="text-sm sm:text-base md:text-lg opacity-75 text-[#9BA3B7] mb-2 tracking-wide uppercase">
            We support independent artists.
          </p>

          <div className="relative">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl text-white leading-tight font-black mb-6 relative z-10 tracking-tight">
              YOUR RIGHTS <br />
              YOUR MUSIC <br />
              YOUR STAGES
            </h1>
          </div>

          <p className="text-sm sm:text-base md:text-lg opacity-90 text-[#9BA3B7] mb-8 max-w-lg mx-auto sm:mx-0">
            We are a community that supports independent artists to grow,
            collaborate, and turn their music dreams into reality.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 relative z-10 w-full max-w-md mx-auto sm:mx-0">
            <button
              onClick={() => navigate("/find-your-collaborator")}
              className="bg-[#5DC9DE] hover:bg-[#4db8cc] hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base text-black font-bold rounded-full text-center shadow-lg"
            >
              Grab the Opportunity Now
            </button>
            <button
              onClick={() => {
                window.location.href = "/auth/signup";
              }}
              className="bg-[#22252A] hover:bg-[#2c3037] border border-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base text-white font-bold rounded-full text-center shadow-lg"
            >
              Sign Up
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
