import React, { useEffect, useState } from "react";
import { reduceMotion } from "@/features/apps/music/utils/motion";

/** Judul yang diketik satu huruf demi satu saat lagu berganti */
export const TypedText: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const [shown, setShown] = useState(() => (reduceMotion() ? text : ""));

  useEffect(() => {
    if (reduceMotion()) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 35);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </p>
  );
};
