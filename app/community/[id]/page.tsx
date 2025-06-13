// app/community/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Post {
  _id: string;
  title: string;
  content: string;
  author?: string;
  createdAt?: string;
  views?: number;
}

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8000/posts/${id}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("❌ 게시글 로드 실패:", err);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) return <div>로딩 중...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-2">{post.createdAt}</p>
      <p className="mb-6">{post.content}</p>
      <p className="text-sm text-gray-600">조회수: {post.views ?? 0}</p>
    </div>
  );
}
