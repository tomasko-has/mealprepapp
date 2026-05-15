import { Suspense } from "react";
import SummaryContent from "./summary-content";

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
      <SummaryContent />
    </Suspense>
  );
}
