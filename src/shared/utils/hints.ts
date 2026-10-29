/**
 * Jumlah petunjuk yang terbuka. Satu di awal, lalu bertambah setiap dua kali
 * jawaban salah, sehingga pemain mendapat bantuan lebih banyak secara bertahap.
 */
export const revealedHintCount = (wrong: number, total: number): number =>
  total === 0 ? 0 : Math.min(total, 1 + Math.floor(wrong / 2));
