// hooks/useButtonSound.ts
import { useMemo } from "react";
import type { FocusEvent } from "react";
import { useSound } from "./useSound";

export const useButtonSound = () => {
  const { playSound } = useSound();

  return useMemo(
    () => ({
      hoverSound: {
        onMouseEnter: () => playSound("hover"),
        onFocus: (e: FocusEvent<HTMLButtonElement>) => {
          if (e.currentTarget.matches(":focus-visible")) playSound("hover");
        },
      },
      clickThen: (action: () => void) => () => {
        playSound("click");
        action();
      },
    }),
    [playSound],
  );
};