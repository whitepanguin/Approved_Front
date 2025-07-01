// app/not-found.tsx (or app/_not-found/page.tsx 중 하나)
import { Suspense } from "react";
import NotFoundPage from "@/components/NotFoundPage";

export default function NotFoundWrapper() {
  return (
    <Suspense fallback={null}>
      <NotFoundPage />
    </Suspense>
  );
}
