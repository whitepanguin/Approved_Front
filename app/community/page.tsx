"use client";

import type React from "react";
import { useRouter } from "next/navigation";

import { useState, useEffect, use } from "react";
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

const API_BASE_URL = "http://localhost:8000";

interface Post {
  _id: string;
  id: string;
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
  email: string;
}

interface Comment {
  _id: string;
  userid: string;
  createdAt: string | Date;
  content?: string;
  text?: string;
  id?: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentSort, setCurrentSort] = useState("latest");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const [postCount, setPostCount] = useState(0);

  const [commentCount, setCommentCount] = useState(0);

  const [likeSum, setLikeSum] = useState(0);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");

  const [totalUsers, setTotalUsers] = useState(0);

  const [totalPosts, setTotalPosts] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    setFilteredPosts(posts); // posts 변경 시 필터 초기화
  }, [posts]);

  // ✅ fetchStats 함수는 최상단에 선언해도 무방합니다 (return 없음)
  const fetchStats = async () => {
    const token =
      localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (!user?.currentUser?.email || !token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/posts/stats/email/${encodeURIComponent(
          user.currentUser.email
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("통계 불러오기 실패: " + errorText);
      }

      const data = await res.json();
      console.log("✅ 통계 데이터:", data);

      setPostCount(data.postCount);
      setCommentCount(data.commentCount);
      setLikeSum(data.likeCount ?? 0);
    } catch (err) {
      console.error("📊 통계 불러오기 중 오류:", err);
    }
  };

  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts/stats/community");
        const data = await res.json();
        setTotalUsers(data.totalUsers);
        setTotalPosts(data.totalPosts);
      } catch (err) {
        console.error("❌ 커뮤니티 통계 로딩 실패:", err);
      }
    };

    fetchCommunityStats();
  }, []);

  // 📊 게시글 수, 댓글 수, 좋아요 수 통합 통계 API 호출
  useEffect(() => {
    fetchStats(); // 조건은 fetchStats 내부에서 체크함
  }, [user?.currentUser?.email]);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
      setCategory(editingPost.category || "");
    } else {
      setTitle("");
      setContent("");
      setCategory("");
    }
  }, [editingPost]);

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
    console.log("수정할 글:", post);
    setEditingPost(post);
    setShowWriteModal(true);
  };

  // 삭제 버튼 핸들러

  const handleDelete = async (postId: string) => {
    console.log("🗑️ 삭제 요청 postId:", postId); // 디버깅
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

      await fetchStats();

      alert("✅ 삭제 완료");
      setShowPostModal(false); // 모달 닫기
      setSelectedPost(null); // 선택 글 초기화
      router.push("/community"); // 커뮤니티 이동
      router.push("/community"); // ✅ 커뮤니티 페이지로 이동 추가
    } catch (err) {
      console.error("❌ 삭제 오류:", err);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  /* 상세 모달 OPEN ─ 조회수·댓글·좋아요 갱신 */
  // ✅ 안전하게 ID 추출하는 함수
  const openPostModal = async (post: Post) => {
    const postId = post._id || post.id;
    if (!postId) {
      console.error("❌ post._id도 없고 post.id도 없음:", post);
      alert("유효하지 않은 게시글입니다.");
      return;
    }

    try {
      // ✅ 1) 조회수 PATCH (하루 1회)
      if (!hasViewedToday(postId)) {
        await fetch(`${API_BASE_URL}/posts/${postId}/view`, {
          method: "PATCH",
        });
        markViewedToday(postId);
        setPosts((prev) =>
          prev.map((p) =>
            (p._id || p.id) === postId ? { ...p, views: p.views + 1 } : p
          )
        );
      }
      console.log("ddddd", postId);
      // ✅ 2) 댓글 불러오기
      const res = await fetch(`${API_BASE_URL}/comments/${postId}`);
      if (!res.ok) throw new Error("댓글 가져오기 실패");
      const comments: Comment[] = await res.json();
      setPostComments(comments);

      // ✅ 3) 좋아요 상태 초기화
      setLiked(false);
      setLikeCount(post.likes);

      // ✅ 4) 게시글 모달 띄우기
      setSelectedPost({
        ...post,
        _id: post._id ?? post.id ?? "", // ← 이후 기능을 위해 _id 세팅
        content: post.content ?? post.preview,
      });
      setShowPostModal(true);
    } catch (err) {
      console.error(":x: 게시글 상세 정보 로딩 실패:", err);
      alert("게시글을 불러오는데 실패했습니다.");
    }
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setNewComment("");
  };

  // 좋아요 기능
  const handleToggleLike = async () => {
    if (!selectedPost?._id) return;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwtToken");

    if (!token) {
      alert("로그인 후 이용해 주세요!");
      return;
    }

    try {
      const email = user.currentUser.email;
      const userid = user.currentUser.userid;

      // 게시글 좋아요 처리
      const res = await fetch(
        `http://localhost:8000/likes/${
          selectedPost._id
        }?email=${encodeURIComponent(email)}&userid=${encodeURIComponent(
          userid
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ← 현재는 백엔드에서 사용 안 함이지만, 나중 대비 유지
          },
        }
      );

      if (!res.ok) throw new Error("좋아요 처리 실패");

      const { liked: nowLiked, likes } = await res.json();

      setLiked(nowLiked);
      setLikeCount(likes);
      setPosts((prev) =>
        prev.map((p) => (p._id === selectedPost._id ? { ...p, likes } : p))
      );
    } catch (err) {
      console.error(":x: 좋아요 처리 실패:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 커뮤니티 페이지 검색박스 핸들
  const handleSearch = () => {
    const filtered = posts.filter((post) =>
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
    setCurrentPage(1); // 페이지 초기화
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost?._id) return;
    const Token = localStorage.getItem("jwtToken");
    if (!Token) {
      alert("로그인 후 이용해주세요!");
      router.push("/login");
      return;
    }
    try {
      const payload = {
        postId: selectedPost._id,
        userid: user.currentUser.userid, // ← 백엔드에서 무시해도 되므로 그대로 둠
        content: newComment,
        email: user.currentUser.email,
      };
      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("댓글 등록 실패");

      const savedComment: Comment = await res.json();

      setPostComments((prev) => [...prev, savedComment]);
      setNewComment("");
      setPosts((prev) =>
        prev.map((p) =>
          p._id === selectedPost._id ? { ...p, comments: p.comments + 1 } : p
        )
      );
    } catch (err) {
      console.error(":x: 댓글 추가 실패:", err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  // 게시글 상세페이지 신고 로직
  const handleReport = async (postId: string) => {
    console.log("신고버튼", selectedPost?._id);
    try {
      const res = await fetch(
        `http://localhost:8000/posts/${selectedPost?._id}/report`,
        {
          method: "PATCH",
        }
      );
      const data = await res.json();
      console.log(data);
      alert(data.message); // ✅ 알림 추가
    } catch (err) {
      console.error("❌ 신고 실패:", err);
      alert("신고 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts/category-counts");
        const data = await res.json();
        // console.log("카테고리 수", data);
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
      title: "창업 정보",
      icon: "fas fa-rocket",
      posts: categoryCounts["startup"] || 0,
      comments: 0,
      desc: "창업에 필요한 정보와 경험을 나눠요",
    },
  };

  // 1. 게시글 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts");
        const data = await res.json();

        let postArray: Post[] = [];

        if (Array.isArray(data)) {
          postArray = data;
        } else if (Array.isArray(data.posts)) {
          postArray = data.posts;
        } else {
          console.error("❌ 예기치 않은 응답:", data);
          setPosts([]);
          return;
        }

        // 최신글 먼저 정렬
        const sortedPosts = postArray.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // "dev" 카테고리 제외 후 저장
        const filteredPosts = sortedPosts.filter(
          (post) => post.category?.trim().toLowerCase() !== "dev"
        );

        setPosts(filteredPosts);
      } catch (err) {
        console.error("❌ 게시글 로딩 실패:", err);
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  const displayedPosts = (searchTerm ? filteredPosts : posts)
    .filter(
      (post) =>
        post.category !== "dev" &&
        (currentCategory === "all" || post.category === currentCategory)
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
  const currentPosts = displayedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(displayedPosts.length / postsPerPage);

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
      userid: user.currentUser.userid,
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
      email: user.currentUser.email,
    };

    if (editingPost) {
      console.log("🛠 수정 모드입니다");
      console.log("📌 editingPost 객체:", editingPost);
      console.log("📌 editingPost._id 값:", editingPost._id);
      console.log("📌 editingPost.id 값:", editingPost.id);
    }

    try {
      let res;

      // ✅ 수정인지 확인 (id 보완)
      if (editingPost) {
        const postId = editingPost._id || editingPost.id;
        if (!postId) {
          alert("수정할 게시글 ID가 없습니다.");
          return;
        }

        res = await fetch(`http://localhost:8000/posts/${postId}`, {
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
      console.log("📌 최신 글 목록:", updatedPosts);
      setPosts(updatedPosts);
      await fetchStats();
      setShowWriteModal(false);
      setEditingPost(null);
      alert(
        editingPost ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다."
      );
    } catch (err) {
      console.error("❌ 서버 오류:", err);
      alert("서버에 문제가 있어 게시글을 저장하지 못했습니다.");
    }
  };

  return (
    <MainLayout introPassed={true}>
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
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl text-gray-800 m-0 flex items-center gap-2 min-w-[120px]">
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
                </div>
                {/* 🔽 정렬 드롭다운 */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* 정렬 드롭다운 */}
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

                  {/* 커뮤니티 검색창 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="내용 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                    <button
                      onClick={handleSearch}
                      className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowWriteModal(true)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 hover:bg-blue-700 transition-colors ml-auto"
                  >
                    <FontAwesomeIcon icon={faPen} /> 글쓰기
                  </button>
                </div>
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
                    {currentPosts.map((post, index) => (
                      <div
                        key={post._id || index}
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
                            {user?.currentUser?.email &&
                              post.email === user.currentUser.email && (
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
                                      if (post._id) handleDelete(post._id);
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
                  {user?.currentUser ? (
                    <>
                      <h3 className="text-lg text-gray-800 mb-1">
                        {user.currentUser.userid} {/* 닉네임 */}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {user.currentUser.email || "이메일 없음"} {/* 이메일 */}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg text-gray-400 mb-1">
                        로그인 필요
                      </h3>
                      <p className="text-gray-400 text-sm">이메일 없음</p>
                    </>
                  )}
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
                    {commentCount}
                  </span>
                  <span className="text-xs text-gray-600">댓글</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-blue-600">
                    {likeSum}
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

            {/* 커뮤니티 현황 */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h3 className="text-base text-gray-800 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartBar} /> 커뮤니티 현황
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">전체 회원</span>
                  <span className="text-blue-600 font-semibold text-sm">
                    {totalUsers}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">전체 게시글</span>
                  <span className="text-blue-600 font-semibold text-sm">
                    {totalPosts}
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

      {/* 수정하기 상세페이지 모달 */}
      {showWriteModal && (
        <div className="modal open">
          <div className="modal-content w-full max-w-lg mx-3">
            <div className="modal-header">
              <h2>
                <FontAwesomeIcon icon={faPen} className="mr-2" />
                {editingPost ? "수정하기" : "글쓰기"}
              </h2>
              <span
                className="close"
                onClick={() => {
                  setShowWriteModal(false);
                  setEditingPost(null); // 닫을 때 초기화
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              <form
                onSubmit={handleWriteSubmit}
                className="flex flex-col gap-5"
              >
                {/* 카테고리 선택 */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="category"
                    className="text-base font-medium text-gray-800"
                  >
                    카테고리 선택
                  </label>
                  <select
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600"
                  >
                    <option value="" disabled>
                      카테고리를 선택하세요
                    </option>
                    <option value="info">정보공유</option>
                    <option value="qna">Q&A</option>
                    <option value="daily">일상 이야기</option>
                    <option value="startup">창업 정보</option>
                  </select>
                </div>

                {/* 제목 입력 */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="title"
                    className="text-base font-medium text-gray-800"
                  >
                    제목
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title" // ✅ 이거 꼭 추가
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    required
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600"
                  />
                </div>

                {/* 내용 입력 */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="content"
                    className="text-base font-medium text-gray-800"
                  >
                    내용
                  </label>
                  <textarea
                    id="content"
                    name="content" //추가
                    value={content || ""}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                    className="px-3 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-600"
                    rows={6}
                    required
                  />
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingPost ? "수정 완료" : "글 등록"}
                </button>
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
                      key={(comment._id || comment.id)?.toString()} // ✅ 고유 key
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

              {/* 상세페이지 신고/삭제  🔽 */}
              {selectedPost && user.currentUser && (
                <div className="flex justify-end gap-4 px-2 pt-4 text-sm text-gray-600">
                  {/* ✅ 자기 글일 때만 삭제 버튼 */}
                  {selectedPost.userid === user.currentUser.userid && (
                    <button
                      onClick={() => handleDelete(selectedPost._id!)}
                      className="text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  )}

                  {/* ✅ 자기 글이 아닐 때만 신고 버튼 */}
                  {selectedPost.userid !== user.currentUser.userid && (
                    <button
                      onClick={() => handleReport(selectedPost._id!)}
                      className="text-orange-500 hover:underline"
                    >
                      신고
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
