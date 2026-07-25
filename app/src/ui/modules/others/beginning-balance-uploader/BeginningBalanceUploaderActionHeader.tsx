import Link from "next/link";
import { ArrowLeft, Edit3, FileSpreadsheet, Save, Upload, X } from "lucide-react";
import {
  BeginningBalanceUploaderActionCopy,
  BeginningBalanceUploaderHref,
} from "@/app/src/constants/modules/others/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import type {
  BeginningBalanceUploaderActionMode,
  BeginningBalanceUploaderRecord,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function BeginningBalanceUploaderActionHeader({
  existingRecord,
  isMutating,
  mode,
}: {
  existingRecord?: BeginningBalanceUploaderRecord;
  isMutating: boolean;
  mode: BeginningBalanceUploaderActionMode;
}) {
  const copy = BeginningBalanceUploaderActionCopy[mode];
  const title = existingRecord?.transactionNumber
    ? `${copy.title} | ${existingRecord.transactionNumber}`
    : copy.title;

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description={copy.description}
      eyebrow={
        <>
          <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
          Beginning balance
        </>
      }
      actions={
        <>
          <Link href={BeginningBalanceUploaderHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {mode === "view" && existingRecord ? (
            <Link
              href={`${BeginningBalanceUploaderHref}/edit/${existingRecord.id}`}
              className={moduleHeaderActionClassNames.primary}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : (
            <>
              <button type="button" className={moduleHeaderActionClassNames.secondary}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Import
              </button>
              <Link href={BeginningBalanceUploaderHref} className={moduleHeaderActionClassNames.secondary}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isMutating}
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {isMutating ? "Saving..." : "Save Draft"}
              </button>
            </>
          )}
        </>
      }
    />
  );
}
