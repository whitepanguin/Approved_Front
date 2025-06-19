"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "../providers";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { setUser } from "@/modules/user";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import PostCard from "@/components/postCard/postCard"; // 꼭 경로 맞게
import PostModal from "@/components/postModal/postModal";
type Post = {
  _id: string;
  title: string;
  content: string;
  date: string;
  preview?: string;
  userid?: string;
  author?: string;
  category?: string;
  views?: number;
  likes?: number;
  comments?: number;
  emoji?: string;
  createdAt: string | Date;
};

type Comment = {
  _id: string;
  postId: string; //댓글 모달
  userid: string;
  postTitle: string;
  content: string;
  createdAt: string | Date;
};

export default function MyPage() {
  const PER_PAGE = 10; // 탭 공통 개수
  const [page, setPage] = useState({
    posts: 1,
    comments: 1,
    likes: 1,
  });
  // 🔹 Redux 및 로그인 관련
  const dispatch = useDispatch();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const user = useSelector((state: RootState) => state.user.currentUser);

  // 🔹 인증 토큰
  const [token, setToken] = useState<string | null>(null);

  // 🔹 프로필 이미지 경로 처리
  const profileSrc = user?.profile
    ? `http://localhost:8000${user.profile}?v=${Date.now()}`
    : "/default-profile.jpg";
  // 🔹 프로필 수정 상태
  const [profileData, setProfileData] = useState({
    userid: "",
    name: "",
    email: "",
    phone: "",
    businessType: "",
    joinDate: "",
  });
  const [originalUserId, setOriginalUserId] = useState(""); // 기존 닉네임 기억용
  const [isChecked, setIsChecked] = useState(false); // 닉네임 중복확인 여부
  const [isEditing, setIsEditing] = useState(false); // 프로필 수정 모드
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // 이미지 파일 선택
  const fileInputRef = useRef<HTMLInputElement | null>(null); // 파일 input 참조

  // 🔹 마이페이지 탭 상태
  const [activeTab, setActiveTab] = useState("profile"); // 탭: profile | posts | comments | likes
  const [sortKey, setSortKey] = useState<"latest" | "likes" | "comments">(
    "latest"
  ); // 정렬 기준

  // 글쓰기 모달
  const [showReportModal, setShowReportModal] = useState(false);

  // 🔹 내 게시글 / 댓글 / 좋아요한 글
  const [comments, setComments] = useState<Comment[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myComments, setMyComments] = useState<Comment[]>([]);
  // const [likedPosts, setLikedPosts] = useState([]); // 좋아요 누른
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  // 글 목록
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState("");

  // 🔹 정렬된 게시글 리스트
  const sortedPosts = [...myPosts].sort((a, b) => {
    if (sortKey === "likes") return (b.likes ?? 0) - (a.likes ?? 0);
    if (sortKey === "comments") return (b.comments ?? 0) - (a.comments ?? 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const [isStatsLoaded, setIsStatsLoaded] = useState(false);

  // 🔹 게시글 상세보기 모달 관련
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 불필요하면 제거 가능

 // ✅ 최초 통계 한방에 불러오기
useEffect(() => {
  if (!user?.userid || !token) return;

  const fetchAllStats = async () => {
    try {
      const userid = user.userid;

      const [postRes, commentRes, likeRes] = await Promise.all([
        fetch(`http://localhost:8000/posts/user/${userid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // 🔽 userid 로 변경
        fetch(`http://localhost:8000/comments/user/${userid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `http://localhost:8000/likes/user/${encodeURIComponent(
            userid
          )}/posts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setMyPosts(postRes.ok ? await postRes.json() : []);
      setMyComments(commentRes.ok ? await commentRes.json() : []);
      setLikedPosts(likeRes.ok ? await likeRes.json() : []);
    } catch (e) {
      console.error("📛 통계 불러오기 에러:", e);
    } finally {
      setIsStatsLoaded(true);
    }
  };

  fetchAllStats();
}, [user, token]);


  // 조회수
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

  // 🔹 상세보기 모달 내 좋아요 및 댓글 상태

  // 모달 열기
  // 📌 수정본
  const openPostModal = async (post: Post) => {
    const postId = post._id ?? (post as any).id;
    if (!postId || !user?.userid || !token) {
      alert("유저 정보 또는 게시글 정보가 없습니다.");
      return;
    }

    console.log("🔍 post._id:", post._id, typeof post._id);
    console.log("🟢 [모달] openPostModal 도착:", post);

    // post._id가 없을 경우를 대비해 강제로 넣어줌
    const normalizedPost = { ...post, _id: postId };
    setSelectedPost(normalizedPost);
    setShowPostModal(true);

    // 1) 조회수 PATCH (하루 1회)
    try {
      if (!hasViewedToday(postId)) {
        await fetch(`http://localhost:8000/posts/${postId}/view`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        markViewedToday(postId);

        // 리스트 카드 +1
        setMyPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, views: (p.views ?? 0) + 1 } : p
          )
        );

        // 모달 내부도 +1
        setSelectedPost((prev) =>
          prev ? { ...prev, views: (prev.views ?? 0) + 1 } : prev
        );
      }
    } catch (err) {
      console.error("조회수 증가 실패:", err);
    }

    // 2) 댓글 불러오기
    try {
      const r = await fetch(`http://localhost:8000/comments/${postId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setComments(await r.json());
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
      setComments([]);
    }

    // 3) 좋아요 상태 및 개수 불러오기
    try {
      const r = await fetch(`http://localhost:8000/posts/${postId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const p = await r.json();

      const nowLikeCnt = typeof p.likes === "number" ? p.likes : 0;

      const likeRes = await fetch(
        `http://localhost:8000/likes/user/${user.userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const likeList = await likeRes.json();
      const nowLiked = likeList.some(
        (like: any) => like.postId?._id === postId
      );

      setLiked(nowLiked);
      setLikeCount(nowLikeCnt);

      // 카드에도 반영
      setMyPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: nowLikeCnt } : p))
      );

      // 모달에도 반영
      setSelectedPost((prev) => (prev ? { ...prev, likes: nowLikeCnt } : prev));
    } catch (err) {
      console.error("좋아요 상태 불러오기 실패:", err);
      setLiked(false);
      setLikeCount(0);
    }
  };

  // 불만사항/신고글 작성
  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  /* 폼 → payload */
  const form = new FormData(e.currentTarget);
  const payload = {
    category: "dev",            // 고정
    title: form.get("title"),
    content: form.get("content"),
    userid: user?.userid,
  };

  try {
    /*  fetch */
    const res = await fetch("http://localhost:8000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    /* 에러 판정 */
    const resultText = await res.clone().text(); // 메시지 추출
    if (!res.ok) throw new Error(resultText || `HTTP ${res.status}`);

    /* 성공 로직 */
    alert("✅ 접수되었습니다!");

    // reset 먼저
    if (e.currentTarget) {
      e.currentTarget.reset();
    }

    // 모달 닫기
    setShowReportModal(false);
  } catch (err) {
    /* 5️⃣ 실패 로직 */
    alert(
      err instanceof Error
        ? `등록 실패: ${err.message}`
        : "등록 중 알 수 없는 오류가 발생했습니다."
    );
  }
};



  /** 댓글을 클릭했을 때 실행 */
  const openPostFromComment = async (comment: Comment) => {
    // 1️⃣ title로 내 글 / 좋아요 글 배열에서 먼저 찾아보기
    let post =
      myPosts.find((p) => p.title === comment.postTitle) ||
      likedPosts.find((p) => p.title === comment.postTitle);

    // 2️⃣ 못 찾았으면 서버에 '제목 검색' 요청 (이미 존재하는 검색 API 활용)
    if (!post) {
      try {
        const r = await fetch(
          `http://localhost:8000/posts/search?title=` +
            encodeURIComponent(comment.postTitle),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (r.ok) {
          const list = await r.json();
          post = list[0]; // 첫 번째 결과 사용 (필요하면 더 정교하게)
        }
      } catch (err) {
        console.error("🔴 제목 검색 실패:", err);
      }
    }

    // 3️⃣ post가 확보되면 모달 열기
    if (post) {
      openPostModal(post);
    } else {
      alert("❌ 관련 게시글을 찾을 수 없습니다.");
    }
  };

  const handleToggleLike = async () => {
    const token = localStorage.getItem("jwtToken");
    const userid = user?.userid;
    const postId = selectedPost?._id;
    console.log("❤️ 좋아요 토글 시도:");
    console.log("👉 token:", token);
    console.log("👉 userid:", userid);
    console.log("👉 postId:", postId);

    if (!token || !userid || !postId) {
      console.warn("❌ 좋아요 요청 조건 부족");
      alert("유저 정보 또는 게시글 정보가 없습니다.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/likes/${postId}?userid=${encodeURIComponent(
          userid
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const result = await res.text(); // "liked" or "unliked"

      const countRes = await fetch(
        `http://localhost:8000/posts/${postId}/like-count`
      );
      const { likeCount } = await countRes.json();

      setLiked(result === "liked");
      setLikeCount(likeCount);
      setMyPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: likeCount } : p))
      );
      setSelectedPost((prev) => (prev ? { ...prev, likes: likeCount } : prev));
    } catch (err) {
      console.error("❌ 좋아요 토글 실패:", err);
      alert(err instanceof Error ? err.message : "좋아요 처리 중 오류 발생");
    }
  };

  // 댓글 등록
  const handleAddComment = async (content: string) => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          postId: selectedPost?._id,
          userid: user?.userid,
          content,
        }),
      });
      if (!res.ok) throw new Error("댓글 등록 실패");
      const saved = await res.json();
      setComments((prev) => [...prev, saved]); // 새 댓글 목록에 추가
      setNewComment(""); // 입력창 비우기
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("jwtToken");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!user) return;

    setProfileData((prev) => ({
      ...prev,
      userid: user.userid ?? "",
      phone: user.phone ?? "",
      businessType: user.businessType ?? "",
      joinDate: user.createdAt?.slice(0, 10) ?? "",
    }));
    setOriginalUserId(user.userid ?? ""); // 닉네임 변경 여부 비교용
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/mypage/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("🔵 JWT 기반 프로필 불러옴:", data);
        dispatch(setUser(data)); // ✅ 여기서 Redux에 저장!
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    console.log("🔍🔍 activeTab 변경:", activeTab);
  }, [activeTab]);

  // 좋아요 한 글 불러오기
  useEffect(() => {
    const fetchLikedPosts = async () => {
      const userid = user?.userid;
      if (!userid) return;

      try {
        const res = await fetch(
          `http://localhost:8000/likes/user/${encodeURIComponent(
            userid
          )}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json(); // ✅ 본문은 한 번만 읽는다

        console.log("📡 좋아요 조회 응답 상태:", res.status);

        if (!res.ok) {
          console.error("📡 좋아요 응답 내용:", data); // 실패 내용 로깅
          throw new Error("좋아요한 글 조회 실패");
        }

        // 성공 시
        setLikedPosts(data);
      } catch (err) {
        console.error("❌ 좋아요한 글 불러오기 에러:", err);
      }
    };

    if (activeTab === "likes" && user) fetchLikedPosts();
  }, [activeTab, user, token]); // token 의존성도 함께 지정

  // 내 댓글 불러오기
  useEffect(() => {
    const fetchMyComments = async () => {
      console.log("🗨️ fetchMyComments 호출");

      const userid = user?.userid;

      if (!userid) {
        console.warn("🟡 userid/email/name 없음, 요청 중단");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8000/comments/user/${encodeURIComponent(userid)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`내 댓글 조회 실패: ${res.status}`);

        const data = await res.json();
        console.log("✅ 받아온 댓글:", data);
        console.log("user:", user);
        console.log("user.userid:", user?.userid);
        console.log("user.email:", user?.email);
        console.log("user.name:", user?.name);
        console.log("userid:", userid);

        setMyComments(data);
      } catch (err) {
        console.error("❌ 내 댓글 조회 에러:", err);
      }
    };

    // 🗂️ 'comments' 탭이 활성화되고 user 객체가 준비된 뒤에만 호출
    if (activeTab === "comments" && user) {
      fetchMyComments();
    }
  }, [activeTab, user]);

  // 내 게시글 불러오기
  useEffect(() => {
    const fetchMyPosts = async () => {
      const userid = user?.userid || user?.name;
      if (!userid) {
        console.warn("🟡 userid 또는 name 없음, 요청 중단");
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/posts/user/${userid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("내 글 조회 실패");

        const posts = await res.json();
        console.log("✅ 받아온 게시글:", posts);
        setMyPosts(posts);
      } catch (err) {
        console.error("❌ 내 글 조회 에러:", err);
      }
    };

    // 🔑 탭이 'posts' 이고, user 정보가 로드된 뒤에만 실행
    if (activeTab === "posts" && user) {
      fetchMyPosts();
    }
  }, [activeTab, user]); // ← 의존성도 user.currentUser → user

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("정말로 회원 탈퇴하시겠습니까?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/users/remove`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user?.email }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      alert("회원탈퇴 완료 🥲");

      // ✅ 토큰 제거
      localStorage.removeItem("jwtToken");
      sessionStorage.removeItem("jwtToken");

      // ✅ 메인 페이지 이동 (Next.js)
      window.location.href = "/";
    } catch (err: any) {
      console.error("회원탈퇴 오류:", err);
      alert("서버 오류로 탈퇴에 실패했습니다.");
    }
  };

  // 파일 선택 시 상태에 저장
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // input file 트리거
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 프로필 이미지 업로드
  // 프로필 이미지 업로드
  const handleUploadPicture = async () => {
    if (!selectedImage) {
      alert("업로드할 이미지를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("picture", selectedImage);
    formData.append("email", user?.email || "");

    try {
      const res = await fetch(`http://localhost:8000/users/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ 프로필 이미지 업로드 완료");

      // ✅ user 상태에 새 프로필 이미지 경로 반영
      dispatch(
        setUser({
          ...user,
          profile: data.filePath, // 새로 저장된 파일 경로
        })
      );
    } catch (err: any) {
      console.error("이미지 업로드 실패:", err.message);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };
  // useEffect: 프로필 처음 불러올 때 닉네임 기억해두기
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (!token || !user?.email) {
      console.warn("❗ 토큰 또는 user.email이 없습니다. 요청 중단");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/users/getUserInfo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("🔎 getUserInfo 응답:", data);
        setProfileData({
          userid: data.userid || "",
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          businessType: data.businessType || "",
          joinDate: data.createdAt?.slice(0, 10) || "",
        });
        setOriginalUserId(data.userid || ""); // ✅ 최초 닉네임 기억
      } catch (err) {
        console.error("❌ 프로필 불러오기 실패:", err);
      }
    };

    fetchUserProfile();
  }, [user?.email]);

  // 중복확인
  const handleCheckDuplicate = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/users/check-duplicate?userid=${profileData.userid}`
      );

      console.log("📡 중복확인 응답 상태:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ 서버 응답 내용:", text);
        throw new Error("중복확인 실패");
      }

      const result = await res.json();
      console.log("✅ 중복확인 결과:", result);

      if (result.exists) {
        alert("이미 사용 중인 닉네임입니다.");
      } else {
        alert("사용 가능한 닉네임입니다!");
        setIsChecked(true);
      }
    } catch (err) {
      console.error("❌ 중복확인 에러:", err);
      alert("중복확인 중 오류가 발생했습니다.");
      setIsChecked(false);
    }
  };

  // 저장하기 – DEBUG 버전
  const handleSaveProfile = async () => {
    // 1) 토큰 읽기
    const token =
      typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
    console.log("[handleSaveProfile] token →", token);

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const isNicknameChanged = profileData.userid !== originalUserId;
    console.log(
      "isNicknameChanged:",
      isNicknameChanged,
      "isChecked:",
      isChecked
    );
    if (isNicknameChanged && !isChecked) {
      alert("닉네임을 변경하셨습니다. 중복확인을 먼저 해주세요.");
      return;
    }

    // 3) 전송할 데이터
    const bodyToSend = {
      userid: profileData.userid,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      businessType: profileData.businessType,
    };
    console.table(bodyToSend);

    try {
      // 4) fetch 요청
      const res = await fetch(`http://localhost:8000/users/modify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      // 5) 응답 상태 및 헤더 로깅
      console.log("response.status:", res.status);
      console.log(
        "response.headers:",
        Object.fromEntries(res.headers.entries())
      );

      // 6) 결과 파싱
      const result = await res.json().catch(() => ({}));
      console.log("response.body:", result);

      if (!res.ok) throw new Error(result.message || "저장 실패");

      alert("✅ 저장 완료!");
      setOriginalUserId(profileData.userid); // 닉네임 원본 갱신
      setIsChecked(false); // 중복확인 플래그 리셋
    } catch (err) {
      console.error("❌ 저장 에러:", err);
      alert(
        err instanceof Error ? err.message : "저장 중 오류가 발생했습니다."
      );
    }
  };

  // 프로필 입력 필드 값 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 배열을 잘라서 현재 탭에 보여줄 목록만 반환
  const getPaged = <T,>(list: T[], tab: keyof typeof page) => {
    const start = (page[tab] - 1) * PER_PAGE;
    return list.slice(start, start + PER_PAGE);
  };

  // 총 페이지 수 계산
  const totalPages = (len: number) => Math.ceil(len / PER_PAGE);

  // 마이페이지 탭 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            <div className="relative">
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
                      value={user?.email || ""}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      아이디는 변경할 수 없습니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      프로필 이미지
                    </label>
                    <div className="flex">
                      <div
                        onClick={triggerFileInput}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-600 cursor-pointer bg-white flex items-center justify-between"
                      >
                        <span className="text-gray-500 text-sm">
                          {selectedImage
                            ? selectedImage.name
                            : "선택된 파일 없음"}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-medium">
                          파일 선택
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        onClick={handleUploadPicture}
                        className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        업로드
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
                        name="userid"
                        value={profileData.userid}
                        onChange={handleInputChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        onClick={handleCheckDuplicate}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
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
                      value={profileData.phone || ""}
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
                      value={profileData.businessType || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    >
                      <option value=""></option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-11"></label>
                    {/* <input
                      type="text"
                      name="joinDate"
                      value={user?.createdAt?.slice(0, 10) || ""}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    /> */}

                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "posts": {
        /* 1) 정렬 옵션 – JSX 밖 변수 */
        const sortOptions = [
          { key: "latest", label: "최신순" },
          { key: "likes", label: "인기순" },
          { key: "comments", label: "댓글순" },
        ];

        /* 2) 현재 페이지에 보여줄 글 10개 */
        const pagedPosts = getPaged(sortedPosts, "posts");

        /* 3) 반환 JSX */
        return (
          <>
            <div className="space-y-6">
              {/* 헤더 */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  내가 쓴 글
                </h3>

                <select
                  value={sortKey}
                  onChange={(e) =>
                    setSortKey(
                      e.target.value as "latest" | "likes" | "comments"
                    )
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 게시글 리스트 */}
              {pagedPosts.length > 0 ? (
                <div className="space-y-4">
                  {pagedPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={{
                        _id: post._id,
                        title: post.title,
                        preview: post.preview,
                        category: post.category,
                        author: post.userid,
                        createdAt: (post.createdAt || post.date) as string,
                        views: post.views,
                        likes: post.likes,
                        comments: post.comments,
                      }}
                      onClick={() => openPostModal(post)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-file-alt text-4xl mb-4 opacity-50" />
                  <p>작성한 글이 없습니다.</p>
                </div>
              )}

              {/* 페이지네이터 */}
              {sortedPosts.length > PER_PAGE && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-1">
                    {Array.from(
                      { length: totalPages(sortedPosts.length) },
                      (_, i) => i + 1
                    ).map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setPage((prev) => ({ ...prev, posts: num }))
                        }
                        className={`w-9 h-9 flex items-center justify-center border
                                      border-gray-300 rounded text-sm ${
                                        num === page.posts
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "hover:bg-gray-100"
                                      }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 🔍 상세 모달 */}
            {showPostModal && selectedPost && (
              <PostModal
                post={selectedPost}
                comments={comments}
                liked={liked} // ✅
                likeCount={likeCount} // ✅
                newComment={newComment}
                setNewComment={setNewComment}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
                onClose={() => {
                  setShowPostModal(false);
                  setSelectedPost(null);
                  setComments([]);
                }}
              />
            )}
          </>
        );
      }

      case "comments": {
        const pagedComments = getPaged(myComments, "comments");

        return (
          <div className="space-y-6">
            {/* 헤더 */}
            <h3 className="text-xl font-semibold text-gray-800">내 댓글</h3>

            {/* 본문 – 댓글 카드 리스트 */}
            {myComments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FontAwesomeIcon
                  icon={faCommentDots}
                  className="text-4xl mb-4 text-purple-500/50"
                />
                <p>작성한 댓글이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {pagedComments.map((comment) => (
                    <div
                      key={comment._id}
                      onClick={() => openPostFromComment(comment)}
                      className="p-5 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-600 hover:shadow transition-colors"
                    >
                      {/* 상단: 댓글이 달린 글 제목, 날짜 */}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-semibold text-gray-800 flex items-center">
                          <FontAwesomeIcon
                            icon={faCommentDots}
                            className="text-purple-500 mr-2"
                          />
                          {comment.postTitle}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      {/* 댓글 본문 */}
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 페이지네이터 */}
                {myComments.length > PER_PAGE && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-1">
                      {Array.from(
                        { length: totalPages(myComments.length) },
                        (_, i) => i + 1
                      ).map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            setPage((prev) => ({ ...prev, comments: num }))
                          }
                          className={`w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-sm ${
                            num === page.comments
                              ? "bg-blue-600 text-white border-blue-600"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

      case "likes": {
        /* 1) 정렬 → 기존 로직 유지해 정렬된 배열 준비 */
        const sortedLikes = [...likedPosts].sort((a, b) => {
          if (sortKey === "likes") return (b.likes ?? 0) - (a.likes ?? 0);
          if (sortKey === "comments")
            return (b.comments ?? 0) - (a.comments ?? 0);
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        /* 2) 현재 페이지 Likes 10개 */
        const pagedLikes = getPaged(sortedLikes, "likes");

        /* 3) 반환 JSX */
        return (
          <div className="space-y-6">
            {/* 헤더 */}
            <h3 className="text-xl font-semibold text-gray-800">좋아요한 글</h3>

            {/* 카드 리스트 */}
            {likedPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-heart text-4xl mb-4 opacity-50" />
                <p>좋아요한 글이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {pagedLikes.map((post) => (
                    <PostCard
                      key={post._id}
                      post={{
                        _id: post._id,
                        title: post.title,
                        preview:
                          post.preview || post.content?.slice(0, 80) + "...",
                        category: post.category,
                        author: post.userid ?? post.author,
                        createdAt: post.date ?? post.createdAt,
                        views: post.views,
                        likes: post.likes,
                        comments: post.comments,
                        emoji: post.emoji,
                      }}
                      onClick={() => openPostModal(post)}
                    />
                  ))}
                </div>

                {/* 페이지네이터 */}
                {likedPosts.length > PER_PAGE && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-1">
                      {Array.from(
                        { length: totalPages(likedPosts.length) },
                        (_, i) => i + 1
                      ).map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            setPage((prev) => ({ ...prev, likes: num }))
                          }
                          className={`w-9 h-9 flex items-center justify-center border
                                      border-gray-300 rounded text-sm ${
                                        num === page.likes
                                          ? "bg-blue-600 text-white border-blue-600"
                                          : "hover:bg-gray-100"
                                      }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

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
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <i className="fas fa-user-times mr-3"></i>
                    회원 탈퇴
                  </button>
                </div>
              </div>
              <div className="p-5 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">불만사항 / 신고</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full text-left p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <i className="fas fa-user-times mr-3"></i>
                    접수 / 신고하기
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
                {/*사진 올라가는 곳 */}
                <div className="flex justify-center">
                  <img
                    src={profileSrc || "/images/default-profile.png"} // src가 빈 경우도 대비
                    alt="프로필 이미지"
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-profile.png";
                    }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {user?.userid || ""}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {user?.email || ""}
                </p>

                <div className="flex justify-between w-full border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      {isStatsLoaded ? myPosts.length : "-"}
                    </span>
                    <span className="text-xs text-gray-600">작성글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      {isStatsLoaded ? myComments.length : "-"}
                    </span>
                    <span className="text-xs text-gray-600">댓글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      {isStatsLoaded ? likedPosts.length : "-"}
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
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-md w-full min-w-[800px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
      {showPostModal && selectedPost && (
        <PostModal
          post={selectedPost}
          comments={comments}
          liked={liked}
          likeCount={likeCount}
          onClose={() => {
            setShowPostModal(false);
            setSelectedPost(null);
          }}
          onToggleLike={handleToggleLike}
          onAddComment={handleAddComment}
          newComment={newComment}
          setNewComment={setNewComment}
        />
      )}
{showReportModal && (
  <div className="modal open">
    <div className="modal-content w-full max-w-lg mx-3">
      <div className="modal-header">
        <h2>
          <FontAwesomeIcon icon={faPen} className="mr-2" />
          불만사항 / 신고
        </h2>
        <span
          className="close"
          onClick={() => setShowReportModal(false)}
        >
          &times;
        </span>
      </div>

      {/* === 실제 폼 === */}
      <div className="modal-body">
        <form onSubmit={handleReportSubmit} className="flex flex-col gap-5">
           <input type="hidden" name="category" value="dev" />
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-800">
              제목
            </label>
            <input
              type="text"
              name="title"
              placeholder="제목을 입력하세요"
              required
              className="px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-600"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-gray-800">
              내용
            </label>
            <textarea
              name="content"
              rows={8}
              placeholder="자세한 내용을 입력해주세요"
              required
              className="px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-600 resize-vertical min-h-[150px]"
            />
          </div>

          <div className="flex justify-end gap-4 mt-5">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              제출하기
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
