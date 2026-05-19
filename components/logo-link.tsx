"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LogoLink() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="text-2xl font-bold text-gray-900 shrink-0 cursor-pointer"
      >
        ORA<span className="text-primary">N</span>utrition<span className="text-primary">.</span>
      </button>
    );
  }

  return (
    <Link href="/" className="text-2xl font-bold text-gray-900 shrink-0">
      ORA<span className="text-primary">N</span>utrition<span className="text-primary">.</span>
    </Link>
  );
}
