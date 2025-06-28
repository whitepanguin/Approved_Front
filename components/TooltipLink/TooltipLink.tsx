import { ReactNode, useState, useEffect } from "react";

type TooltipLinkProps = {
  href: string;
  tooltip: string;
  children: ReactNode;
  className?: string;
};

export default function TooltipLink({
  href,
  tooltip,
  children,
  className = "",
}: TooltipLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [visible, setVisible] = useState(false);

  // 마우스 진입 시 바로 툴팁 visible true
  const handleMouseEnter = () => {
    setVisible(true);
    setShowTooltip(true);
  };

  // 마우스 나가면 애니메이션 딜레이 후 visible false
  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTimeout(() => setVisible(false), 200); // 200ms 애니메이션 시간과 맞춰서
  };

  return (
    <a
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow hover:bg-white transition ${className}`}
    >
      {/* 아이콘 */}
      <svg
        className="w-4 h-4 text-blue-500"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.94 6.06l-2.5 6.14a1 1 0 01-.54.54l-6.14 2.5 2.5-6.14a1 1 0 01.54-.54l6.14-2.5z" />
      </svg>

      {children}

      {visible && (
        <div
          className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black bg-opacity-80 px-3 py-1 text-xs text-white shadow-lg z-10 pointer-events-none
            transition-opacity transition-transform duration-200
            ${
              showTooltip
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1"
            }`}
        >
          {tooltip}
        </div>
      )}
    </a>
  );
}
