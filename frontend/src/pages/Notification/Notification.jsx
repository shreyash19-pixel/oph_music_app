import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Noti from "../../../public/assets/images/noti.png";

const Notification = () => {
  const { headers, ophid, setHasNewNotification } = useArtist();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!ophid) return;
      try {
        const { data } = await axiosApi.get(`/notification/${ophid}`, {
          headers,
        });
        setNotifications(data);
        // user has viewed notifications page; clear red dot
        setHasNewNotification(false);
        localStorage.removeItem("hasNewNotification");
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [ophid, headers, setHasNewNotification]);

  const handleNotificationClick = async (note) => {
    if (note.read_status) {
      if (note.link) window.open(note.link, "_blank");
      return;
    }

    try {
      await axiosApi.put(`/notification/${note.id}/read`, {}, { headers });

      setNotifications((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, read_status: true } : n)),
      );

      // if (note.link) window.open(note.link, "_blank");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const NotificationItem = ({ note }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
      e.stopPropagation();
      if (!note.link) return;

      // Ensure link starts with /dashboard
      // const linkTo = note.link.startsWith("/dashboard") ? note.link : note.link;

      navigate(`${note.link}`);
    };

    return (
      <div
        onClick={() => handleNotificationClick(note)}
        className={`flex gap-4 p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${
          !note.read_status ? "bg-[#1e293b]" : ""
        }`}
      >
        <div className="flex-shrink-0">
          <div className="w-12 h-12 p-2 bg-cyan-950 rounded-lg flex items-center justify-center">
            <img src={Noti} alt="notification icon" />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-white font-medium mb-1">{note.title}</h3>
          <p className="text-gray-400 text-sm">{note.message}</p>

          {note.link && (
            <span
              onClick={handleClick}
              className="text-cyan-400 text-xs mt-2 hover:text-cyan-300 underline inline-block"
            >
              {note.link}
            </span>
          )}
        </div>
      </div>
    );
  };

  NotificationItem.propTypes = {
    note: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      link: PropTypes.string,
      read_status: PropTypes.bool,
    }).isRequired,
  };

  // Split notifications
  const newNots = notifications.filter((n) => !n.read_status);
  const earlier = notifications.filter((n) => n.read_status);

  return (
    <div className="bg-black min-h-[calc(100vh-70px)] text-white">
      <div className="px-8 py-6">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          NOTIFICATION
        </h1>

        {/* NEW NOTIFICATIONS */}
        <div className="mb-8">
          <h2 className="text-cyan-400 text-xs mb-4">NEW</h2>
          {newNots.length > 0 ? (
            <div className="bg-[#151D26]">
              {newNots.map((note) => (
                <NotificationItem key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No New Notifications</p>
          )}
        </div>

        {/* EARLIER NOTIFICATIONS */}
        <div>
          <h2 className="text-cyan-400 text-xs mb-4">EARLIER</h2>
          {earlier.length > 0 ? (
            earlier.map((note) => (
              <NotificationItem key={note.id} note={note} />
            ))
          ) : (
            <p className="text-gray-600">No Earlier Notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
