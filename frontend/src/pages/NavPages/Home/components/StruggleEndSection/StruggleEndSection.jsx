import React, { useEffect, useState } from "react";
import axiosApi from "../../../../../conf/axios.js";
import Music2 from "../../../../../../public/assets/images/music2.png";
import Elipse from "../../../../../../public/assets/images/elipse.png";
import CustomVideoPlayer from "../../../../../components/CustomVideoPlayer/CustomVideoPlayer";

const StruggleEndsSection = () => {
  const [aboutUs, setAboutUs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const response = await axiosApi.get("/about-us");
        setAboutUs(response.data.data);
        console.log("about us data", response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  if (loading) return <div className="bg-black text-white py-16 px-4">Loading...</div>;

  return (
    aboutUs && (
      <div className="bg-black relative text-white py-16">
        <img src={Music2} className="absolute z-20 right-0 w-[300px]" alt="" />
        <img
          src={Elipse}
          className="absolute z-10 right-0 -top-[300px] w-[400px]"
          alt=""
        />
        <div className="container px-4 md:px-16 lg:px-16">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-5xl font-bold mb-2 justify-center text-center md:text-left md:ml-[10%]">
              YOUR <span className="text-[#5DC9DE]">STRUGGLE ENDS HERE!</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative group">
              <CustomVideoPlayer
                src={aboutUs.about_us_video}
                className="w-full h-[300px] sm:h-[400px] rounded-xl aspect-[4/3]"
                showPlayButtonOverlay={true}
                pauseOtherVideos={true}
              />
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 leading-relaxed text-lg">
                {aboutUs.about_us_desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default StruggleEndsSection;
