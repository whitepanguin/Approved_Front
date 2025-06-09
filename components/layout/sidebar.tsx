"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/app/providers"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { searchHistory, removeFromSearchHistory } = useApp()

  const navItems = [
    { href: "/community", icon: "fas fa-users", label: "커뮤니티" },
    { href: "/map", icon: "fas fa-map-marked-alt", label: "지도" },
    { href: "/mypage", icon: "fas fa-user", label: "마이페이지" },
  ]

  return (
    <div className={`sidenav ${isOpen ? "open" : ""}`}>
      <a href="#" className="closebtn" onClick={onClose}>
        &times;
      </a>

      {navItems.map((item) => (
        <Link key={item.href} href={item.href} onClick={onClose}>
          <div className={`nav-item ${pathname === item.href ? "active" : ""}`}>
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </div>
        </Link>
      ))}

      <div className="history-container">
        <h3>검색 기록</h3>
        <div className="search-history">
          {searchHistory.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px", padding: "10px 0" }}>검색 기록이 없습니다.</p>
          ) : (
            searchHistory.map((query, index) => (
              <div key={index} className="history-item">
                <div className="history-text">
                  <i className="fas fa-history"></i>
                  <span>{query}</span>
                </div>
                <div className="history-actions" onClick={() => removeFromSearchHistory(index)}>
                  <i className="fas fa-times"></i>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
