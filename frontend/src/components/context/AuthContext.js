import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Add user state

  // Simple logout function - NO navigation
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUser(null);
  };

  // Check if token exists (simple check)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    
    if (token) {
      setIsLoggedIn(true);
      // Parse user data if available
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      } else if (role) {
        // Fallback: create basic user object from role
        setUser({ role });
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    
    setLoading(false);
  }, []); // Only run ONCE on mount

  const login = (token, userData = null) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.role) {
        localStorage.setItem("role", userData.role);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      login, 
      logout, 
      loading,
      user // Make sure user is included in the context value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create and export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};