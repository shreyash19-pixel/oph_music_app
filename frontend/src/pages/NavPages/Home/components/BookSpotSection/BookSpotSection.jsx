import React from "react";

const BookSpot = () => {
  return (
    <div
      className="relative  pt-10 pb-10  flex text-white"
      style={{
        backgroundImage: `linear-gradient(rgb(0 0 0 / 91%) 0%, rgb(150 150 150 / 51%) 30%, rgb(137 137 137 / 0%) 100%), url(/assets/images/bookSpotBg.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-label="Networking Collaboration Platform"
    >
      {/* Background Image */}
      <div className="absolute inset-0 " aria-hidden="true" />

      {/* Content Overlay */}
      <div className="relative z-20 text-center px-4 container mx-auto">
        <h1 className="text-3xl lg:text-5xl md:text-6xl font-bold mb-4">
          <span className="text-[#5DC9DE] block mb-2">
            INDIA'S REAL MUSIC COMMUNITY
          </span>
          <span className="block">ARTISTS-FIRST MUSIC PLATFORM</span>
        </h1>

        <p className="text-gray-300 text-base lg:text-lg md:text-xl mb-8 max-w-3xl mx-auto">
          The most trusted music community and open-source networking
          collaboration platform, dedicated to nurturing talent, transforming
          creators into celebrated artists, and turning fans into lifelong
          supporters. Trust us and begin your journey—join today!
        </p>

        <button
          onClick={() => {
            window.location.href =
              import.meta.env.VITE_PORTAL_URL + "/auth/signup";
          }}
          className="bg-[#5DC9DE] hover:font-bold transition delay-300 text-black font-semibold py-3 px-8 rounded-full "
        >
          BECOME A MEMBER
        </button>
      </div>

      {/* Optional: Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 z-0" />
    </div>
  );
};

export default BookSpot;
