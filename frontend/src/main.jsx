import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { checkDomainAndRedirect } from "./utils/domainRedirect";
import { shouldRedirectToOrigin, getOriginUrl } from "./utils/domainManager";

// Check domain and redirect before React renders
if (checkDomainAndRedirect()) {
  // If redirect is happening, don't render React
  // The page will navigate away
} else {
  // Also check if we should redirect to origin domain (for users on .org)
  if (shouldRedirectToOrigin()) {
    const originUrl = getOriginUrl(window.location.pathname);
    if (originUrl) {
      console.log('Redirecting to origin domain on page load:', originUrl);
      window.location.replace(originUrl);
    } else {
      // No redirect, render normally
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
  } else {
    // No redirect needed, render normally
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
}
