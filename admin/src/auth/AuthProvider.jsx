import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = token ? { Authorization: `Bearer ${token}` } : null;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken && typeof storedToken === "string" && storedToken.split(".").length === 3) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          setUser(decoded);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  const login = (jwtToken) => {
    if (!jwtToken || typeof jwtToken !== "string" || jwtToken.split(".").length !== 3) {
      console.error("Invalid token received:", jwtToken);
      return;
    }

    localStorage.setItem("token", jwtToken);

    const decoded = jwtDecode(jwtToken);
    setToken(jwtToken);
    setUser(decoded);

    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000 - Date.now();
      setTimeout(logout, expirationTime);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, headers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
