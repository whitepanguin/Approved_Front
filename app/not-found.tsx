"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="frem">
      <p>404</p>
      <h2>Look like you're lost</h2>
      <h5>The page you are looking for is not available</h5>
      <Link href="/" className="btn ">
        Go to Home
      </Link>

      <style jsx>{`
        .frem {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif);
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          text-align: center;
        }

        .frem p {
          position: absolute;
          top: 3rem;
          font-size: 7rem;
          color: #00000063;
        }

        .frem h2 {
          position: absolute;
          bottom: 8rem;
          font-size: 34px;
        }

        .frem h5 {
          position: absolute;
          bottom: 6rem;
          color: #9c9c9c;
        }

        .btn {
          position: absolute;
          bottom: 1rem;
          background: linear-gradient(45deg, #ff0034, #ffbc00);
          padding: 12px 24px;
          color: white;
          text-decoration: none;
          font-size: 23px;
          border-radius: 13px;
        }
      `}</style>
    </div>
  );
}
