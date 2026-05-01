import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

// ✅ Safe parser (bulletproof)
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
    const { data } = await api.post("/api/auth/login", {
      email,
      password
    });

    // ✅ Safe storage
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      localStorage.removeItem("user");
    }

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    setUser(data.user || null);
  };

  // ✅ SIGNUP
  const signup = async (name, email, password) => {
    const { data } = await api.post("/api/auth/signup", {
      name,
      email,
      password
    });

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      localStorage.removeItem("user");
    }

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    setUser(data.user || null);
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};