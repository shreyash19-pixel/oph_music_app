import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ArtistProvider } from "./pages/auth/API/ArtistContext";
import DashboardRoutes from "./routes/DashboardRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import Error from "./pages/Error";
import { Navigate } from "react-router-dom";
import NavRoutes from "./routes/NavRoutes";
import ScrollToTop from "./utils/ScrollTop";
import React from "react";
// import NotFound from "./pages/error/NotFound";
// import Unauthorized from "./pages/error/Unauthorized";

const App = () => {

  return (
    <Router>
      <ArtistProvider>
        <ScrollToTop />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
          
          {/* Website Routes */}
          <Route path="/*" element={<NavRoutes />} />

          {/* Redirect root to /auth */}
          <Route path="/" element={<Navigate to="/auth" />} />

          {/* Fallback error */}
          <Route path="*" element={<Error />} />
        </Routes>
      </ArtistProvider>
    </Router>
    
  );
};

export default App;
