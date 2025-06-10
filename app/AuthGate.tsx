"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "./providers"; // useApp 임포트
import { setUser, setUserStatus } from "@/modules/user";

export default function AuthGate() {
  const { setUser, setUserStatus } = useApp(); // useApp에서 상태/액션 받아옴
  const searchParams = useSearchParams();
  const router = useRouter();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) return;
    setChecked(true);

    const tokenFromURL = searchParams.get("jwtToken");

    // 우선순위: URL → sessionStorage → localStorage
    const jwtToken =
      tokenFromURL ||
      sessionStorage.getItem("jwtToken") ||
      localStorage.getItem("jwtToken");

    if (!jwtToken) {
      setUser({});
      setUserStatus(false);
      sessionStorage.removeItem("jwtToken");
      localStorage.removeItem("jwtToken");
      return;
    }

    // 어떤 저장소에서 쓰는지 확인 (useApp은 sessionStorage 기준)
    let loginType: "useApp" | "social";
    if (tokenFromURL) {
      // URL에 있을 경우 저장소에 최신화
      if (sessionStorage.getItem("jwtToken")) {
        sessionStorage.setItem("jwtToken", tokenFromURL);
        loginType = "useApp";
      } else {
        localStorage.setItem("jwtToken", tokenFromURL);
        loginType = "social";
      }
    } else if (sessionStorage.getItem("jwtToken") === jwtToken) {
      loginType = "useApp";
    } else {
      loginType = "social";
    }

    const authUrl =
      loginType === "useApp"
        ? "http://localhost:8000/auth/local" // local 로그인 인증 주소 (useApp)
        : "http://localhost:8000/auth/jwt"; // social 로그인 인증 주소

    fetch(authUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Unknown error");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setUserStatus(true);
        } else {
          throw new Error("사용자 정보가 없습니다.");
        }

        if (tokenFromURL) {
          router.replace("/");
        }
      })
      .catch((err) => {
        console.error("인증 오류:", err);
        setUser({});
        setUserStatus(false);
        localStorage.removeItem("jwtToken");
      });
  }, []);

  return null;
}
