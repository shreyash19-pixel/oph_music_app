import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const ArtistContext = createContext();

export const ArtistProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [headers, setHeaders] = useState(
    token ? { Authorization: `Bearer ${token}` } : null
  );
  const [ophid, setOphid] = useState(null);
  const [user, setUser] = useState(null);


  // Decode token and extract artist ID
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        if (!decoded?.email) throw new Error("Invalid token");

        setUser(decoded);
        const id = decoded.userData?.artist?.id;
        if (id) {
          setOphid(id);
        }
      } catch (err) {
        console.error("Failed to decode token", err);
        logout();
      }
    }
  }, [token]);

  // Sync headers when token changes
  useEffect(() => {
    if (token) {
      setHeaders({ Authorization: `Bearer ${token}` });
    } else {
      setHeaders(null);
    }
  }, [token]);

  // Validate token on mount and redirect if needed
  useEffect(() => {
    const verifyToken = () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken || storedToken === "undefined" || storedToken === "null") {
        const openRoutes = [
          "/auth/login",
          "/auth/signup",
          "/auth/forgot-password",
          "/auth/payment",
          "/auth/signin",
          "/auth/signup/payment-callback",
          "/auth/reset-password",
          "/resources/music-learning-education",
        ];

        if (!openRoutes.includes(window.location.pathname)) {
          navigate("/auth/login");
        }
        return;
      }

      try {
        const decodedToken = jwtDecode(storedToken);
        if (!decodedToken?.email) {
          throw new Error("Invalid token");
        }

        // Optional: check token expiry
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
          console.warn("Token expired");
          logout();
          return;
        }

        setToken((prev) => (prev === storedToken ? prev : storedToken));
        setUser(decodedToken);
      } catch (error) {
        console.error("Token validation error:", error);
        logout();
      }
    };

    verifyToken();
  }, [navigate]);

  const redirectBasedOnStatus = (status) => {
    switch (status) {
      case 0:
        navigate("/auth/create-profile/personal-details");
        break;
      case 1:
        navigate("/auth/create-profile/professional-details");
        break;
      case 2:
        navigate("/auth/create-profile/documentation-details");
        break;
      case 3:
        navigate("/auth/profile-status?status=success");
        break;
      case 4:
        navigate("/dashboard");
        break;
      case 5:
        navigate("/auth/profile-status?status=rejected");
        break;
      default:
        navigate("/auth/login");
    }
  };

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (!decoded?.email) {
        throw new Error("Invalid token");
      }

      localStorage.setItem("token", token);
      setToken(token);
      // setUser and ophid will be handled in the useEffect
    } catch (error) {
      console.error("Login error:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setHeaders(null);
    setUser(null);
    setOphid(null);
    navigate("/auth/login");
    window.location.reload(); // optional, depending on your flow
  };

  return (
    <ArtistContext.Provider value={{ logout, login, headers, ophid, user}}>
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtist = () => useContext(ArtistContext);
