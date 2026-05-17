import { Suspense } from "react";
import AccountContent from "./account-content";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
      <AccountContent />
    </Suspense>
  );
}
