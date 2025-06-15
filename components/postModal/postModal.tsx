"use client";
import React from "react";
import { formatDate } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClock, faEye, faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart, faComment as farComment } from "@fortawesome/free-regular-svg-icons";


type Comment = {
  _id: string;
  userid: string;
  content: string;
  createdAt: string | Date;
};

interface Props {
  post: any;                     // selectedPost
  comments: Comment[];
  liked: boolean;
  likeCount: number;
  onClose: () => void;
  onToggleLike: () => void;
  onAddComment: (c: string) => void;
  newComment: string;
  setNewComment: (v: string) => void;
 
}

export default function PostModal({
  post, comments, liked, likeCount,
  onClose, onToggleLike,
  onAddComment, newComment, setNewComment,
 
}: Props) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold truncate">{post.title}</h2>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>

        {/* body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* meta */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex gap-4">
              <span><FontAwesomeIcon icon={faUser} className="mr-1" />{post.userid}</span>
              <span><FontAwesomeIcon icon={faClock} className="mr-1" />{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex gap-4">
              <span><FontAwesomeIcon icon={faEye}  className="mr-1" />{post.views}</span>
              <span><FontAwesomeIcon icon={faHeart} className="mr-1" />{likeCount}</span>
              <span><FontAwesomeIcon icon={faComment} className="mr-1" />{comments.length}</span>
            </div>
          </div>

          {/* content */}
          <p className="whitespace-pre-line leading-relaxed text-gray-800">{post.content ?? post.preview}</p>

          {/* like / comment btn */}
          <div className="flex items-center gap-6 text-gray-600">
            <button onClick={onToggleLike} className="flex items-center gap-1 hover:text-pink-600">
              <FontAwesomeIcon icon={liked ? faHeart : farHeart} />
              <span>{likeCount}</span>
            </button>
            <button onClick={() => document.getElementById("commentInput")?.focus()}
                    className="flex items-center gap-1 hover:text-blue-600">
              <FontAwesomeIcon icon={farComment} />
              <span>{comments.length}</span>
            </button>
          </div>

          {/* comment list */}
          <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 댓글이 없습니다.</p>
            ) : comments.map(c => (
              <div key={c._id} className="p-3 bg-gray-50 rounded text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{c.userid}</span>
                  <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                </div>
                <p>{c.content}</p>
              </div>
            ))}
          </div>

          {/* comment input */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <input id="commentInput" value={newComment}
                   onChange={e => setNewComment(e.target.value)}
                   onKeyDown={e => e.key === "Enter" && onAddComment(newComment)}
                   placeholder="댓글을 입력하세요…" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            <button onClick={() => onAddComment(newComment)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">등록</button>
          </div>
        </div>
      </div>
    </div>
  );
}
