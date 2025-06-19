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

        {loading && <p className="text-gray-600">불러오는 중...</p>}

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
    </MainLayout>
  );
}
