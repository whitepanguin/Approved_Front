"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, setUserStatus } from "@/modules/user";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { currentUser, isLogin } = useSelector(
    (state: RootState) => state.user || {}
  );

  /* 로그아웃 */
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");
    dispatch(setUser(null)); // currentUser 초기화
    dispatch(setUserStatus(false)); // isLogin = false
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md flex justify-between items-center px-6 h-16">
      {/* 왼쪽: 메뉴 + 로고 */}
      <div className="flex items-center">
        <span
          className="text-2xl cursor-pointer mr-5 text-blue-600"
          onClick={onMenuClick}
        >
          &#9776;
        </span>

        <Link href="/" className="flex items-center cursor-pointer">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-icon-fAPihCUVCxAAcBXblivU6MKQ8c0xIs.png"
            alt="허가요 로고"
            className="w-8 h-8 mr-2"
          />
          <span className="text-xl font-bold text-blue-600">허가요</span>
        </Link>
      </div>

      {/* 오른쪽: 로그인/로그아웃 영역 */}
      <div className="flex gap-2 items-center">
        {isLogin && currentUser ? (
          <>
            {/* 관리자 버튼 */}
            {currentUser.name === "Admin" && (
              <button
                onClick={() => router.push("/AdminPage")}
                className="px-4 py-2 rounded bg-transparent text-blue-600 hover:bg-blue-50 transition-colors"
              >
                관리자 페이지
              </button>
            )}

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-transparent text-blue-600 hover:bg-blue-50 transition-colors"
            >
              로그아웃
            </button>

            {/* 유저 정보 */}
            <div className="flex items-center gap-2 text-sm">
              <i className="fas fa-user-circle text-blue-600 text-xl" />
              <span>{currentUser.name ?? "사용자"}님</span>
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="px-4 py-2 rounded bg-transparent text-blue-600 hover:bg-blue-50 transition-colors">
                로그인
              </button>
            </Link>

            <Link href="/signup">
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                회원가입
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
