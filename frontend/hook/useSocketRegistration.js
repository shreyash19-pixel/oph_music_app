import { useEffect } from "react";
import { socket } from "./socket"; // shared socket instance
import toast from "react-hot-toast";

const useSocketRegistration = (OPH_ID, onNewNotification) => {
  useEffect(() => {
    if (!OPH_ID) {
      console.warn("No OPH_ID provided to socket registration.");
      return;
    }

    // Ensure the shared socket only connects when we actually have an OPH_ID.
    if (!socket.connected) {
      socket.connect();
    }

    const registerIfConnected = () => {
      socket.emit("register", OPH_ID.trim());
      console.log("Socket registered with OPH_ID:", OPH_ID);
    };

    const handleConnect = () => {
      console.log("🔌 Socket connected:", socket.id);
      registerIfConnected();
    };

    socket.on("connect", handleConnect);

    // If already connected, register immediately
    if (socket.connected) {
      registerIfConnected();
    }

    const handleTicketUpdate = (data) => {
      console.log("Received ticket-updated event:", data);

      toast.success(`${data.title}`, {
        duration: 10000,
        position: "top-right",
        icon: "🎶",
      });
      if (typeof onNewNotification === "function") onNewNotification();
    };

    const handlePaymentUpdate = (data) => {
      console.log("Received payment-updated event:", data);

      toast.success(`${data.title}`, {
        duration: 10000,
        position: "top-right",
        icon: "💳",
      });
      if (typeof onNewNotification === "function") onNewNotification();
    };

    const handleProfileUpdate = (data) => {
      console.log("Received profile-update event:", data);

      toast.success(`${data.title}`, {
        duration: 10000,
        position: "top-right",
        icon: "👤",
      });
      if (typeof onNewNotification === "function") onNewNotification();
    };
    const handleTVUpdate = (data) => {
      console.log("Received TV-update event:", data);

      toast.success(`${data.title}`, {
        duration: 10000,
        position: "top-right",
        icon: "🎥",
      });
      if (typeof onNewNotification === "function") onNewNotification();
    };

    socket.on("Music-update", handleTicketUpdate);
    socket.on("Payment-update", handlePaymentUpdate);
    socket.on("Profile-update", handleProfileUpdate);
    socket.on("TV-update", handleTVUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("Music-update", handleTicketUpdate);
      socket.off("Payment-update", handlePaymentUpdate);
      socket.off("Profile-update", handleProfileUpdate);
      socket.off("TV-update", handleTVUpdate);

      // If the context unmounts (or user logs out and OPH_ID becomes null),
      // we can disconnect to avoid background reconnect loops.
      try {
        socket.disconnect();
      } catch {
        // no-op
      }
    };
  }, [OPH_ID, onNewNotification]);
};

export default useSocketRegistration;
