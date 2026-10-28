import type { SchemaTable } from "./parseSchema";

/** Kata perintah SQL yang akan diberi warna dan dibuat kapital otomatis. */
export const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL", "LIKE",
  "BETWEEN", "EXISTS", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL",
  "CROSS", "ON", "AS", "USING", "ORDER", "BY", "GROUP", "HAVING", "LIMIT",
  "OFFSET", "DISTINCT", "UNION", "ALL", "CASE", "WHEN", "THEN", "ELSE", "END",
  "ASC", "DESC", "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "INSERT",
  "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "DROP",
  "ALTER", "INDEX", "PRIMARY", "FOREIGN", "KEY", "REFERENCES", "DEFAULT",
  "UNIQUE", "CHECK", "WITH", "TRUE", "FALSE", "CAST", "ROUND",
]);

export type SqlTokenKind =
  | "keyword"
  | "table"
  | "column"
  | "string"
  | "comment"
  | "number"
  | "text";

export interface SqlToken {
  kind: SqlTokenKind;
  text: string;
  /** Hanya untuk kata: true jika diikuti karakter non-identifier (atau akhir teks ditutup spasi/tanda). */
  terminated?: boolean;
}

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_]/.test(c);

/**
 * Memecah SQL menjadi token. Nama tabel & kolom dari skema diprioritaskan
 * di atas kata kunci, sehingga identifier tidak ikut berubah menjadi kapital.
 */
export const tokenizeSql = (sql: string, schema: SchemaTable[]): SqlToken[] => {
  const tableSet = new Set(schema.map((t) => t.name.toLowerCase()));
  const colSet = new Set(
    schema.flatMap((t) => t.cols.map((c) => c.toLowerCase())),
  );

  const tokens: SqlToken[] = [];
  const pushText = (text: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === "text") last.text += text;
    else tokens.push({ kind: "text", text });
  };

  const n = sql.length;
  let i = 0;

  while (i < n) {
    const ch = sql[i];

    // Komentar baris: -- ...
    if (ch === "-" && sql[i + 1] === "-") {
      let j = i;
      while (j < n && sql[j] !== "\n") j++;
      tokens.push({ kind: "comment", text: sql.slice(i, j) });
      i = j;
      continue;
    }

    // String literal: '...' (dengan escape '')
    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") {
            j += 2;
            continue;
          }
          break;
        }
        j++;
      }
      const end = Math.min(j + 1, n);
      tokens.push({ kind: "string", text: sql.slice(i, end) });
      i = end;
      continue;
    }

    // Kata / identifier
    if (isIdentStart(ch)) {
      let j = i;
      while (j < n && isIdentPart(sql[j])) j++;
      const word = sql.slice(i, j);
      const lower = word.toLowerCase();
      const upper = word.toUpperCase();
      const terminated = j < n;

      let kind: SqlTokenKind = "text";
      if (tableSet.has(lower)) kind = "table";
      else if (colSet.has(lower)) kind = "column";
      else if (SQL_KEYWORDS.has(upper)) kind = "keyword";

      tokens.push({ kind, text: word, terminated });
      i = j;
      continue;
    }

    // Angka
    if (/\d/.test(ch)) {
      let j = i;
      while (j < n && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ kind: "number", text: sql.slice(i, j) });
      i = j;
      continue;
    }

    pushText(ch);
    i++;
  }

  return tokens;
};

/**
 * Mengapitalkan kata kunci perintah. Hanya dilakukan untuk kata yang sudah
 * selesai diketik (diikuti spasi/tanda baca), agar kata yang sedang diketik
 * tidak berubah-ubah. Panjang teks tidak berubah, sehingga posisi kursor aman.
 */
export const formatSqlKeywords = (sql: string, schema: SchemaTable[]): string =>
  tokenizeSql(sql, schema)
    .map((t) =>
      t.kind === "keyword" && t.terminated ? t.text.toUpperCase() : t.text,
    )
    .join("");
