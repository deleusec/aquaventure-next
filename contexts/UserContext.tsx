"use client";

import { createContext, useContext, useState } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  media?: { url: string }[];
  initializeUser: () => void;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (updatedUser: User) => void;
  initializeUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const initializeUser = () => {
    fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, initializeUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
