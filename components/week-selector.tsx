"use client";

export interface WeekCollection {
  handle: string;
  title: string;
  label: string;
  dates: string;
}

export function parseWeekCollection(col: { handle: string; title: string }): WeekCollection {
  // handle format: week-YYYY-MM-DD
  const match = col.handle.match(/^week-(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { ...col, label: col.title, dates: "" };

  const start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startMonth = start.toLocaleString("en", { month: "short" });
  const endMonth = end.toLocaleString("en", { month: "short" });

  const label = startMonth === endMonth ? startMonth : `${startMonth}-${endMonth}`;
  const dates = `${start.getDate().toString().padStart(2, "0")}-${end.getDate().toString().padStart(2, "0")}`;

  return { handle: col.handle, title: col.title, label, dates };
}

interface WeekSelectorProps {
  weeks: WeekCollection[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function WeekSelector({ weeks, activeIndex, onChange }: WeekSelectorProps) {
  if (weeks.length === 0) return null;

  return (
    <div className="flex justify-center mb-10">
      <div className="inline-flex gap-1 bg-primary/10 p-1.5 rounded-2xl">
        {weeks.map((week, i) => (
          <button
            key={week.handle}
            onClick={() => onChange(i)}
            className={`px-6 py-3 rounded-xl text-center transition-all min-w-[110px] ${
              activeIndex === i
                ? "bg-primary text-white shadow-md"
                : "text-gray-600 hover:bg-primary/10"
            }`}
          >
            <span className={`block text-xs ${activeIndex === i ? "text-white/80" : "text-gray-400"}`}>
              {week.label}
            </span>
            <span className={`block text-base font-bold ${activeIndex === i ? "text-white" : "text-gray-700"}`}>
              {week.dates}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
