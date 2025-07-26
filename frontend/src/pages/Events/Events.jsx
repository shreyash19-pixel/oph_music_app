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

  const musicEvents = [
    {
      event_id: 1,
      hashtags: "#Competition, #Music, #Winners",
      competitionName: "Live Stage Singing Competition",
      dateTime: "28/12/2025 – 09:00 PM",
      location: "Purplish Club, Bandra, Mumbai",
      description: "An exciting performance.",
      registrationFee_normal: "150",
      registrationFee_offer_availableFor: "OPH Creators",
      registrationFee_offer_discount: "50%",
      registrationStart: "15/12/2025",
      registrationEnd: "18/12/2025",
      winnerReward: "10,000",
      image:
        "https://events.com/wp-content/uploads/2022/09/BLOG-How-To-Plan-a-Music-Festival-A-Complete-Guide.png",
      is_register: true,
    },
    {
      event_id: 2,
      hashtags: "#Competition, #Music, #Winners",
      competitionName: "Live Stage Singing Competition",
      dateTime: "28/12/2023 – 09:00 PM",
      location: "Purplish Club, Bandra, Mumbai",
      description: "An exciting performance.",
      registrationFee_normal: "150",
      registrationFee_offer_availableFor: "OPH Creators",
      registrationFee_offer_discount: "50%",
      registrationStart: "15/2/2023",
      registrationEnd: "18/5/2023",
      winnerReward: "10,000",
      image:
        "https://events.com/wp-content/uploads/2022/09/BLOG-How-To-Plan-a-Music-Festival-A-Complete-Guide.png",
      is_register: true,
    },{
      event_id: 3,
      hashtags: "#Competition, #Music, #Winners",
      competitionName: "Live Stage Singing Competition",
      dateTime: "28/08/2025 – 09:00 PM",
      location: "Purplish Club, Bandra, Mumbai",
      description: "An exciting performance.",
      registrationFee_normal: "150",
      registrationFee_offer_availableFor: "OPH Creators",
      registrationFee_offer_discount: "50%",
      registrationStart: "22/08/2025",
      registrationEnd: "27/08/2025",
      winnerReward: "10,000",
      image:
        "https://events.com/wp-content/uploads/2022/09/BLOG-How-To-Plan-a-Music-Festival-A-Complete-Guide.png",
      is_register: false,
    },
  ];

  const parseEventDateTime = (dateTimeStr) => {
    if (!dateTimeStr || typeof dateTimeStr !== "string") return null;
    const [datePart, timePart] = dateTimeStr.split("–").map(part => part.trim());
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split("/").map(Number);
    let [time, modifier] = timePart.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes);
  };

  const now = new Date();
  const upcomingEvents = musicEvents.filter((event) => {
    const eventDate = parseEventDateTime(event.dateTime);
    return eventDate && eventDate > new Date();
  });

  const previousEvents = musicEvents.filter((event) => {
    const eventDate = parseEventDateTime(event.dateTime);
    return eventDate && eventDate <= new Date();
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosApi.get("/event/get-event", {
          headers,
        });
        if (response.data.success) {
          setArtistBookEvents(response.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleReg = (data) => {
    // navigate("/auth/payment", {
    //   state: {
    //     artist_id: ophid,
    //     amount: (parseInt(data.registrationFee_normal) / 2).toFixed(0),
    //     event_id: data.event_id,
    //     returnPath: "/dashboard/events",
    //     heading: "Complete Event Registration",
    //     from: "Event Registeration",
    //   },
    // });
    navigate("/dashboard/success", {
          state: {
            heading: "Your Event Spot has been booked Successfully.",
            btnText: "Check Out More Events",
            redirectTo: "/dashboard/events",
          },
          replace: true,
        });
  };

  const parseDDMMYYYY = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const checkRegValid = (reg_date) => {
    const today = new Date();
    const reg = parseDDMMYYYY(reg_date);
    return today <= reg;
  };

  const formatDateInline = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
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
              className="flex md:mb-0 hover:bg-gray-900 transition-colors mb-5 hover:cursor-pointer gap-6 flex-col md:flex-row rounded-lg p-2 md:p-4"
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
                  {event.dateTime} - {event.location}
                </div>
                <div className="text-cyan-400">{event.description}</div>
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
                  ) : event.is_register ? (
                    <button
                      className="px-6 py-2 bg-cyan-400 text-gray-900 hover:bg-cyan-100 rounded-full text-sm font-medium cursor-not-allowed"
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
                      className="px-6 py-2 bg-cyan-400 text-gray-900 rounded-full text-sm font-medium hover:bg-cyan-100 transition-colors"
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