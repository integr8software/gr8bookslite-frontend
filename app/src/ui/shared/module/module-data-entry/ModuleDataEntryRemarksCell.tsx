"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { AppLimitedTextareaMaxLength } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { ModuleTextareaDialog } from "@/app/src/ui/shared/module/ModuleTextareaDialog";

export function ModuleDataEntryRemarksCell({
  inputId,
  inputName,
  isReadonly,
  onChange,
  placeholder = "Enter Remarks",
  subtitle,
  textareaId,
  value,
}: {
  inputId: string;
  inputName: string;
  isReadonly: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  subtitle: string;
  textareaId: string;
  value: string;
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
        <input
          id={inputId}
          name={inputName}
          type="text"
          value={value}
          readOnly={isReadonly}
          maxLength={AppLimitedTextareaMaxLength}
          placeholder={placeholder}
          title={value || placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full min-w-0 truncate border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 read-only:bg-darknavy/[0.03] read-only:text-darknavy"
        />
        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="inline-flex h-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
          aria-label="Open remarks"
          title="Open Remarks"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {isEditorOpen ? (
        <ModuleTextareaDialog
          isOpen
          isReadonly={isReadonly}
          title="Remarks"
          subtitle={subtitle}
          textareaId={textareaId}
          value={value}
          onClose={() => setIsEditorOpen(false)}
          onSave={(nextValue) => {
            onChange(nextValue);
            setIsEditorOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
