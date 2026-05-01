import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

// ✅ Safe parser (prevents "undefined" crash)
const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return null;

    const trimmed = savedUser.trim();

    if (trimmed === "undefined" || trimmed === "null") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }

    return JSON.parse(trimmed);
  } catch (error) {
    console.error("Error parsing user:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", data);

      // ✅ Save user safely
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }

      // ✅ Save token safely
      if (data?.token) {
        localStorage.setItem("token", data.token);
      } else {
        localStorage.removeItem("token");
      }

      return data; // ✅ VERY IMPORTANT
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // ✅ SIGNUP
  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/signup", {
        name,
        email,
        password
      });

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};