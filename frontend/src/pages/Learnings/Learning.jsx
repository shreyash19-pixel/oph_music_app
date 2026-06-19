import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import CustomVideoPlayer from "../../components/CustomVideoPlayer/CustomVideoPlayer";
import NavbarRight from "../../components/Navbar/NavbarRight";
import NavbarLeft from "../../components/Navbar/NavbarLeft";

const Learnings = () => {
  const [learnings, setLearnings] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [modalVideo, setModalVideo] = useState(null);
  const { headers, ophid } = useArtist();

  const fetchLearnings = async () => {
    if (!headers?.Authorization) {
      setLoadError("Sign in to view learning resources.");
      setLearnings([]);
      return;
    }
    try {
      setLoadError(null);
      const response = await axiosApi.get("/learning/visible-for-artist", {
        headers,
      });
      if (response.status === 200) {
        setLearnings(response.data.data || []);
      }
    } catch (err) {
      console.log(err);
      setLoadError("Could not load learnings.");
      setLearnings([]);
    }
  };

  useEffect(() => {
    fetchLearnings();
  }, [ophid, headers?.Authorization]);

  const openModal = (videoUrl) => {
    setModalVideo(videoUrl);
  };

  const closeModal = () => {
    setModalVideo(null);
  };

  return (
    <div className="px-[16px] lg:px-8">
      <div className="flex items-center justify-between lg:justify-end py-4 block lg:hidden">
        <NavbarLeft />
        <NavbarRight />
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mt-8 mb-12 text-cyan-300 font-extrabold drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          LEARNINGS
        </h2>
        <div className="hidden lg:block">
          <NavbarRight />
        </div>
      </div>
      {loadError && (
        <p className="text-amber-300/90 text-sm mb-4">{loadError}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {learnings.length > 0 &&
          learnings.map((learning) => (
            <div key={learning.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={learning.thumbnail_url}
                  alt="Thumbnail"
                  className="w-full h-60 object-cover rounded-[30px]"
                />
                <button
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={() => openModal(learning.video_url)}
                >
                  <img
                    className="w-24"
                    src="/assets/images/play_button.png"
                    alt="Play"
                  />
                </button>
              </div>
              <div className="text-left md:text-center p-2 md:p-4">
                <h3 className="text-[16px] md:text-lg font-medium text-white">
                  {learning.title}
                </h3>
              </div>
            </div>
          ))}
      </div>

      {modalVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative w-[90%] md:w-[60%] h-auto bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold z-50"
              onClick={closeModal}
            >
              ✕
            </button>
            <CustomVideoPlayer
              src={modalVideo}
              autoPlay={true}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Learnings;
