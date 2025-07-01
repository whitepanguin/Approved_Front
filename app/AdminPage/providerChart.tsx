"use client"; // 🔥 App Router에서는 필수
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface User {
  id: number;
  email: string;
  name: string;
  userid: string;
  birthDate: string;
  phone: string;
  businessType: string;
  address: string;
  profile: string;
  provider: string;
  createdAt: string | null;
  updatedAt: string | null;
  password: string | null;
  likedPosts: string[];
  isReported: boolean;
}

const PieChart: React.FC = () => {
  const [googleUser, setGoogleUser] = useState<number>(0);
  const [localUser, setLocalUser] = useState<number>(0);
  const [kakaoUser, setKakaoUser] = useState<number>(0);
  const [NaverUser, setNaverUser] = useState<number>(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/users/allUsers");
        const data: User[] = await response.json();

        setGoogleUser(data.filter((user) => user.provider === "google").length);
        setLocalUser(data.filter((user) => user.provider === "local").length);
        setKakaoUser(data.filter((user) => user.provider === "kakao").length);
        setNaverUser(data.filter((user) => user.provider === "naver").length);
      } catch (error) {
        console.error("사용자 데이터를 불러오지 못했습니다:", error);
      }
    };

    fetchUsers();
  }, []);

  const data = {
    labels: ["Google", "Local", "Kakao", "Naver"],
    datasets: [
      {
        label: "가입자 수",
        data: [googleUser, localUser, kakaoUser, NaverUser], // 숫자만 넣어야 합니다
        backgroundColor: ["#F38181", "#EAFFD0", "#FCE38A", "#95E1D3"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "가입 플랫폼별 사용자 분포",
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default PieChart;
