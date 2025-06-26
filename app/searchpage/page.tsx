"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";

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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("search") || "";
  const [results, setResults] = useState<SearchResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [history, setHistory] = useState<
    { query: string; result: SearchResultType }[]
  >([]);

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
        setResults(parsed);
        setHistory((prev) => [...prev, { query, result: parsed }]);
        return;
      } catch (e) {
        console.warn("⚠️ 캐시 파싱 실패, 요청 강행:", e);
      }
    }

    const fetchResults = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/searchllm?search=${encodeURIComponent(
            query
          )}&email=${encodeURIComponent(email)}`
        );

        if (!res.ok) throw new Error("검색 실패");

        const data = await res.json();
        console.log("📥 [응답 수신] raw:", data);

        const normalized: SearchResultType = data.result;
        if (!normalized) throw new Error("result 필드가 응답에 없습니다");

        localStorage.setItem(storageKey, JSON.stringify(normalized));
        setResults(normalized);
        setHistory((prev) => [...prev, { query, result: normalized }]);
      } catch (error) {
        console.error("에러 발생:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, email]);

  return (
    <MainLayout hideFooter>
      <div className="w-full mt-12 pb-[100px]">
        <div className="mx-auto w-[800px] flex flex-col h-full gap-5">
          {history.map(({ query, result }, index) => (
            <div key={index}>
              <div className="flex justify-end">
                <SpeachBubble text={query} className="mb-4 mt-4" />
              </div>
              <div className="flex justify-start">
                <SpeachBubble isAnswer text={result.answer} className="mb-3" />
              </div>
              <div className="ml-5 w-[63%] text-sm flex flex-row gap-2">
                <button
                  onClick={() => setShowDocsModal(true)}
                  className="w-full px-3 py-2 rounded shadow-md bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition"
                >
                  📑 관련 문서 다운로드
                </button>
                <button
                  onClick={() => setShowLawsModal(true)}
                  className="w-full px-3 py-2 rounded shadow-md bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition"
                >
                  📘 관련 법률 보기
                </button>
                <button
                  onClick={() => setShowDictModal(true)}
                  className="w-full px-3 py-2 rounded shadow-md bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition"
                >
                  💻 법률 검색하러 가기
                </button>
              </div>
            </div>
          ))}
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
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-transparent px-4 py-3 z-50">
        <div className="max-w-3xl mx-auto w-full flex items-center rounded-full border border-gray-300 px-4 bg-white shadow-md">
          <input
            type="text"
            placeholder="궁금한 것을 검색해보세요..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(
                  `/searchpage?search=${encodeURIComponent(searchInput)}`
                );
              }
            }}
            className="flex-1 py-4 pr-4 outline-none border-none text-base bg-transparent "
          />
          <button
            onClick={() =>
              router.push(
                `/searchpage?search=${encodeURIComponent(searchInput)}`
              )
            }
            className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full hover:bg-gray-300 transition"
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
      </div>

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
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
            <h2 className="text-lg font-bold mb-4">📄 관련 문서 다운로드</h2>
            <button
              onClick={() => setShowDocsModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
              {results?.reference_documents.map((doc, i) => (
                <li key={i}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showLawsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
            <h2 className="text-lg font-bold mb-4">📘 관련 법률 보기</h2>
            <button
              onClick={() => setShowLawsModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <ul className="mt-4 list-disc pl-5 text-sm text-gray-700">
              {results?.referenced_laws.map((law, i) => (
                <li key={i}>{law}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showDictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
            <h2 className="text-lg font-bold mb-4">💻 법률 검색하러 가기</h2>
            <button
              onClick={() => setShowDictModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <p className="text-sm text-gray-600"></p>
            ➡️
            <a
              href="https://law.go.kr/lsTrmScListP.do"
              target="_blank"
              className="underline text-blue-500 hover:text-blue-700"
            >
              대한민국 법령용어사전 바로가기
            </a>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function SpeachBubble({
  text,
  isAnswer,
  className = "",
}: {
  text: string;
  isAnswer?: boolean;
  className?: string;
}) {
  const baseClass = [
    "rounded-xl shadow-lg border border-gray-300",
    "break-words whitespace-normal mx-5 transition-all duration-200 p-5 w-fit max-w-[500px]",
    isAnswer ? "bg-[#f2fdf5]" : "bg-[#fef7ee]",
    className,
  ].join(" ");

  return (
    <div className={baseClass}>
      {isAnswer ? (
        <div
          className="prose prose-base max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }}
        />
      ) : (
        text
      )}
    </div>
  );
}
