"use client";
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
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const complementaryMap: Record<string, string[]> = {
    생맥주: ["노래방"],
    호프: ["노래방"],
    노래방: ["생맥주", "호프"],
    서점: ["문구"],
    문구: ["서점"],
    노래: ["생맥주", "노래방"],
    맥주집: ["생맥주", "노래방"],
  };

  const keywordAlias: Record<string, string> = {
    맥주집: "생맥주",
    맥주: "생맥주",
    생맥주: "생맥주",
    호프: "호프",
    노래방: "노래방",
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
        const lat = Number.parseFloat(result[0].y);
        const lng = Number.parseFloat(result[0].x);
        const center = new kakao.maps.LatLng(lat, lng);

        if (mapRef.current) {
          mapRef.current.setCenter(center);
          mapRef.current.setLevel(4);
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
    const fetchData = async () => {
      const response = await fetch("/map-data.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setBusinessData(jsonData);
    };
    fetchData();
  }, []);

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

  return (
    <MainLayout>
      <Script
        src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=62727505cda834a0a8563345c1c569d1&autoload=false&libraries=services"
        strategy="beforeInteractive"
      />

      <div className="max-w-7xl mx-auto px-0">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          유사업종 / 보완업종 지도
        </h1>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 max-w-[100rem] mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-sm p-6 rounded-xl shadow-lg">
          <p className="mb-3 text-blue-800 font-semibold text-base">
            📍 <strong>사용 방법 안내</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>주소와 업종 키워드를 함께 입력하고 검색하세요.</li>
            <li>
              반경 <strong className="text-blue-600">300m</strong> 내 업종 수에
              따라 원 색상 표시:
              <ul className="ml-6 list-disc mt-1 space-y-1">
                <li>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  1~2개: 초록색
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  3~4개: 노란색
                </li>
                <li>
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  5개 이상: 빨간색
                </li>
              </ul>
            </li>
            <li>지도 확대 시, 유사업종(🔴), 보완업종(🔵) 마커 표시</li>
          </ul>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 lg:px-8 max-w-[100rem] mx-auto mb-8">
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업종 키워드
            </label>
            <input
              type="text"
              placeholder="예: 맥주집, 노래방, 서점"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              placeholder="예: 서울 강남구"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              🔍 검색
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 mt-6">
        <div className="max-w-7xl mx-auto">
          <div
            id="map"
            className="w-full h-[600px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          ></div>
        </div>
      </div>
    </MainLayout>
  );
}
