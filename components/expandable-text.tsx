"use client";

import { useRef, useState } from "react";

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{
          maxHeight: expanded
            ? `${contentRef.current?.scrollHeight ?? 1000}px`
            : "4.5em",
        }}
      >
        <div ref={contentRef}>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{text}</p>
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm font-bold text-gray-900 inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
      >
        {expanded ? "Read Less" : "Read More"}
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
}
