import React, { useState, useEffect, useRef } from "react";
import { Lock, ChevronLeft, ChevronRight } from "lucide-react";
import axiosApi from "../../../../conf/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import ArtistSidebar from "../../../../components/ArtistSidebar";

export default function TimeCalendar() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [blockedDatesInfo, setBlockedDatesInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toastShownRef = useRef(false); // Ref to track if toast has been shown
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosApi.get("admin-calendar/bookings");

        if (response.data.status === 200 || response.status === 200) {
          const dateMap = {};
          setData(response.data.data);
          response.data.data.forEach((item) => {
            const d = new Date(item.current_booking_date);
            const localDateStr = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            dateMap[localDateStr] = {
              content: item.oph_id,
              artist: item.full_name,
              song_id: item.song_id,
            };
          });

          setBlockedDatesInfo(dateMap);
        } else {
          console.error("API did not return success:", response.data);
          setError("Failed to load data from server");
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedDates();
  }, []);

  // check for toast notification from payment screen
  useEffect(() => {
    // Check if we have success toast parameters AND haven't shown the toast yet
    if (
      location.state?.showSuccessToast &&
      location.state?.successMessage &&
      !toastShownRef.current
    ) {
      // Set our ref to true to prevent showing again
      toastShownRef.current = true;

      // Show the success toast
      toast.success(location.state.successMessage, {
        duration: 4000,
        position: "top-right",
      });

      // Clear the state to prevent duplicate toasts
      const currentPath = location.pathname;
      navigate(currentPath, { replace: true });
    }
  }, [location.state, navigate]);

  // Helper function to check if a date is blocked
  const isDateBlocked = (year, month, day) => {
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;

    return blockedDatesInfo.hasOwnProperty(dateStr);
  };

  // Helper function to check if a date is in the past
  const isDateInPast = (year, month, day) => {
    const today = new Date();
    const checkDate = new Date(year, month, day);
    return (
      checkDate <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  // Helper function to check if a date is within one year from now
  const isWithinOneYear = (year, month, day) => {
    const today = new Date();
    const oneYearFromNow = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate()
    );
    const checkDate = new Date(year, month, day);
    return checkDate <= oneYearFromNow;
  };

  // Month and day mappings
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate(); // Get the last day of the month
  };

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

  const generateCalendarDays = () => {
    const totalDays = daysInMonth(currentMonthIndex, currentYear);
    const prevMonthDays = daysInMonth(
      (currentMonthIndex - 1 + 12) % 12,
      currentMonthIndex === 0 ? currentYear - 1 : currentYear
    );

    const days = [];

    // Add days from the previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    // Add days from the current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
      });
    }

    // Add days from the next month to fill the remaining cells
    while (days.length % 7 !== 0) {
      days.push({
        day: days.length - totalDays - firstDayOfMonth + 1,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    const today = new Date();
    const currentDate = new Date(currentYear, currentMonthIndex - 1); // Simulate previous month

    // Only allow navigation if previous month is not in the past
    if (
      currentDate.getFullYear() > today.getFullYear() ||
      (currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() >= today.getMonth())
    ) {
      if (currentMonthIndex === 0) {
        setCurrentMonthIndex(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonthIndex((prev) => prev - 1);
      }
    }
  };

  const handleNextMonth = () => {
    // Create dates for comparison
    const today = new Date();
    const oneYearFromNow = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate()
    );

    // Calculate the first day of the next month
    let nextYear = currentYear;
    let nextMonth = currentMonthIndex + 1;

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    const nextMonthDate = new Date(nextYear, nextMonth, 1);

    // Only allow navigation if next month starts before or on one year from now
    if (nextMonthDate <= oneYearFromNow) {
      if (currentMonthIndex === 11) {
        setCurrentMonthIndex(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonthIndex((prev) => prev + 1);
      }
    }
  };

  // Initialize to current month on component mount
  useEffect(() => {
    const today = new Date();
    setCurrentMonthIndex(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, []);

  const calendarDays = generateCalendarDays();

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const UserAvatar = ({ artist, ophId, songId }) => (
    <div className="flex flex-col gap-1 mb-2">
      {/* OPH ID and Song ID */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-cyan-300">{ophId}</span>
        {songId && (
          <span className="text-xs font-semibold text-yellow-300">
            Song: {songId}
          </span>
        )}
      </div>
    </div>
  );

  const handleDateCellClick = (
    year,
    month,
    day,
    isCurrentMonth,
    getCurrentGridStatus
  ) => {
    if (!isCurrentMonth || getCurrentGridStatus.Status === "approved") return; // Don't handle clicks on non-current month days
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;

    const dateInfo = blockedDatesInfo[dateStr];

    if (dateInfo) {
      navigate("/verify-booking-dates", {
        state: { selectedDate: dateStr },
      });
    } else {
      return;
    }
  };

  // Update renderCalendarCell to include click handler
  const renderCalendarCell = ({ day, isCurrentMonth }, index) => {
    const isBlocked = isDateBlocked(currentYear, currentMonthIndex, day);
    const isPast = isDateInPast(currentYear, currentMonthIndex, day);
    const isValidFutureDate = isWithinOneYear(
      currentYear,
      currentMonthIndex,
      day
    );

    const d = new Date(currentYear, currentMonthIndex, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    const artist = blockedDatesInfo[dateStr];

    console.log(artist);
    

    const getCurrentGridStatus = data.find(
      (d) => d.current_booking_date === dateStr
    );

    // console.log(getCurrentGridStatus);

    return (
      <div
        key={index}
        onClick={() => {
          if (!isPast && isValidFutureDate) {
            handleDateCellClick(
              currentYear,
              currentMonthIndex,
              day,
              isCurrentMonth,
              getCurrentGridStatus
            );
          }
        }}
        className={`sm:min-h-[90px] min-h-[70px]  sm:p-4 p-2 relative backdrop-blur-sm border-[1px] ${
          isBlocked &&
          isCurrentMonth &&
          getCurrentGridStatus.Status === "under review"
            ? "bg-[#6F4FA0]/30 border-[#6F4FA0] shadow-[#6F4FA0]/20 shadow-inner"
            : isBlocked &&
              isCurrentMonth &&
              getCurrentGridStatus.Status === "approved"
            ? "bg-[#FFD700]/10 border-[#FFD700] shadow-[#FFD700]/20 shadow-inner"
            : "bg-[#2DDA89]/10 border-[#2DDA89] shadow-[#2DDA89]/20 shadow-inner"
        }
        ${isPast ? "opacity-50" : ""}
        ${!isValidFutureDate ? " opacity-25" : ""}
        ${
          !isPast && isValidFutureDate
            ? "cursor-pointer hover:opacity-80"
            : "cursor-not-allowed"
        }`}
      >
        <div className="flex justify-between items-start">
          <span
            className={`text-xs lg:text-lg ${
              !isCurrentMonth ? "text-gray-600" : ""
            }`}
          >
            {day}
          </span>
          {isBlocked &&
            isCurrentMonth &&
            getCurrentGridStatus.Status === "under review" && (
              <svg
                className="absolute top-0 right-0 sm:top-4 sm:right-4 sm:w-7 sm:h-7 w-4 h-4 translate-x-1 -translate-y-1"
                viewBox="0 0 18 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.25 6C3.25 2.82436 5.82436 0.25 9 0.25C12.1756 0.25 14.75 2.82436 14.75 6V7.11372C14.75 7.18052 14.7413 7.24529 14.7249 7.30693C16.161 7.83463 17.2803 8.99318 17.7553 10.4549C18 11.2081 18 12.1387 18 14C18 15.8613 18 16.7919 17.7553 17.5451C17.2607 19.0673 16.0673 20.2607 14.5451 20.7553C13.7919 21 12.8613 21 11 21H6.99998C5.13871 21 4.20808 21 3.45492 20.7553C1.93273 20.2607 0.739307 19.0673 0.244717 17.5451C0 16.7919 0 15.8613 0 14C0 12.1387 0 11.2081 0.244717 10.4549C0.719664 8.99318 1.83903 7.83463 3.27512 7.30693C3.25873 7.24529 3.25 7.18052 3.25 7.11372V6ZM4.75 7.03413C5.31973 7 6.03471 7 7 7H11C11.9653 7 12.6803 7 13.25 7.03413V6C13.25 3.65279 11.3472 1.75 9 1.75C6.65279 1.75 4.75 3.65279 4.75 6V7.03413ZM9 11.25C9.41421 11.25 9.75 11.5858 9.75 12V16C9.75 16.4142 9.41421 16.75 9 16.75C8.58579 16.75 8.25 16.4142 8.25 16V12C8.25 11.5858 8.58579 11.25 9 11.25Z"
                  fill="#EC4346"
                />
              </svg>
            )}
        </div>
        {isBlocked && isCurrentMonth && (
          <UserAvatar 
            artist={artist?.artist} 
            ophId={artist?.content} 
            songId={artist?.song_id} 
          />
        )}
      </div>
    );
  };
  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100">
      <ArtistSidebar>
        <div className="space-y-6">
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-2 text-cyan-400">Loading calendar data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-red-400">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-500/20 rounded hover:bg-red-500/30"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="flex items-center gap-[16px]">
                <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-4">
                  <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
                    TIME CALENDAR
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6F4FA0]"></div>
                    <span className="text-[#0d3c44]">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2DDA89]"></div>
                    <span className="text-[#0d3c44]">Not Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FFD700]"></div>
                    <span className="text-[#0d3c44]">Approved</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-800 rounded-lg overflow-hidden">
                {/* Calendar Header */}
                <div className="grid grid-cols-7  bg-[#005868]  text-xs lg:text-lg">
                  {weekDays.map((day, index) => (
                    <React.Fragment key={index}>
                      <div className="lg:p-6 text-center border border-gray-500 py-3 hidden lg:block font-bold text-white">
                        {day}
                      </div>
                      <div className="lg:p-4 text-center block border border-gray-500 lg:hidden py-4 font-bold text-white">
                        {day[0] + day[1] + day[2]}
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="divide-y divide-gray-800 bg-[#0d3c44]">
                  {Array.from(
                    { length: calendarDays.length / 7 },
                    (_, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7">
                        {calendarDays
                          .slice(weekIndex * 7, weekIndex * 7 + 7)
                          .map((dayData, index) =>
                            renderCalendarCell(dayData, index)
                          )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Month and Year Selector */}
              <div className="flex justify-end items-center mt-4 ">
                <select
                  value={currentMonthIndex}
                  onChange={(e) =>
                    setCurrentMonthIndex(parseInt(e.target.value))
                  }
                  className="bg-[#0d3c44] text-white rounded px-4 py-2 mr-2"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="bg-[#0d3c44] text-white rounded px-4 py-2"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </ArtistSidebar>
    </div>
  );
}
