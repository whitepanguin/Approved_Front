"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "./providers";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import IntroPreview from "./IntroPreview";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [introPassed, setIntroPassed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [count, setCount] = useState<number>(0);
  const { addToSearchHistory } = useApp();
  const router = useRouter();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    {
      title: "건축법",
      href: "https://www.law.go.kr/DRF/lawService.do?OC=kom6381&target=law&MST=261475&type=HTML&mobileYn=&efYd=20240627",
    },
    {
      title: "식품위생법",
      href: "https://www.law.go.kr/DRF/lawService.do?OC=kom6381&target=law&MST=270311&type=HTML&mobileYn=&efYd=20250401",
    },
    {
      title: "공중위생관리법",
      href: "https://www.law.go.kr/DRF/lawService.do?OC=kom6381&target=law&MST=265873&type=HTML&mobileYn=&efYd=20250423",
    },
    {
      title: "약사법",
      href: "https://www.law.go.kr/DRF/lawService.do?OC=kom6381&target=law&MST=217283&type=HTML&mobileYn=&efYd=20250408",
    },
    {
      title: "도로교통법",
      href: "https://www.law.go.kr/DRF/lawService.do?OC=kom6381&target=law&MST=266639&type=HTML&mobileYn=&efYd=20250604",
    },
  ];

  useEffect(() => {
    const stored = sessionStorage.getItem("introPassed");
    if (!stored) {
      sessionStorage.setItem("introPassed", "false");
    } else if (stored === "true") {
      setIntroPassed(true);
      document.body.style.overflow = "auto";
    } else {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = introPassed ? "auto" : "hidden";
  }, [introPassed]);

  useEffect(() => {
    if (!introPassed) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % 3); // steps.length = 3
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [introPassed]);

  const handleStart = () => {
    const mainSection = document.getElementById("main");
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        sessionStorage.setItem("introPassed", "true");
        setIntroPassed(true);
      }, 1000);
    }
  };

  const handleClick = () => {
    if (!isLogin) {
      alert("로그인 후 이용해주세요.");
      router.push("/login");
      return;
    }

    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      router.push(
        `/searchpage?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!isLogin) {
        alert("로그인 후 이용해주세요.");
        router.push("/login");
        return;
      }

      if (searchQuery.trim()) {
        addToSearchHistory(searchQuery);
        router.push(
          `/searchpage?search=${encodeURIComponent(searchQuery.trim())}`
        );
      }
    }
  };

  useEffect(() => {
    const getcount = async () => {
      try {
        const res = await fetch("http://localhost:8000/searchllm/count", {
          method: "GET",
        });

        const data = await res.json();
        setCount(data.count);
        // console.log(data);
      } catch (error) {
        console.error("실패:", error);
      }
    };

    getcount();
  }, []);

  return (
    <>
      {!introPassed && (
        <IntroPreview onStart={handleStart} currentStep={currentStep} />
      )}

      <MainLayout introPassed={introPassed}>
        {/* 🎨 배경 래퍼 추가 - 여기가 새로 추가된 부분입니다! */}
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 relative overflow-hidden ">
          {/* 동적 배경 요소들 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[99]">
            {/* 떠다니는 문서 아이콘들 - 📄 크기 증가 (w-8 h-8 → w-12 h-12, opacity-20 → opacity-35) */}
            <div
              className="absolute top-20 left-10 text-blue-200 opacity-35 animate-bounce"
              style={{ animationDuration: "3s", animationDelay: "0s" }}
            >
              <svg
                className="w-12 h-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>

            {/* 📄 크기 증가 (w-10 h-10 → w-14 h-14, opacity-15 → opacity-30) */}
            <div
              className="absolute top-32 right-20 text-indigo-200 opacity-30 animate-bounce"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            >
              <svg
                className="w-14 h-14"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16,9H8V7H16M16,13H8V11H16M16,17H8V15H16M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V4A2,2 0 0,0 18,2H6Z" />
              </svg>
            </div>

            {/* 📄 크기 증가 (w-6 h-6 → w-10 h-10, opacity-25 → opacity-40) */}
            <div
              className="absolute bottom-32 left-20 text-slate-300 opacity-40 animate-bounce"
              style={{ animationDuration: "5s", animationDelay: "2s" }}
            >
              <svg
                className="w-10 h-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9,4V6H15V4H17V6H19A2,2 0 0,1 21,8V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V8A2,2 0 0,1 5,6H7V4H9M5,10V18H19V10H5M7,12H9V14H7V12M11,12H13V14H11V12M15,12H17V14H15V12Z" />
              </svg>
            </div>

            {/* 움직이는 데이터 플로우 점들 - 💫 크기와 진하기 증가 */}
            <div className="absolute top-1/4 left-1/4">
              <div
                className="w-6 h-6 bg-blue-400 rounded-full opacity-60 animate-ping"
                style={{ animationDuration: "2s" }}
              ></div>
            </div>
            <div className="absolute top-1/3 right-1/3">
              <div
                className="w-8 h-8 bg-indigo-400 rounded-full opacity-55 animate-ping"
                style={{ animationDuration: "3s", animationDelay: "0.5s" }}
              ></div>
            </div>
            <div className="absolute bottom-1/4 right-1/4">
              <div
                className="w-6 h-6 bg-slate-500 rounded-full opacity-50 animate-ping"
                style={{ animationDuration: "4s", animationDelay: "1s" }}
              ></div>
            </div>
            <div className="absolute top-1/5 left-1/2">
              <div
                className="w-7 h-7 bg-purple-400 rounded-full opacity-45 animate-ping"
                style={{ animationDuration: "5s", animationDelay: "1.5s" }}
              ></div>
            </div>
            <div className="absolute bottom-1/5 left-1/3">
              <div
                className="w-5 h-5 bg-cyan-400 rounded-full opacity-50 animate-ping"
                style={{ animationDuration: "3.5s", animationDelay: "2s" }}
              ></div>
            </div>

            {/* 🌟 글씨 동그라미 커지면서 사라지고 다시 커지는 효과 추가 - 여기가 수정된 부분입니다! */}
            <div
              className="absolute top-40 left-1/3 text-lg text-blue-500 opacity-70 font-bold"
              style={{
                animation: "textPulse 6s ease-in-out infinite",
                animationDelay: "0s",
              }}
            >
              법령
            </div>
            <div
              className="absolute top-60 right-1/4 text-lg text-indigo-500 opacity-65 font-bold"
              style={{
                animation: "textPulse 7s ease-in-out infinite",
                animationDelay: "1s",
              }}
            >
              인허가
            </div>
            <div
              className="absolute bottom-40 left-1/4 text-lg text-slate-600 opacity-60 font-bold"
              style={{
                animation: "textPulse 8s ease-in-out infinite",
                animationDelay: "2s",
              }}
            >
              규정
            </div>
            <div
              className="absolute top-1/2 right-1/5 text-lg text-purple-500 opacity-65 font-bold"
              style={{
                animation: "textPulse 9s ease-in-out infinite",
                animationDelay: "3s",
              }}
            ></div>
            <div
              className="absolute bottom-1/3 right-1/3 text-lg text-blue-600 opacity-60 font-bold"
              style={{
                animation: "textPulse 10s ease-in-out infinite",
                animationDelay: "4s",
              }}
            >
              신청
            </div>
            <div
              className="absolute top-1/6 right-1/2 text-lg text-green-500 opacity-55 font-bold"
              style={{
                animation: "textPulse 11s ease-in-out infinite",
                animationDelay: "5s",
              }}
            >
              법률
            </div>

            {/* 기하학적 도형들 - 🔄 크기 증가 (w-16 h-16 → w-24 h-24, opacity-10 → opacity-20) */}
            <div
              className="absolute top-16 right-16 w-32 h-32 border-2 border-blue-300 opacity-30 animate-spin"
              style={{
                animationDuration: "15s",
                animationIterationCount: "infinite",
                animationTimingFunction: "linear",
              }}
            ></div>
            <div
              className="absolute bottom-20 left-16 w-28 h-28 border-2 border-indigo-300 opacity-35 animate-spin"
              style={{
                animationDuration: "20s",
                animationIterationCount: "infinite",
                animationTimingFunction: "linear",
                animationDirection: "reverse",
              }}
            ></div>
            <div
              className="absolute top-1/3 left-1/5 w-24 h-24 border border-purple-300 opacity-25 rounded-full animate-spin"
              style={{
                animationDuration: "25s",
                animationIterationCount: "infinite",
                animationTimingFunction: "linear",
              }}
            ></div>

            {/* 연결선들 - 🌊 진하기 증가 (opacity-5 → opacity-10) */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="dots"
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="50" cy="50" r="2" fill="#3b82f6" opacity="0.5">
                    <animate
                      attributeName="r"
                      values="1;4;1"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />

              <path
                d="M100,200 Q300,100 500,300 T900,200"
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                opacity="0.2"
              >
                <animate
                  attributeName="stroke-dasharray"
                  values="0,1000;1000,0;0,1000"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M200,400 Q400,300 600,500 T1000,400"
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                opacity="0.2"
              >
                <animate
                  attributeName="stroke-dasharray"
                  values="1000,0;0,1000;1000,0"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>

          <div
            id="main"
            className="relative w-full h-screen overflow-hidden max-w-5xl mx-auto flex flex-col items-center justify-center px-5 -translate-y-10 z-[99]"
          >
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-start mb-2 pl-[35px]">
                <div className="flex items-start gap-1">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
                    alt="허가요 로고"
                    className="w-14 h-14 object-contain"
                  />
                  <div className="flex items-baseline mt-2">
                    <h1 className="text-3xl font-bold text-gray-800 mt-[6px]">
                      <span className="text-blue-600">허가요</span>
                    </h1>
                    <div className="text-sm text-black-500 ml-[30px] whitespace-nowrap">
                      대한민국 인허가 정보 통합 검색 플랫폼
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-6xl flex items-center gap-4 mb-4">
                <div className="flex-1 flex items-center rounded-full shadow-lg overflow-hidden bg-white/95 backdrop-blur-sm border border-white/70">
                  <div className="px-4">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="궁금한 것을 검색해보세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 py-4 pr-4 outline-none border-none text-base bg-transparent"
                  />
                </div>
                <button
                  onClick={handleClick}
                  className="h-[56px] px-5 py-3 bg-blue-600 text-white text-sm rounded-full shadow-lg hover:bg-blue-700 whitespace-nowrap flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a8 8 0 105.293 14.293l4.707 4.707a1 1 0 001.414-1.414l-4.707-4.707A8 8 0 0010 2zm-6 8a6 6 0 1112 0 6 6 0 01-12 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full max-w-6xl flex justify-start items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-red-200 rounded-full text-red-700 text-sm font-medium shadow hover:bg-white transition"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                  </svg>
                  지금 인기있는 법률 검색어
                </button>

                {open && (
                  <div
                    ref={popupRef}
                    className="absolute left-8 bottom-[170px] mt-2 w-44 bg-white shadow-lg rounded-lg border border-gray-200 z-10"
                  >
                    <ul className="py-2">
                      {items.map((item) => (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setOpen(false)} // 또는 onMouseDown 가능
                          >
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-green-200 rounded-full text-green-700 text-sm font-medium shadow">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  총 검색수:
                  <span className="font-semibold">
                    {(count + 9900).toLocaleString()}
                  </span>
                </div>
                <Link
                  href="/community"
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow hover:bg-white transition"
                >
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.94 6.06l-2.5 6.14a1 1 0 01-.54.54l-6.14 2.5 2.5-6.14a1 1 0 01.54-.54l6.14-2.5z" />
                  </svg>
                  커뮤니티
                </Link>
                <Link
                  href="/map"
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow hover:bg-white transition"
                >
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.94 6.06l-2.5 6.14a1 1 0 01-.54.54l-6.14 2.5 2.5-6.14a1 1 0 01.54-.54l6.14-2.5z" />
                  </svg>
                  지도
                </Link>
                <Link
                  href="/mypage"
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow hover:bg-white transition"
                >
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.94 6.06l-2.5 6.14a1 1 0 01-.54.54l-6.14 2.5 2.5-6.14a1 1 0 01.54-.54l6.14-2.5z" />
                  </svg>
                  마이페이지
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

      {/* 🌟 글씨 애니메이션을 위한 CSS 추가 - 여기가 새로 추가된 부분입니다! */}
      <style jsx>{`
        @keyframes textPulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
