import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { checkDomainAndRedirect } from "./utils/domainRedirect";

// Check domain and redirect before React renders
if (checkDomainAndRedirect()) {
  // If redirect is happening, don't render React
  // The page will navigate away
} else {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
      <div className="z-[1000]">
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
      </div>
    </StrictMode>
  );
}
