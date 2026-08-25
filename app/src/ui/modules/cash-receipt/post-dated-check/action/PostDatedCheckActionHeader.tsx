import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PostDatedCheckHref } from "@/app/src/constants/modules/cash-receipt/post-dated-check/PostDatedCheckConstants";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function PostDatedCheckActionHeader({
  title,
  isReadonly,
  copyFromRecords,
  copyFromSources,
  isSaving,
  onCopyFrom,
  onSave,
}: {
  title: string;
  isReadonly: boolean;
  copyFromRecords: AppCopyFromRecord[];
  copyFromSources: string[];
  isSaving: boolean;
  onCopyFrom: (recordIds: string[]) => void;
  onSave: () => void;
}) {
  return (
    <ModuleHeader
      variant="panel"
      title={title}
      description="Record a party and its post-dated checks."
      actions={
        <>
          <Link href={PostDatedCheckHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Registry
          </Link>
          {!isReadonly ? <AppCopyFromDropdown records={copyFromRecords} sources={copyFromSources} onApply={onCopyFrom} /> : null}
          {!isReadonly ? (
            <button className={moduleHeaderActionClassNames.primary} disabled={isSaving} type="button" onClick={onSave}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {isSaving ? "Saving..." : "Save Registry"}
            </button>
          ) : null}
        </>
      }
    />
  );
}
