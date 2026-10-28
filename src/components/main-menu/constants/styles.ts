export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,800&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');`;

export const LOCAL_CSS = `
.sq-display { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; }
.sq-sans { font-family: 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif; }
.sq-mono { font-family: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace; }
@keyframes sq-caret { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
.sq-caret { animation: sq-caret 1s steps(1) infinite; }
@keyframes sq-rise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
.sq-rise { animation: sq-rise .45s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .sq-caret, .sq-rise { animation: none; }
  .sq-stack-card { transition: none !important; }
}
`;

export const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b84b]";
