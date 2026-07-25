"use client";

import { useState } from "react";
import { ClipboardPaste, Copy, Files, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  StorageLayoutDescription,
  StorageLayoutLevelTypes,
  StorageLayoutTitle,
} from "@/app/src/constants/modules/warehouse-management/storage-layout/StorageLayoutConstants";
import { useStorageLayoutPage } from "@/app/src/hooks/modules/warehouse-management/storage-layout/useStorageLayoutPage";
import type {
  StorageLayoutDraft,
  StorageLayoutRecord,
} from "@/app/src/types/modules/warehouse-management/storage-layout/StorageLayoutTypes";
import { validateStorageLayoutDraft } from "@/app/src/validations/modules/warehouse-management/storage-layout/StorageLayoutValidation";
import { StorageLayoutWarehouseSwitcher } from "@/app/src/ui/modules/warehouse-management/storage-layout/StorageLayoutWarehouseSwitcher";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";

export function StorageLayoutPage() {
  const page = useStorageLayoutPage();
  const [editing, setEditing] = useState<StorageLayoutRecord | "new" | null>(null);

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        eyebrow="Warehouse Storage"
        title={StorageLayoutTitle}
        description={StorageLayoutDescription}
        actions={
          <button
            type="button"
            className={moduleHeaderActionClassNames.primary}
            onClick={() => setEditing("new")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Layout Level
          </button>
        }
      />
      <StorageLayoutWarehouseSwitcher
        value={page.warehouseId}
        warehouses={page.warehouses}
        onChange={(warehouseId) => {
          page.setWarehouseId(warehouseId);
          page.setSelectedId(null);
        }}
      />
      <div className="flex flex-wrap gap-2 rounded-lg border border-darknavy/10 bg-white p-3 shadow-sm">
        <ActionButton icon={Files} label="Duplicate" disabled={!page.selectedRecord} onClick={() => {
          if (page.duplicateSelected()) toast.success("Layout level duplicated.");
        }} />
        <ActionButton icon={Copy} label="Copy Layout" disabled={!page.visibleRecords.length} onClick={() => {
          toast.success(`${page.copyLayout()} layout levels copied.`);
        }} />
        <ActionButton icon={ClipboardPaste} label="Apply Layout" disabled={!page.copiedLayout.length} onClick={() => {
          toast.success(`${page.applyLayout()} layout levels applied.`);
        }} />
        <ActionButton icon={Trash2} label="Remove Level" disabled={!page.selectedRecord} tone="danger" onClick={() => {
          page.removeSelected();
          toast.success("Layout level removed.");
        }} />
      </div>
      {editing ? (
        <LayoutEditor
          record={editing === "new" ? undefined : editing}
          warehouseId={page.warehouseId}
          onClose={() => setEditing(null)}
          onSave={(draft, recordId) => {
            page.saveRecord(draft, recordId);
            setEditing(null);
            toast.success(recordId ? "Layout level updated." : "Layout level added.");
          }}
        />
      ) : null}
      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <div className="border-b border-darknavy/10 px-5 py-4">
          <h2 className="font-semibold text-darknavy">Warehouse hierarchy</h2>
          <p className="mt-1 text-sm text-darknavy/50">Select a level to edit, duplicate, or remove it.</p>
        </div>
        <div className="divide-y divide-darknavy/8">
          {page.visibleRecords.map((record) => (
            <button
              type="button"
              key={record.id}
              onClick={() => page.setSelectedId(record.id)}
              onDoubleClick={() => setEditing(record)}
              className={`grid w-full gap-3 px-5 py-4 text-left transition hover:bg-offwhite sm:grid-cols-[7rem_minmax(0,1fr)_10rem_8rem_7rem] ${
                page.selectedRecord?.id === record.id ? "bg-skyblue/8" : ""
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wide text-skyblue">{record.type}</span>
              <span>
                <span className="block text-sm font-semibold text-darknavy">{record.name}</span>
                <span className="mt-0.5 block text-xs text-darknavy/45">{record.code}</span>
              </span>
              <span className="text-sm text-darknavy/60">{record.parentCode}</span>
              <span className="text-sm text-darknavy/60">{record.capacity}</span>
              <ModuleStatusBadge status={record.status} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LayoutEditor({
  onClose,
  onSave,
  record,
  warehouseId,
}: {
  onClose: () => void;
  onSave: (draft: StorageLayoutDraft, recordId?: string) => void;
  record?: StorageLayoutRecord;
  warehouseId: string;
}) {
  const [draft, setDraft] = useState<StorageLayoutDraft>(
    record ?? {
      capacity: "",
      code: "",
      name: "",
      parentCode: "Warehouse",
      sequence: 1,
      status: "Active",
      type: "Zone",
      warehouseId,
    },
  );
  const [error, setError] = useState("");

  return (
    <section className="rounded-lg border border-skyblue/25 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-darknavy">{record ? "Edit layout level" : "Add layout level"}</h2>
          <p className="mt-1 text-sm text-darknavy/50">Define the level and its parent in this warehouse.</p>
        </div>
        <button type="button" aria-label="Close editor" onClick={onClose}>
          <X className="h-4 w-4 text-darknavy/45" />
        </button>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm font-medium text-coralpink">{error}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Level code *" value={draft.code} onChange={(code) => setDraft({ ...draft, code })} />
        <Field label="Level name *" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <label className="grid gap-1.5 text-sm font-semibold text-darknavy">
          Level type *
          <select className="h-11 rounded-md border border-darknavy/15 bg-white px-3 font-normal" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as StorageLayoutDraft["type"] })}>
            {StorageLayoutLevelTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <Field label="Parent level" value={draft.parentCode} onChange={(parentCode) => setDraft({ ...draft, parentCode })} />
        <Field label="Capacity" value={draft.capacity} onChange={(capacity) => setDraft({ ...draft, capacity })} />
        <Field label="Sequence" type="number" value={String(draft.sequence)} onChange={(sequence) => setDraft({ ...draft, sequence: Number(sequence) || 1 })} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className={moduleHeaderActionClassNames.secondary} onClick={onClose}>Cancel</button>
        <button type="button" className={moduleHeaderActionClassNames.primary} onClick={() => {
          const validationError = validateStorageLayoutDraft(draft);
          if (validationError) {
            setError(validationError);
            return;
          }
          onSave(draft, record?.id);
        }}>Save Level</button>
      </div>
    </section>
  );
}

function Field({ label, onChange, type = "text", value }: { label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-darknavy">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-darknavy/15 px-3 font-normal outline-none focus:border-skyblue focus:ring-4 focus:ring-skyblue/15" />
    </label>
  );
}

function ActionButton({ disabled, icon: Icon, label, onClick, tone = "default" }: { disabled: boolean; icon: typeof Copy; label: string; onClick: () => void; tone?: "default" | "danger" }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${tone === "danger" ? "border-coralpink/25 text-coralpink hover:bg-coralpink/5" : "border-darknavy/15 text-darknavy hover:bg-offwhite"}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
