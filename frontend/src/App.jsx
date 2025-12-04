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
    // Check if we should redirect to origin domain
    // This will automatically redirect users back to their original domain
    // when they navigate away from auth routes on .org
    if (shouldRedirectToOrigin()) {
      const originUrl = getOriginUrl(location.pathname);
      if (originUrl) {
        // Use replace to avoid adding to history
        window.location.replace(originUrl);
      }
    }
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
