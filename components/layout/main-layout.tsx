"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import FloatingDictButton from "../FloatingDictButton/FloatingDictButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div id="sidemain" className={sidebarOpen ? "shifted" : ""}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {children}
        <FloatingDictButton />
      </div>
    </>
  );
}
