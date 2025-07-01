"use client";

import { useState } from "react";

const FloatingDictButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const url = `https://port-0-approved-springback-m5mcnm8ebdc80276.sel4.cloudtype.app/api/dict?q=${encodeURIComponent(
        keyword
      )}`;

      const res = await fetch(url);
      const data = await res.json();

      setResults(data.channel?.item || []);
    } catch (err) {
      // console.error("사전 검색 실패:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg"
      >
        🔍
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 bg-white p-4 rounded-lg shadow-xl border w-96 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-2">한글 사전 검색</h3>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="검색어 입력"
            className="w-full border px-2 py-1 rounded mb-2"
          />
          <button
            onClick={handleSearch}
            className="w-full bg-blue-500 text-white py-1 rounded mb-4"
          >
            검색
          </button>

          {loading ? (
            <p className="text-center text-gray-500">로딩 중...</p>
          ) : results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((item, index) => (
                <li key={index} className="text-sm border-b pb-2">
                  <a
                    href={item.sense.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {item.word}
                  </a>
                  <p className="mt-1 text-gray-800">{item.sense.definition}</p>
                  <p className="text-xs text-gray-500">{item.pos}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400">검색 결과가 없습니다.</p>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingDictButton;
