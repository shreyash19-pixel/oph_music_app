import { useSelector } from "react-redux";
import Card from "../../../../../components/Card/Card";
import { useNavigate } from "react-router-dom";
import Elipse from "../../../../../../public/assets/images/elipse.png";

function PreviousEventSection() {
  const navigate = useNavigate();
  const previousEvents = useSelector((state) => state.event.previousEvents);
  const dateFormat = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC", // Ensure UTC
    });
  };

  const ShimmerCard = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div>
        {/* Image placeholder */}
        <div className="w-full h-[200px] bg-gray-200 animate-shimmer"></div>
        {/* Content placeholder */}
        <div className="p-4">
          {/* Title placeholder */}
          <div className="h-6 bg-gray-200 rounded animate-shimmer mb-4"></div>
          {/* Date placeholder */}
          <div className="h-4 bg-gray-200 rounded animate-shimmer w-3/4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <style>
        {`
          .animate-shimmer {
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite linear;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
      
      <div className="px-8 py-12 md:px-10 xl:px-16 container mx-auto">
        <div className="w-full uppercase font-extrabold text-[55px] py-8">
          Previous Events
        </div>
        <div className="grid grid-cols-1 py-5 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {previousEvents === undefined ? (
            [1, 2, 3].map((i) => <ShimmerCard key={i} />)
          ) : previousEvents.length > 0 ? (
            previousEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                onClick={() => navigate(`/events/${event.id}`)}
                className="cursor-pointer"
              >
                <Card
                  img={event.thumbnail_url}
                  title={event.name}
                  date={dateFormat(event.event_date_time)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full">No Previous Events</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviousEventSection;