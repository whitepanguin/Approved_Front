// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AuthGate from "./AuthGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "허가요 - 인허가 검색 서비스",
  description: "대한민국 인허가 정보 통합 검색 플랫폼",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
  
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <Providers>
          <AuthGate />
          {children}
        </Providers>
      </body>
    </html>
  );
}
