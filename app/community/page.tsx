"use client";

import type React from "react";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "../providers";
import { useSelector } from "react-redux";
import { RootState } from "../../store"; // store 타입 import 필요

interface Post {
  _id?: string;
  title: string;
  preview: string;
  userid: string;
  createdAt: Date;
  category: string;
  views: number;
  likes: number;
  comments: number;
  isHot: boolean;
  isNotice: boolean;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentSort, setCurrentSort] = useState("latest");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const [postCount, setPostCount] = useState(0);

  const categoryInfo = {
    all: { title: "전체 게시글", icon: "fas fa-list" },
    info: { title: "정보공유", icon: "fas fa-info-circle" },
    qna: { title: "Q&A", icon: "fas fa-question-circle" },
    daily: { title: "일상 이야기", icon: "fas fa-coffee" },
    startup: { title: "창업 관련 정보", icon: "fas fa-rocket" },
  };

  // const samplePosts: Post[] = [
  //   {
  //     id: 1,
  //     title: "음식점 영업허가 신청 시 주의사항",
  //     preview:
  //       "음식점을 개업하려고 하는데 영업허가 신청할 때 놓치기 쉬운 부분들을 정리해봤습니다. 특히 위생 관련 서류와 소방 안전 검사는 미리 준비하시는 것이 좋습니다.",
  //     userid: "김사장님",
  //     date: "2023-06-01",
  //     category: "info",
  //     views: 1245,
  //     likes: 89,
  //     comments: 32,
  //     isHot: true,
  //     isNotice: false,
  //   },
  //   {
  //     id: 2,
  //     title: "건축허가 관련 질문드립니다",
  //     preview:
  //       "단독주택 신축 시 건축허가 절차가 어떻게 되는지 궁금합니다. 경험 있으신 분들의 조언 부탁드려요. 특히 도시계획 조례에 관한 부분이 헷갈립니다.",
  //     userid: "집짓는사람",
  //     date: "2023-06-02",
  //     category: "qna",
  //     views: 876,
  //     likes: 45,
  //     comments: 28,
  //     isHot: false,
  //     isNotice: false,
  //   },
  //   {
  //     id: 3,
  //     title: "오늘 드디어 사업자등록증을 받았습니다!",
  //     preview:
  //       "1년간 준비한 카페 창업, 드디어 사업자등록증을 받았습니다. 기쁜 마음에 인증샷 올려봅니다. 앞으로 잘 부탁드려요!",
  //     userid: "카페주인",
  //     date: "2023-06-03",
  //     category: "daily",
  //     views: 654,
  //     likes: 102,
  //     comments: 45,
  //     isHot: true,
  //     isNotice: false,
  //   },
  //   {
  //     id: 4,
  //     title: "[공지] 커뮤니티 이용 규칙 안내",
  //     preview:
  //       "허가요 커뮤니티를 이용해주셔서 감사합니다. 모두가 편안하게 이용할 수 있도록 커뮤니티 이용 규칙을 안내드립니다.",
  //     userid: "관리자",
  //     date: "2023-05-20",
  //     category: "all",
  //     views: 2345,
  //     likes: 156,
  //     comments: 12,
  //     isHot: false,
  //     isNotice: true,
  //   },
  //   {
  //     id: 5,
  //     title: "창업 초기 세무 관리 팁 공유합니다",
  //     preview:
  //       "창업 3년차 소상공인입니다. 초기에 세무 관리를 어떻게 하면 좋을지 제 경험을 공유합니다. 특히 세금계산서 관리와 경비 처리에 대한 팁입니다.",
  //     userid: "세무달인",
  //     date: "2023-05-28",
  //     category: "info",
  //     views: 1567,
  //     likes: 134,
  //     comments: 56,
  //     isHot: true,
  //     isNotice: false,
  //   },
  // ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts");

        const data = await res.json();
        setPosts(data);
        console.log(data);
      } catch (err) {
        console.error("❌ 게시글 로딩 실패:", err);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchPostCount = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/posts/count/${user.currentUser.name}`
        );
        const data = await res.json();

        console.log(data);
        setPostCount(data.count); // ← 상태로 저장
      } catch (err) {
        console.error("❌ 작성글 수 조회 실패:", err);
      }
    };

    fetchPostCount();
  }, [user?.currentUser?.name]);

  const filteredPosts = posts
    .filter(
      (post) => currentCategory === "all" || post.category === currentCategory
    )
    .sort((a, b) => {
      switch (currentSort) {
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          return b.likes - a.likes;
        case "comments":
          return b.comments - a.comments;
        case "views":
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const formatDate = (input: string | Date) => {
    const date = new Date(input);
    if (isNaN(date.getTime())) return "날짜 오류";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    else if (diffDays === 1) return "어제";
    else if (diffDays < 7) return `${diffDays}일 전`;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  const getCategoryName = (category: string) => {
    const categories = {
      info: "정보공유",
      qna: "Q&A",
      daily: "일상",
      startup: "창업정보",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const newPost: Post = {
      title: formData.get("title") as string,
      preview: (formData.get("content") as string).substring(0, 100) + "...",
      userid: user.name,
      createdAt: new Date(), // ← 이건 DB 저장용이 아니라 화면용이라면 OK
      category: formData.get("category") as string,
      views: 0,
      likes: 0,
      comments: 0,
      isHot: false,
      isNotice: false,
    };

    try {
      // ✅ [1] 최종 요청할 데이터 로그
      const payload = {
        userid: user.currentUser.name,
        title: newPost.title,
        content: formData.get("content") as string,
        category: newPost.category,
        tags: [],
        views: 0,
        todayViews: 0,
        comments: 0,
        likes: 0,
        preview: newPost.preview,
        isHot: false,
        isNotice: false,
      };
      console.log("📝 서버로 전송할 게시글 데이터:", payload);

      const res = await fetch("http://localhost:8000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("❌ 글 저장 실패");

      // ✅ [2] 서버 응답 로그
      const updatedPosts = await fetch("http://localhost:8000/posts").then(
        (res) => res.json()
      );
      console.log("📦 서버에서 받아온 게시글 목록:", updatedPosts);

      setPosts(updatedPosts);
      setShowWriteModal(false);
      alert("✅ 게시글이 등록되었습니다.");
    } catch (err) {
      console.error("❌ 서버 오류:", err);
      alert("서버에 문제가 있어 게시글을 등록하지 못했습니다.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-3 md:p-5">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl text-blue-600 mb-1 md:mb-2 flex items-center gap-2">
            <i className="fas fa-users"></i> 커뮤니티
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            다양한 주제로 소통하고 정보를 공유해보세요
          </p>
        </div>

        {/* 모바일 필터 버튼 */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow text-blue-600 text-sm"
          >
            <i className="fas fa-filter"></i>
            {getCategoryName(currentCategory)} {showMobileFilter ? "▲" : "▼"}
          </button>
          <button
            onClick={() => setShowWriteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            <i className="fas fa-pen"></i> 글쓰기
          </button>
        </div>

        {/* 모바일 필터 드롭다운 */}
        {showMobileFilter && (
          <div className="bg-white rounded-xl p-4 shadow-lg mb-4 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryInfo).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentCategory(key);
                    setShowMobileFilter(false);
                  }}
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    currentCategory === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  <i className={data.icon}></i>
                  <span className="text-sm">{data.title}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <select
                value={currentSort}
                onChange={(e) => setCurrentSort(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
                <option value="comments">댓글순</option>
                <option value="views">조회순</option>
              </select>
            </div>
          </div>
        )}

        {/* 데스크톱 카테고리 그리드 - 모바일에서는 숨김 */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries({
            info: {
              icon: "fas fa-info-circle",
              title: "정보공유",
              desc: "유용한 인허가 정보와 팁을 공유해요",
              posts: 124,
              comments: 356,
            },
            qna: {
              icon: "fas fa-question-circle",
              title: "Q&A",
              desc: "궁금한 점을 질문하고 답변을 받아보세요",
              posts: 89,
              comments: 203,
            },
            daily: {
              icon: "fas fa-coffee",
              title: "일상 이야기",
              desc: "자유롭게 일상을 공유하고 소통해요",
              posts: 67,
              comments: 145,
            },
            startup: {
              icon: "fas fa-rocket",
              title: "창업 관련 정보",
              desc: "창업에 필요한 정보와 경험을 나눠요",
              posts: 45,
              comments: 98,
            },
          }).map(([key, data]) => (
            <div
              key={key}
              onClick={() => setCurrentCategory(key)}
              className={`bg-white rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 border-2 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl ${
                currentCategory === key
                  ? "border-blue-600 bg-blue-50 -translate-y-1 shadow-xl"
                  : "border-transparent"
              }`}
            >
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mb-3">
                  <i className={`${data.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg text-gray-800 mb-1 font-semibold">
                  {data.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {data.desc}
                </p>
              </div>
              <div className="flex gap-3 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <i className="fas fa-file-alt"></i> {data.posts}개 게시글
                </span>
                <span className="flex items-center gap-1">
                  <i className="fas fa-comments"></i> {data.comments}개 댓글
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* 메인 게시글 영역 */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
              {/* 데스크톱 헤더 - 모바일에서는 숨김 */}
              <div className="hidden md:flex justify-between items-center mb-5 pb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-5">
                  <h2 className="text-xl md:text-2xl text-gray-800 m-0 flex items-center gap-2">
                    <i
                      className={
                        categoryInfo[
                          currentCategory as keyof typeof categoryInfo
                        ].icon
                      }
                    ></i>
                    {
                      categoryInfo[currentCategory as keyof typeof categoryInfo]
                        .title
                    }
                  </h2>
                  <select
                    value={currentSort}
                    onChange={(e) => setCurrentSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none cursor-pointer bg-white"
                  >
                    <option value="latest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="comments">댓글순</option>
                    <option value="views">조회순</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowWriteModal(true)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-pen"></i> 글쓰기
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <i className="fas fa-search text-5xl mb-4 opacity-50"></i>
                    <p>게시글이 없습니다.</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() =>
                        alert(
                          `"${post.title}" 게시글 상세 페이지로 이동합니다.`
                        )
                      }
                      className="border border-gray-200 rounded-lg p-4 transition-all duration-300 bg-white cursor-pointer hover:border-blue-600 hover:shadow-lg"
                    >
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.isNotice && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                            공지
                          </span>
                        )}
                        {post.isHot && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                            인기
                          </span>
                        )}
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          {getCategoryName(post.category)}
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg text-gray-800 mb-2 font-semibold leading-tight">
                        {post.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2 hidden md:block">
                        {post.preview}
                      </p>
                      <div className="flex flex-wrap justify-between items-center text-xs text-gray-500">
                        <div className="flex flex-wrap gap-3">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-user"></i> {post.userid}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-clock"></i>{" "}
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2 md:mt-0">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-eye"></i> {post.views}
                          </span>
                          <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                            <i className="fas fa-heart"></i> {post.likes}
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <i className="fas fa-comment"></i> {post.comments}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-center items-center mt-6 gap-2">
                <button
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  <i className="fas fa-chevron-left"></i> 이전
                </button>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-gray-300 rounded text-sm cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 ${
                        num === 1
                          ? "bg-blue-600 text-white border-blue-600"
                          : ""
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600">
                  다음 <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 - 모바일에서는 숨김 */}
          <div className="hidden md:block w-1/4">
            <div className="bg-white rounded-xl p-5 shadow-lg mb-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <i className="fas fa-user-circle text-blue-600 text-5xl"></i>
                </div>
                <div>
                  <h3 className="text-lg text-gray-800 mb-1">
                    {user.currentUser.name} {/* 닉네임 */}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {user?.currentUser?.email || "이메일 없음"} {/* 이메일 */}
                  </p>
                </div>
              </div>
              <div className="flex justify-between py-4 border-t border-b border-gray-200 mb-5">
                <div className="text-center">
                  <span className="block text-xl font-bold text-blue-600">
                    {postCount}
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
                  <span className="text-xs text-gray-600">받은 좋아요</span>
                </div>
              </div>
              <button
                onClick={() => setShowWriteModal(true)}
                className="w-full py-3 bg-blue-600 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-blue-700"
              >
                <i className="fas fa-pen mr-2"></i> 글쓰기
              </button>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg mb-4">
              <h3 className="text-base text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-tags"></i> 인기 태그
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "#영업허가",
                  "#건축허가",
                  "#창업",
                  "#법인설립",
                  "#세무",
                  "#노무",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:bg-blue-600 hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h3 className="text-base text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-chart-bar"></i> 커뮤니티 현황
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">전체 회원</span>
                  <span className="text-blue-600 font-semibold text-sm">
                    1,234명
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">오늘 방문자</span>
                  <span className="text-blue-600 font-semibold text-sm">
                    89명
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">전체 게시글</span>
                  <span className="text-blue-600 font-semibold text-sm">
                    325개
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 하단 플로팅 버튼 */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button
            onClick={() => setShowWriteModal(true)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-pen text-lg"></i>
          </button>
        </div>
      </div>

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <div className="modal open">
          <div className="modal-content w-full max-w-lg mx-3">
            <div className="modal-header">
              <h2>
                <i className="fas fa-pen mr-2"></i> 글쓰기
              </h2>
              <span className="close" onClick={() => setShowWriteModal(false)}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <form
                onSubmit={handleWriteSubmit}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="category"
                    className="text-base font-medium text-gray-800"
                  >
                    카테고리 선택
                  </label>
                  <select
                    name="category"
                    required
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600"
                  >
                    <option value="" disabled>
                      카테고리를 선택하세요
                    </option>
                    <option value="info">정보공유</option>
                    <option value="qna">Q&A</option>
                    <option value="daily">일상 이야기</option>
                    <option value="startup">창업 관련 정보</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="title"
                    className="text-base font-medium text-gray-800"
                  >
                    제목
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="제목을 입력하세요"
                    required
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="content"
                    className="text-base font-medium text-gray-800"
                  >
                    내용
                  </label>
                  <textarea
                    name="content"
                    placeholder="내용을 입력하세요"
                    rows={8}
                    required
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600 resize-vertical min-h-[150px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="tags"
                    className="text-base font-medium text-gray-800"
                  >
                    태그
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="태그를 입력하세요 (쉼표로 구분)"
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600"
                  />
                  <div className="text-xs text-gray-500">
                    예: #인허가, #창업, #음식점
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg text-base font-medium cursor-pointer transition-all hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all hover:bg-blue-700"
                  >
                    등록하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
