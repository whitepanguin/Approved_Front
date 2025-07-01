// components/PostCard.tsx
"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faHeart,
  faComment,
  faUser,
  faClock,
  faInfoCircle,
  faQuestionCircle,
  faCoffee,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";

/** 카테고리 → 아이콘 매핑 */
const categoryIcons = {
  info: faInfoCircle,
  qna: faQuestionCircle,
  daily: faCoffee,
  startup: faRocket,
} as const;

interface Post {
  _id: string;
  title: string;
  preview?: string;
  category?: keyof typeof categoryIcons | string;
  author?: string;
  createdAt: string | Date;
  views?: number;
  likes?: number;
  comments?: number;
  emoji?: string;
  email: string;
}

interface User {
  email: string;
  nickname: string;
}

const categoryLabels: Record<string, string> = {
  info: "정보",
  qna: "Q&A",
  daily: "일상",
  startup: "창업",
};

export default function PostCard(
  { post, onClick }: { post: Post; onClick?: () => void } // ⬅️ onClick 받기
) {
  return (
    <div
      onClick={onClick}
      className="p-5 border border-gray-200 rounded-lg hover:border-blue-600 transition-colors cursor-pointer"
    >
      {/* ───── 카테고리 뱃지 ───── */}
      {post.category && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full mb-2">
          {categoryIcons[post.category as keyof typeof categoryIcons] && (
            <FontAwesomeIcon
              icon={categoryIcons[post.category as keyof typeof categoryIcons]}
            />
          )}
          {categoryLabels[post.category] ?? post.category}
        </span>
      )}

      {/* ───── 제목 (+이모지) ───── */}
      <h4 className="text-lg font-semibold text-gray-800 mb-1">
        {post.emoji && <span className="mr-1">{post.emoji}</span>}
        {post.title}
      </h4>

      {/* ───── 내용 요약 ───── */}
      {post.preview && (
        <p className="text-gray-600 text-sm truncate mb-2">{post.preview}</p>
      )}

      {/* ───── 작성자 · 날짜 ───── */}
      <div className="flex items-center text-xs text-gray-500 gap-3 mb-1">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faUser} />
          {/* {post.author || "익명"} */}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} />
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* ───── 조회 · 좋아요 · 댓글 카운트 ───── */}
      <div className="flex justify-end gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faEye} />
          {post.views ?? 0}
        </span>
        <span className="flex items-center gap-1 text-pink-600">
          <FontAwesomeIcon icon={faHeart} />
          {post.likes ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faComment} />
          {post.comments ?? 0}
        </span>
      </div>
    </div>
  );
}
