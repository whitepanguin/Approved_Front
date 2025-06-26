import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, setUserStatus } from "@/modules/user";
import { useRouter } from "next/navigation";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 회사 정보 */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            {/* <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs"></span>
            </div> */}
            <span className="font-semibold text-gray-900">허가요</span>
          </div>
          <p className="text-sm text-gray-600">
            대한민국 인터넷 정보 통합 검색 플랫폼
          </p>
          <p className="text-xs text-gray-500">
            서울특별시 강남구 테헤란로 123, 허가요빌딩 (우) 06234
          </p>
          <p className="text-xs text-gray-500">
            사업자등록번호: 123-45-67890 | 대표이사: 김사과 | 고객센터:
            1588-1234
          </p>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 pt-4">
          {/* 하단 링크 */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
            >
              이용약관
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="#"
              className="text-sm font-semibold text-gray-900 hover:text-blue-500 transition-colors"
            >
              개인정보처리방침
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
            >
              청소년보호정책
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
            >
              운영정책
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
            >
              위치기반서비스 이용약관
            </Link>
          </div>

          {/* 저작권 정보 */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              © 2025 허가요 Corp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
