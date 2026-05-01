import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();


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

  
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", data);

      if (data?.user) {
        // 🔥 FIX: Normalize user structure
        const normalizedUser = {
          ...data.user,
          _id: data.user._id || data.user.id, // FIX ID ISSUE
          role: data.user.role?.toLowerCase() // FIX ROLE CONSISTENCY
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      } else {
        localStorage.removeItem("token");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  
  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/signup", {
        name,
        email,
        password
      });

      if (data?.user) {
        // 🔥 FIX: Normalize user structure
        const normalizedUser = {
          ...data.user,
          _id: data.user._id || data.user.id,
          role: data.user.role?.toLowerCase()
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);
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


export const useAuth = () => {
  return useContext(AuthContext);
};