import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { BsTwitterX } from "react-icons/bs";

const Footer = ({ userData }) => {
  return (
    <div
      className="w-full h-auto px-4 sm:px-8 lg:px-16 flex flex-col bg-[url('/assets/images/footer.png')] bg-cover bg-center relative
      before:content-[''] before:absolute before:inset-0 before:block
      before:bg-gradient-to-r before:from-[#0C0C11] before:to-[#252730] before:opacity-75 before:z-5"
    >
      <div className="flex flex-col justify-between w-full z-10 container mx-auto mt-12 gap-8">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left w-full gap-8">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase w-full lg:w-1/2">
            Your Music
            <br />
            Your Rights
            <br />
            <span className="text-[#5DC9DE]">Your Stage</span>
          </div>

          <div className="w-full lg:w-auto flex justify-center lg:justify-end">
            {userData ? (
              <Link to="/">
                <button className="bg-primary text-black font-semibold py-2 px-6 rounded-full hover:bg-cyan-300 transition-transform hover:scale-105 duration-300 w-full sm:w-auto">
                  Book Your Spot
                </button>
              </Link>
            ) : (
              <button
                onClick={() => {
                  window.location.href =
                    import.meta.env.VITE_PORTAL_URL + "/auth/signup";
                }}
                className="bg-primary text-black font-semibold py-2 px-6 rounded-full hover:bg-cyan-300 transition-transform hover:scale-105 duration-300 w-full sm:w-auto"
              >
                Book Your Spot - Sign Up Now
              </button>
            )}
          </div>
        </div>

        {/* Middle Info and Navigation */}
        <div className="flex flex-col lg:flex-row justify-between items-center w-full text-center lg:text-left gap-6">
          <div className="text-sm sm:text-base text-[#9BA3B7] w-full lg:w-1/3 px-2">
            Lorem Ipsum has been the industry&apos;s standard dummy text ever
            since the 1500s, when an unknown printer took.
          </div>

          <ul className="flex flex-wrap justify-center lg:justify-end gap-4 text-white font-semibold w-full lg:w-2/3">
            {[
              "Home",
              "Events",
              "Artists",
              "Leaderboard",
              "Resources",
              "Contact",
            ].map((text, index) => (
              <li
                key={index}
                className="hover:text-gray-300 cursor-pointer"
                onClick={() => {
                  let url = import.meta.env.VITE_WEBSITE_URL;
                  if (text.toLowerCase() !== "home") url += text.toLowerCase();
                  window.location.href = url;
                }}
              >
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white opacity-30"></div>

        {/* Bottom Section: Policies and Social Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <ul className="flex flex-wrap justify-center md:justify-start gap-4 text-white text-sm w-full md:w-2/3 px-2">
            {[
              { name: "Privacy Policy", path: "/privacy-policy" },
              { name: "Terms and Conditions", path: "/terms-and-conditions" },
              { name: "Refund Policy", path: "/refund-policy" },
              { name: "Cancellation Policy", path: "/cancellation-policy" },
              { name: "Disclaimer", path: "/disclaimer" },
            ].map((item, index) => (
              <li key={index}>
                <Link
                  to={`${import.meta.env.VITE_WEBSITE_URL}${item.path}`}
                  className="hover:text-gray-300"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex gap-3 justify-center md:justify-end w-full md:w-1/3">
            <a
              href="/facebook"
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
            >
              <FaFacebook size={22} />
            </a>
            <a
              href="/instagram"
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
            >
              <AiFillInstagram size={22} />
            </a>
            <a
              href="/linkedin"
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
            >
              <FaLinkedin size={22} />
            </a>
            <a
              href="/twitter"
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
            >
              <BsTwitterX size={22} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
