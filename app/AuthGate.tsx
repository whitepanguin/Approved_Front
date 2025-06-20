"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, setUserStatus } from "../modules/user";

const AuthGate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const jwtToken =
      localStorage.getItem("jwtToken") || searchParams.get("jwtToken");

    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);

      const authenticate = async () => {
        try {
          const res = await fetch("http://localhost:8000/auth/jwt", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });

          const data = await res.json();
          if (searchParams.get("jwtToken")) {
            router.push("/");
          }
          console.log("응답 데이터:", data);
          if (!data.user || !data.user.name)
            throw new Error("유저 데이터 없음");
          dispatch(setUser(data));
          dispatch(setUserStatus(true));
        } catch (error) {
          console.error("JWT 인증 실패:", error);
          // localStorage.removeItem("jwtToken");
          dispatch(setUser({}));
          dispatch(setUserStatus(false));
        } finally {
          setChecked(true);
        }
      };

      authenticate();
    } else {
      dispatch(setUser({}));
      dispatch(setUserStatus(false));
      localStorage.removeItem("jwtToken");

      setChecked(true);
    }
  }, [dispatch, router, searchParams]);

  if (!checked) return null; // 로딩 중엔 아무것도 렌더링하지 않음

  return null; // 인증 처리만 하고 UI는 출력하지 않음
};

export default AuthGate;
