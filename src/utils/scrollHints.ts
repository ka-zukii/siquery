const MIN_HIDDEN = 4; // px: selisih kecil diabaikan

const update = (el: HTMLElement) => {
  const more = el.scrollHeight - el.scrollTop - el.clientHeight > MIN_HIDDEN;
  const value = String(more);
  if (el.dataset.more !== value) el.dataset.more = value;
};

const refreshAll = () => {
  document.querySelectorAll<HTMLElement>(".os-scroll").forEach(update);
};

/** Memantau perubahan isi dan ukuran; mengembalikan fungsi untuk melepas pemantau */
export const initScrollHints = (): (() => void) => {
  refreshAll();

  const onScroll = (e: Event) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.classList.contains("os-scroll"))
      update(t);
  };
  document.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", refreshAll);

  const mo = new MutationObserver(refreshAll);
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  return () => {
    document.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", refreshAll);
    mo.disconnect();
  };
};
