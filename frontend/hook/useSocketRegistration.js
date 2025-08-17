import { useEffect } from "react";
import { socket } from "./socket"; // shared socket instance
import toast from "react-hot-toast";

const useSocketRegistration = (OPH_ID) => {
  useEffect(() => {
    if (!OPH_ID) {
      console.warn("No OPH_ID provided to socket registration.");
      return;
    }

    console.log("Preparing to register socket with OPH_ID:", OPH_ID);

    const registerIfConnected = () => {
      socket.emit("register", OPH_ID.trim());
      console.log("Socket registered with OPH_ID:", OPH_ID);
    };

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      registerIfConnected();
    });

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
    };

    socket.on("Music-update", handleTicketUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("connect", registerIfConnected);
      socket.off("ticket-updated", handleTicketUpdate);
    };
  }, [OPH_ID]);
};

export default useSocketRegistration;
