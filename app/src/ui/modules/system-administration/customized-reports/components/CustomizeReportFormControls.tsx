import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { InspectorNumberInputClassName } from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type { CustomizeReportAlign } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
export function FieldNumberControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className={InspectorNumberInputClassName}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

export function TextControl({
  label,
  multiline = false,
  onChange,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      {multiline ? (
        <textarea
          className={`${InspectorNumberInputClassName} min-h-20 resize-y py-2`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className={InspectorNumberInputClassName}
          onChange={(event) => onChange(event.target.value)}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}

export function AlignButton({
  align,
  currentAlign,
  onClick,
}: {
  align: CustomizeReportAlign;
  currentAlign: CustomizeReportAlign;
  onClick: () => void;
}) {
  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;

  return (
    <button
      className={`flex h-9 items-center justify-center border-r border-slate-200 last:border-r-0 ${
        align === currentAlign
          ? "bg-orange-500 text-white"
          : "bg-white text-slate-600 hover:bg-slate-50"
      }`}
      onClick={onClick}
      title={`Align ${align}`}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

