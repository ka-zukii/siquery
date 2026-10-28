import React, { useLayoutEffect, useMemo, useRef } from "react";
import type { SchemaTable } from "../utils/parseSchema";
import {
  formatSqlKeywords,
  tokenizeSql,
  type SqlTokenKind,
} from "../utils/sqlHighlight";

/** Warna per jenis token. Kata perintah = amber, tabel = biru langit, kolom = hijau mint. */
const TOKEN_COLOR: Record<SqlTokenKind, string> = {
  keyword: "#f0b84b",
  table: "#7dd3fc",
  column: "#b5f5a8",
  string: "#e8c48a",
  comment: "#6b8a7c",
  number: "#f4a582",
  text: "#9be8c9",
};

interface SqlEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  schema: SchemaTable[];
  placeholder?: string;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  id,
  value,
  onChange,
  onKeyDown,
  schema,
  placeholder,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);
  const pendingCaret = useRef<number | null>(null);

  const tokens = useMemo(() => tokenizeSql(value, schema), [value, schema]);

  // Kembalikan posisi kursor setelah teks diubah otomatis (kapitalisasi)
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (el && pendingCaret.current !== null) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const caret = e.target.selectionStart;
    const formatted = formatSqlKeywords(raw, schema);
    if (formatted !== raw) pendingCaret.current = caret;
    onChange(formatted);
  };

  // Sinkronkan scroll lapisan berwarna dengan textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-lg border border-paper/12 bg-screen shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] focus-within:border-lamp focus-within:ring-[3px] focus-within:ring-lamp/25">
      {/* Lapisan berwarna (di belakang) */}
      <pre
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-[10px_12px] font-mono text-[0.88rem] leading-relaxed wrap-break-word whitespace-pre-wrap"
      >
        {tokens.map((t, idx) => (
          <span
            key={`tok-${idx}`}
            style={{
              color: TOKEN_COLOR[t.kind],
              fontWeight: t.kind === "keyword" ? 600 : undefined,
              fontStyle: t.kind === "comment" ? "italic" : undefined,
            }}
          >
            {t.kind === "keyword" && t.terminated
              ? t.text.toUpperCase()
              : t.text}
          </span>
        ))}
        {/* Spasi tambahan agar tinggi lapisan selalu cocok dengan textarea */}
        {" "}
      </pre>

      {/* Textarea transparan (di depan) untuk input */}
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        spellCheck={false}
        placeholder={placeholder}
        className="no-scrollbar absolute inset-0 h-full w-full resize-none overflow-y-auto bg-transparent p-[10px_12px] font-mono text-[0.88rem] leading-relaxed text-transparent caret-lamp outline-none selection:bg-lamp/30 placeholder:text-phosphor/35"
      />
    </div>
  );
};
