"use client";


import type React from "react";
import { useState, useEffect } from "react"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"
import { useApp } from "./providers"
import "@fortawesome/fontawesome-free/css/all.min.css";


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [introPassed, setIntroPassed] = useState(false)
  const { addToSearchHistory } = useApp()

  useEffect(() => {
    const stored = sessionStorage.getItem("introPassed")
    if (stored === "true") {
      setIntroPassed(true)
      document.body.style.overflow = "auto"
    } else {
      window.scrollTo(0, 0)
      document.body.style.overflow = "hidden"
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = introPassed ? "auto" : "hidden"
  }, [introPassed])

  const handleStart = () => {
    const mainSection = document.getElementById("main")
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: "smooth" })
      setTimeout(() => {
        sessionStorage.setItem("introPassed", "true")
        setIntroPassed(true)
      }, 1000)
    }
  }

  const handleSearch = (type: "ai" | "normal") => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      alert(`${type === "ai" ? "AI" : "일반"} 검색: ${searchQuery}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {

      const mainSection = document.getElementById("main")
      if (mainSection) {
        mainSection.scrollIntoView({ behavior: "smooth" })
        if (searchQuery.trim()) {
          addToSearchHistory(searchQuery)
        }
      }

    }
  };

  return (
    <>
      {!introPassed && (
        <div
          id="intro"
          className="relative h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat px-10"
          style={{
            backgroundImage: `url("https://img.freepik.com/premium-photo/businesswoman-male-lawyer-judge-consult-having-team-meeting-with-client_28283-995.jpg?w=740")`,
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50 z-0" />
          <div className="relative z-10 flex w-full max-w-7xl justify-between items-center text-white">
            <div className="flex flex-col max-w-7xl items-start gap-5">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
                alt="허가요 로고"
                className="w-28 h-28 mb-2"
              />
              <h1 className="text-3xl md:text-4xl font-bold">
                대한민국 인허가 정보 플랫폼 <br />
                <span className="text-blue-400">허가요</span>
              </h1>
              <button
                onClick={handleStart}
                className="mt-6 px-6 py-3 border border-white text-white rounded-full shadow-lg hover:bg-white hover:text-black transition bg-transparent"
              >
                ↓ 시작하기
              </button>
            </div>
            <div className="flex flex-col gap-4 text-right">
              <div className="px-4 py-2 bg-white/20 rounded-full text-base font-semibold shadow-md backdrop-blur-sm">
                정부 공식 데이터 기반
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-base font-semibold shadow-md backdrop-blur-sm">
                실시간 업데이트
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-base font-semibold shadow-md backdrop-blur-sm">
                AI 기반 정확한 검색
              </div>
            </div>
          </div>
        </div>
      )}

      <MainLayout>
        <div id="main" className="w-full h-screen overflow-hidden max-w-5xl mx-auto flex flex-col items-center justify-center px-5 -translate-y-10">
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
                  alt="허가요 로고"
                  className="w-14 h-14 object-contain"
                />
                <h1 className="text-3xl font-bold text-gray-800 mt-2"><span className="text-blue-600">허가요</span></h1>
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap mt-2">
                대한민국 인허가 정보 통합 검색 플랫폼
              </div>
            </div>

            <div className="w-full max-w-6xl flex items-center gap-4 mb-4">
              <div className="flex-1 flex items-center rounded-full shadow-lg overflow-hidden">
                <div className="px-4">
                  <i className="fas fa-search text-blue-600"></i>
                </div>
                <input
                  type="text"
                  placeholder="궁금한 것을 검색해보세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 py-4 pr-4 outline-none border-none text-base"
                />
              </div>
              {/* ✅ 지도 버튼을 아이콘으로 변경 */}
              <Link
                href="/map"
                className="h-[56px] px-5 py-3 bg-blue-600 text-white text-sm rounded-full shadow hover:bg-blue-700 whitespace-nowrap flex items-center justify-center"
              >
                <i className="fas fa-map-marked-alt text-white text-lg"></i>
              </Link>

            </div>
            <div className="w-full max-w-6xl flex justify-start items-center">
              <Link
                href="/popular"
                className="flex items-center gap-2 px-4 py-2 bg-blue-10 border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow hover:bg-blue-100 transition"
              >
                <i className="fas fa-fire text-red-500"></i>
                지금 인기있는 법률 검색어
              </Link>


            </div>
          </div>
        </div>

      </MainLayout>
    </>
  )

}
