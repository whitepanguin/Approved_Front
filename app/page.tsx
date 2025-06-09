"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"
import { useApp } from "./providers"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { addToSearchHistory } = useApp()

  const handleSearch = (type: "ai" | "normal") => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery)
      alert(`${type === "ai" ? "AI" : "일반"} 검색: ${searchQuery}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch("ai")
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-5 max-w-4xl mx-auto">
        <div className="w-24 h-24 flex items-center justify-center mb-5">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
            alt="허가요 펭귄 로고"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold mb-2 text-gray-800">허가요</h1>

        <div className="text-center mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold text-blue-600 mb-6 leading-relaxed">
            대한민국 인허가 정보 통합 검색 플랫폼
          </h2>

          <div className="flex justify-center gap-8 mb-5 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-600">
              <i className="fas fa-shield-alt text-base"></i>
              <span>정부 공식 데이터 기반</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-600">
              <i className="fas fa-clock text-base"></i>
              <span>실시간 업데이트</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-600">
              <i className="fas fa-search text-base"></i>
              <span>AI 기반 정확한 검색</span>
            </div>
          </div>

          <p className="text-base text-gray-600 font-normal leading-relaxed">
            신뢰할 수 있는 인허가 정보를 빠르고 정확하게 제공합니다
          </p>
        </div>

        <div className="w-full max-w-2xl relative mb-5">
          <i className="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-600"></i>
          <input
            type="text"
            placeholder="궁금한 것을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full py-4 pl-12 pr-5 rounded-full border-none shadow-lg text-base outline-none"
          />
        </div>

        <div className="flex gap-5 w-full max-w-4xl">
          <Link href="/popular" className="w-1/2">
            <div className="bg-white rounded-xl p-6 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center h-full">
              <i className="fas fa-chart-line text-blue-600 text-3xl mb-4"></i>
              <h3 className="text-lg mb-2 text-gray-800">가장 많이 검색한 인허가 사항</h3>
              <p className="text-sm text-gray-600">자주 찾는 인허가 정보를 확인하세요</p>
            </div>
          </Link>

          <Link href="/map" className="w-1/2">
            <div className="bg-white rounded-xl p-6 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center h-full">
              <i className="fas fa-map-marked-alt text-blue-600 text-3xl mb-4"></i>
              <h3 className="text-lg mb-2 text-gray-800">지도</h3>
              <p className="text-sm text-gray-600">지역별 인허가 정보를 확인하세요</p>
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
