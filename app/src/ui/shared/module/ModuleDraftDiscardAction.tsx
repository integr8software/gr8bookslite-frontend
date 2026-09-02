"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileX2 } from "lucide-react";
import toast from "react-hot-toast";
import { useModuleDiscardPreference } from "@/app/src/hooks/shared/module/useModuleDiscardPreference";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function ModuleDraftDiscardAction({
  href,
  hasChanges,
  mode,
  onDiscard,
}: {
  href: string;
  hasChanges: boolean;
  mode: "add" | "edit";
  onDiscard: () => void;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const { shouldReturnToList, updateShouldReturnToList } = useModuleDiscardPreference();

  return (
    <>
      <button
        type="button"
        className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-45`}
        disabled={!hasChanges}
        onClick={() => setIsConfirming(true)}
      >
        <FileX2 className="h-4 w-4" aria-hidden="true" />
        Discard
      </button>
      <AppDialog
        isOpen={isConfirming}
        cancelLabel="Keep Editing"
        confirmIcon={<FileX2 />}
        confirmLabel="Discard Changes"
        content={
          <label className="flex cursor-pointer items-center justify-center gap-2 text-sm font-medium text-darknavy/70">
            <input
              type="checkbox"
              checked={shouldReturnToList}
              className="h-4 w-4 rounded border-darknavy/20 accent-slate-500"
              onChange={(event) => updateShouldReturnToList(event.target.checked)}
            />
            Return to list after discarding
          </label>
        }
        description={
          mode === "add"
            ? "Your unsaved changes will be removed."
            : "Unsaved changes will be removed. The transaction stays unchanged."
        }
        iconTone="neutral"
        statusIcon={<FileX2 />}
        title="Discard unsaved changes?"
        tone="neutral"
        onCancel={() => setIsConfirming(false)}
        onConfirm={() => {
          onDiscard();
          setIsConfirming(false);
          toast.success("Unsaved changes discarded.");

          if (shouldReturnToList) {
            router.push(href);
          }
        }}
      />
    </>
  );
}
