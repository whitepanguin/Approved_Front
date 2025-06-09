"use client"

import type React from "react"

import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div id="main" className={sidebarOpen ? "shifted" : ""}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
    </>
  )
}
