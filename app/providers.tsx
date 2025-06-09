"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AppContextType {
  user: any
  setUser: (user: any) => void
  searchHistory: string[]
  addToSearchHistory: (query: string) => void
  removeFromSearchHistory: (index: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within a Providers")
  }
  return context
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== query)
      return [query, ...filtered].slice(0, 10)
    })
  }

  const removeFromSearchHistory = (index: number) => {
    setSearchHistory((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        searchHistory,
        addToSearchHistory,
        removeFromSearchHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
