"use client";

import type React from "react";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "../providers";
import { useSelector } from "react-redux";
import { RootState } from "../../store"; // store 타입 import 필요
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  /* 사용하는 solid 아이콘 */
  faUsers,
  faFilter,
  faPen,
  faFileAlt,
  faComments,
  faSearch,
  faInfoCircle,
  faQuestionCircle,
  faCoffee,
  faRocket,
  faList,
  faComment,
  faChartBar,
  faTags,
  faEye,
  faClock,
  faUser,
  faHeart,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  /* 사용하는 regular 아이콘 */
  faHeart as farHeart,
  faComment as farComment,
} from "@fortawesome/free-regular-svg-icons";

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
  content: string;
}

interface Comment {
  _id: string;
  userid: string;
  createdAt: string | Date;
  content?: string;
  text?: string;
  id: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentSort, setCurrentSort] = useState("latest");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const user = useSelector((state: RootState) => state.user);

  const [postCount, setPostCount] = useState(0);

  // 포스트 상세 모달 관련 상태
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const todayKey = () => "viewedPosts_" + new Date().toISOString().slice(0, 10);

  const hasViewedToday = (id: string) => {
    const viewed: string[] = JSON.parse(
      localStorage.getItem(todayKey()) || "[]"
    );
    return viewed.includes(id);
  };

  const markViewedToday = (id: string) => {
    const viewed: string[] = JSON.parse(
      localStorage.getItem(todayKey()) || "[]"
    );
    localStorage.setItem(todayKey(), JSON.stringify([...viewed, id]));
  };

  // 수정 버튼 핸들러
  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowWriteModal(true);
  };

  // 삭제 버튼 핸들러
  const handleDelete = async (postId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`http://localhost:8000/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제 실패");

      const updatedPosts = await fetch("http://localhost:8000/posts").then(
        (res) => res.json()
      );
      setPosts(updatedPosts);

      await fetchPostCount();

      alert("✅ 삭제 완료");
    } catch (err) {
      console.error("❌ 삭제 오류:", err);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  /* 상세 모달 OPEN ─ 조회수·댓글·좋아요 갱신 */
  const openPostModal = async (post: Post) => {
    try {
      // 1) 조회수 PATCH (하루 1회)
      if (!hasViewedToday(post._id!)) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}/view`,
          {
            method: "PATCH",
          }
        );
        markViewedToday(post._id!);

        // 카드 조회수 +1 동기화
        setPosts((prev) =>
          prev.map((p) =>
            p._id === post._id ? { ...p, views: p.views + 1 } : p
          )
        );
      }

      // 2) 댓글 가져오기
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${post._id}`
      );
      setPostComments(await r.json());

      // 3) 좋아요 초기화(추후 서버에서 상태 확인 로직 넣을 수 있음)
      setLiked(false);
      setLikeCount(post.likes);

      // 4) 모달 열기
      setSelectedPost({ ...post, content: post.content ?? post.preview });
      setShowPostModal(true);
    } catch (err) {
      console.error("❌ 게시글 상세 로딩 실패:", err);
      alert("게시글을 불러오지 못했습니다.");
    }
  };

  /* 모달 CLOSE */
  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setNewComment("");
  };

  /* 좋아요 토글 */
  const handleToggleLike = async () => {
    if (!selectedPost?._id) return;

    const token =
      localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!token) return alert("로그인 필요!");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${selectedPost._id}/like`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { liked: nowLiked, likes } = await res.json();

      setLiked(nowLiked);
      setLikeCount(likes);
      setPosts((prev) =>
        prev.map((p) => (p._id === selectedPost._id ? { ...p, likes } : p))
      );
    } catch (err) {
      console.error("❌ 좋아요 실패:", err);
    }
  };

  /* 댓글 등록 */
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost?._id) return;

    try {
      const payload = {
        postId: selectedPost._id,
        userid: user.currentUser.name,
        content: newComment,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();

      setPostComments((prev) => [...prev, saved]);
      setNewComment("");
      setPosts((prev) =>
        prev.map((p) =>
          p._id === selectedPost._id ? { ...p, comments: p.comments + 1 } : p
        )
      );
    } catch (err) {
      console.error("❌ 댓글 등록 실패:", err);
    }
  };

  useEffect(() => {
    console.log("유저 ID 찍어보기", user);
    const fetchCategoryCounts = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts/category-counts");
        const data = await res.json();
        setCategoryCounts(data);
      } catch (err) {
        console.error("❌ 카테고리 수 불러오기 실패:", err);
      }
    };

    fetchCategoryCounts();
  }, []);

  const categoryInfo = {
    all: {
      title: "전체 게시글",
      icon: "fas fa-list",
      posts: posts.length,
      comments: 0,
      desc: "모든 게시글을 확인할 수 있어요",
    },
    info: {
      title: "정보공유",
      icon: "fas fa-info-circle",
      posts: categoryCounts["info"] || 0,
      comments: 0,
      desc: "유용한 인허가 정보와 팁을 공유해요",
    },
    qna: {
      title: "Q&A",
      icon: "fas fa-question-circle",
      posts: categoryCounts["qna"] || 0,
      comments: 0,
      desc: "궁금한 점을 질문하고 답변을 받아보세요",
    },
    daily: {
      title: "일상 이야기",
      icon: "fas fa-coffee",
      posts: categoryCounts["daily"] || 0,
      comments: 0,
      desc: "자유롭게 일상을 공유하고 소통해요",
    },
    startup: {
      title: "창업 관련 정보",
      icon: "fas fa-rocket",
      posts: categoryCounts["startup"] || 0,
      comments: 0,
      desc: "창업에 필요한 정보와 경험을 나눠요",
    },
  };

  const fetchPostCount = async () => {
    try {
      console.log("유저 ID 찍어보기", user);
      const res = await fetch(
        `http://localhost:8000/posts/count/${user.currentUser.name}`
      );
      const data = await res.json();
      setPostCount(data.count);
    } catch (err) {
      console.error("❌ 작성글 수 조회 실패:", err);
    }
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

  // 1. 게시글 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts");
        const data = await res.json();
        setPosts(data);
        console.log("✅ 게시글 불러오기 성공:", data);
      } catch (err) {
        console.error("❌ 게시글 로딩 실패:", err);
      }
    };

    fetchPosts();
  }, []);

  // 2. 작성글 수 불러오기 (user가 있을 경우에만)
  useEffect(() => {
    if (!user?.currentUser?.name) return;

    const fetchPostCount = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/posts/count/${user.currentUser.name}`
        );
        const data = await res.json();
        setPostCount(data.count);
        console.log("✅ 작성글 수 불러오기 성공:", data.count);
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
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

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

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const preview = content.substring(0, 100) + "...";

    const payload = {
      userid: user.currentUser.name,
      title,
      content,
      category,
      tags: [],
      views: 0,
      comments: 0,
      likes: 0,
      preview,
      isHot: false,
      isNotice: false,
    };

    try {
      let res;

      // ✅ 수정인지 확인
      if (editingPost) {
        res = await fetch(`http://localhost:8000/posts/${editingPost._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:8000/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("❌ 글 저장 실패");

      // 최신 글 목록 다시 불러오기
      const updatedPosts = await fetch("http://localhost:8000/posts").then(
        (res) => res.json()
      );

      setPosts(updatedPosts);
      await fetchPostCount();
      setShowWriteModal(false);
      setEditingPost(null); // ← 수정 후 초기화
      alert(
        editingPost ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다."
      );
    } catch (err) {
      console.error("❌ 서버 오류:", err);
      alert("서버에 문제가 있어 게시글을 저장하지 못했습니다.");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-3 md:p-5">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl text-blue-600 mb-1 md:mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} /> 커뮤니티
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
            <FontAwesomeIcon icon={faFilter} />
            {getCategoryName(currentCategory)} {showMobileFilter ? "▲" : "▼"}
          </button>
          <button
            onClick={() => setShowWriteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            <FontAwesomeIcon icon={faPen} /> 글쓰기
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
          {Object.entries(categoryInfo)
            .filter(([key]) => key !== "all") // ← "전체"는 제외
            .map(([key, data]) => (
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
                    <FontAwesomeIcon icon={faFileAlt} /> {data.posts}개 게시글
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faComments} /> {data.comments}개 댓글
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
                  <FontAwesomeIcon icon={faPen} /> 글쓰기
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-5xl mb-4 opacity-50"
                    />
                    <p>게시글이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    {currentPosts.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => openPostModal(post)}
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
                          {/* 작성자 + 작성일 */}
                          <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faUser} /> {post.userid}
                            </span>
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} />{" "}
                              {formatDate(post.createdAt)}
                            </span>
                          </div>

                          {/* 조회/좋아요/댓글 + 수정삭제 */}
                          <div className="flex gap-3 mt-2 md:mt-0 items-center">
                            <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faEye} /> {post.views}
                            </span>
                            <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                              <FontAwesomeIcon icon={faHeart} /> {post.likes}
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <FontAwesomeIcon icon={faComment} />{" "}
                              {post.comments}
                            </button>

                            {/* 수정/삭제 버튼 (본인 글만 표시) */}
                            {post.userid === user.currentUser.name && (
                              <div className="flex gap-2 ml-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(post);
                                  }}
                                  className="text-blue-600 hover:underline"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(post._id!);
                                  }}
                                  className="text-red-600 hover:underline"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center items-center mt-6 gap-2">
                      {/* << 처음 */}
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &laquo;
                      </button>

                      {/* < 이전 */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &lt;
                      </button>

                      {/* 페이지 번호 */}
                      <div className="flex gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((num) => (
                          <button
                            key={num}
                            onClick={() => setCurrentPage(num)}
                            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-gray-300 rounded text-sm cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 ${
                              currentPage === num
                                ? "bg-blue-600 text-white border-blue-600"
                                : ""
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      {/* > 다음 */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &gt;
                      </button>

                      {/* >> 끝 */}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &raquo;
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 - 모바일에서는 숨김 */}
          <div className="hidden md:block w-1/4">
            <div className="bg-white rounded-xl p-5 shadow-lg mb-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-blue-600 text-5xl"
                  />
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
                <FontAwesomeIcon icon={faPen} className="mr-2" /> 글쓰기
              </button>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg mb-4">
              <h3 className="text-base text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faTags} /> 인기 태그
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
                <FontAwesomeIcon icon={faChartBar} /> 커뮤니티 현황
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
            <FontAwesomeIcon icon={faChartBar} /> 커뮤니티 현황
          </button>
        </div>
      </div>

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <div className="modal open">
          <div className="modal-content w-full max-w-lg mx-3">
            <div className="modal-header">
              <h2>
                <FontAwesomeIcon icon={faPen} className="mr-2" /> 글쓰기
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
      {/* 게시글 상세 모달 */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
            {/* -------- header -------- */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold truncate">
                {selectedPost.title}
              </h2>
              <button
                onClick={closePostModal}
                className="text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* -------- body -------- */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* 메타 정보 */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex flex-wrap gap-4">
                  <span>
                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                    {selectedPost.userid}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span>
                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                    {selectedPost.views}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faHeart} className="mr-1" />
                    {likeCount}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faComment} className="mr-1" />
                    {postComments.length}
                  </span>
                </div>
              </div>

              {/* 본문 */}
              <p className="whitespace-pre-line leading-relaxed text-gray-800">
                {selectedPost.content ?? selectedPost.preview}
              </p>

              {/* 좋아요 / 댓글 버튼 영역 */}
              <div className="flex items-center gap-6 text-gray-600">
                <button
                  onClick={handleToggleLike}
                  className="flex items-center gap-1 hover:text-pink-600"
                >
                  <FontAwesomeIcon icon={liked ? faHeart : farHeart} />
                  <span>{likeCount}</span>
                </button>

                <button
                  onClick={() =>
                    document.getElementById("commentInput")?.focus()
                  }
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <FontAwesomeIcon icon={farComment} />
                  <span>{postComments.length}</span>
                </button>
              </div>

              {/* ------- 댓글 리스트 ------- */}
              <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
                {postComments.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    등록된 댓글이 없습니다.
                  </p>
                ) : (
                  postComments.map((comment) => (
                    <div
                      key={comment._id || comment.id} // ✅ 고유 key
                      className="p-3 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-blue-600 text-xl"
                          />
                          <span className="font-medium">{comment.userid}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">
                        {comment.content ?? comment.text} {/* ✅ 필드명 보강 */}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* ------- 댓글 입력 ------- */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <input
                  id="commentInput"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="댓글을 입력하세요…"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
