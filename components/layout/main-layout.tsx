"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import FloatingDictButton from "../FloatingDictButton/FloatingDictButton";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode | React.ReactNode[];
  introPassed?: boolean;
  hideFooter?: boolean;
}

export default function MainLayout({
  children,
  introPassed = true,
  hideFooter = false,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        id="sidemain"
        className={`min-h-screen flex flex-col ${sidebarOpen ? "shifted" : ""}`}
      >
        {introPassed && <Header onMenuClick={() => setSidebarOpen(true)} />}
        {children}
        {/* ✅ 핵심 */}
        <FloatingDictButton />
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}
