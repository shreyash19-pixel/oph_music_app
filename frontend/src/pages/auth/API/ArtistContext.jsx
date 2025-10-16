import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import useSocketRegistration from "../../../../hook/useSocketRegistration";

const ArtistContext = createContext();

export const ArtistProvider = ({ children }) => {
  console.log("sdhsaddh");
  
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [headers, setHeaders] = useState(
    token ? { Authorization: `Bearer ${token}` } : null
  );
  const [ophid, setOphid] = useState(null);
  const [user, setUser] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Decode token and extract artist ID
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (!decoded?.email) throw new Error("Invalid token");

        setUser(decoded);
        const id = decoded.userData?.artist?.id;
        console.log(id);

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

  useEffect(() => {
    console.log("👤 User state changed:", user);
    console.log(ophid);
  }, [user]);

  useSocketRegistration(ophid, () => setHasNewNotification(true));
  // Validate token on mount and redirect if needed
  useEffect(() => {
    const verifyToken = () => {
      console.groupCollapsed("[Auth] verifyToken");
      console.time("verifyToken");
      const rawPathname = window.location.pathname;
      // normalize: strip trailing slashes for consistent matching
      const normalizedPathname = rawPathname.replace(/\/+$/, "") || "/";
      console.log(
        "pathname:",
        rawPathname,
        "-> normalized:",
        normalizedPathname
      );
      const storedToken = localStorage.getItem("token");
      console.log("token:", storedToken);

      if (
        !storedToken ||
        storedToken === "undefined" ||
        storedToken === "null"
      ) {
        console.log("No valid token found");
        const openRoutes = [
          "/home",
          "/auth/login",
          "/auth/signup",
          "/auth/forgot-password",
          "/auth/payment",
          "/auth/signin",
          "/auth/signup/payment-callback",
          "/auth/reset-password",
          "/events/online-music-events",
          "/contact",
          "/leaderboard",
          "/leaderboard/top-music-networking-platform-for-creators",
          "/resources/music-learning-education",
          "/find-your-collaborator",
          "/public-artist-detail",
          "/content/:id",
          "/success",
          "/privacy-policy",
          "/cancellation-policy",
          "/disclaimer",
          "/refund-policy",
          "/terms-and-conditions",
        ];

        // normalize open routes (strip trailing slashes)
        const openRoutesNormalized = openRoutes.map(
          (r) => r.replace(/\/+$/, "") || "/"
        );
        console.log("openRoutes count:", openRoutesNormalized.length);
        const isOpen = openRoutesNormalized.includes(normalizedPathname);
        console.log("routeIsOpen:", isOpen);

        if (!isOpen) {
          console.warn(
            "Route not open. Scheduling redirect to /auth/login in 1500ms"
          );
          setTimeout(() => {
            console.warn("Redirecting now: /auth/login");
            logout();
            navigate("/auth/login");
          }, 1500);
        } else {
          console.log("Route is open, no redirect needed");
        }
        console.timeEnd("verifyToken");
        console.groupEnd();
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
        console.warn("Scheduling logout redirect in 1500ms due to token error");
        setTimeout(() => {
          logout();
        }, 3000);
      }
      console.timeEnd("verifyToken");
      console.groupEnd();
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
        navigate("/auth/profile-status", { state: { status: "success" } });
        break;
      case 4:
        navigate("/dashboard");
        break;
      case 5:
        navigate("/auth/profile-status", { state: { status: "rejected" } });
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
    console.groupCollapsed("[Auth] logout");
    console.log("Clearing auth & scheduling navigation in 500ms");
    localStorage.removeItem("token");
    setToken(null);
    setHeaders(null);
    setUser(null);
    setOphid(null);
    setTimeout(() => {
      console.log("Navigating to /auth/login now");
      navigate("/auth/login");
      // Give the console a moment to flush logs before reload
      setTimeout(() => window.location.reload(), 200);
    }, 500);
    console.groupEnd();
  };

  return (
    <ArtistContext.Provider
      value={{
        logout,
        login,
        headers,
        ophid,
        user,
        hasNewNotification,
        setHasNewNotification,
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtist = () => useContext(ArtistContext);
