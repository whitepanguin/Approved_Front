"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    userid: "", // 아이디
    email: "", // 이메일
    password: "", // 비밀번호
    confirmPassword: "", // 비밀번호 확인
    name: "", // 이름
    birthDate: "", // 생일 (YYYYMMDD 문자열로 입력 받아 숫자로 변환)
    address: "", // 주소
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
    agreeAll: false,
  });

  useEffect(() => {
    const allChecked =
      formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing;
    setFormData((prev) => ({ ...prev, agreeAll: allChecked }));
  }, [formData.agreeTerms, formData.agreePrivacy, formData.agreeMarketing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAgreeAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
      agreeAll: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      userid: formData.userid,
      name: formData.name,
      birthDate: Number(formData.birthDate),
      address: formData.address,
      provider: "local",
    };

    try {
      const res = await fetch(
        "https://port-0-approved-springback-m5mcnm8ebdc80276.sel4.cloudtype.app/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json(); // 항상 JSON 파싱 먼저 시도

      if (!res.ok) {
        // 서버가 보낸 오류 메시지 사용
        alert(data.message || "회원가입 실패");
        return;
      }

      alert("회원가입이 완료되었습니다!");
      router.push("/login");
    } catch (err) {
      alert("회원가입 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <main
      id="sidemain"
      className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4"
    >
      <section className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              maxLength={100}
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              maxLength={50}
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              maxLength={50}
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              type="text"
              name="userid"
              value={formData.userid}
              onChange={handleInputChange}
              maxLength={20}
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              maxLength={8}
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              생년월일 (YYYYMMDD)
            </label>
            <input
              type="text"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              maxLength={8}
              placeholder="예: 19900101"
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              주소
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              maxLength={100}
              className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 약관 동의 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="agreeAll"
                checked={formData.agreeAll}
                onChange={handleAgreeAllChange}
                className="mr-2"
              />
              <label>모두 동의합니다</label>
            </div>
            <div className="flex items-center ml-4">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label>이용약관 동의 (필수)</label>
            </div>
            <div className="flex items-center ml-4">
              <input
                type="checkbox"
                name="agreePrivacy"
                checked={formData.agreePrivacy}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label>개인정보 수집 및 이용 동의 (필수)</label>
            </div>
            <div className="flex items-center ml-4">
              <input
                type="checkbox"
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label>마케팅 수신 동의 (선택)</label>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            회원가입
          </button>
        </form>
      </section>
    </main>
  );
}
