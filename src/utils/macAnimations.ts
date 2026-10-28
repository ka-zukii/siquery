const WATCH = ".os-window, .overlay-backdrop";
const leaving = new WeakSet<HTMLElement>();

function animateOut(el: HTMLElement, minimize: boolean): void {
  leaving.add(el);

  el.classList.remove("hidden");
  const cls = minimize ? "animate-mac-minimize" : "animate-mac-close";
  el.classList.add(cls);

  const duration = minimize ? 450 : 200;
  window.setTimeout(() => {
    el.classList.remove(cls);
    el.classList.add("hidden");
    delete el.dataset.minimize;

    window.setTimeout(() => leaving.delete(el), 0);
  }, duration);
}

export function initMacAnimations(): () => void {
  const handleCaptureClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest(".btn-min");
    if (!btn) return;
    const win = btn.closest<HTMLElement>(".os-window");
    if (win) win.dataset.minimize = "1";
  };

  document.addEventListener("click", handleCaptureClick, true);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName !== "class") continue;
      const el = m.target as HTMLElement;
      if (!el.matches?.(WATCH)) continue;
      if (leaving.has(el)) continue;

      const wasHidden = (m.oldValue ?? "").split(/\s+/).includes("hidden");
      const isHidden = el.classList.contains("hidden");

      if (!wasHidden && isHidden) {
        animateOut(el, el.dataset.minimize === "1");
      }
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
    attributeOldValue: true,
    subtree: true,
  });

  return () => {
    document.removeEventListener("click", handleCaptureClick, true);
    observer.disconnect();
  };
}
