// app/searchpage/page.tsx
import { Suspense } from "react";
import SearchPage from "@/components/SearchPage";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<p className="p-10">로딩 중...</p>}>
      <SearchPage />
    </Suspense>
  );
}
