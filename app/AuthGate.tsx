"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setUserStatus } from "../modules/user";
import { RootState } from "@/store";

const AuthGate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);
  const { currentUser, isLogin } = useSelector(
    (state: RootState) => state.user || {}
  );

  useEffect(() => {
    const jwtToken =
      localStorage.getItem("jwtToken") || searchParams.get("jwtToken");

    if (!jwtToken) {
      return;
    }

    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
      const authenticate = async () => {
        try {
          const res = await fetch(
            "https://port-0-approved-springback-m5mcnm8ebdc80276.sel4.cloudtype.app/auth/jwt",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );

          const data = await res.json();
          /*
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
          */
          if (!data.user || !data.user.name) {
            throw new Error("유효하지 않은 유저 데이터");
          }

          dispatch(setUser(data));
          dispatch(setUserStatus(true));

          if (searchParams.get("jwtToken")) {
            router.push("/");
          }
        } catch (error) {
          // 에러 발생 시에도 콘솔만 찍고, 사용자에겐 영향 없게
          console.warn("JWT 인증 실패 (무시됨):", error);
          dispatch(setUser({}));
          dispatch(setUserStatus(false));
          localStorage.removeItem("jwtToken");
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
