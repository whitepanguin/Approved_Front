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
    맥주집: ["노래방"],
    노래방: ["맥주집"],
    서점: ["문구"],
    문구: ["서점"],
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

    // 초기화
    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    if (infoWindowRef.current) infoWindowRef.current.close();
    markersRef.current = [];
    circlesRef.current = [];

    const complementaryList = complementaryMap[searchKeyword] || [];
    const targetList = [searchKeyword, ...complementaryList];

    const kakao = (window as any).kakao;
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
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
          item["상권업종소분류명"].includes(searchKeyword)
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
          filteredData.forEach((item) => {
            const lat = Number(item["위도"]);
            const lng = Number(item["경도"]);
            if (!lat || !lng) return;

            const position = new kakao.maps.LatLng(lat, lng);
            const name = item["상호명"] || "업소";
            const type = item["상권업종소분류명"];

            const isMain = type?.includes(searchKeyword);
            const isComp = complementaryMap[searchKeyword]?.some((v) =>
              type.includes(v)
            );
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

      <div className="max-w-4xl mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">
          유사업종 / 보완업종 지도
        </h1>

        <div className="bg-gray-100 text-sm p-3 rounded-lg mb-4 shadow">
          <p className="mb-1">
            📍 <strong>사용 방법 안내</strong>
          </p>
          <ul className="list-disc list-inside">
            <li>주소와 업종 키워드를 함께 입력하고 검색하세요.</li>
            <li>
              반경 <strong>300m 이내</strong> 유사업종 개수에 따라 색상 반경
              표시:
            </li>
            <ul className="list-disc list-inside ml-4">
              <li>1~2개: 녹색</li>
              <li>3~4개: 노란색</li>
              <li>5개 이상: 빨간색</li>
            </ul>
            <li>
              지도 확대(레벨 3 이하) 시, 유사업종(🔴), 보완업종(🔵) 각각 마커
              표시
            </li>
            <li>마커 클릭 시 업소 이름 및 업종 정보 표시</li>
            <li>다른 검색을 진행할 경우 지도는 자동 초기화됩니다.</li>
          </ul>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="예: 맥주집, 노래방, 서점, 문구"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="예: 서울 강남구"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
          >
            검색
          </button>
        </div>

        <div id="map" className="w-full h-[600px] rounded-xl shadow-md"></div>
      </div>
    </MainLayout>
  );
}
