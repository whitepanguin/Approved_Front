"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "./providers"; // useApp에서 상태/액션 받아오기
import {
  setUser as setReduxUser,
  setUserStatus as setReduxUserStatus,
} from "@/modules/user.js";
import { useDispatch } from "react-redux";

export default function AuthGate() {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, setUserStatus } = useApp(); // Context 상태 관리용
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // 중복 호출 방지 플래그
  const [checked, setChecked] = useState(false);
  const jwtToken =
    localStorage.getItem("jwtToken") || searchParams.get("jwtToken");

  useEffect(() => {
    if (checked) return;
    setChecked(true);

    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
      router.push("/");
    }
    if (jwtToken) {
      const isAuthenticate = async () => {
        const response = await fetch("http://localhost:8000/auth/jwt", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const getAuthenticate = await response.json();
        return getAuthenticate;
      };

      isAuthenticate()
        .then((res) => {
          console.log(res);
          // 3) 화면에 뿌릴 수 있도록 유저정보를 파싱(redux)
          dispatch(setUser(res.user)); // currentUser
          dispatch(setUserStatus(true)); // isLogin
        })
        .catch(console.error);
    } else {
      dispatch(setUser({})); // currentUser
      dispatch(setUserStatus(false)); // isLogin
      localStorage.clear();
    }
  }, [jwtToken]);

  // 인증 완료 후 자식 컴포넌트 렌더링 등...
  return null;
}
