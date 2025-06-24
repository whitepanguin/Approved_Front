"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import FloatingDictButton from "../FloatingDictButton/FloatingDictButton";

interface MainLayoutProps {
  children: React.ReactNode;
  introPassed: boolean;
}

export default function MainLayout({
  children,
  introPassed = true,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div id="sidemain" className={sidebarOpen ? "shifted" : ""}>
        {introPassed && <Header onMenuClick={() => setSidebarOpen(true)} />}
        {children}
        <FloatingDictButton />
      </div>
    </>
  );
}
