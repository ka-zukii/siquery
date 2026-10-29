import React, { useEffect, useState } from "react";
import type { EmailItem } from "../../../types/case.types";

interface UniMailAppProps {
  inbox: EmailItem[];
  readIds: string[];
  onRead: (id: string) => void;
  /** true saat jendela UniMail terbuka: surat yang dipilih otomatis ditandai dibaca */
  isOpen: boolean;
}

export const UniMailApp: React.FC<UniMailAppProps> = ({
  inbox,
  readIds,
  onRead,
  isOpen,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    inbox[0]?.id ?? null,
  );
  const selected = inbox.find((m) => m.id === selectedId) ?? inbox[0];

  useEffect(() => {
    if (isOpen && selected) onRead(selected.id);
  }, [isOpen, selected, onRead]);

  if (!selected) {
    return (
      <div className="p-6 font-sans text-sm text-ink/70">
        Kotak masuk kosong.
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[250px_1fr] overflow-hidden bg-mac-solid">
      <div className="space-y-1 overflow-y-auto border-r border-mac-sep bg-mac-sidebar p-1.5">
        {inbox.map((m) => {
          const isSel = m.id === selected.id;
          const isUnread = !readIds.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedId(m.id)}
              className={`block w-full cursor-pointer rounded-lg p-2.5 text-left ${
                isSel ? "bg-lamp text-[#1d1608]" : "hover:bg-black/5"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {isUnread && (
                  <span
                    aria-label="belum dibaca"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0a64d8]"
                  />
                )}
                <span className="truncate">{m.from}</span>
              </div>
              <div className="truncate text-[0.76rem]">{m.subject}</div>
              <div
                className={`mt-0.5 text-[0.68rem] ${isSel ? "text-[#1d1608]/70" : "opacity-60"}`}
              >
                {m.date}
              </div>
            </button>
          );
        })}
      </div>

      <div className="overflow-y-auto p-5">
        <div className="min-h-full rounded-md bg-paper p-6 text-ink shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <h3 className="font-display mb-1 text-xl font-bold leading-snug">
            {selected.subject}
          </h3>
          <div className="mb-4 border-b border-dashed border-ink/30 pb-3 font-mono text-[0.7rem] text-ink/60">
            Dari: {selected.from}
            {selected.to && ` • Untuk: ${selected.to}`}
          </div>
          <p className="max-w-[62ch] whitespace-pre-line text-sm leading-relaxed text-ink/90">
            {selected.body}
          </p>
        </div>
      </div>
    </div>
  );
};
