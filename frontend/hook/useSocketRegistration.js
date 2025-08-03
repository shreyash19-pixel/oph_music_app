// useSocketRegistration.js
import { useEffect } from "react";
import { socket } from "./socket"; // shared socket instance

const useSocketRegistration = (ophId) => {
  useEffect(() => {
    console.log("register from socket",ophId);
    
    const registerIfPossible = () => {
      if (ophId) {
        socket.emit("register", ophId);
        console.log("Socket registered with ophId:", ophId);
      }
    };

    if (socket.connected) {
      registerIfPossible();
    } else {
      socket.once("connect", registerIfPossible); // wait until connected
    }

    // Optional: cleanup any pending listeners
    return () => {
      socket.off("connect", registerIfPossible);
    };
  }, [ophId]);
};

export default useSocketRegistration;
