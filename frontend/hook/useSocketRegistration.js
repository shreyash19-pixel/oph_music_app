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

    // 🔔 Listen for ticket-updated event from backend
    const handleTicketUpdate = () => {
      console.log("Received ticket-updated event:", );

      toast.success(`Audio for your song is accepted\n`, {
        duration: 10000,
        icon: "",
      });
    };

    socket.on("ticket-updated", handleTicketUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("connect", registerIfConnected);
      socket.off("ticket-updated", handleTicketUpdate);
    };
  }, [OPH_ID]);
};

export default useSocketRegistration;
