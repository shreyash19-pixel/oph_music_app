import { FaPlay, FaPause } from "react-icons/fa";
import { formatDateTime } from "../../../../utils/date";
import React, { useEffect, useState } from "react";
import RegistrationModal from "../../../../components/registration/Registration";
import { useDispatch, useSelector } from "react-redux";
import { changeSelectedEvent } from "../../../../slice/events";
import { useLocation, useNavigate } from "react-router-dom";
import getToken from "../../../../utils/getToken";
import axiosApi from "../../../../conf/axios";
import ReleaseBlur from "../../../../../public/assets/images/release_blur.png";

const EventsNewReleases = ({ secondEvent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audio, setAudio] = useState(null); // State for audio object
  const [playingSongId, setPlayingSongId] = useState(null); // State for currently playing song ID
  const [visibleSongs, setVisibleSongs] = useState(5); // State for the number of visible songs
  const [showAllSongs, setShowAllSongs] = useState(false); // State to toggle between showing more and fewer songs
  const eventID = useSelector((state) => state.event.selectedEvent);
  const location = useLocation();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const newReleases = useSelector((state) => state.newRelease.newRelease);

  const songsArray = Object.values(newReleases).sort(
    (a, b) => b.songId - a.songId
  );

  const handlePlayPause = (song) => {
    if (audio && playingSongId === song.songId) {
      // Toggle play/pause for the same song
      if (!audio.paused) {
        audio.pause();
        setPlayingSongId(null);
      } else {
        audio.play();
        setPlayingSongId(song.songId);
      }
    } else {
      // New song selected
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.audioUrl);
      newAudio.play();
      setAudio(newAudio);
      setPlayingSongId(song.songId);

      // Handle when the song ends
      newAudio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = async (data) => {
    if (!data) return; // Ensure data is defined
    console.log(data);

    // Dispatch the selected event data
    dispatch(changeSelectedEvent({ data: data }));

    // Navigate to the payment page
    await navigate("/dashboard/payment", {
      state: {
        amount: data.fees,
        planIds: [data.payment_plan_id],
        returnPath: "/dashboard",
        heading: "Complete Event Registration",
      },
    });
  };

  const createEventReg = async () => {
    const token = getToken();
    if (location.state?.status === "success") {
      console.log("Success");
      console.log("Event ID", eventID);
      const payment_id = location.state.paymentData.newPaymentIds[0];
      console.log("Payment ID", payment_id);
      const response = await axiosApi.post(
        `/events/${eventID}/artist-booking`,
        {
          payment_id: payment_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status == 200) {
        console.log("Booking Successful");
      }
    }
  };

  useEffect(() => {
    createEventReg();
  }, [location.state]);

  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const toggleShowAllSongs = () => {
    setShowAllSongs(!showAllSongs);
    setVisibleSongs(showAllSongs ? 5 : newReleases.length);
  };

  return (
    <div className=" text-white overflow-hidden px-8 py-6 sm:my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Events Section */}
        <div className="flex flex-col">
          <h2 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            EVENTS
          </h2>
          {secondEvent && (
            <div
              className="relative flex-grow h-[300px] rounded-md shadow-lg before:content-['']
                before:absolute
                before:inset-0
                before:block
                before:bg-gradient-to-b
                before:from-[#00000000]
                before:to-[#000000]
                before:opacity-75
                before:z-5"
            >
              <img
                src={secondEvent.image}
                alt="Live event"
                className="rounded-lg w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 p-4">
                <div className="text-xs text-cyan-400 mb-2">
                  {formatDateTime(secondEvent.dateTime)} -{" "}
                  {secondEvent.location}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {secondEvent.EventName}
                </h3>
                {secondEvent.is_registered ? (
                  <button
                    disabled={true}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm"
                  >
                    Booked
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(secondEvent)} // Navigate to payment page
                    className="bg-[#6F4FA0] text-white px-4 py-2 rounded-full text-sm font-extrabold"
                  >
                    Book Your Spot Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* New Releases Section */}
        <div className="flex relative flex-col">
          <h2 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            NEW RELEASES
          </h2>

          <img src={ReleaseBlur} className="absolute -left-48" alt="" />
          <img
            src={ReleaseBlur}
            className="absolute -right-48 -top-44"
            alt=""
          />

          <div className="space-y-4 z-30 flex-grow">
            <div className="flex items-end text-sm text-gray-400 justify-end">
              <span className="w-8">#</span>
              <span className="flex-grow ms-4">SONG</span>
              <span className="w-24 text-right">PLAY</span>
              <span className="w-24 text-right">LISTEN</span>
            </div>
            {songsArray.length > 0 &&
              songsArray.slice(0, visibleSongs).map((song, index) => (
                <div
                  key={song.songId}
                  onClick={() =>
                    window.open(
                      import.meta.env.VITE_WEBSITE_URL +
                        "artists" +
                        `/${song.ophid}`,
                      "_blank"
                    )
                  }
                  className="flex hover:cursor-pointer items-center py-2 border-b border-gray-800"
                >
                  <img
                    src={song.imageUrl[0]}
                    className="w-10 h-10 rounded-md"
                    alt=""
                  />
                  <div className="flex-grow ms-4 truncate">
                    <div className="font-medium">
                      {/* <span className="block sm:hidden">
                    {song.secondaryArtist?.length > 5 ? song.secondaryArtist.slice(0, 5) + "..." : song.secondaryArtist}
                    </span>
                    
                    <span className="hidden sm:block">
                    {song.secondaryArtist}
                    </span> */}

                      <span className="hidden sm:block">{song.songName}</span>
                      <div className="text-sm text-gray-400 truncate max-w-full overflow-hidden whitespace-nowrap">
                        {song.primaryArtist}
                        {song.secondaryArtist.length > 0 && !song.secondaryArtist.includes(null) && (
                          <span>, {song.secondaryArtist.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="w-24 text-right text-gray-400">
                    {/* {song.total_views} */}
                    {song.youtubeViews}
                  </span>
                  <span className="w-24 flex items-center justify-end ml-auto">
                    <button
                      className="p-2 bg-[#6F4FA0] rounded-full hover:bg-purple-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        handlePlayPause(song);
                      }}
                    >
                      {playingSongId === song.songId && !audio?.paused ? (
                        <FaPause className="w-3 h-3" />
                      ) : (
                        <FaPlay className="w-3 h-3" />
                      )}
                    </button>
                  </span>
                </div>
              ))}
            <div className="text-center">
              {visibleSongs < newReleases.length && (
                <button
                  className="text-cyan-400 underline"
                  onClick={toggleShowAllSongs}
                >
                  See more...
                </button>
              )}
              {showAllSongs && (
                <button
                  className="text-cyan-400 underline"
                  onClick={toggleShowAllSongs}
                >
                  See less
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <RegistrationModal
          id={secondEvent.id}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default EventsNewReleases;
