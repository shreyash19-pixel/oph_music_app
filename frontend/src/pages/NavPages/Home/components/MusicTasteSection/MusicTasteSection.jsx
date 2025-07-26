import React from "react";

const MusicTasteSection = () => {
  return (
    <div className="bg-black pt-16 xl:px-16 lg:px-10 px-6 mb-16">
      <div className="container mx-auto">
        <div
          className="relative overflow-hidden bg-gradient-to-r from-pink-500/20 to-blue-900/40 min-h-[500px]"
          style={{
            backgroundImage: "url('/assets/images/musicTasteSectionBg.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            // backgroundBlendMode: "burn",
          }}
          aria-label="Best platform for independent artists 2025"
        >
          <div className="grid md:grid-cols-2 items-center">
            <div className="absolute -z-30 inset-0 bg-gradient-to-r from-pink-500/30 to-blue-500/30" />
            {/* Left Image Section */}
            <div className=""></div>

            {/* Right Content Section */}
            <div className="p-8 md:p-12">
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-8 lg:mb-4 leading-tight">
                YOUR MUSIC IS YOUR TASTE,
                <span className="text-cyan-600 ">
                  WE ARE JUST TASTE ENHANCER
                </span>
              </h2>

              <p className="text-gray-300 mb-8 max-w-md">
                Lorem ipsum has been the industry&apos;s standard dummy text ever
                since the 1500s, when an unknown printer took. Standard dummy
                text ever since the 1500s when an unknown printer took.
              </p>

              <button onClick={() =>{window.location.href=import.meta.env.VITE_PORTAL_URL+'/auth/signup'}} className="bg-cyan-400 z-50 hover:cursor-pointer text-black font-semibold py-3 px-8 rounded-full hover:font-bold transition delay-300">
                Book Your Spot - Sign Up Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicTasteSection;
