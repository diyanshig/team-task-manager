import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser || savedUser === "undefined" || savedUser === "null") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }

    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", {
      email,
      password
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/api/auth/signup", {
      name,
      email,
      password
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
  };

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