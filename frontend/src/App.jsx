import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { ArtistProvider } from "./pages/auth/API/ArtistContext";
import DashboardRoutes from "./routes/DashboardRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import Error from "./pages/Error";
import { Navigate } from "react-router-dom";
import NavRoutes from "./routes/NavRoutes";
import ScrollToTop from "./utils/ScrollTop";
import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { shouldRedirectToOrigin, getOriginUrl } from "./utils/domainManager";
// import NotFound from "./pages/error/NotFound";
// import Unauthorized from "./pages/error/Unauthorized";

const DomainRedirectHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check immediately on mount and route change
    const checkAndRedirect = () => {
      if (shouldRedirectToOrigin()) {
        const originUrl = getOriginUrl();
        console.log('Redirecting to origin domain:', originUrl);
        if (originUrl) {
          // Use replace to avoid adding to history
          window.location.replace(originUrl);
          return true; // Indicates redirect is happening
        }
      }
      return false;
    };
    
    // Check immediately
    if (checkAndRedirect()) {
      return; // Redirect is happening, don't set up timer
    }
    
    // Also check after a small delay (in case React Router hasn't finished)
    const timer = setTimeout(() => {
      checkAndRedirect();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return null;
};

const App = () => {

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <ArtistProvider>
        <ScrollToTop />
        <DomainRedirectHandler />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard/*" element={<DashboardRoutes />} />

          {/* Website Routes */}
          <Route path="/*" element={<NavRoutes />} />

          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" />} />

          {/* Fallback error */}
          <Route path="*" element={<Error />} />
        </Routes>
      </ArtistProvider>
    </Router>
  );
};

export default App;
