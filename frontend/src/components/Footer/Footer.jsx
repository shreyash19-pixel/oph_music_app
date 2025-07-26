import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { useState, useEffect } from "react";

function Footer() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="w-full h-auto lg:px-16 px-2 flex flex-col bg-[url('/assets/images/contact/footer.png')] bg-cover bg-center relative">
      <div className="flex h-full flex-col justify-between w-full container mx-auto gap-6 sm:gap-0 sm:mt-12 mt-4">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row w-full items-center lg:items-start">
          <div className="xl:text-[55px] text-[30px] md:text-[40px] text-center lg:text-left w-full lg:w-1/2 uppercase font-bold leading-[3rem] sm:leading-[4rem]">
            Your Music
            <br />
            Your Rights
            <br />
            <span className="text-[#5DC9DE]">Your Stage</span>
          </div>
          <div className="w-full flex justify-center lg:justify-end pt-3 sm:pt-12">
            <button
              onClick={() => {
                window.location.href = import.meta.env.VITE_PORTAL_URL + "/auth/signup";
              }}
              className="bg-primary h-14 text-black font-semibold py-3 px-6 sm:px-8 rounded-full hover:font-bold transition"
            >
              ONLY FOR FIRST 1000 ARTISTS
            </button>
          </div>
        </div>

        {/* Middle Navigation Section */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-center">
          <div className="text-md text-center lg:text-left text-[#9BA3B7] w-full lg:w-1/3 px-8 lg:px-0 py-3">
          OPH COMMUNITY: India's First Decentralized Music Platform. A Best Platform for Independent Artists 2025
          </div>
          <ul className="hidden lg:flex space-x-12 justify-end text-white w-1/2">
            <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
            <li><Link to="/events/online-music-events" className="hover:text-gray-300">Events</Link></li>
            <li><a href="/find-your-collaborator" className="hover:text-gray-300">Artists</a></li>
            <li><a href="/leaderboard/top-music-networking-platform-for-creators/" className="hover:text-gray-300">Leaderboard</a></li>
            <li><a href="/resources/music-learning-education" className="hover:text-gray-300">Resources</a></li>
            <li><Link to="/contact" className="hover:text-gray-300">Contact</Link></li>
          </ul>
        </div>

        {/* Divider */}
        <div className="container w-full h-[1px] opacity-30 mx-auto bg-white sm:my-8 my-2"></div>

        {/* Bottom Policies + Socials */}
        <div className="w-full flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-4 sm:gap-0 sm:my-8 text-center sm:text-left">
          <ul className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-white text-sm">
            <li><Link className="hover:text-gray-300" to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link className="hover:text-gray-300" to="/terms-and-conditions">Terms & Conditions</Link></li>
            <li><Link className="hover:text-gray-300" to="/refund-policy">Refund Policy</Link></li>
            <li><Link className="hover:text-gray-300" to="/cancellation-policy">Cancellation Policy</Link></li>
            <li><Link className="hover:text-gray-300" to="/disclaimer">Disclaimer</Link></li>
          </ul>

          <div className="flex justify-center sm:justify-end gap-3 pt-2 sm:pt-0">
            <a href="/facebook" className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <FaFacebook size={24} />
            </a>
            <a href="/instagram" className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <AiFillInstagram size={24} />
            </a>
            <a href="/linkedin" className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <FaLinkedin size={24} />
            </a>
            <a href="/twitter" className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <BsTwitterX size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
