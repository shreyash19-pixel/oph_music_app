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
    const pathAndSearch = `${location.pathname}${location.search}`;

    const checkAndRedirect = () => {
      if (!shouldRedirectToOrigin()) return false;
      // Pass explicit path+search from React Router (not window) so it matches the
      // navigation intent; include `location.search` in deps so repeat visits with
      // different ?artist= re-run and the delayed check does not use a stale URL.
      const originUrl = getOriginUrl(pathAndSearch);
      console.log("Redirecting to origin domain:", originUrl);
      if (originUrl) {
        window.location.replace(originUrl);
        return true;
      }
      return false;
    };

    if (checkAndRedirect()) {
      return undefined;
    }

    const timer = setTimeout(() => {
      checkAndRedirect();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

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
