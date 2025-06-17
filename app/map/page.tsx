"use client";
import MainLayout from "@/components/layout/main-layout";
import { useState } from "react";

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState("서울특별시");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const regions = [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
    "경기도",
    "강원도",
    "충청북도",
    "충청남도",
    "전라북도",
    "전라남도",
    "경상북도",
    "경상남도",
    "제주특별자치도",
  ];

  const categories = [
    { id: "all", name: "전체", icon: "fas fa-list" },
    { id: "business", name: "사업자등록", icon: "fas fa-building" },
    { id: "food", name: "음식점", icon: "fas fa-utensils" },
    { id: "construction", name: "건축", icon: "fas fa-hammer" },
    { id: "environment", name: "환경", icon: "fas fa-leaf" },
    { id: "transport", name: "교통", icon: "fas fa-car" },
  ];

  const sampleData = [
    {
      id: 1,
      name: "강남구청",
      address: "서울특별시 강남구 학동로 426",
      phone: "02-3423-5000",
      category: "business",
      services: ["사업자등록", "법인설립", "각종 인허가"],
    },
    {
      id: 2,
      name: "서초구청",
      address: "서울특별시 서초구 남부순환로 2584",
      phone: "02-2155-8114",
      category: "business",
      services: ["사업자등록", "건축허가", "환경신고"],
    },
    {
      id: 3,
      name: "송파구청",
      address: "서울특별시 송파구 올림픽로 326",
      phone: "02-2147-2114",
      category: "construction",
      services: ["건축허가", "도시계획", "주택관련"],
    },
  ];

  const filteredData =
    selectedCategory === "all"
      ? sampleData
      : sampleData.filter((item) => item.category === selectedCategory);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-5">
        <div className="mb-8">
          <h1 className="text-3xl text-blue-600 mb-2 flex items-center gap-2">
            <i className="fas fa-map-marked-alt"></i> 지도
          </h1>
          <p className="text-gray-600">
            지역별 인허가 관련 기관 정보를 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 지역 선택 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-blue-600"></i>
              지역 선택
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`p-3 text-left rounded-lg transition-all ${
                    selectedRegion === region
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-filter text-blue-600"></i>
              카테고리
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 text-left rounded-lg transition-all flex items-center gap-3 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <i className={category.icon}></i>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-building text-blue-600"></i>
              {selectedRegion} 관련 기관
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-search text-3xl mb-3 opacity-50"></i>
                  <p>해당 조건의 기관이 없습니다.</p>
                </div>
              ) : (
                filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-600 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-blue-600"></i>
                        <span>{item.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-phone text-blue-600"></i>
                        <span>{item.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clipboard-list text-blue-600"></i>
                        <span>{item.services.join(", ")}</span>
                      </div>
                    </div>
                    <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      상세 정보 보기
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
