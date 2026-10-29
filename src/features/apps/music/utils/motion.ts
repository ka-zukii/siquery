/** Pengguna yang minta gerakan dikurangi: animasi dimatikan */
export const reduceMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
