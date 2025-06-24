"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ReactMarkdown from "react-markdown";

// 타입 정의
export type SearchResultType = {
  answer: string;
  referenced_laws: string[];
  reference_documents: {
    title: string;
    url: string;
  }[];
};

function getStorageKey(email: string, query: string) {
  return `search_result_${encodeURIComponent(email)}_${encodeURIComponent(
    query
  )}`;
}

// 결과 파싱 함수
function parseLLMTextToResult(raw: string): SearchResultType {
  const sections = raw.split(/\n(?=\d\. \*\*.+?\*\*)/);
  const map: Record<string, string> = {};

  for (const section of sections) {
    const match = section.match(/^(\d+)\. \*\*(.+?)\*\*/);
    if (match) {
      const rawKey = match[2].trim().toLowerCase().replace(/\s+/g, "_");
      const content = section.replace(match[0], "").trim();
      map[rawKey] = content;
    }
  }

  const answer = map["answer"] ?? "";

  const referenced_laws = (map["referenced_laws"] ?? "")
    .split("\n")
    .map((line) => line.replace(/^\* /, "").trim())
    .filter(Boolean);

  const reference_documents = (map["reference_documents"] ?? "")
    .split("\n")
    .map((line) => {
      // 시작 문자가 *, - 둘 다 허용됨
      const cleanLine = line.replace(/^[-*]\s*/, "").trim();

      // "관련 문서 보기:" 접두사 제거
      const cleaned = cleanLine.replace(/^관련 문서 보기[:：]?\s*/i, "");

      // 괄호 안에 제목이 있는 경우 (정상 케이스)
      const match = cleaned.match(/^(.+?)\s*\((.+?)\)$/);

      if (match) {
        const rawUrl = match[1].trim();
        const rawTitle = match[2].trim();
        const fullUrl = rawUrl.startsWith("http")
          ? rawUrl
          : `https://www.law.go.kr${
              rawUrl.startsWith("/") ? "" : "/"
            }${rawUrl}`;

        return {
          url: fullUrl,
          title: rawTitle,
        };
      }

      // 괄호가 없는 경우 fallback 처리
      const urlOnly = cleaned.trim();
      if (urlOnly.startsWith("/")) {
        return {
          url: `https://www.law.go.kr${urlOnly}`,
          title: "문서 보기",
        };
      }

      console.warn("❗ 파싱되지 않은 관련 문서 라인:", line);
      return null;
    })
    .filter(Boolean) as SearchResultType["reference_documents"];

  return {
    answer,
    referenced_laws,
    reference_documents,
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search") || "";
  const [results, setResults] = useState<SearchResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showLawsModal, setShowLawsModal] = useState(false);
  const [showDictModal, setShowDictModal] = useState(false);

  const { currentUser } = useSelector((state: RootState) => state.user || {});
  const email = currentUser?.email ?? "";

  useEffect(() => {
    if (!query.trim()) return;

    const storageKey = getStorageKey(email, query);
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("📦 캐시에서 검색 결과 로드됨:", storageKey);
        setResults(parsed);
        return;
      } catch (e) {
        console.warn("⚠️ 캐시 파싱 실패, 요청 강행:", e);
      }
    }

    // ❗ 캐시 없을 때만 요청
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/searchllm?search=${encodeURIComponent(
            query
          )}&email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            cache: "force-cache",
          }
        );
        if (!res.ok) throw new Error("검색 실패");

        const data = await res.json();
        const rawText = data.result;
        const normalized = parseLLMTextToResult(rawText);
        localStorage.setItem(storageKey, JSON.stringify(normalized));
        setResults(normalized);
      } catch (error) {
        console.error("에러 발생:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults(); // ✅ 호출 필요
  }, [query, email]);

  return (
    <MainLayout>
      <div className="w-full overflow-hidden h-full mt-5">
        <div className="mx-auto w-[650px] overflow-auto flex flex-col h-full gap-5">
          <SpeachBubble text={query} />

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-80 h-20 mb-4">
                <div className="absolute top-1/2 left-0 w-full flex justify-between items-center">
                  {[0, 0.3, 0.6, 0.9, 1.2].map((delay, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-3 bg-blue-400 rounded-full"
                      style={{
                        animation: `dotPulse 2s ease-in-out infinite ${delay}s`,
                      }}
                    ></div>
                  ))}
                </div>
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

          {!loading && results?.answer && (
            <SpeachBubble isAnswer text={results.answer} />
          )}

          {!loading && results && (
            <div className="ml-5 flex flex-wrap gap-2">
              <button
                onClick={() => setShowDocsModal(true)}
                className="px-3 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
              >
                📄 관련 문서 보기
              </button>
              <button
                onClick={() => setShowLawsModal(true)}
                className="px-3 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition"
              >
                📘 관련 법률 보기
              </button>
              <button
                onClick={() => setShowDictModal(true)}
                className="px-3 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
              >
                📚 단어 사전
              </button>
            </div>
          )}
        </div>
      </div>

      {showDocsModal && results && (
        <Modal
          title="📄 관련 문서 보기"
          onClose={() => setShowDocsModal(false)}
        >
          <ul className="list-disc list-inside text-sm text-gray-700">
            {results.reference_documents.map((doc, idx) => {
              console.log("📄 관련 문서 확인:", doc); // ✅ 추가

              return (
                <li key={idx}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-500 hover:text-blue-700"
                  >
                    {doc.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}

      {showLawsModal && results && (
        <Modal
          title="📘 관련 법률 보기"
          onClose={() => setShowLawsModal(false)}
        >
          <ul className="list-disc list-inside text-sm text-gray-700">
            {results.referenced_laws.map((law, idx) => (
              <li key={idx}>{law}</li>
            ))}
          </ul>
        </Modal>
      )}

      {showDictModal && (
        <Modal
          title="📚 법률 용어 사전"
          onClose={() => setShowDictModal(false)}
        >
          <p className="text-sm text-gray-700">
            <a
              href="https://www.law.go.kr/LSW/lsDefinitionList.do"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700"
            >
              👉 대한민국 법제처 법령용어사전 바로가기
            </a>
          </p>
        </Modal>
      )}

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

function SpeachBubble({
  text,
  isAnswer,
}: {
  text: string;
  isAnswer?: boolean;
}) {
  const className = [
    "rounded-xl shadow-lg break-words whitespace-normal mx-5 transition-all duration-200 mb-5 hover:shadow-xl p-5 w-fit max-w-[400px]",
    isAnswer ? "bg-cyan-50" : "bg-slate-50 self-end",
  ].join(" ");

  return (
    <div className={className}>
      {isAnswer ? <ReactMarkdown>{text}</ReactMarkdown> : text}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-2xl hover:text-black"
        >
          &times;
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
}
