"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../store";

interface AppContextType {
  user: any;
  setUser: (user: any) => void;
  userStatus: boolean;
  setUserStatus: (status: boolean) => void;
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  removeFromSearchHistory: (index: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within a Providers");
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  const removeFromSearchHistory = (index: number) => {
    setSearchHistory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ReduxProvider store={store}>
      <AppContext.Provider
        value={{
          user,
          setUser,
          userStatus,
          setUserStatus,
          searchHistory,
          addToSearchHistory,
          removeFromSearchHistory,
        }}
      >
        {children}
      </AppContext.Provider>
    </ReduxProvider>
  );
}
