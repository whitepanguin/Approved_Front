"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, setUserStatus } from "../../modules/user";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userCount, setuserCount] = useState(0);
  const [postCount, setpostCount] = useState(0);
  const [reportCount, setreportCount] = useState(0);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { currentUser, isLogin } = useSelector(
    (state: RootState) => state.user
  );
  const router = useRouter();

  // useEffect(() => {
  //   if (
  //     !currentUser ||
  //     currentUser.email?.toLowerCase() !== "admin@admin.com"
  //   ) {
  //     alert("접근 권한이 없습니다.");
  //     router.push("/");
  //   }
  // }, [currentUser]);

  // 샘플 데이터
  const qnaList = [
    {
      id: 1,
      title: "건축허가 관련 질문드립니다",
      content:
        "단독주택 신축 시 건축허가 절차가 어떻게 되나요? 건축과에 직접 방문해야 하는지 궁금합니다.",
      author: "건축초보",
      createdAt: "2023.06.03 14:30",
      status: "답변대기",
      views: 45,
      isUrgent: true,
    },
    {
      id: 2,
      title: "식품위생교육 어디서 받나요?",
      content:
        "카페 창업 준비 중인데 식품위생교육을 어디서 받을 수 있는지 알려주세요.",
      author: "카페준비생",
      createdAt: "2023.06.02 16:20",
      status: "답변완료",
      views: 78,
      isUrgent: false,
    },
    {
      id: 3,
      title: "사업자등록증 발급 기간이 얼마나 걸리나요?",
      content: "온라인으로 신청했는데 언제쯤 받을 수 있을까요?",
      author: "신규사업자",
      createdAt: "2023.06.01 09:15",
      status: "답변대기",
      views: 32,
      isUrgent: false,
    },
  ];

  const allPosts = [
    {
      id: 1,
      title: "오늘 드디어 사업자등록증을 받았습니다!",
      author: "홍길동",
      category: "인허가",
      createdAt: "2023.06.03",
      views: 654,
      likes: 102,
      comments: 45,
      status: "정상",
    },
    {
      id: 2,
      title: "건축허가 관련 질문드립니다",
      author: "건축초보",
      category: "Q&A",
      createdAt: "2023.06.02",
      views: 876,
      likes: 45,
      comments: 28,
      status: "정상",
    },
    {
      id: 3,
      title: "음식점 영업허가 신청 시 주의사항",
      author: "음식점사장",
      category: "인허가",
      createdAt: "2023.06.01",
      views: 1245,
      likes: 89,
      comments: 67,
      status: "신고됨",
    },
  ];

  const userList = [
    {
      id: 1,
      name: "홍길동",
      email: "hong@example.com",
      businessType: "음식점업",
      joinDate: "2023.05.15",
      posts: 15,
      comments: 42,
      status: "활성",
      lastLogin: "2023.06.03",
    },
    {
      id: 2,
      name: "김사장",
      email: "kim@example.com",
      businessType: "소매업",
      joinDate: "2023.04.20",
      posts: 8,
      comments: 23,
      status: "활성",
      lastLogin: "2023.06.02",
    },
    {
      id: 3,
      name: "이대표",
      email: "lee@example.com",
      businessType: "서비스업",
      joinDate: "2023.03.10",
      posts: 3,
      comments: 12,
      status: "정지",
      lastLogin: "2023.05.28",
    },
  ];
  // 총 계수 데이터 불러오는 공간
  useEffect(() => {
    const getUsercount = async () => {
      try {
        const res = await fetch("http://localhost:8000/users/UserCount", {
          method: "GET",
        });

        const Usercountdata = await res.json();
        setuserCount(Usercountdata.count);
        // console.log(userCount);
      } catch (error) {
        console.error("실패:", error);
      }
    };

    getUsercount();
  }, [userCount]);

  useEffect(() => {
    const getPostcount = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts/PostCount", {
          method: "GET",
        });

        const Postcountdata = await res.json();
        setpostCount(Postcountdata.count);
        // console.log(postCount);
      } catch (error) {
        console.error("실패:", error);
      }
    };

    getPostcount();
  }, [postCount]);

  useEffect(() => {
    const getReportcount = async () => {
      try {
        const res = await fetch("http://localhost:8000/posts/reported/count", {
          method: "GET",
        });

        const Reportcountdata = await res.json();
        setreportCount(Reportcountdata.count);
        // console.log(Reportcountdata);
      } catch (error) {
        console.error("실패:", error);
      }
    };

    getReportcount();
  }, [reportCount]);

  const handleQuickReply = (qnaId: number, reply: string) => {
    console.log(`QnA ${qnaId}에 답변: ${reply}`);
    alert("답변이 등록되었습니다.");
  };

  const handlePostAction = (action: string, postIds: number[]) => {
    console.log(`${action} 실행:`, postIds);
    alert(`${postIds.length}개 게시글 ${action} 완료`);
    setSelectedPosts([]);
  };

  const handleUserAction = (action: string, userIds: number[]) => {
    console.log(`${action} 실행:`, userIds);
    alert(`${userIds.length}명 유저 ${action} 완료`);
    setSelectedUsers([]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="w-full space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                관리자 대시보드
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                커뮤니티 현황을 한눈에 확인하세요
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">
                        총 회원수
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        {userCount}
                      </p>
                    </div>
                    <i className="fas fa-users text-blue-600 text-2xl"></i>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">
                        총 게시글
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        {postCount}
                      </p>
                    </div>
                    <i className="fas fa-file-alt text-green-600 text-2xl"></i>
                  </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">
                        답변 대기
                      </p>
                      <p className="text-2xl font-bold text-orange-800">30</p>
                    </div>
                    <i className="fas fa-question-circle text-orange-600 text-2xl"></i>
                  </div>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">
                        신고 게시글
                      </p>
                      <p className="text-2xl font-bold text-red-800">
                        {reportCount}
                      </p>
                    </div>
                    <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">최근 활동</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-user-plus text-blue-600"></i>
                      <span className="text-gray-700">
                        새 회원 가입: 박창업
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">5분 전</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-file-alt text-green-600"></i>
                      <span className="text-gray-700">
                        새 게시글: "카페 창업 후기"
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">15분 전</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-question-circle text-orange-600"></i>
                      <span className="text-gray-700">
                        새 질문: "건축허가 관련"
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">30분 전</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "qna":
        return (
          <div className="w-full space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Q&A 관리
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                질문에 빠르게 답변하고 관리하세요
              </p>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-medium text-gray-800">질문 목록</h4>
                  <div className="flex gap-2">
                    <select className="p-2 border border-gray-300 rounded-lg text-sm">
                      <option>전체</option>
                      <option>답변대기</option>
                      <option>답변완료</option>
                      <option>긴급</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {qnaList.map((qna) => (
                    <div
                      key={qna.id}
                      className="border border-gray-200 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              qna.status === "답변대기"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {qna.status}
                          </span>
                          {qna.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                              긴급
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>조회 {qna.views}</span>
                          <span>{qna.createdAt}</span>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {qna.title}
                      </h4>
                      <p className="text-gray-600 mb-4">{qna.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-white text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {qna.author}
                          </span>
                        </div>

                        {qna.status === "답변대기" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const reply = prompt("답변을 입력하세요:");
                                if (reply) handleQuickReply(qna.id, reply);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              빠른 답변
                            </button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                              상세보기
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "posts":
        return (
          <div className="w-full space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                게시글 관리
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                모든 게시글을 관리하고 수정하세요
              </p>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-medium text-gray-800">전체 게시글</h4>
                  <div className="flex gap-2">
                    <select className="p-2 border border-gray-300 rounded-lg text-sm">
                      <option>전체</option>
                      <option>정상</option>
                      <option>신고됨</option>
                      <option>숨김</option>
                    </select>
                    {selectedPosts.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handlePostAction("삭제", selectedPosts)
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          선택 삭제 ({selectedPosts.length})
                        </button>
                        <button
                          onClick={() =>
                            handlePostAction("숨김", selectedPosts)
                          }
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          선택 숨김
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPosts(allPosts.map((p) => p.id));
                              } else {
                                setSelectedPosts([]);
                              }
                            }}
                          />
                        </th>
                        <th className="text-left p-3">제목</th>
                        <th className="text-left p-3">작성자</th>
                        <th className="text-left p-3">카테고리</th>
                        <th className="text-left p-3">작성일</th>
                        <th className="text-left p-3">조회/좋아요</th>
                        <th className="text-left p-3">상태</th>
                        <th className="text-left p-3">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPosts.map((post) => (
                        <tr
                          key={post.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPosts([...selectedPosts, post.id]);
                                } else {
                                  setSelectedPosts(
                                    selectedPosts.filter((id) => id !== post.id)
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-gray-800">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              댓글 {post.comments}개
                            </div>
                          </td>
                          <td className="p-3 text-gray-700">{post.author}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                              {post.category}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">
                            {post.createdAt}
                          </td>
                          <td className="p-3 text-gray-600">
                            {post.views} / {post.likes}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                post.status === "정상"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200">
                                수정
                              </button>
                              <button className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="w-full space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                유저 관리
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                회원 정보를 관리하고 수정하세요
              </p>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-medium text-gray-800">회원 목록</h4>
                  <div className="flex gap-2">
                    <select className="p-2 border border-gray-300 rounded-lg text-sm">
                      <option>전체</option>
                      <option>활성</option>
                      <option>정지</option>
                      <option>탈퇴</option>
                    </select>
                    {selectedUsers.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUserAction("정지", selectedUsers)
                          }
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          선택 정지 ({selectedUsers.length})
                        </button>
                        <button
                          onClick={() =>
                            handleUserAction("삭제", selectedUsers)
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          선택 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(userList.map((u) => u.id));
                              } else {
                                setSelectedUsers([]);
                              }
                            }}
                          />
                        </th>
                        <th className="text-left p-3">회원정보</th>
                        <th className="text-left p-3">이메일</th>
                        <th className="text-left p-3">사업분야</th>
                        <th className="text-left p-3">가입일</th>
                        <th className="text-left p-3">활동</th>
                        <th className="text-left p-3">상태</th>
                        <th className="text-left p-3">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(
                                    selectedUsers.filter((id) => id !== user.id)
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-white"></i>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  최근 로그인: {user.lastLogin}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-700">{user.email}</td>
                          <td className="p-3 text-gray-600">
                            {user.businessType}
                          </td>
                          <td className="p-3 text-gray-600">{user.joinDate}</td>
                          <td className="p-3 text-gray-600">
                            <div className="text-sm">
                              <div>글 {user.posts}개</div>
                              <div>댓글 {user.comments}개</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                user.status === "활성"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200">
                                수정
                              </button>
                              <button className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs hover:bg-orange-200">
                                정지
                              </button>
                              <button className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
      <div className="max-w-7xl mx-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 */}
          <div className="lg:col-span-1">
            {/* 관리자 정보 카드 */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <div className="flex flex-col items-center">
                <img
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-3"
                  src="/images/bear_profile.png"
                  alt=""
                />

                <h3 className="text-lg font-semibold text-gray-800">관리자</h3>
                <p className="text-gray-600 text-sm mb-4">
                  @admin
                  <button onClick={() => console.log(currentUser)}>
                    _test
                  </button>
                </p>

                <div className="flex justify-between w-full border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-red-600">
                      {userCount}
                    </span>
                    <span className="text-xs text-gray-600">총 회원</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-red-600">
                      {postCount}
                    </span>
                    <span className="text-xs text-gray-600">총 게시글</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-red-600">
                      12
                    </span>
                    <span className="text-xs text-gray-600">답변대기</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 메뉴 네비게이션 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <nav>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "dashboard"
                      ? "border-red-600 bg-red-50 text-red-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-chart-bar ${
                      activeTab === "dashboard"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  ></i>
                  <span>대시보드</span>
                </button>

                <button
                  onClick={() => setActiveTab("qna")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "qna"
                      ? "border-red-600 bg-red-50 text-red-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-question-circle ${
                      activeTab === "qna" ? "text-red-600" : "text-gray-500"
                    }`}
                  ></i>
                  <span>Q&A 관리</span>
                  <span className="ml-auto bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                    2
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "posts"
                      ? "border-red-600 bg-red-50 text-red-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-file-alt ${
                      activeTab === "posts" ? "text-red-600" : "text-gray-500"
                    }`}
                  ></i>
                  <span>게시글 관리</span>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-3 w-full p-4 text-left border-l-4 ${
                    activeTab === "users"
                      ? "border-red-600 bg-red-50 text-red-600"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-users ${
                      activeTab === "users" ? "text-red-600" : "text-gray-500"
                    }`}
                  ></i>
                  <span>유저 관리</span>
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
