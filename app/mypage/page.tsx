"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "../providers";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { setUser } from "@/modules/user";

import PostCard from "@/components/postCard/postCard"; // 꼭 경로 맞게
import PostModal from "@/components/postModal/postModal";
type Post = {
  _id: string;
  title: string;
  content: string;
  preview?: string;
  date: string;
  author?: string;
  views?: number;
  likes?: number;
  comments?: number;
};

type Comment = {
  id: number;
  postTitle: string;
  comment: string;
  date: string;
  likes: number;
};

export default function MyPage() {
  // 🔹 Redux 및 로그인 관련
  const dispatch = useDispatch();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);
  const user = useSelector((state: RootState) => state.user.currentUser);

  // 🔹 인증 토큰
  const [token, setToken] = useState<string | null>(null);

  // 🔹 프로필 이미지 경로 처리
  const profileSrc = user?.profile?.startsWith("http")
    ? user.profile
    : user?.profile
    ? `${process.env.NEXT_PUBLIC_API_URL}/${user.profile}`
    : "/default-profile.jpg";

  // 🔹 프로필 수정 상태
  const [profileData, setProfileData] = useState({
    userId: "",
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

  // 🔹 내 게시글 / 댓글 / 좋아요한 글
  const [comments, setComments] = useState<Comment[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myComments, setMyComments] = useState<Comment[]>([]);
  const [likedPosts, setLikedPosts] = useState([]); // 좋아요 누른
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

  // 🔹 게시글 상세보기 모달 관련
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 불필요하면 제거 가능

  useEffect(() => {
    if (!user) return;

    const fetchAllStats = async () => {
      const email = user.email;
      const userid = user.userid;

      try {
        // 1. 내가 쓴 글
        const postRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/user/${email}`
        );
        if (postRes.ok) {
          const posts = await postRes.json();
          setMyPosts(posts);
        }

        // 2. 내가 쓴 댓글
        const commentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/comments/user/${email}`
        );
        if (commentRes.ok) {
          const comments = await commentRes.json();
          setMyComments(comments);
        }

        // 3. 내가 좋아요한 글
        const likeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/liked/${encodeURIComponent(
            userid
          )}`
        );
        if (likeRes.ok) {
          const likes = await likeRes.json();
          setLikedPosts(likes);
        }
      } catch (err) {
        console.error("📛 통계 불러오기 에러:", err);
      }
    };

    fetchAllStats(); // 페이지 첫 로딩 시 1회만 실행
  }, [user]);

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
    // 1) 우선 모달 열고 현재 글 기억
    setSelectedPost(post);
    setShowPostModal(true);

    // 2) 조회수 PATCH (하루 1회) ────────────────────────
    try {
      if (!hasViewedToday(post._id)) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}/view`,
          { method: "PATCH" }
        );
        markViewedToday(post._id);

        // 리스트 카드 +1
        setMyPosts((prev) =>
          prev.map((p) =>
            p._id === post._id ? { ...p, views: (p.views ?? 0) + 1 } : p
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

    // 3) 댓글 불러오기 ────────────────────────────────
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${post._id}`
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setComments(await r.json());
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
      setComments([]);
    }

    // 4) 좋아요 상태 / 개수 불러오기 ───────────────────
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${post._id}`
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const p = await r.json();

      const likesField = p.likes; // 배열 | 숫자 | undefined
      const nowLiked = Array.isArray(likesField) // 내가 눌렀나?
        ? likesField.includes(user?.userid)
        : p.liked ?? false;

      const nowLikeCnt = Array.isArray(likesField)
        ? likesField.length
        : typeof likesField === "number"
        ? likesField
        : 0;

      setLiked(nowLiked);
      setLikeCount(nowLikeCnt);

      // 카드에 즉시 반영
      setMyPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, likes: nowLikeCnt } : p))
      );
      // 모달 post 최신화
      setSelectedPost((prev) => (prev ? { ...prev, likes: nowLikeCnt } : prev));
    } catch (err) {
      console.error("좋아요 상태 불러오기 실패:", err);
      setLiked(false);
      setLikeCount(0);
    }
  };

  // 좋아요 토글
  const handleToggleLike = async () => {
    if (!selectedPost) return;

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("jwtToken") ||
            sessionStorage.getItem("jwtToken")
          : null;
      if (!token) throw new Error("로그인 필요");

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

      const { liked: nowLiked, likes } = await res.json(); // ← 백엔드가 숫자 반환
      if (!res.ok) throw new Error("좋아요 실패");

      // 1) 모달 내부
      setLiked(nowLiked);
      setLikeCount(likes);

      // 2) 카드 리스트(마이글 탭) 동기화
      setMyPosts((prev) =>
        prev.map((p) => (p._id === selectedPost._id ? { ...p, likes } : p))
      );

      // 3) 현재 선택된 post 객체도 갱신 ― 모달이 닫혔다 다시 열려도 유지
      setSelectedPost((prev) => (prev ? { ...prev, likes } : prev));
    } catch (err) {
      console.error("❌ 좋아요 실패:", err);
      alert(err instanceof Error ? err.message : "좋아요 실패");
    }
  };

  // 댓글 등록
  const handleAddComment = async (content: string) => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    const t = localStorage.getItem("token") || sessionStorage.getItem("token");
    setToken(t);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mypage/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log("🔵 JWT 기반 프로필 불러옴:", data);
        dispatch(setUser(data)); // ✅ 여기서 Redux에 저장!
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

    if (!token || !user?.email) {
      console.warn("❗ 토큰 또는 user.email이 없습니다. 요청 중단");

      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/getUserInfo?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("프로필 요청 실패");

        const data = await res.json();
        console.log("🔵 JWT 기반 프로필 불러옴:", data);

        setProfileData({
          userId: data.userid || "", // ✅ userId → userid
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          businessType: data.businessType || "",
          joinDate: data.createdAt?.slice(0, 10) || "",
        });
      } catch (err) {
        console.error("❌ 프로필 불러오기 실패:", err);
      }
    };

    fetchUserProfile();
  }, [user?.email]);

  useEffect(() => {
    console.log("🔍🔍 activeTab 변경:", activeTab);
  }, [activeTab]);

  // 좋아요 한 글 불러오기
  useEffect(() => {
    const fetchLikedPosts = async () => {
      const userid = user?.userid; // ✅ userid 우선 사용
      if (!userid) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/liked/${encodeURIComponent(
            userid
          )}`
        );
        if (!res.ok) throw new Error("좋아요한 글 조회 실패");
        setLikedPosts(await res.json());
      } catch (err) {
        console.error("❌ 좋아요한 글 불러오기 에러:", err);
      }
    };

    if (activeTab === "likes" && user) fetchLikedPosts();
  }, [activeTab, user]);

  // 내 댓글 불러오기
  useEffect(() => {
    const fetchMyComments = async () => {
      console.log("🗨️ fetchMyComments 호출");

      const userid = user?.email || user?.name;

      if (!userid) {
        console.warn("🟡 userid/email/name 없음, 요청 중단");
        return;
      }

      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/comments/user/${encodeURIComponent(userid)}`
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
      const userid = user?.email || user?.name;
      if (!userid) {
        console.warn("🟡 userid 또는 name 없음, 요청 중단");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/user/${userid}`
        );
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/remove`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user?.email }),
        }
      );

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
  const handleUploadPicture = async () => {
    if (!selectedImage) {
      alert("업로드할 이미지를 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("picture", selectedImage);
    formData.append("email", user?.email || "");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/picture`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ 프로필 이미지 업로드 완료");
      // 📌 필요시 user 상태 업데이트 추가 필요
    } catch (err: any) {
      console.error("이미지 업로드 실패:", err.message);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  // useEffect: 프로필 처음 불러올 때 닉네임 기억해두기
  useEffect(() => {
    const token =
      localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

    if (!token || !user?.email) {
      console.warn("❗ 토큰 또는 user.email이 없습니다. 요청 중단");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/getUserInfo?email=${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setProfileData({
          userId: data.userid || "",
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
        `${process.env.NEXT_PUBLIC_API_URL}/users/check-duplicate?userid=${profileData.userId}`
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

  // 저장하기
  const handleSaveProfile = async () => {
    const token =
      localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // ✅ 닉네임이 변경되었을 경우에만 중복확인 필수
    const isNicknameChanged = profileData.userId !== originalUserId;
    if (isNicknameChanged && !isChecked) {
      alert("닉네임을 변경하셨습니다. 중복확인을 먼저 해주세요.");
      return;
    }

    const bodyToSend = {
      userid: profileData.userId,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      businessType: profileData.businessType,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyToSend),
        }
      );

      if (!res.ok) throw new Error("저장 실패");

      const result = await res.json();
      alert("✅ 저장 완료!");
      setOriginalUserId(profileData.userId); // 변경 성공 시 원본 닉네임 업데이트
      setIsChecked(false); // 중복확인 플래그 리셋
    } catch (err) {
      console.error("❌ 저장 에러:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 프로필 입력 필드 값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // // 비밀번호 변경 폼 제출  현재는 실제 비밀번호 변경 로직 없이 alert만 띄움 (UI 동작만 존재)
  // const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   const form = e.currentTarget;

  //   const currentPassword = (
  //     form.elements.namedItem("currentPassword") as HTMLInputElement
  //   )?.value;
  //   const newPassword = (
  //     form.elements.namedItem("newPassword") as HTMLInputElement
  //   )?.value;
  //   const confirmPassword = (
  //     form.elements.namedItem("confirmNewPassword") as HTMLInputElement
  //   )?.value;

  //   const email = user?.email;
  //   const token =
  //     localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");

  //   if (!email || !token) {
  //     alert("로그인이 필요합니다.");
  //     return;
  //   }

  //   // ✅ 소셜 로그인 계정일 경우 비밀번호 변경 금지
  //   if (
  //     email.endsWith("@gmail.com") ||
  //     email.endsWith("@kakao.com") ||
  //     email.endsWith("@naver.com")
  //   ) {
  //     alert("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
  //     return;
  //   }

  //   if (!currentPassword || !newPassword || !confirmPassword) {
  //     alert("모든 필드를 입력해주세요.");
  //     return;
  //   }

  //   // ✅ 현재 비밀번호와 새 비밀번호가 같을 경우 차단
  //   if (currentPassword === newPassword) {
  //     alert("현재 비밀번호와 새 비밀번호는 달라야 합니다.");
  //     return;
  //   }

  //   if (newPassword !== confirmPassword) {
  //     alert("새 비밀번호가 일치하지 않습니다.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/users/updatePassword`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ email, currentPassword, newPassword }),
  //       }
  //     );

  //     const result = await res.json();

  //     if (!res.ok) {
  //       alert(result.message || "비밀번호 변경 실패");
  //       return;
  //     }

  //     alert("✅ 비밀번호가 성공적으로 변경되었습니다.");
  //   } catch (err) {
  //     console.error("❌ 비밀번호 변경 에러:", err);
  //     alert("서버 오류가 발생했습니다.");
  //   }
  // };

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
                        name="userId"
                        value={profileData.userId || ""}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가입일
                    </label>
                    <input
                      type="text"
                      name="joinDate"
                      value={user?.createdAt?.slice(0, 10) || ""}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />

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

            {/* <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-4">비밀번호 변경</h4>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    name="currentPassword"
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
                    name="newPassword"
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
                    name="confirmNewPassword"
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
            </div> */}
          </div>
        );

      case "posts": {
        /* 1) 정렬 옵션 - JSX 밖 변수 */
        const sortOptions = [
          { key: "latest", label: "최신순" },
          { key: "likes", label: "인기순" },
          { key: "comments", label: "댓글순" },
        ];

        /* 2) 반환 JSX */
        return (
          <>
            <div className="space-y-6">
              {/* 헤더 */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  내가 쓴 글
                </h3>

                <div className="flex gap-2">
                  <select
                    value={sortKey}
                    onChange={(e) =>
                      setSortKey(
                        e.target.value as "latest" | "likes" | "comments"
                      )
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="latest">최신순</option>
                    <option value="likes">인기순</option>
                    <option value="comments">댓글순</option>
                  </select>
                </div>
              </div>

              {/* 게시글 리스트 */}
              {Array.isArray(sortedPosts) && sortedPosts.length > 0 ? (
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
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

              {/* 페이지네이션 */}
              <div className="flex justify-center mt-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className={`w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-sm ${
                        num === 1
                          ? "bg-blue-600 text-white border-blue-600"
                          : ""
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
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

      case "comments":
        return (
          <div className="space-y-6">
            {/* 헤더 */}
            <h3 className="text-xl font-semibold text-gray-800">내 댓글</h3>

            {/* 본문 – 댓글 카드 리스트ㅇ */}
            {myComments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-comment-dots text-4xl mb-4 opacity-50" />
                <p>작성한 댓글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myComments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-5 border border-gray-200 rounded-lg
                         hover:border-blue-600 hover:shadow transition-colors"
                  >
                    {/* 상단: 댓글이 달린 글 제목, 날짜 */}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-base font-semibold text-gray-800 flex items-center">
                        <i className="fas fa-message text-purple-500 mr-2" />
                        {comment.postTitle}
                      </h4>

                      {/* createdAt → 날짜 포맷 */}
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
            )}

            {/* (선택) 페이지네이터 – 필요 없으면 삭제 */}
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    className={`w-9 h-9 flex items-center justify-center border
                          border-gray-300 rounded text-sm ${
                            num === 1
                              ? "bg-blue-600 text-white border-blue-600"
                              : ""
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
            {/* ------ 헤더 ------ */}
            <h3 className="text-xl font-semibold text-gray-800">좋아요한 글</h3>
            {/* ------ 카드 리스트 ------ */}
            {likedPosts.length === 0 ? (
              /* 빈 상태 */
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-heart text-4xl mb-4 opacity-50" />
                <p>좋아요한 글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...likedPosts]
                  .sort((a, b) => {
                    if (sortKey === "likes")
                      return (b.likes ?? 0) - (a.likes ?? 0);
                    if (sortKey === "comments")
                      return (b.comments ?? 0) - (a.comments ?? 0);
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })
                  .map((post) => (
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
            )}

            {/* ------ (선택) 페이지네이션 ------ */}
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
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
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
                {/*사진 올라가는 곳 */}
                <div className="flex justify-center">
                  <img
                    src={profileSrc}
                    alt="프로필 이미지"
                    className="w-24 h-24 rounded-full object-cover"
                    className="w-24 h-24 rounded-full object-cover"
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
                      {myPosts.length}
                    </span>
                    <span className="text-xs text-gray-600">작성글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      {myComments.length}
                    </span>
                    <span className="text-xs text-gray-600">댓글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-blue-600">
                      {likedPosts.length}
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
    </MainLayout>
  );
}
