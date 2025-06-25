"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ReactMarkdown from "react-markdown";

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

    // ✅ 실제 서비스에서 사용
    // const fetchResults = async () => {
    //   try {
    //     setLoading(true);
    //     const res = await fetch(
    //       `http://localhost:8000/searchllm?search=${encodeURIComponent(
    //         query
    //       )}&email=${encodeURIComponent(email)}`
    //     );
    //     if (!res.ok) throw new Error("검색 실패");

    //     const data = await res.json();
    //     console.log("📥 [응답 수신] raw:", data);

    //     // ✅ JSON.parse 제거
    //     const normalized: SearchResultType = data.result;
    //     localStorage.setItem(storageKey, JSON.stringify(normalized));
    //     setResults(normalized);
    //   } catch (error) {
    //     console.error("에러 발생:", error);
    //     setResults(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // ✅ 더미 응답 사용
    const fetchResults = async () => {
      try {
        setLoading(true);

        const dummy: SearchResultType = {
          answer:
            "더미 답변입니다. 이 내용은 mock 데이터로부터 왔습니다. 음식점을 하시려면 '영업신고증'이 필요합니다. '영업허가증'은 필요 없습니다. 제공된 문서에 따르면 음식판매자동차를 이용하는 휴게음식점, 일반음식점, 제과점 영업의 경우 식품위생법 제42조에 따라 영업신고를 해야 하고, 신고 후 '영업신고증'을 발급받게 됩니다. 이 신고증은 음식점 영업을 할 수 있다는 증명이므로 반드시 가지고 계셔야 합니다. 영업허가증은 식품위생법 제40조에서 언급되는 허가제도와 관련된 것으로, 제공된 문서에서는 음식점 영업과 관련하여 허가증이 필요하다고 명시되지 않았습니다. 즉, 음식점 영업을 위해 따로 허가를 받을 필요는 없고, 신고만 하면 됩니다. 신고를 위해 필요한 서류는 식품위생법 제42조 1항에 자세히 나와 있습니다. 예를 들어, 제조·가공하려는 식품의 유형 및 제조방법 설명서, 영업장과 연접하는 외부 장소를 사용하려면 사용 권한을 증명하는 서류 등이 필요할 수 있습니다. 하지만 정확한 서류 목록은 영업의 종류(휴게음식점, 일반음식점, 제과점 등)와 영업 방식에 따라 달라질 수 있으므로, 관할 구청에 직접 문의하시는 것이 가장 정확합니다. 제공된 문서에는 신고서 양식 자체는 포함되어 있지 않습니다. 관할 구청에 문의하거나, 식품의약품안전처 또는 서울특별시청 홈페이지에서 해당 양식을 다운로드 받으실 수 있습니다.참고로, 서울특별시 음식판매자동차 영업장소 지정 및 관리 등에 관한 조례는 음식판매자동차(푸드트럭)를 운영하는 경우에 적용되는 조례이며, 일반적인 음식점에는 적용되지 않을 수 있습니다.",
          referenced_laws: [
            "식품위생법 제42조-1항-13호",
            "식품위생법 제40조-5항",
          ],
          reference_documents: [
            {
              title: "영업신고서 예시",
              url: "https://www.law.go.kr/LSW/flDownload.do?flSeq=123456789",
            },
            {
              title: "업종별 시설 기준",
              url: "https://www.law.go.kr/LSW/flDownload.do?flSeq=987654321",
            },
          ],
        };

        // ✅ 저장 및 상태 설정
        localStorage.setItem(storageKey, JSON.stringify(dummy));
        setResults(dummy);
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
    <MainLayout>
      <div className="w-full overflow-hidden h-full mt-5">
        <div className="mx-auto w-[650px] overflow-auto flex flex-col h-full gap-5">
          {!loading && <SpeachBubble text={query} />}
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
            <SpeachBubble isAnswer text={results.answer} className="mb-0" />
          )}
          {!loading && results && (
            <div className="ml-5 flex flex-wrap gap-2">
              <button
                onClick={() => setShowDocsModal(true)}
                className="px-3 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 shadow-sm hover:bg-blue-100 transition"
              >
                📑 관련 문서 다운로드
              </button>
              <button
                onClick={() => setShowLawsModal(true)}
                className="px-3 py-1 rounded bg-green-50 text-green-700 border border-green-200 shadow-sm hover:bg-green-100 transition"
              >
                📘 관련 법률 보기
              </button>
              <button
                onClick={() => setShowDictModal(true)}
                className="px-3 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200 shadow-sm hover:bg-orange-100 transition"
              >
                💻 법률 검색하러 가기
              </button>
            </div>
          )}
        </div>
      </div>
      {showDocsModal && results && (
        <Modal
          title="📑 관련 문서 다운로드"
          onClose={() => setShowDocsModal(false)}
        >
          <ul className="list-disc list-inside text-sm text-gray-700">
            {results.reference_documents.map((doc, idx) => {
              console.log("📑 관련 문서 다운로드", doc);
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
          title="💻 법률 검색하러 가기"
          onClose={() => setShowDictModal(false)}
        >
          <p className="text-sm text-gray-700">
            ➡️
            <a
              href="https://law.go.kr/lsTrmScListP.do"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700"
            >
              대한민국 법령용어사전 바로가기
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
  className = "",
}: {
  text: string;
  isAnswer?: boolean;
  className?: string;
}) {
  const baseClass = [
    "rounded-xl shadow-lg break-words whitespace-normal mx-5 transition-all duration-200 p-5 w-fit max-w-[400px]",
    isAnswer ? "bg-cyan-50" : "bg-slate-50 self-end",
    className,
  ].join(" ");
  return (
    <div className={baseClass}>
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
