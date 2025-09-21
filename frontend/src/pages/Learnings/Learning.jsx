import React, { useEffect, useState, useRef } from "react";
import axiosApi from "../../conf/axios";
import getToken from "../../utils/getToken"; // Import your token retrieval function

const Learnings = () => {
  const [learnings, setLearnings] = useState([]);
  const [modalVideo, setModalVideo] = useState(null);
  const modalRef = useRef(null);

  const fetchLearnings = async () => {
    try {
      const token = localStorage.getItem('token') // Retrieve the token
      const response = await axiosApi.get("/allLearning", {
        headers: {
          Authorization: `Bearer ${token}`, // Set the Authorization header
        },
      });
      if (response.status === 200) {
        setLearnings(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLearnings();
  }, []);

  const openModal = (videoUrl) => {
    setModalVideo(videoUrl);
  };

  const closeModal = () => {
    setModalVideo(null);
  };

  return (
    <div className="px-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300">Learnings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {learnings.length > 0 &&
          learnings.map((learning) => (
            <div key={learning.id} className="rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={learning.thumbnail_url}
                  alt="Thumbnail"
                  className="w-full h-60 object-cover"
                />
                <button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2"
                  onClick={() => openModal(learning.video_url)}
                >
                  <img className="w-24" src="/assets/images/play_button.png" alt="Play" />
                </button>
              </div>
              <div className="text-center p-4">
                <h3 className="text-lg font-medium text-white">{learning.title}</h3>
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
            <video
              ref={modalRef}
              src={modalVideo}
              controls
              autoPlay
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Learnings;