import React from "react";
import { useDisplayPrefs } from "@/shared/display/useDisplayPrefs";
import { FOCUS } from "@/features/menu/constants/styles";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  checked,
  onToggle,
}) => (
  <div className="flex items-center justify-between gap-6">
    <div>
      <p className="text-[15px] font-medium">{label}</p>
      <p className="mt-1 text-[13px] text-ink/65">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? "bg-ink" : "bg-ink/25"
      } ${FOCUS}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-paper shadow transition-transform ${
          checked ? "translate-x-[1.25rem]" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

export const DisplaySettingsPanel: React.FC = () => {
  const { prefs, update } = useDisplayPrefs();

  return (
    <div className="sq-rise max-w-xl rounded-[10px] bg-paper p-7 text-ink shadow-[0_24px_50px_rgba(0,0,0,0.5)] sm:p-9">
      <h2 className="sq-display text-3xl font-bold">Pengaturan tampilan</h2>

      <div className="mt-7 flex flex-col gap-7 border-y border-dashed border-ink/30 py-6">
        <ToggleRow
          label="Kurangi animasi"
          description="Membuat transisi jendela dan kartu hampir tanpa gerak."
          checked={prefs.reduceMotion}
          onToggle={() => update({ reduceMotion: !prefs.reduceMotion })}
        />
        <ToggleRow
          label="Teks lebih besar"
          description="Memperbesar teks di seluruh aplikasi."
          checked={prefs.largeText}
          onToggle={() => update({ largeText: !prefs.largeText })}
        />
      </div>
    </div>
  );
};
