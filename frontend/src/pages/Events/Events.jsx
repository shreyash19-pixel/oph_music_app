import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import RegistrationModal from "../../components/registration/Registration";

export default function Events() {
  const { headers, ophid } = useArtist();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [id, setID] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artistBookEvents, setArtistBookEvents] = useState([]);
  const [musicEvents, setMusicEvents] = useState([]);
  const test = ophid;




  useEffect(() => {
    const getEvents = async () => {
      const events = await axiosApi.get('/events')
      console.log(events.data.data);
      setMusicEvents(events.data.data)
    }

    getEvents()

  }, [])
  console.log(JSON.stringify(musicEvents));


  const upcomingEvents = musicEvents.filter((event) => {
    const eventDate = new Date(event.dateTime);
    return eventDate > new Date();
  });

  const previousEvents = musicEvents.filter((event) => {
    const eventDate = new Date(event.dateTime);
    return eventDate <= new Date();
  });


  useEffect(() => {
    if (!ophid) return; // wait for ophid to be defined

    const fetchData = async () => {
      try {
        console.log("Fetching event_part for:", ophid);

        const response = await axiosApi.get(`/event_part/${ophid}`, {
          headers,
        });

        console.log(response);

        if (response.status === 200) {
          const participantData = response.data;
          const normalizedData = Array.isArray(participantData)
            ? participantData
            : [participantData]; // wrap single object into array

          console.log("✅ Normalized artist registrations:", normalizedData);
          setArtistBookEvents(normalizedData);
        }
      } catch (err) {
        console.error("Error fetching event_part:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, [ophid]);

  const handleReg = (data) => {
    navigate("/auth/payment", {
      state: {
        OPH_ID: ophid,
        amount: (parseInt(data.registrationFee_normal) / 2).toFixed(0),
        event_id: data.event_id,
        returnPath: "/dashboard/events",
        heading: "Complete Event Registration",
        from: "Event Registeration",
      },
    });
    // navigate("/dashboard/success", {
    //   state: {
    //     heading: "Your Event Spot has been booked Successfully.",
    //     btnText: "Check Out More Events",
    //     redirectTo: "/dashboard/events",
    //   },
    //   replace: true,
    // });
  };

  // const parseDDMMYYYY = (dateStr) => {
  //   const [day, month, year] = dateStr.split("/").map(Number);
  //   return new Date(year, month - 1, day);
  // };

  // const checkRegValid = (reg_date) => {
  //   const today = new Date();
  //   const reg = parseDDMMYYYY(reg_date);
  //   return today <= reg;
  // };

  const checkRegValid = (regDateISO) => {
    return new Date() <= new Date(regDateISO);
  };


  // const formatDateInline = (dateStr) => {
  //   if (!dateStr) return "";
  //   const [day, month, year] = dateStr.split("/");
  //   return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  // };

  const formatDateInline = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };


  const isArtistRegistered = (eventId) => {
    return artistBookEvents.some(
      (entry) =>
        Number(entry.event_id) === Number(eventId) &&
        (entry.status === "under review" || entry.status === "accepted")
    );
  };






  const renderEventsSection = (events, sectionTitle) => (
    <>
      <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] px-6 md:px-0 pt-6 md:pt-0">
        {sectionTitle}
      </h1>
      <div className="space-y-6">
        {events.map((event, ind) => {
          const hashtagsArray = event.hashtags?.split(",") || [];
          const isPrevious = sectionTitle === "Previous Events";
          return (
            <div
              key={ind}
              className={`flex md:mb-0 mb-5 gap-6 flex-col md:flex-row rounded-lg p-2 md:p-4 transition-colors ${isPrevious
                ? "bg-gray-800 opacity-50 cursor-not-allowed grayscale"
                : "hover:bg-gray-900 hover:cursor-pointer"
                }`}
            >
              <div className="md:w-[340px] px-6 md:px-0 w-[96vw] h-[250px] flex-shrink-0">
                <img
                  src={event.image}
                  alt={event.competitionName}
                  className="md:w-full w-[100vw] h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 px-6 space-y-3">
                <div className="flex gap-2">
                  {hashtagsArray.map((tag, idx) => (
                    <span key={idx} className="text-cyan-400 text-sm">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-semibold uppercase">
                  {event.competitionName}
                </h2>
                <div className="text-gray-400 text-sm">
                  {new Date(event.dateTime).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })} - {event.location}

                </div>
                {event.event_id}
                <div className="text-cyan-400">{event.EventName}</div>
                <p className="text-gray-400 text-sm">
                  {event.description.length > 50
                    ? `${event.description.substring(0, 100)}...`
                    : event.description}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-400">Registration fees:</span>
                    <span className="text-red-400 line-through">
                      ₹{event.registrationFee_normal}
                    </span>
                    <span className="text-cyan-400 font-semibold">
                      ₹{(parseInt(event.registrationFee_normal) / 2).toFixed(0)}
                    </span>
                    <span className="text-green-400 text-sm font-medium">
                      ({event.registrationFee_offer_discount} off for {event.registrationFee_offer_availableFor})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">
                      Registration Start date to end date:
                    </span>
                    <span className="text-cyan-400">
                      {formatDateInline(event.registrationStart)} - {formatDateInline(event.registrationEnd)}
                    </span>
                  </div>
                  <div className="text-green-400 font-bold">
                    Winner rewards: <span className="text-cyan-400">₹{event.winnerReward}</span>
                  </div>
                </div>
                <div>
                  {isPrevious ? (
                    <button className="px-6 py-2 bg-gray-700 text-gray-300 rounded-full text-sm font-medium cursor-not-allowed">
                      Closed
                    </button>
                  ) : isArtistRegistered(event.event_id) ? (
                    <button
                      className="px-6 py-2 bg-cyan-400 text-gray-900 hover:bg-cyan-200 rounded-full text-sm font-medium cursor-not-allowed"
                      disabled
                    >
                      Registered
                    </button>
                  ) : checkRegValid(event.registrationEnd) ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleReg(event);
                      }}
                      className="px-6 py-2 bg-cyan-400 text-gray-900 rounded-full text-sm font-medium hover:bg-cyan-200 transition-colors"
                    >
                      Register
                    </button>
                  ) : (
                    <button className="px-6 py-2 bg-gray-700 text-gray-300 rounded-full text-sm font-medium cursor-not-allowed">
                      Closed
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen text-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-gray-100 p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!musicEvents.length > 0) {
    return (
      <div className="min-h-screen text-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-400">No events found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 md:py-0 md:p-6">
      <div className="">
        {renderEventsSection(upcomingEvents, "Upcoming Events")}
        {previousEvents.length > 0 && renderEventsSection(previousEvents, "Previous Events")}
      </div>
      {isModalOpen && (
        <RegistrationModal id={id} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}


('OPH-CAN-IA-07', 1, 'under review'),
  ('OPH-CAN-IA-07', 1, 'accepted'),
  ('OPH-CAN-IA-07', 1, 'rejected'),
  ('OPH-XYZ-22', 1, 'accepted'),
  ('OPH-USER-99', 1, 'rejected');