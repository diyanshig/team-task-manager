import { createContext, useContext, useState, useEffect } from "react";
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
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSavedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSavedUser());
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", {
      email,
      password
    });

    const normalizedUser = {
      ...data.user,
      _id: data.user._id || data.user.id
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("token", data.token);

    setUser(normalizedUser);

    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/api/auth/signup", {
      name,
      email,
      password
    });

    const normalizedUser = {
      ...data.user,
      _id: data.user._id || data.user.id
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("token", data.token);

    setUser(normalizedUser);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);