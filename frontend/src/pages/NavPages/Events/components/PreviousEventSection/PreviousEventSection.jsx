import React, { useEffect, useState } from "react";
import Card from "../../../../../components/Card/Card";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../../conf/axios";

function PreviousEventSection() {
  const navigate = useNavigate();

  const [previousEvents, setPreviousEvents] = useState(undefined); // undefined => loading shimmer
  const [error, setError] = useState(null);

  const dateFormat = (date) => {
    const eventDate = new Date(date);
    if (isNaN(eventDate)) return "";
    return eventDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  const ShimmerCard = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div>
        <div className="w-full h-[200px] bg-gray-200 animate-shimmer" />
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded animate-shimmer mb-4" />
          <div className="h-4 bg-gray-200 rounded animate-shimmer w-3/4" />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    let cancelled = false;

    const fetchPrevious = async () => {
      try {
        setError(null);
        const res = await axiosApi.get("/events_status");
        console.log(res.data.data);

        const raw = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data?.events ?? []);

        // Filter only events where event_type === "previous"
        const mapped = raw
          .filter((e) => e?.event_type === "previous")
          .map((e) => ({
            id: e.event_id ?? e.id,
            name: e.EventName ?? e.name,
            event_date_time: e.dateTime ?? e.event_date_time,
            thumbnail_url: e.image ?? e.thumbnail_url ?? "",
            raw: e,
          }));

        if (!cancelled) setPreviousEvents(mapped);
      } catch (err) {
        console.error("Failed to fetch previous events:", err);
        if (!cancelled) {
          setError("Unable to load previous events");
          setPreviousEvents([]);
        }
      }
    };

    fetchPrevious();

    return () => {
      cancelled = true;
    };
  }, []);

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
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>

      <div className="px-8 py-12 md:px-10 xl:px-16 container mx-auto">
        <div className="w-full uppercase font-extrabold text-[55px] py-8">
          Previous Events
        </div>

        <div className="grid grid-cols-1 py-5 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {previousEvents === undefined &&
            [1, 2, 3].map((i) => <ShimmerCard key={i} />)}

          {previousEvents !== undefined && previousEvents.length === 0 && (
            <div className="col-span-full text-center text-gray-400">
              {error ? error : "No Previous Events"}
            </div>
          )}

          {previousEvents &&
            previousEvents.length > 0 &&
            previousEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id ?? index}
                onClick={() => navigate(`/events/${event.id}`)}
                className="cursor-pointer"
              >
                <Card
                  img={event.thumbnail_url}
                  title={event.name}
                  date={dateFormat(event.event_date_time)}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default PreviousEventSection;
