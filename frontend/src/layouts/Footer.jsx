import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaSpotify, FaApple } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();

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
              onClick={() => navigate("/auth/signup")}
              className="bg-primary h-14 text-black font-semibold py-3 px-6 sm:px-8 rounded-full hover:font-bold transition"
            >
              Book Your Spot - Sign Up Now
            </button>
          </div>
        </div>

        {/* Middle Navigation Section */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0">
          <div className="text-md text-center lg:text-left text-[#9BA3B7] w-full lg:w-1/3 px-4 lg:px-0">
            OPH COMMUNITY: India&apos;s First Decentralized Music Platform. A
            Best Platform for Independent Artists 2025
          </div>

          {/* Navigation Links - Visible on Mobile & Desktop */}
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-end items-center gap-3 sm:gap-6 lg:gap-12 text-white w-full lg:w-1/2">
            <li>
              <Link to="/" className="hover:text-gray-300 transition">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/events/online-music-events"
                className="hover:text-gray-300 transition"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                to="/find-your-collaborator"
                className="hover:text-gray-300 transition"
              >
                Artists
              </Link>
            </li>
            <li>
              <Link
                to="/leaderboard/top-music-networking-platform-for-creators/"
                className="hover:text-gray-300 transition"
              >
                Leaderboard
              </Link>
            </li>
            <li>
              <Link
                to="/resources/music-learning-education"
                className="hover:text-gray-300 transition"
              >
                Resources
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gray-300 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>
       <div className="bg-red-500 text-white text-center py-4">
  TEST NAVIGATION BLOCK
</div>
        {/* Divider */}
        <div className="container w-full h-[1px] opacity-30 mx-auto bg-white sm:my-8 my-2"></div>

        {/* Bottom Policies + Socials */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-6 sm:my-8 text-center lg:text-left">
          <ul className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-white text-sm">
            <li>
              <Link
                className="hover:text-gray-300 transition"
                to="/privacy-policy"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-gray-300 transition"
                to="/terms-and-conditions"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-gray-300 transition"
                to="/refund-policy"
              >
                Refund Policy
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-gray-300 transition"
                to="/cancellation-policy"
              >
                Cancellation Policy
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-gray-300 transition"
                to="/disclaimer"
              >
                Disclaimer
              </Link>
            </li>
          </ul>

          <div className="flex justify-center gap-3">
            <a
              href="/facebook"
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <FaFacebook size={24} />
            </a>

            <a
              href="/instagram"
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <AiFillInstagram size={24} />
            </a>

            <a
              href="/linkedin"
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <FaLinkedin size={24} />
            </a>

            <a
              href="/spotify"
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <FaSpotify size={24} />
            </a>

            <a
              href="/apple-music"
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <FaApple size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;