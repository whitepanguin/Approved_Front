"use client"; // 🔥 App Router에서는 필수

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface Post {
  id: string;
  title: string;
  content: string;
  preview: string;
  userid: string;
  category: string;
  tags: string[];
  comments: number;
  likes: number;
  views: number;
  hot: boolean;         // ✔ isHot → hot
  notice: boolean;      // ✔ isNotice → notice
  reported: boolean;    // ✔ isReported → reported
  createdAt: string;
  updatedAt: string;
  reports: number;
  _class: string;
  status: "답변대기" | "답변완료";
}


const CategoryChart: React.FC = () => {
    const [info, setInfo] = useState<number>(0);
    const [qna, setQna] = useState<number>(0);
    const [daily, setDaily] = useState<number>(0);
    const [startup, setStartup] = useState<number>(0);
  
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await fetch("http://localhost:8000/posts");
          const data: Post[] = await response.json();
  
          setInfo(data.filter((post) => post.category === "info").length);
          setQna(data.filter((post) => post.category === "qna").length);
          setDaily(data.filter((post) => post.category === "daily").length);
          setStartup(data.filter((post) => post.category === "startup").length);
        } catch (error) {
          console.error("사용자 데이터를 불러오지 못했습니다:", error);
        }
      };
  
      fetchUsers();
    }, []);
  
    const data = {
      labels: ["정보공유", "Q&A", "일상 이야기", "창업 관련 정보"],
      datasets: [
        {
          label: "가입자 수",
          data: [info, qna, daily, startup], // 숫자만 넣어야 합니다
          backgroundColor: ["#FFC7C7", "#FFE2E2", "#F6F6F6", "#8785A2"],
          borderWidth: 1
        }
      ]
    };
  
    const options = {
      responsive: true,
      plugins: {
        legend: { position: "top" as const },
        title: {
          display: true,
          text: "카테고리 테마별 분포"
        }
      }
    };

  return <Doughnut data={data} options={options} />;
};

export default CategoryChart;
