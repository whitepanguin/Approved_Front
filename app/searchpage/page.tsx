"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, setUserStatus } from "@/modules/user";

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  // 필요시 다른 필드도 추가
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, isLogin } = useSelector(
    (state: RootState) => state.user || {}
  );

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/searchllm?search=${encodeURIComponent(
            query
          )}&email=${currentUser.email}`
        );
        if (!res.ok) throw new Error("검색 실패");
        const data = await res.json();
        console.log(data);
        setResults([data]);
      } catch (error) {
        console.error("에러 발생:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">
          🔍 <span className="text-blue-600">"{query}"</span> 검색 결과
        </h1>

        {/* :펭귄: 수정된 부분: 허가요 로고가 점들을 징검다리 건너는 로딩 애니메이션 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-80 h-20 mb-4">
              {/* 징검다리 점들 */}
              <div className="absolute top-1/2 left-0 w-full flex justify-between items-center">
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  style={{ animation: "dotPulse 2s ease-in-out infinite" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  style={{ animation: "dotPulse 2s ease-in-out infinite 0.3s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  style={{ animation: "dotPulse 2s ease-in-out infinite 0.6s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  style={{ animation: "dotPulse 2s ease-in-out infinite 0.9s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  style={{ animation: "dotPulse 2s ease-in-out infinite 1.2s" }}
                ></div>
              </div>
              {/* 허가요 로고 */}
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
                alt="허가요 로고"
                className="absolute w-12 h-12 object-contain"
                style={{
                  animation: "logoJump 2s ease-in-out infinite",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
            <p className="text-blue-600 font-medium text-lg animate-pulse">
              허가요가 열심히 검색하고 있어요...
            </p>
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        )}

        <ul className="space-y-4">
          {results.map((item) => (
            <li
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                질문: {item.question}
              </h2>
              <p className="text-sm text-gray-600 mt-1">답변: {item.result}</p>
              <p className="text-xs text-gray-400 mt-2">
                생성일: {item.createdAt}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {/* :펭귄: 수정된 부분: 징검다리 애니메이션을 위한 CSS 추가 */}
      <style jsx>{`
        @keyframes dotPulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        @keyframes logoJump {
          0% {
            left: 0%;
            transform: translateY(-50%) translateX(0) rotate(0deg);
          }
          12.5% {
            left: 12.5%;
            transform: translateY(-70%) translateX(-50%) rotate(-10deg);
          }
          25% {
            left: 25%;
            transform: translateY(-50%) translateX(-50%) rotate(0deg);
          }
          37.5% {
            left: 37.5%;
            transform: translateY(-70%) translateX(-50%) rotate(10deg);
          }
          50% {
            left: 50%;
            transform: translateY(-50%) translateX(-50%) rotate(0deg);
          }
          62.5% {
            left: 62.5%;
            transform: translateY(-70%) translateX(-50%) rotate(-10deg);
          }
          75% {
            left: 75%;
            transform: translateY(-50%) translateX(-50%) rotate(0deg);
          }
          87.5% {
            left: 87.5%;
            transform: translateY(-70%) translateX(-50%) rotate(10deg);
          }
          100% {
            left: 100%;
            transform: translateY(-50%) translateX(-100%) rotate(0deg);
          }
        }
      `}</style>
    </MainLayout>
  );
}
