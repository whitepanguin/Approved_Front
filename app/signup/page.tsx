"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    signupUserId: "",
    signupEmail: "",
    signupPassword: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
    businessType: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
    agreeAll: false,
  })

  const [showPassword, setShowPassword] = useState({
    signupPassword: false,
    confirmPassword: false,
  })

  const [showTermsModal, setShowTermsModal] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert("필수 약관에 동의해주세요.")
      return
    }

    if (formData.signupPassword !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }

    alert("회원가입이 완료되었습니다!")
    router.push("/login")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const toggleAllTerms = () => {
    const newValue = !formData.agreeAll
    setFormData((prev) => ({
      ...prev,
      agreeAll: newValue,
      agreeTerms: newValue,
      agreePrivacy: newValue,
      agreeMarketing: newValue,
    }))
  }

  const sendVerificationCode = () => {
    if (!formData.signupEmail) {
      alert("이메일을 입력해주세요.")
      return
    }
    setVerificationSent(true)
    alert("인증번호가 발송되었습니다.")
  }

  const verifyCode = () => {
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.")
      return
    }
    alert("이메일 인증이 완료되었습니다.")
    setVerificationSent(false)
  }

  const checkUserId = () => {
    if (!formData.signupUserId) {
      alert("아이디를 입력해주세요.")
      return
    }

    const isAvailable = Math.random() > 0.3
    if (isAvailable) {
      alert("사용 가능한 아이디입니다.")
    } else {
      alert("이미 사용 중인 아이디입니다.")
    }
  }

  const checkNickname = () => {
    if (!formData.nickname) {
      alert("닉네임을 입력해주세요.")
      return
    }

    const isAvailable = Math.random() > 0.5
    if (isAvailable) {
      alert("사용 가능한 닉네임입니다.")
    } else {
      alert("이미 사용 중인 닉네임입니다.")
    }
  }

  const getTermsContent = (type: string) => {
    switch (type) {
      case "terms":
        return {
          title: "이용약관",
          content: `
            <h3>제1조 (목적)</h3>
            <p>이 약관은 허가요(이하 "회사")가 제공하는 인허가 정보 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            
            <h3>제2조 (정의)</h3>
            <p>1. "서비스"란 회사가 제공하는 인허가 정보 검색 및 관련 서비스를 의미합니다.</p>
            <p>2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
          `,
        }
      case "privacy":
        return {
          title: "개인정보 처리방침",
          content: `
            <h3>1. 개인정보의 처리목적</h3>
            <p>허가요는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
            <ul>
              <li>회원가입 및 관리</li>
              <li>서비스 제공 및 계약의 이행</li>
              <li>고객상담 및 불만처리</li>
              <li>마케팅 및 광고에의 활용</li>
            </ul>
          `,
        }
      case "marketing":
        return {
          title: "마케팅 정보 수신 동의",
          content: `
            <h3>마케팅 정보 수신 동의</h3>
            <p>허가요에서 제공하는 다양한 혜택과 정보를 받아보실 수 있습니다.</p>
            
            <h3>수신 정보</h3>
            <ul>
              <li>새로운 서비스 및 기능 안내</li>
              <li>이벤트 및 프로모션 정보</li>
              <li>인허가 관련 최신 정보</li>
              <li>맞춤형 콘텐츠 추천</li>
            </ul>
          `,
        }
      default:
        return { title: "", content: "" }
    }
  }

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-5">
        <div className="bg-white rounded-2xl p-10 shadow-xl w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-clipboard-check text-white text-4xl"></i>
            </div>
            <h1 className="text-3xl text-gray-800 mb-2 font-bold">회원가입</h1>
            <p className="text-gray-600">허가요와 함께 시작해보세요</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 아이디 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-user absolute left-4 text-gray-400"></i>
                <input
                  type="text"
                  name="signupUserId"
                  placeholder="아이디를 입력하세요"
                  value={formData.signupUserId}
                  onChange={handleInputChange}
                  required
                  className="flex-1 py-4 pl-12 pr-20 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={checkUserId}
                  className="absolute right-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  중복확인
                </button>
              </div>
              <small className="text-xs text-gray-500">4-20자의 영문, 숫자, 언더스코어(_)만 사용 가능</small>
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-envelope absolute left-4 text-gray-400"></i>
                <input
                  type="email"
                  name="signupEmail"
                  placeholder="이메일을 입력하세요"
                  value={formData.signupEmail}
                  onChange={handleInputChange}
                  required
                  className="flex-1 py-4 pl-12 pr-16 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  className="absolute right-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  인증
                </button>
              </div>
              <small className="text-xs text-gray-500">계정 인증 및 중요 알림 수신용</small>
            </div>

            {/* 인증번호 */}
            {verificationSent && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-800">인증번호</label>
                <div className="relative flex items-center">
                  <i className="fas fa-key absolute left-4 text-gray-400"></i>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호를 입력하세요"
                    className="flex-1 py-4 pl-12 pr-16 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={verifyCode}
                    className="absolute right-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    확인
                  </button>
                </div>
                <small className="text-xs text-red-600 font-semibold">05:00 내에 인증번호를 입력해주세요</small>
              </div>
            )}

            {/* 비밀번호 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-lock absolute left-4 text-gray-400"></i>
                <input
                  type={showPassword.signupPassword ? "text" : "password"}
                  name="signupPassword"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.signupPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full py-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, signupPassword: !prev.signupPassword }))}
                  className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <i className={`fas ${showPassword.signupPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              <small className="text-xs text-gray-500">8자 이상, 영문/숫자/특수문자 포함</small>
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-lock absolute left-4 text-gray-400"></i>
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full py-4 pl-12 pr-12 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                  className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <i className={`fas ${showPassword.confirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-user absolute left-4 text-gray-400"></i>
                <input
                  type="text"
                  name="nickname"
                  placeholder="닉네임을 입력하세요"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  required
                  className="flex-1 py-4 pl-12 pr-20 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={checkNickname}
                  className="absolute right-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  중복확인
                </button>
              </div>
              <small className="text-xs text-gray-500">2-10자의 한글, 영문, 숫자만 사용 가능</small>
            </div>

            {/* 휴대폰 번호 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">
                휴대폰 번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-phone absolute left-4 text-gray-400"></i>
                <input
                  type="tel"
                  name="phone"
                  placeholder="휴대폰 번호를 입력하세요"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white"
                />
              </div>
              <small className="text-xs text-gray-500">아이디 찾기 시 필요합니다</small>
            </div>

            {/* 사업 분야 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-800">사업 분야</label>
              <div className="relative flex items-center">
                <i className="fas fa-briefcase absolute left-4 text-gray-400"></i>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full py-4 pl-12 pr-4 border-2 border-gray-200 rounded-xl text-base outline-none transition-all bg-gray-50 focus:border-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="">선택하세요</option>
                  <option value="restaurant">음식점업</option>
                  <option value="retail">소매업</option>
                  <option value="service">서비스업</option>
                  <option value="manufacturing">제조업</option>
                  <option value="construction">건설업</option>
                  <option value="it">IT/소프트웨어</option>
                  <option value="consulting">컨설팅</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <label className="flex items-center cursor-pointer text-sm text-gray-800 relative pl-6 mb-4">
                <input
                  type="checkbox"
                  checked={formData.agreeAll}
                  onChange={toggleAllTerms}
                  className="absolute opacity-0 w-0 h-0"
                />
                <span className="absolute left-0 h-4 w-4 bg-gray-200 rounded transition-all"></span>
                전체 동의
              </label>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="flex items-center justify-between cursor-pointer text-sm text-gray-800 relative pl-6 mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      required
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <span className="absolute left-0 h-4 w-4 bg-gray-200 rounded transition-all"></span>
                    <span className="text-red-500 mr-1">[필수]</span> 이용약관 동의
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal("terms")}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    보기
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer text-sm text-gray-800 relative pl-6 mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={formData.agreePrivacy}
                      onChange={handleInputChange}
                      required
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <span className="absolute left-0 h-4 w-4 bg-gray-200 rounded transition-all"></span>
                    <span className="text-red-500 mr-1">[필수]</span> 개인정보 처리방침 동의
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal("privacy")}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    보기
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer text-sm text-gray-800 relative pl-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onChange={handleInputChange}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <span className="absolute left-0 h-4 w-4 bg-gray-200 rounded transition-all"></span>
                    [선택] 마케팅 정보 수신 동의
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal("marketing")}
                    className="text-blue-600 text-xs hover:underline"
                  >
                    보기
                  </button>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 border-none rounded-xl text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <i className="fas fa-user-plus"></i>
              회원가입
            </button>

            <div className="relative text-center my-6">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>
              <span className="bg-white px-5 text-gray-400 text-sm">또는</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full py-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-blue-500 hover:border-gray-300 hover:-translate-y-px"
              >
                <i className="fab fa-google"></i>
                Google로 가입
              </button>
              <button
                type="button"
                className="w-full py-3 border-2 border-yellow-400 rounded-xl text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-yellow-800 bg-yellow-400 hover:bg-yellow-300 hover:border-yellow-300"
              >
                <i className="fas fa-comment"></i>
                카카오로 가입
              </button>
              <button
                type="button"
                className="w-full py-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 text-green-600 hover:border-gray-300 hover:-translate-y-px"
              >
                <span className="bg-green-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold">
                  N
                </span>
                네이버로 가입
              </button>
            </div>

            <div className="text-center mt-5">
              <p className="text-gray-600 text-sm">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-blue-600 no-underline font-medium hover:underline">
                  로그인
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* 약관 모달 */}
      {showTermsModal && (
        <div className="modal open">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{getTermsContent(showTermsModal).title}</h2>
              <span className="close" onClick={() => setShowTermsModal(null)}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div
                className="max-h-96 overflow-y-auto p-5 bg-gray-50 rounded-lg text-sm leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: getTermsContent(showTermsModal).content }}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
