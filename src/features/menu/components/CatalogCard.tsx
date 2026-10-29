import React from "react";
import type { Chapter } from "@/features/menu/types";

const LevelDots: React.FC<{ level: number; label: string }> = ({
  level,
  label,
}) => (
  <span className="flex items-center gap-2">
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`h-2 w-2 rounded-full ${n <= level ? "bg-ink" : "bg-ink/20"}`}
        />
      ))}
    </span>
    <span>{label}</span>
  </span>
);

const stackStyle = (offset: number): React.CSSProperties => {
  if (offset === 0)
    return {
      transform: "translate(0, 0) rotate(0deg)",
      zIndex: 30,
      opacity: 1,
    };
  if (offset === 1)
    return {
      transform: "translate(22px, 14px) rotate(2.5deg)",
      zIndex: 20,
      opacity: 1,
      filter: "brightness(0.78)",
    };
  if (offset === 2)
    return {
      transform: "translate(40px, 26px) rotate(5deg)",
      zIndex: 10,
      opacity: 1,
      filter: "brightness(0.6)",
    };
  return {
    transform: "translate(40px, 26px) rotate(5deg) scale(0.96)",
    zIndex: 0,
    opacity: 0,
    pointerEvents: "none",
  };
};

export const CatalogCard: React.FC<{
  chapter: Chapter;
  offset: number;
  onFocusCard: () => void;
}> = ({ chapter, offset, onFocusCard }) => {
  const isFront = offset === 0;
  return (
    <article
      aria-hidden={!isFront}
      onClick={() => !isFront && onFocusCard()}
      style={stackStyle(offset)}
      className={`sq-stack-card absolute inset-0 flex flex-col rounded-[10px] bg-paper px-6 pb-12 pt-8 text-ink shadow-[0_24px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 ${isFront ? "" : "cursor-pointer"}`}
    >
      {/* Tab penanda kartu */}
      <div className="sq-sans absolute -top-3.5 left-6 rounded-t-md bg-paper px-4 pb-1 pt-1.5 text-[12px] font-semibold text-ink shadow-[0_-4px_10px_rgba(0,0,0,0.25)]">
        Kasus {chapter.number}
      </div>

      {/* Stempel status */}
      <div
        className={`sq-sans absolute right-5 top-5 -rotate-6 rounded border-2 px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] ${
          chapter.progress?.done
            ? "border-[#2f7a55] bg-[#2f7a55] text-paper"
            : chapter.isAvailable
              ? "border-[#2f7a55] text-[#2f7a55]"
              : "border-ink/40 text-ink/50"
        }`}
      >
        {chapter.progress?.done
          ? "SELESAI"
          : chapter.isAvailable
            ? "TERSEDIA"
            : "SEGERA HADIR"}
      </div>

      <p className="sq-sans mt-1 max-w-[70%] text-[13px] text-ink/60">
        {chapter.subtitle}
      </p>
      <h2 className="sq-display mt-1 max-w-[85%] text-[1.7rem] font-bold leading-[1.1] text-ink sm:text-[2rem]">
        {chapter.title}
      </h2>

      {/* Rincian ala kartu katalog */}
      <dl className="sq-sans mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-y border-dashed border-ink/30 py-3 text-[13px]">
        <dt className="text-ink/55">Lokasi</dt>
        <dd className="font-medium">{chapter.location}</dd>
        <dt className="text-ink/55">Tanggal</dt>
        <dd className="font-medium">{chapter.date}</dd>
        <dt className="text-ink/55">Tingkat</dt>
        <dd className="font-medium">
          <LevelDots level={chapter.level} label={chapter.levelLabel} />
        </dd>
        {chapter.progress && (
          <>
            <dt className="text-ink/55">Progres</dt>
            <dd className="font-medium">{chapter.progress.label}</dd>
          </>
        )}
      </dl>

      <p className="sq-sans mt-4 text-[14px] leading-relaxed text-ink/85">
        {chapter.description}
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {chapter.skills.map((s) => (
          <span
            key={s}
            className="sq-mono rounded border border-ink/30 px-2 py-0.5 text-[11px] text-ink/80"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Lubang batang laci katalog */}
      <span
        className="absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-desk shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
        aria-hidden="true"
      />
    </article>
  );
};

