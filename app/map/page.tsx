"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import * as XLSX from "xlsx";
import MainLayout from "@/components/layout/main-layout";
import { getPolygonCenter } from "./getPolygonCenter";

export default function SearchableBusinessMap() {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const landUsePolygonsRef = useRef<any[]>([]);
  const landUseOverlaysRef = useRef<any[]>([]);

  const [showLandUse, setShowLandUse] = useState(false);
  const [isLandUseLoading, setIsLandUseLoading] = useState(false);
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
    맥주집: ["생맥주", "호프"],
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

  //용도 지역 시각화 하기
  const handleToggleLandUse = () => {
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps) return;

    const map = mapRef.current;
    if (!map) return;

    if (!showLandUse) {
      setIsLandUseLoading(true);

      fetch("/seoul_landuse_final_cleaned_valid.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          if (
            !geojson ||
            !geojson.features ||
            !Array.isArray(geojson.features)
          ) {
            setIsLandUseLoading(false);
            return;
          }

          const polygons: any[] = [];
          const overlays: any[] = [];
          const displayedZones = new Set<string>();

          //렌더링 분산
          const scheduleRender = (
            features: any[],
            callback: (feature: any) => void
          ) => {
            let i = 0;
            const batchSize = 10;

            const processBatch = (deadline: any) => {
              while (i < features.length && deadline.timeRemaining() > 0) {
                callback(features[i]);
                i++;
              }
              if (i < features.length) {
                requestIdleCallback(processBatch);
              } else {
                // 렌더링 완료 시 로딩 상태 해제
                setIsLandUseLoading(false);
              }
            };

            requestIdleCallback(processBatch);
          };

          scheduleRender(geojson.features, (feature: any) => {
            const { geometry, properties } = feature;
            const type = geometry.type;
            const coordinates = geometry.coordinates;
            const useZone = properties["DGM_NM"] || "기타";
            let fillColor = "#d1e6ff";

            if (useZone.includes("제1종")) fillColor = "#c6e48b";
            else if (useZone.includes("제2종")) fillColor = "#fdfd96";
            else if (useZone.includes("제3종")) fillColor = "#ffdab9";
            else if (useZone.includes("준공업")) fillColor = "#ffd1dc";
            else if (useZone.includes("상업")) fillColor = "#add8e6";
            else if (useZone.includes("녹지")) fillColor = "#98fb98";
            else if (useZone.includes("관리")) fillColor = "#f4cccc";
            else if (useZone.includes("개발제한")) fillColor = "#ccc";

            const paths: kakao.maps.LatLng[][] = [];
            if (type === "Polygon") {
              paths.push(
                coordinates[0].map(
                  ([lng, lat]: [number, number]) =>
                    new kakao.maps.LatLng(lat, lng)
                )
              );
            } else if (type === "MultiPolygon") {
              coordinates.forEach((polygon: any[][]) => {
                paths.push(
                  polygon[0].map(
                    ([lng, lat]: [number, number]) =>
                      new kakao.maps.LatLng(lat, lng)
                  )
                );
              });
            }

            paths.forEach((path) => {
              const polygon = new kakao.maps.Polygon({
                path,
                strokeWeight: 1,
                strokeColor: "#333",
                strokeOpacity: 0.5,
                fillColor,
                fillOpacity: 0.3,
              });
              polygon.setMap(map);
              polygons.push(polygon);

              // ✅ 개선된 라벨 스타일로 중심 좌표 기반 라벨 생성
              const center = getPolygonCenter(path, useZone);
              if (!center) return;

              const kakaoCenter = center as {
                getLat(): number;
                getLng(): number;
              };
              const labelLat = kakaoCenter.getLat();
              const labelLng = kakaoCenter.getLng();
              const labelKey = `${useZone}@${labelLat.toFixed(
                2
              )},${labelLng.toFixed(2)}`;

              if (!displayedZones.has(labelKey)) {
                const overlay = new kakao.maps.CustomOverlay({
                  position: center,
                  content: `
  <div style="
    font-size: 10px;
    font-weight: 600;
    color: #1a202c;
    white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
    display: none;
    pointer-events: none;
    text-shadow: 0 0 2px rgba(255,255,255,1), 1px 1px 0 rgba(255,255,255,0.9);
    letter-spacing: -0.01em;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  " class="land-use-label">
    ${useZone}
  </div>
`,
                  yAnchor: 0.5,
                  xAnchor: 0.5,
                });
                overlay.setMap(map);
                overlays.push(overlay);
                displayedZones.add(labelKey);
              }
            });
          });

          landUsePolygonsRef.current = polygons;
          landUseOverlaysRef.current = overlays;
        })
        .catch((error) => {
          console.error("Failed to load land use data:", error);
          setIsLandUseLoading(false);
        });
    } else {
      landUsePolygonsRef.current.forEach((polygon) => polygon.setMap(null));
      landUseOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      landUsePolygonsRef.current = [];
      landUseOverlaysRef.current = [];
    }

    setShowLandUse(!showLandUse);
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
            content: `<div style="padding:8px;background:#fff3cd;border:1px solid #ffecb5;border-radius:8px;font-size:13px;color:#664d03;">
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
      // ✅ 지도 클릭 시 주소 입력
      kakao.maps.event.addListener(map, "click", (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result: any, status: any) => {
            if (status === kakao.maps.services.Status.OK) {
              const addr = result[0].address.address_name;
              setAddress(addr);
            }
          }
        );
      });

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
              content: `
              <div style="padding:6px;font-size:12px;"><b>${name}</b><br/>(${type})</div>`,
            });

            kakao.maps.event.addListener(marker, "click", () => {
              if (infoWindowRef.current) infoWindowRef.current.close();
              infowindow.open(map, marker);
              infoWindowRef.current = infowindow;
            });

            markersRef.current.push(marker);
          });
        }

        // 용도지역 라벨 표시/숨김 제어
        const labels = document.querySelectorAll(".land-use-label");
        if (level <= 5) {
          labels.forEach((label) => {
            if (label instanceof HTMLElement) {
              label.style.display = "block";
            }
          });
        } else {
          labels.forEach((label) => {
            if (label instanceof HTMLElement) {
              label.style.display = "none";
            }
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
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <Script
            src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=62727505cda834a0a8563345c1c569d1&autoload=false&libraries=services"
            strategy="beforeInteractive"
          />
          <style jsx>{`
            @keyframes wobble {
              0%,
              100% {
                transform: rotate(0deg) scale(1);
              }
              25% {
                transform: rotate(-5deg) scale(1.05);
              }
              50% {
                transform: rotate(0deg) scale(1.1);
              }
              75% {
                transform: rotate(5deg) scale(1.05);
              }
            }
          `}</style>

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
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
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

            {/* 용도지역 토글 버튼 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  용도지역 표시
                </span>
                <span className="text-xs text-gray-500">
                  지역별 토지 이용 현황
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isLandUseLoading && (
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/default-profile.png"
                      alt="Loading"
                      className="w-6 h-6 animate-bounce"
                      style={{
                        animation: "wobble 1s ease-in-out infinite",
                      }}
                    />
                    <span className="text-xs text-blue-600 font-medium">
                      렌더링 중<span className="animate-pulse">...</span>
                    </span>
                  </div>
                )}
                <button
                  onClick={handleToggleLandUse}
                  disabled={isLandUseLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    showLandUse ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                      showLandUse ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
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

                {/* 기존 업종 범례 */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2 text-xs">
                    업종 분류
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full" />{" "}
                      <span>주요 업종</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full" />{" "}
                      <span>보완 업종</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />{" "}
                      <span>경쟁 낮음</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full opacity-60" />{" "}
                      <span>경쟁 높음</span>
                    </div>
                  </div>
                </div>

                {/* 용도지역 범례 */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-xs">
                    용도지역 분류
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#c6e48b" }}
                      ></div>
                      <span>제1종 주거지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#fdfd96" }}
                      ></div>
                      <span>제2종 주거지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#ffdab9" }}
                      ></div>
                      <span>제3종 주거지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#add8e6" }}
                      ></div>
                      <span>상업지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#ffd1dc" }}
                      ></div>
                      <span>준공업지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#98fb98" }}
                      ></div>
                      <span>녹지지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#f4cccc" }}
                      ></div>
                      <span>관리지역</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: "#ccc" }}
                      ></div>
                      <span>개발제한구역</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 용도지역 라벨은 지도를 적당히 확대했을 때 표시됩니다
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">
                  사용 안내
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 반경 300m 내 업소 표시</li>
                  <li>• 확대하면 상세 마커 표시</li>
                  <li>• 학교 근처 제한업종 경고</li>
                  <li>• 마커 클릭시 상세 정보</li>
                  <li>• 지도 클릭시 해당 주소 검색창 반영</li>
                </ul>
              </div>

              {/* 분석 결과 */}
              {filteredData.length > 0 && (
                <>
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

                        let level = "낮음",
                          color = "green",
                          bgColor = "bg-green-100";

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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
