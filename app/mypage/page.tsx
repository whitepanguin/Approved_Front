"use client";

import type React from "react";
import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "../providers";

export default function MyPage() {
  const { user, searchHistory, removeFromSearchHistory } = useApp();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    userId: "honggildong",
    name: "홍길동",
    email: "hong@example.com",
    phone: "010-1234-5678",
    businessType: "음식점업",
    joinDate: "2023.05.15",
  });

  // 샘플 데이터
  const myPosts = [
    {
      id: 1,
      title: "음식점 영업허가 신청 시 주의사항",
      preview:
        "음식점을 개업하려고 하는데 영업허가 신청할 때 놓치기 쉬운 부분들을 정리해봤습니다.",
      date: "2023-06-01",
      views: 1245,
      likes: 89,
      comments: 32,
    },
    {
      id: 2,
      title: "사업자등록증 발급 후기",
      preview:
        "처음으로 사업자등록증을 발급받았습니다. 과정과 필요 서류를 공유합니다.",
      date: "2023-05-15",
      views: 876,
      likes: 45,
      comments: 18,
    },
  ];

  const myComments = [
    {
      id: 1,
      postTitle: "건축허가 관련 질문드립니다",
      comment:
        "저도 비슷한 경험이 있는데요, 건축과에 직접 방문하시는 것이 가장 빠릅니다.",
      date: "2023-06-05",
      likes: 12,
    },
    {
      id: 2,
      postTitle: "식품위생교육 어디서 받나요?",
      comment:
        "식품의약품안전처 교육포털에서 온라인으로 받을 수 있습니다. 링크 첨부합니다.",
      date: "2023-05-28",
      likes: 8,
    },
    {
      id: 3,
      postTitle: "창업 초기 세무 관리 팁",
      comment:
        "세금계산서 발행과 매입/매출 관리는 꼭 클라우드 회계 프로그램 사용하세요.",
      date: "2023-05-20",
      likes: 15,
    },
  ];

  const likedPosts = [
    {
      id: 1,
      title: "2023년 달라지는 인허가 제도 총정리",
      author: "정책전문가",
      date: "2023-06-10",
      views: 2341,
      likes: 156,
      comments: 45,
    },
    {
      id: 2,
      title: "소상공인 지원 정책 모음",
      author: "경제연구소",
      date: "2023-06-05",
      views: 1876,
      likes: 134,
      comments: 28,
    },
    {
      id: 3,
      title: "식품접객업 인허가 체크리스트",
      author: "식당CEO",
      date: "2023-05-30",
      views: 1543,
      likes: 98,
      comments: 37,
    },
  ];

  const handleProfileSave = () => {
    setIsEditing(false);
    alert("프로필이 저장되었습니다.");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("비밀번호가 변경되었습니다.");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                프로필 수정
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                개인정보를 안전하게 관리하세요
              </p>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">기본 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      아이디
                    </label>
                    <input
                      type="text"
                      name="userId"
                      value={profileData.userId}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      아이디는 변경할 수 없습니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <div className="flex">
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                      />
                      <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        인증
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      닉네임
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                      />
                      <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        중복확인
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      휴대폰 번호
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사업 분야
                    </label>
                    <select
                      name="businessType"
                      value={profileData.businessType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    >
                      <option value="음식점업">음식점업</option>
                      <option value="소매업">소매업</option>
                      <option value="서비스업">서비스업</option>
                      <option value="제조업">제조업</option>
                      <option value="건설업">건설업</option>
                      <option value="IT/소프트웨어">IT/소프트웨어</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가입일
                    </label>
                    <input
                      type="text"
                      name="joinDate"
                      value={profileData.joinDate}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-4">비밀번호 변경</h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "posts":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                내가 쓴 글
              </h3>
              <div className="flex gap-2">
                <select className="p-2 border border-gray-300 rounded-lg text-sm">
                  <option>최신순</option>
                  <option>인기순</option>
                  <option>댓글순</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  글쓰기
                </button>
              </div>
            </div>

            {myPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-file-alt text-4xl mb-4 opacity-50"></i>
                <p>작성한 글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors cursor-pointer"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.preview}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar"></i> {post.date}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-eye"></i> {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-heart"></i> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-comment"></i> {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-sm ${
                      num === 1 ? "bg-blue-600 text-white border-blue-600" : ""
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "comments":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">내 댓글</h3>
              <select className="p-2 border border-gray-300 rounded-lg text-sm">
                <option>최신순</option>
                <option>인기순</option>
              </select>
            </div>

            {myComments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-comment text-4xl mb-4 opacity-50"></i>
                <p>작성한 댓글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-5 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-base font-semibold text-gray-800">
                        <i className="fas fa-reply text-blue-600 mr-2 rotate-180"></i>
                        {comment.postTitle}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 pl-6">{comment.comment}</p>
                    <div className="flex justify-end items-center text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-heart"></i> {comment.likes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    className={`w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-sm ${
                      num === 1 ? "bg-blue-600 text-white border-blue-600" : ""
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "likes":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                좋아요한 글
              </h3>
              <select className="p-2 border border-gray-300 rounded-lg text-sm">
                <option>최신순</option>
                <option>인기순</option>
                <option>댓글순</option>
              </select>
            </div>

            {likedPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-heart text-4xl mb-4 opacity-50"></i>
                <p>좋아요한 글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {likedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors cursor-pointer"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-user"></i> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-calendar"></i> {post.date}
                      </span>
                    </div>
                    <div className="flex justify-end gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-eye"></i> {post.views}
                      </span>
                      <span className="flex items-center gap-1 text-pink-600">
                        <i className="fas fa-heart"></i> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-comment"></i> {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    className={`w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-sm ${
                      num === 1 ? "bg-blue-600 text-white border-blue-600" : ""
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">계정 설정</h3>

            <div className="space-y-4">
              <div className="p-5 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">알림 설정</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">이메일 알림</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">SMS 알림</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">마케팅 정보 수신</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>

              <div className="p-5 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">계정 관리</h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <i className="fas fa-download mr-3 text-blue-600"></i>내
                    데이터 다운로드
                  </button>
                  <button className="w-full text-left p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <i className="fas fa-user-times mr-3"></i>
                    회원 탈퇴
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 */}
          <div className="lg:col-span-1">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {profileData.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  @{profileData.userId}
                </p>

                <div className="flex justify-between w-full border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      15
                    </span>
                    <span className="text-xs text-gray-600">작성글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      42
                    </span>
                    <span className="text-xs text-gray-600">댓글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      128
                    </span>
                    <span className="text-xs text-gray-600">좋아요</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 메뉴 네비게이션 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <nav>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "profile"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-user ${
                      activeTab === "profile"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  ></i>
                  <span>프로필 수정</span>
                </button>

                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "posts"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-file-alt ${
                      activeTab === "posts" ? "text-blue-600" : "text-gray-500"
                    }`}
                  ></i>
                  <span>내가 쓴 글</span>
                </button>

                <button
                  onClick={() => setActiveTab("comments")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "comments"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-comment ${
                      activeTab === "comments"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  ></i>
                  <span>내 댓글</span>
                </button>

                <button
                  onClick={() => setActiveTab("likes")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "likes"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-heart ${
                      activeTab === "likes" ? "text-blue-600" : "text-gray-500"
                    }`}
                  ></i>
                  <span>좋아요한 글</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "settings"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-cog ${
                      activeTab === "settings"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  ></i>
                  <span>계정 설정</span>
                </button>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-md">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
