"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type Option = { label: string; value: string };

const defaultTriggerClass =
  "w-full flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition hover:border-gray-300 focus:outline-none focus:border-[#0F2044] cursor-pointer";

export default function Dropdown({
  options,
  value,
  onSelect,
  placeholder,
  triggerClassName = defaultTriggerClass,
  ariaLabelledby,
}: {
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  // Shown in the trigger when nothing is selected. Without it, the first option's label is used.
  placeholder?: string;
  triggerClassName?: string;
  // id of an external <label> to associate with the trigger button for accessibility.
  ariaLabelledby?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const match = options.find((o) => o.value === value);
  const selectedLabel = value
    ? match?.label ?? placeholder ?? ""
    : placeholder ?? match?.label ?? options[0]?.label ?? "";

  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-labelledby={ariaLabelledby} onClick={() => setOpen((v) => !v)} className={triggerClassName}>
        <span className={value ? "text-gray-900" : "text-gray-400"}>{selectedLabel}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <li key={opt.value || "none"}>
              <button
                type="button"
                onClick={() => { onSelect(opt.value); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition cursor-pointer"
              >
                <span className="flex-1 text-left">{opt.label}</span>
                {value === opt.value && <Check size={14} className="text-[#0F2044] shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
