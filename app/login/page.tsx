"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { useApp } from "../providers";
import { useDispatch } from "react-redux";
import { setUser, setUserStatus } from "@/modules/user";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepLogin: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showFindModal, setShowFindModal] = useState<"id" | "password" | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  // useApp 컨텍스트에서 setUser 함수 가져오기
  const { setUser: setAppUser } = useApp();

  const locationGoogle = () => {
    localStorage.removeItem("jwtToken");
    console.log("구글 버튼");
    window.location.href = "http://localhost:8000/auth/google";
  };
  const locationKakao = () => {
    localStorage.removeItem("jwtToken");
    console.log("카카오 버튼");
    window.location.href = "http://localhost:8000/auth/kakao";
  };
  const locationNaver = () => {
    localStorage.removeItem("jwtToken");
    console.log("네이버 버튼");
    window.location.href = "http://localhost:8000/auth/naver";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/auth/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // alert(data.message || "로그인에 성공했습니다.");
        localStorage.setItem("jwtToken", data.jwtToken);

        alert(data.message);
        router.push("/");
      } else {
        alert(data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      setErrorMsg("서버와의 연결에 실패했습니다.");
      console.error("Login error:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (showFindModal === "id") {
      alert("입력하신 정보로 아이디를 찾았습니다.\n아이디: user***");
    } else {
      alert("등록된 이메일로 임시 비밀번호를 발송했습니다.");
    }

    setShowFindModal(null);
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-5">
        <div className="bg-white rounded-2xl p-10 shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-clipboard-check text-white text-4xl"></i>
            </div>
            <h1 className="text-3xl text-gray-800 mb-2 font-bold">로그인</h1>
            <p className="text-gray-600">허가요에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-800"
              >
                이메일
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-user absolute left-4 text-gray-400"></i>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="이메일를 입력하세요"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white focus:shadow-md"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-800"
              >
                비밀번호
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-lock absolute left-4 text-gray-400"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full py-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white focus:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center my-2">
              <label className="flex items-center cursor-pointer text-sm text-gray-800 relative pl-6">
                <input
                  type="checkbox"
                  name="keepLogin"
                  checked={formData.keepLogin}
                  onChange={handleInputChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                <span className="absolute left-0 h-4 w-4 bg-gray-200 rounded transition-all"></span>
                로그인 유지
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 border-none rounded-xl text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <i className="fas fa-sign-in-alt"></i>
              로그인
            </button>

            <div className="flex justify-center items-center gap-4 my-4">
              <button
                type="button"
                onClick={() => setShowFindModal("id")}
                className="text-blue-600 no-underline text-sm font-medium transition-colors hover:text-blue-700 hover:underline"
              >
                아이디 찾기
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => setShowFindModal("password")}
                className="text-blue-600 no-underline text-sm font-medium transition-colors hover:text-blue-700 hover:underline"
              >
                비밀번호 찾기
              </button>
            </div>

            <div className="relative text-center my-6">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>
              <span className="bg-white px-5 text-gray-400 text-sm">또는</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={locationGoogle}
                type="button"
                className="w-full py-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-blue-500 hover:border-gray-300 hover:-translate-y-px"
              >
                <i className="fab fa-google"></i>
                Google로 로그인
              </button>
              <button
                onClick={locationKakao}
                type="button"
                className="w-full py-3 border-2 border-yellow-400 rounded-xl text-sm font-weight-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-yellow-800 bg-yellow-400 hover:bg-yellow-300 hover:border-yellow-300"
              >
                <i className="fas fa-comment"></i>
                카카오로 로그인
              </button>
              <button
                onClick={locationNaver}
                type="button"
                className="w-full py-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-green-600 hover:border-gray-300 hover:-translate-y-px"
              >
                <span className="bg-green-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold">
                  N
                </span>
                네이버로 로그인
              </button>
            </div>

            <div className="text-center mt-5">
              <p className="text-gray-600 text-sm">
                아직 계정이 없으신가요?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 no-underline font-medium hover:underline"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* 아이디/비밀번호 찾기 모달 */}
      {showFindModal && (
        <div className={`modal open`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {showFindModal === "id" ? "이메일 찾기" : "비밀번호 찾기"}
              </h2>
              <span className="close" onClick={() => setShowFindModal(null)}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFindSubmit} className="flex flex-col gap-5">
                {showFindModal === "id" ? (
                  <>
                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                      가입 시 등록한 이름과 휴대폰 번호를 입력해주세요.
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800">
                        이름
                      </label>
                      <div className="relative flex items-center">
                        <i className="fas fa-envelope absolute left-4 text-gray-400"></i>
                        <input
                          type="text"
                          name="findName"
                          placeholder="이름을 입력하세요"
                          required
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800">
                        휴대폰 번호
                      </label>
                      <div className="relative flex items-center">
                        <i className="fas fa-phone absolute left-4 text-gray-400"></i>
                        <input
                          type="tel"
                          name="findPhone"
                          placeholder="휴대폰 번호를 입력하세요"
                          required
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                      아이디와 가입 시 등록한 이메일을 입력해주세요.
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800">
                        아이디
                      </label>
                      <div className="relative flex items-center">
                        <i className="fas fa-user absolute left-4 text-gray-400"></i>
                        <input
                          type="text"
                          name="findUserId"
                          placeholder="아이디를 입력하세요"
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800">
                        이메일
                      </label>
                      <div className="relative flex items-center">
                        <i className="fas fa-envelope absolute left-4 text-gray-400"></i>
                        <input
                          type="email"
                          name="findUserEmail"
                          placeholder="이메일을 입력하세요"
                          className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  <i className="fas fa-search"></i>
                  {showFindModal === "id" ? "아이디 찾기" : "비밀번호 찾기"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
