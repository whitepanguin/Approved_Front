"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setUserStatus } from "../modules/user";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthGate() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const jwtToken =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken") || searchParams.get("jwtToken")
      : null;

  useEffect(() => {
    if (!jwtToken) {
      dispatch(setUser({}));
      dispatch(setUserStatus(false));
      localStorage.clear();
      return;
    }

    localStorage.setItem("jwtToken", jwtToken);

    fetch("http://localhost:8000/auth/jwt", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch(setUser(data.user));
        dispatch(setUserStatus(true));
        router.push("/"); // 필요한 경우 홈으로 이동
      })
      .catch((err) => {
        console.error(err);
        dispatch(setUser({}));
        dispatch(setUserStatus(false));
        localStorage.clear();
      });
  }, [jwtToken]);

  return null;
}
