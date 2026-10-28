export interface SchemaTable {
  name: string;
  cols: string[];
}

const CONSTRAINT_WORDS = /^(PRIMARY|UNIQUE|FOREIGN|CHECK|CONSTRAINT|INDEX|KEY)$/i;

/** Memecah isi kurung CREATE TABLE menjadi bagian per koma (di luar kurung). */
const splitTopLevel = (body: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
};

/** Mengambil nama tabel dan kolom dari skema SQL, untuk sidebar SiQuery. */
export const parseSchema = (sql: string): SchemaTable[] => {
  const tables: SchemaTable[] = [];
  const re = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\)\s*;/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(sql))) {
    const cols = splitTopLevel(m[2])
      .map((part) => part.trim().split(/\s+/)[0])
      .filter((name) => name && !CONSTRAINT_WORDS.test(name));
    tables.push({ name: m[1], cols });
  }

  return tables;
};
