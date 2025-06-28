"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import * as XLSX from "xlsx";
import MainLayout from "@/components/layout/main-layout";

export default function SearchableBusinessMap() {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [address, setAddress] = useState("");
  const [businessData, setBusinessData] = useState<any[]>([]);
  const [schoolData, setSchoolData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const complementaryMap: Record<string, string[]> = {
    생맥주: ["노래방"],
    호프: ["노래방"],
    노래방: ["생맥주", "호프"],
    서점: ["문구"],
    문구: ["서점"],
    노래: ["생맥주", "노래방"],
    맥주집: ["생맥주", "노래방"],
    술집: ["생맥주 전문", "노래방"],
    호프집: ["생맥주 전문", "노래방"],
    생맥주전문: ["노래방"],
    "생맥주 전문": ["노래방"],
  };

  const keywordAlias: Record<string, string> = {
    맥주집: "생맥주",
    맥주: "생맥주",
    생맥주: "생맥주",
    생맥주전문: "생맥주 전문",
    "생맥주 전문": "생맥주 전문",
    호프: "호프",
    호프집: "생맥주 전문",
    술집: "생맥주 전문",
    노래방: "노래방",
    노래: "노래방",
    서점: "서점",
    문구: "문구",
  };

  const normalizeKeyword = (keyword: string): string => {
    return keywordAlias[keyword.trim()] || keyword.trim();
  };

  const getTargetList = (keyword: string): string[] => {
    const norm = normalizeKeyword(keyword);
    const comp = complementaryMap[norm] || [];
    return Array.from(new Set([norm, ...comp]));
  };

  const haversineDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const hasNearbySchool = (lat: number, lng: number): boolean => {
    return schoolData.some((school: any) => {
      const schoolLat = Number(school["위도"]);
      const schoolLng = Number(school["경도"]);
      if (!schoolLat || !schoolLng) return false;
      return haversineDistance(lat, lng, schoolLat, schoolLng) <= 200;
    });
  };

  const handleSearch = () => {
    if (!searchKeyword || !address) return;

    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    if (infoWindowRef.current) infoWindowRef.current.close();
    markersRef.current = [];
    circlesRef.current = [];

    const targetList = getTargetList(searchKeyword);
    const kakao = (window as any).kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const lat = Number(result[0].y);
        const lng = Number(result[0].x);
        const center = new kakao.maps.LatLng(lat, lng);

        if (mapRef.current) {
          mapRef.current.setCenter(center);
          mapRef.current.setLevel(4);
        }

        const isNoraebang = normalizeKeyword(searchKeyword) === "노래방";
        const hasSchoolNearby = hasNearbySchool(lat, lng);
        if (isNoraebang && hasSchoolNearby) {
          const warningWindow = new kakao.maps.InfoWindow({
            position: center,
            content: `
              <div style="padding:8px;background:#fff3cd;border:1px solid #ffecb5;border-radius:8px;font-size:13px;color:#664d03;">
                ⚠ 반경 200m 내 학교 위치<br><strong>위치 제한 업종 여부를 확인하세요</strong>
              </div>`,
          });
          warningWindow.open(mapRef.current);
          infoWindowRef.current = warningWindow;
        }

        const resultFiltered = businessData.filter((item) => {
          const type = item["상권업종소분류명"];
          const itemLat = Number(item["위도"]);
          const itemLng = Number(item["경도"]);
          if (!type || !itemLat || !itemLng) return false;

          const isWithinRadius =
            haversineDistance(lat, lng, itemLat, itemLng) <= 300;
          const isRelevant = targetList.some((t) => type.includes(t));
          return isWithinRadius && isRelevant;
        });

        setFilteredData(resultFiltered);

        const count = resultFiltered.filter((item) =>
          item["상권업종소분류명"].includes(normalizeKeyword(searchKeyword))
        ).length;

        let fillColor = "#00AA00";
        if (count >= 5) fillColor = "#FF0000";
        else if (count >= 3) fillColor = "#FFD700";

        const circle = new kakao.maps.Circle({
          map: mapRef.current,
          center,
          radius: 300,
          strokeWeight: 2,
          strokeColor: "#333",
          strokeOpacity: 0.8,
          fillColor,
          fillOpacity: 0.4,
        });

        circlesRef.current.push(circle);
      }
    });
  };

  useEffect(() => {
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps || !kakao.maps.load) return;

    kakao.maps.load(() => {
      const container = document.getElementById("map");
      if (!container) return;

      if (!mapRef.current) {
        mapRef.current = new kakao.maps.Map(container, {
          center: new kakao.maps.LatLng(37.4979, 127.0276),
          level: 5,
        });
      }

      const map = mapRef.current;
      kakao.maps.event.addListener(map, "zoom_changed", () => {
        const level = map.getLevel();
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (level <= 3) {
          const targetList = getTargetList(searchKeyword);
          filteredData.forEach((item) => {
            const lat = Number(item["위도"]);
            const lng = Number(item["경도"]);
            if (!lat || !lng) return;

            const position = new kakao.maps.LatLng(lat, lng);
            const name = item["상호명"] || "업소";
            const type = item["상권업종소분류명"];
            const isMain = type?.includes(normalizeKeyword(searchKeyword));
            const isComp = !isMain && targetList.some((t) => type.includes(t));
            if (!isMain && !isComp) return;

            const marker = new kakao.maps.Marker({
              position,
              map,
              image: new kakao.maps.MarkerImage(
                isMain ? "/images/red.png" : "/images/blue.png",
                new kakao.maps.Size(40, 40)
              ),
            });

            const infowindow = new kakao.maps.InfoWindow({
              content: `<div style="padding:6px;font-size:12px;"><b>${name}</b><br/>(${type})</div>`,
            });

            kakao.maps.event.addListener(marker, "click", () => {
              if (infoWindowRef.current) infoWindowRef.current.close();
              infowindow.open(map, marker);
              infoWindowRef.current = infowindow;
            });

            markersRef.current.push(marker);
          });
        }
      });
    });
  }, [filteredData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/map-data.xlsx");
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setBusinessData(json);
      } catch (error) {
        console.error("Failed to load business data:", error);
        // Fallback to mock data for demo purposes
        setBusinessData([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const res = await fetch("/school-data.xlsx");
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setSchoolData(json);
      } catch (error) {
        console.error("Failed to load school data:", error);
        // Fallback to mock data for demo purposes
        setSchoolData([]);
      }
    };
    fetchSchoolData();
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-4">
        <Script
          src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=62727505cda834a0a8563345c1c569d1&autoload=false&libraries=services"
          strategy="beforeInteractive"
        />

        <div className="container mx-auto max-w-7xl px-4 py-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              상권 분석 도구
            </h1>
            <p className="text-gray-600 text-sm">
              업종과 주소를 입력하여 주변 상권을 분석해보세요
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="업종 (예: 노래방, 생맥주)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                placeholder="주소 (예: 서울 강남구 역삼동)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={!searchKeyword || !address}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
              >
                검색하기
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    지도 분석 결과
                  </h3>
                </div>
                <div id="map" className="w-full h-[450px]" />
              </div>

              {/* Legend */}
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                  범례
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>주요 업종</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>보완 업종</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full opacity-60"></div>
                    <span>경쟁 낮음</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full opacity-60"></div>
                    <span>경쟁 높음</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Usage Guide */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">
                  사용 안내
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 반경 300m 내 업소 표시</li>
                  <li>• 확대하면 상세 마커 표시</li>
                  <li>• 학교 근처 제한업종 경고</li>
                  <li>• 마커 클릭시 상세 정보</li>
                </ul>
              </div>

              {/* Statistics */}
              {filteredData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    분석 결과
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-600">
                        {
                          filteredData.filter((item) =>
                            item["상권업종소분류명"]?.includes(
                              normalizeKeyword(searchKeyword)
                            )
                          ).length
                        }
                      </div>
                      <div className="text-xs text-blue-600">동일 업종</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        {filteredData.length}
                      </div>
                      <div className="text-xs text-green-600">
                        전체 관련 업소
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-600">
                        300m
                      </div>
                      <div className="text-xs text-purple-600">분석 반경</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Competition Level */}
              {filteredData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    경쟁 수준
                  </h4>
                  <div className="space-y-2">
                    {(() => {
                      const count = filteredData.filter((item) =>
                        item["상권업종소분류명"]?.includes(
                          normalizeKeyword(searchKeyword)
                        )
                      ).length;
                      let level = "낮음";
                      let color = "green";
                      let bgColor = "bg-green-100";

                      if (count >= 5) {
                        level = "높음";
                        color = "red";
                        bgColor = "bg-red-100";
                      } else if (count >= 3) {
                        level = "보통";
                        color = "yellow";
                        bgColor = "bg-yellow-100";
                      }

                      return (
                        <div
                          className={`${bgColor} rounded-lg p-3 text-center`}
                        >
                          <div
                            className={`text-lg font-bold text-${color}-600`}
                          >
                            {level}
                          </div>
                          <div className={`text-xs text-${color}-600`}>
                            {count}개 업소 발견
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Business List */}
              {filteredData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    주변 업소 목록
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredData.slice(0, 10).map((item, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-2 last:border-b-0"
                      >
                        <div className="font-medium text-xs text-gray-800">
                          {item["상호명"] || "업소명 없음"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item["상권업종소분류명"]}
                        </div>
                      </div>
                    ))}
                    {filteredData.length > 10 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        외 {filteredData.length - 10}개 업소
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
