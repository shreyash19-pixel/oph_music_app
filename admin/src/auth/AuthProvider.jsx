import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { User } from "lucide-react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [headers, setHeaders] = useState(
    token ? { Authorization: `Bearer ${token}` } : null
  );

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    try {
      const decoded = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.log("Token expired on load");
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } else {
        setToken(storedToken);
        setUser(decoded);
        
      }
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }
  setLoading(false); 
  
}, []);


  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    const decoded = jwtDecode(jwtToken);
    setToken(jwtToken);
    setUser(decoded);

    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000 - Date.now();
      setTimeout(() => {
        logout();
      }, expirationTime);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setHeaders(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout,loading,headers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
