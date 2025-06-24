"use client";

import { useEffect, useState } from "react";
import { Search, Users, MapPin, ArrowRight, Sparkles } from "lucide-react";

interface IntroPreviewProps {
  onStart: () => void;
  currentStep: number;
}

export default function IntroPreview({ onStart }: IntroPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Search,
      title: "AI 기반 검색",
      description: "복잡한 인허가 정보를 AI가 쉽게 찾아드립니다",
    },
    {
      icon: Users,
      title: "커뮤니티 포럼",
      description: "경험과 지식을 나누는 전문가 커뮤니티",
    },
    {
      icon: MapPin,
      title: "지역 기반 서비스",
      description: "내 주변 유사 업종을 지도에서 확인하세요",
    },
  ];


  const handleStartClick = () => {
    setTimeout(() => {
      onStart(); // ✅ 0.5초 후에 부모 상태 변경
    }, 500);
  };

  return (
    <>
      <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        <div className="relative z-10 container mx-auto px-6  min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
                alt="허가요 로고"
                className="w-16 h-16"
              />
              <span className="text-2xl font-bold text-white">허가요</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-blue-100 text-sm font-medium">
                AI 기반 플랫폼
              </span>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 flex items-center">
            <div className="grid lg:grid-cols-2 gap-16 w-full max-w-7xl mx-auto">
              {/* Left Side - Story */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                    복잡한 인허가,
                    <br />
                    <span className="text-blue-300">이제 쉽게</span>
                  </h1>
                  <p className="text-xl text-blue-100 leading-relaxed">
                    사업을 시작하려는데 어떤 허가가 필요한지 모르겠나요?
                    <br />
                    허가요가 여러분의 여정을 함께합니다.
                  </p>
                </div>
                {/* Story Steps */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        궁금한 것을 물어보세요
                      </h3>
                      <p className="text-blue-200 text-sm">
                        AI가 정확한 인허가 정보를 찾아드립니다
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        경험을 나누세요
                      </h3>
                      <p className="text-blue-200 text-sm">
                        전문가들과 실무 경험을 공유하고 배우세요
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        주변을 탐색하세요
                      </h3>
                      <p className="text-blue-200 text-sm">
                        내 지역의 유사 업종을 지도에서 확인하세요
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleStartClick}
                  className="group flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  지금 시작하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              {/* Right Side - Interactive Features */}
              <div className="relative">
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === index;
                    return (
                      <div
                        key={index}
                        className={`p-6 rounded-2xl border transition-all duration-500 ${
                          isActive
                            ? "bg-white/15 border-blue-300 scale-105 shadow-2xl"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl transition-colors ${
                              isActive ? "bg-blue-400" : "bg-white/10"
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 ${
                                isActive ? "text-white" : "text-blue-300"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-semibold mb-2 transition-colors ${
                                isActive ? "text-white" : "text-blue-100"
                              }`}
                            >
                              {step.title}
                            </h3>
                            <p
                              className={`text-sm transition-colors ${
                                isActive ? "text-blue-100" : "text-blue-200"
                              }`}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Progress indicator */}
                <div className="flex justify-center mt-8 gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentStep === index
                          ? "bg-blue-300 w-8"
                          : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10,000+</div>
              <div className="text-blue-200 text-sm">인허가 정보</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">5,000+</div>
              <div className="text-blue-200 text-sm">활성 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99%</div>
              <div className="text-blue-200 text-sm">정확도</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
