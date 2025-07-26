import React from "react";
import { useSelector } from "react-redux";
import Elipse from "../../../../../../public/assets/images/elipse.png";

const IndustryStats = () => {
  const stats = useSelector((state) => state.websiteConfig.website_configs);

  return (
    stats && (
      <div className="bg-black relative px-4 lg:px-16 xl:px-16 text-white py-24 w-full">
        {/* <img src={Elipse}  alt="" />
         */}
         <svg className="absolute h-[800px] -top-[400px] right-0" width="595" height="1088" viewBox="0 0 595 1088" fill="none" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.3" filter="url(#filter0_f_85_3832)">
<circle cx="544" cy="544" r="204" fill="#6F4FA0"/>
</g>
<defs>
<filter id="filter0_f_85_3832" x="0" y="0" width="1088" height="1088" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="170" result="effect1_foregroundBlur_85_3832"/>
</filter>
</defs>
</svg>

        <div className="container mx-auto">
          <div className="">
            <h2 className="text-3xl lg:text-6xl font-bold mb-8">
            SUPPORTING ARTISTS
              <br />
              GROWTH  <span className="text-[#5DC9DE]">WITH THESE NUMBERS.</span>
          </h2>

          <div className="lg:flex justify-between">
            <div>
              <p className="text-gray-400 mb-12 max-w-md">
              Artists across all over India trusts OPH Community to build their music careers without compromising their artistic freedom. We’ve empowered thousands of artists to go independent — and hustle in their music journey.
              </p>
            </div>

          </div>
        </div>
        <div className="lg:grid flex flex-col items-center lg:grid-cols-3 gap-6">
              {stats.map((stat, index) =>
                stat.id <= 3 ? (
                  <div
                    key={index}
                    className={
                      index === 1
                        ? "bg-transparent w-[80%] lg:w-auto rounded-xl p-6 transition-colors bg-gradient-to-b from-cyan-800/50 to-white/5 border-b-2 border-l border-r border-cyan-700  shadow-lg"
                        : "bg-transparent w-[80%] lg:w-auto rounded-xl p-6 transition-colors bg-gradient-to-b from-white/20 to-white/5 border-t border-l border-r border-white/20 border-b-transparent shadow-lg"
                    }
                  >
                    <h3
                      className={`text-3xl lg:text-4xl font-bold mb-3 ${
                        index === 1 ? "text-[#5DC9DE]" : "text-white"
                      }`}
                    >
                      {stat.value}
                    </h3>
                    {/* <p className="text-gray-400 text-sm xl:text-base">{stat.param}</p> */}
                    <p className="text-gray-400 text-sm xl:text-base">
  {stat.param === "num_of_artist_connections"
    ? "Total number of artist connections"
    : stat.param === "num_of_songs"
    ? "Total number of songs"
    : "Total number of audience reach"}
</p>

                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
    )
  );
};

export default IndustryStats;
