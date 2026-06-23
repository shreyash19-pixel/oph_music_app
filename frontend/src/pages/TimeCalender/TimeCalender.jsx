import React, { useState, useEffect, useRef } from "react";
import axiosApi from "../../conf/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useArtist } from "../auth/API/ArtistContext";
import NavbarRight from "../../components/Navbar/NavbarRight";
import NavbarLeft from "../../components/Navbar/NavbarLeft";

function toLocalDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeBookingDateFromApi(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    return value.trim().slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TimeCalendar() {
  const { headers, ophid } = useArtist();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [blockedDatesInfo, setBlockedDatesInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toastShownRef = useRef(false);
  const [data, setData] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [pendingReleaseDateChange, setPendingReleaseDateChange] = useState(null);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosApi.get("/bookings", { headers });

        if (response.data.success === true) {
          const dateMap = {};
          const rows = response.data.data || [];
          setData(rows);

          const today = toLocalDateStr(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
          );
          const todays = rows.filter(
            (item) =>
              normalizeBookingDateFromApi(item.current_booking_date) === today,
          );
          setTodaysBookings(todays);

          rows.forEach((item) => {
            const localDateStr = normalizeBookingDateFromApi(
              item.current_booking_date,
            );
            if (!localDateStr) return;
            const anonymous =
              item.anonymous_blocked === true ||
              item.pending_release_date_change === true ||
              !item.oph_id;
            dateMap[localDateStr] = {
              content: anonymous ? null : item.oph_id,
              artist: anonymous ? "" : item.full_name || "",
              anonymous,
            };
          });
          setBlockedDatesInfo(dateMap);
        } else {
          setError("Failed to load data from server");
        }
      } catch (err) {
        console.error("Error fetching blocked dates:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedDates();
  }, [headers]);

  useEffect(() => {
    if (!headers?.Authorization) return;

    let cancelled = false;
    axiosApi
      .get("/pending-release-date-change", { headers })
      .then((res) => {
        if (!cancelled && res.data?.pending) {
          setPendingReleaseDateChange(res.data.pending);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [headers]);

  useEffect(() => {
    if (
      location.state?.showSuccessToast &&
      location.state?.successMessage &&
      !toastShownRef.current
    ) {
      toastShownRef.current = true;
      toast.success(location.state.successMessage, {
        duration: 4000,
        position: "top-right",
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  const isDateBlocked = (year, month, day) => {
    const dateStr = toLocalDateStr(year, month, day);
    return Object.prototype.hasOwnProperty.call(blockedDatesInfo, dateStr);
  };

  const isDateInPast = (year, month, day) => {
    const today = new Date();
    const checkDate = new Date(year, month, day);
    return (
      checkDate <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  const isWithinOneYear = (year, month, day) => {
    const today = new Date();
    const oneYearFromNow = new Date(
      today.getFullYear() + 1,
      today.getMonth(),
      today.getDate(),
    );
    const checkDate = new Date(year, month, day);
    return checkDate <= oneYearFromNow;
  };

  const isWithinFiveDays = (year, month, day) => {
    const today = new Date();
    const checkDate = new Date(year, month, day);
    const timeDiff = checkDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 5 && daysDiff >= 0;
  };

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

  const daysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

  const generateCalendarDays = () => {
    const totalDays = daysInMonth(currentMonthIndex, currentYear);
    const prevMonthDays = daysInMonth(
      (currentMonthIndex - 1 + 12) % 12,
      currentMonthIndex === 0 ? currentYear - 1 : currentYear,
    );
    const days = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    while (days.length % 7 !== 0) {
      days.push({
        day: days.length - totalDays - firstDayOfMonth + 1,
        isCurrentMonth: false,
      });
    }
    return days;
  };

  useEffect(() => {
    const today = new Date();
    setCurrentMonthIndex(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, [data]);

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

  const handleDateCellClick = (year, month, day, isCurrentMonth) => {
    if (!isCurrentMonth) return;

    const dateStr = toLocalDateStr(year, month, day);
    const dateInfo = blockedDatesInfo[dateStr];

    if (dateInfo?.anonymous) {
      toast.error("This date is reserved pending admin approval");
      return;
    }

    const ownerRow = data.find(
      (da) =>
        normalizeBookingDateFromApi(da.current_booking_date) === dateStr &&
        da.oph_id === ophid,
    );

    if (dateInfo && ownerRow) {
      if (pendingReleaseDateChange) {
        toast.error(
          `A release date change to ${pendingReleaseDateChange.release_date} is already pending admin approval.`,
        );
        return;
      }
      if (isWithinFiveDays(year, month, day)) {
        toast.error(
          "You cannot change dates that are within 5 days of today",
        );
        return;
      }
      navigate("/dashboard/date-change", { state: { date: dateStr } });
      return;
    }

    if (dateInfo) {
      toast.error("You can only update your own release dates");
      return;
    }

    navigate("/dashboard/block-date", { state: { selectedDate: dateStr } });
  };

  const renderCalendarCell = ({ day, isCurrentMonth }, index) => {
    const isBlocked = isDateBlocked(currentYear, currentMonthIndex, day);
    const isPast = isDateInPast(currentYear, currentMonthIndex, day);
    const isValidFutureDate = isWithinOneYear(
      currentYear,
      currentMonthIndex,
      day,
    );
    const isWithinFiveDaysRestriction = isWithinFiveDays(
      currentYear,
      currentMonthIndex,
      day,
    );
    const dateStr = toLocalDateStr(currentYear, currentMonthIndex, day);
    const slot = blockedDatesInfo[dateStr];
    const showAnonymous = isBlocked && isCurrentMonth && slot?.anonymous;
    const showNamed =
      isBlocked && isCurrentMonth && slot?.artist && !slot?.anonymous;

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
            );
          }
        }}
        className={`sm:min-h-[90px] min-h-[70px]  sm:p-4 p-2 relative backdrop-blur-sm border-[1px] cursor-pointer hover:opacity-80 ${
          isBlocked && isCurrentMonth
            ? isWithinFiveDaysRestriction
              ? "bg-[#FF6B6B]/30 border-[#FF6B6B] shadow-[#FF6B6B]/20 shadow-inner"
              : showAnonymous
                ? "bg-[#4B5563]/40 border-[#6B7280] shadow-inner"
                : "bg-[#6F4FA0]/30 border-[#6F4FA0] shadow-[#6F4FA0]/20 shadow-inner"
            : isCurrentMonth
              ? "bg-[#2DDA89]/10 border-[#2DDA89] shadow-[#2DDA89]/20 shadow-inner"
              : "bg-gray-900/40 border-gray-700"
        }
        ${isPast ? "opacity-50" : ""}
        ${!isValidFutureDate ? " opacity-25" : ""}
        `}
      >
        <div className="flex justify-between items-start">
          <span
            className={`text-xs lg:text-lg ${
              !isCurrentMonth ? "text-gray-600" : ""
            }`}
          >
            {day}
          </span>
          {isBlocked && isCurrentMonth && (
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
                fill={isWithinFiveDaysRestriction ? "#FF6B6B" : "#EC4346"}
              />
            </svg>
          )}
        </div>
        {showNamed && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-400 text-gray-900 font-bold">
              {slot.artist?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="text-sm hidden lg:block">{slot.artist}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-[16px] py-[16px] md:px-8 md:py-6 ">
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
            <div className="flex flex-col lg:flex-row justify-between mb-[16px] lg:mb-8">
              <div className="w-full flex items-center justify-between lg:justify-end mb-[16px] block lg:hidden">
                <NavbarLeft />
                <NavbarRight />
              </div>
              <h2 className="text-[#5DC9DE] text-2xl sm:text-3xl font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                TIME CALENDAR
              </h2>
              <div className="hidden lg:block">
                <NavbarRight />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center justify-end gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6F4FA0]"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6B7280]"></div>
                  <span>Reserved (pending approval)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                  <span>Locked (within 5 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2DDA89]"></div>
                  <span>Available</span>
                </div>
              </div>

              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <div className="grid grid-cols-7  bg-cyan-400  text-xs lg:text-lg">
                  {weekDays.map((day, idx) => (
                    <React.Fragment key={idx}>
                      <div className="lg:p-6 text-center border border-gray-500 py-3 hidden lg:block font-bold text-gray-900">
                        {day}
                      </div>
                      <div className="lg:p-4 text-center block border border-gray-500 lg:hidden py-4 font-bold text-gray-900">
                        {day[0] + day[1] + day[2]}
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="divide-y divide-gray-800">
                  {Array.from(
                    { length: calendarDays.length / 7 },
                    (_, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7">
                        {calendarDays
                          .slice(weekIndex * 7, weekIndex * 7 + 7)
                          .map((dayData, idx) =>
                            renderCalendarCell(dayData, idx),
                          )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center mt-4 gap-4">
                <button
                  onClick={() =>
                    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1))
                  }
                  className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full transition"
                >
                  {"<"}
                </button>
                <div className="text-white text-lg font-semibold min-w-[120px] text-center">
                  {months[currentMonthIndex]}
                </div>
                <button
                  onClick={() =>
                    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1))
                  }
                  className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full transition"
                >
                  {">"}
                </button>
                <select
                  value={currentYear}
                  onChange={(e) =>
                    setCurrentYear(parseInt(e.target.value, 10))
                  }
                  className="bg-gray-800 text-white rounded px-4 py-2 ml-2"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() + i,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:hidden bg-[#1E1A2D]/70 rounded-2xl p-3">
              <div className="bg-[#4A425B] rounded-lg px-3 py-2">
                <select
                  className="w-full bg-transparent text-white font-semibold outline-none cursor-pointer"
                  value={`${currentMonthIndex}-${currentYear}`}
                  onChange={(e) => {
                    const [month, year] = e.target.value.split("-");
                    setCurrentMonthIndex(Number(month));
                    setCurrentYear(Number(year));
                  }}
                >
                  {Array.from(
                    { length: 5 },
                    (_, y) => new Date().getFullYear() + y,
                  ).flatMap((year) =>
                    months.map((month, index) => (
                      <option
                        key={`${index}-${year}`}
                        value={`${index}-${year}`}
                        className="bg-[#4A425B]"
                      >
                        {month} {year}
                      </option>
                    )),
                  )}
                </select>
              </div>

              <div className="flex flex-wrap justify-between gap-2 mt-4 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 rounded-full bg-[#6F4FA0]" />
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 rounded-full bg-[#6B7280]" />
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 rounded-full bg-[#2DDA89]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 rounded-full bg-[#FF4444]" />
                  <span>Locked (5 days)</span>
                </div>
              </div>

              <div className="mt-4 border border-gray-700">
                {Array.from(
                  { length: calendarDays.length / 7 },
                  (_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7">
                      {calendarDays
                        .slice(weekIndex * 7, weekIndex * 7 + 7)
                        .map((dayData, idx) =>
                          renderCalendarCell(dayData, idx),
                        )}
                    </div>
                  ),
                )}
              </div>

              <div className="bg-[#2A2832] rounded-lg mt-4 overflow-hidden">
                <div className="bg-cyan-400 text-center text-black font-bold py-2">
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </div>

                {todaysBookings.length > 0 ? (
                  <div className="flex justify-center items-center gap-2 py-3">
                    <img
                      src={todaysBookings[0].personal_photo}
                      alt={todaysBookings[0].full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{todaysBookings[0].full_name}</span>
                  </div>
                ) : (
                  <div className="py-3 text-center text-gray-400">
                    No show today
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
