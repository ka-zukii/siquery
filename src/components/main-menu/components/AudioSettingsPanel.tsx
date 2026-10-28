import React from "react";
import {
  setAudioSettings,
  useAudioSettings,
} from "../../../hooks/audioSettings";
import { useSound } from "../../../hooks/useSound";
import { FOCUS } from "../constants/styles";

interface SliderRowProps {
  id: string;
  label: string;
  value: number; // 0..1
  onChange: (value: number) => void;
  onCommit?: () => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  id,
  label,
  value,
  onChange,
  onCommit,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-baseline justify-between text-[15px] font-medium">
      <label htmlFor={id}>{label}</label>
      <span className="sq-mono text-[13px] text-ink/65">
        {Math.round(value * 100)}%
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      step={5}
      value={Math.round(value * 100)}
      onChange={(e) => onChange(Number(e.target.value) / 100)}
      onPointerUp={onCommit}
      onKeyUp={onCommit}
      className={`w-full accent-ink ${FOCUS}`}
    />
  </div>
);

export const AudioSettingsPanel: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { bgm, sfx } = useAudioSettings();
  const { playSound } = useSound();

  return (
    <div className="sq-rise max-w-xl rounded-[10px] bg-paper p-7 text-ink shadow-[0_24px_50px_rgba(0,0,0,0.5)] sm:p-9">
      <h2 className="sq-display text-3xl font-bold">Pengaturan suara</h2>

      <div className="mt-7 flex flex-col gap-7 border-y border-dashed border-ink/30 py-6">
        <SliderRow
          id="volume-bgm"
          label="Musik latar"
          value={bgm}
          onChange={(v) => setAudioSettings({ bgm: v })}
        />
        <SliderRow
          id="volume-sfx"
          label="Efek suara"
          value={sfx}
          onChange={(v) => setAudioSettings({ sfx: v })}
          // Putar contoh suara saat slider dilepas
          onCommit={() => playSound("slide", { durationMs: 500 })}
        />
      </div>

      <button
        onClick={onBack}
        className={`mt-7 rounded-xl bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition hover:bg-[#2b352f] ${FOCUS}`}
      >
        Kembali ke menu
      </button>
    </div>
  );
};
