"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DeliveryVehicleModuleConfig, DeliveryVehicleModuleRecord } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

type Props = {
  config: DeliveryVehicleModuleConfig;
  mode: "add" | "edit" | "view";
  record?: DeliveryVehicleModuleRecord;
  onClose: () => void;
  onSave: (values: Record<string, string>, status: string, category?: string, existing?: DeliveryVehicleModuleRecord) => void;
  validate: (values: Record<string, string>) => Record<string, string>;
};

export function DeliveryVehicleModuleRecordDialog({ config, mode, record, onClose, onSave, validate }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(config.fields.map((field) => [field.key, record?.fields[field.key] ?? field.defaultValue ?? ""])));
  const [status, setStatus] = useState(record?.status ?? config.statuses[0] ?? "Active");
  const [category, setCategory] = useState(record?.category ?? config.categories?.[0] ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isView = mode === "view";
  const title = mode === "add" ? config.primaryAction : mode === "edit" ? `Edit ${config.noun}` : `${config.noun.replace(/^./, (letter) => letter.toUpperCase())} details`;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave(values, status, category || undefined, record);
  }

  return (
    <div className="fixed inset-0 z-140 flex items-center justify-center bg-slate-950/25 px-4 py-6 backdrop-blur-[1px]" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-darknavy/10 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.24)]" role="dialog" aria-modal="true" aria-labelledby="vehicle-record-dialog-title">
        <div className="flex items-start justify-between border-b border-darknavy/10 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-skyblue">{config.code} · Fleet workspace</p>
            <h2 id="vehicle-record-dialog-title" className="mt-1 text-xl font-semibold text-darknavy">{title}</h2>
            <p className="mt-1 text-sm text-darknavy/60">{isView ? "Review the persisted profile and operational references." : "Keep fleet identity, capacity, compliance, and status together."}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-darknavy/50 hover:bg-darknavy/5 hover:text-darknavy" aria-label="Close dialog"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="grid gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => {
              const id = `delivery-vehicle-${field.key}`;
              const common = { id, name: field.key, value: values[field.key] ?? "", disabled: isView, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((current) => ({ ...current, [field.key]: event.target.value })) };
              return <label key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}><span className="text-sm font-semibold text-darknavy">{field.label}{field.required ? " *" : ""}</span>{field.type === "textarea" ? <textarea {...common} rows={3} className={controlClassName(errors[field.key])} /> : field.type === "select" ? <select {...common} className={controlClassName(errors[field.key])}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input {...common} type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "datetime-local" ? "datetime-local" : "text"} className={controlClassName(errors[field.key])} />}{errors[field.key] ? <span className="mt-1 block text-xs font-medium text-red-600">{errors[field.key]}</span> : null}</label>;
            })}
            <label><span className="text-sm font-semibold text-darknavy">Status *</span><select value={status} disabled={isView} onChange={(event) => setStatus(event.target.value)} className={controlClassName()}>{config.statuses.map((option) => <option key={option}>{option}</option>)}</select></label>
            {config.categories ? <label><span className="text-sm font-semibold text-darknavy">Workspace</span><select value={category} disabled={isView} onChange={(event) => setCategory(event.target.value)} className={controlClassName()}>{config.categories.map((option) => <option key={option}>{option}</option>)}</select></label> : null}
          </div>
          <div className="rounded-lg border border-skyblue/20 bg-skyblue/5 px-4 py-3 text-sm text-darknavy/70"><span className="font-semibold text-darknavy">Capacity convention:</span> cargo volume is measured in cubic meters (m³) by default. Use another unit only when the source specification requires it.</div>
          <div className="flex justify-end gap-2 border-t border-darknavy/10 pt-5"><button type="button" onClick={onClose} className="rounded-md border border-darknavy/10 px-4 py-2.5 text-sm font-semibold text-darknavy/70 hover:bg-darknavy/5">{isView ? "Close" : "Cancel"}</button>{!isView ? <button type="submit" className="rounded-md bg-skyblue px-4 py-2.5 text-sm font-semibold text-[var(--skyblue-contrast)] shadow-sm hover:brightness-95">Save {config.noun}</button> : null}</div>
        </form>
      </section>
    </div>
  );
}

function controlClassName(error?: string) {
  return `mt-1.5 h-11 w-full rounded-md border ${error ? "border-red-400" : "border-darknavy/10"} bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5`;
}
