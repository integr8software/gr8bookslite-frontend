import Link from "next/link";
import { FileText, Save, Trash2 } from "lucide-react";
import {
  JournalVoucherActionCopy,
  JournalVoucherHref,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import type { useJournalVoucherFormPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherFormPage";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type JournalVoucherHeaderPageProps = {
  page: ReturnType<typeof useJournalVoucherFormPage>;
};

export function JournalVoucherHeaderPage({
  page,
}: JournalVoucherHeaderPageProps) {
  const copy = JournalVoucherActionCopy[page.mode];

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={copy.title}
      description={copy.description}
      eyebrow={
        <>
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          General journal
        </>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={JournalVoucherHref}
            className={moduleHeaderActionClassNames.secondary}
          >
            Back
          </Link>
          {page.mode === "view" && page.existingRecord ? (
            <Link
              href={`${JournalVoucherHref}/edit/${page.existingRecord.id}`}
              className={moduleHeaderActionClassNames.primary}
            >
              Edit
            </Link>
          ) : null}
          {page.mode === "edit" ? (
            <button
              type="button"
              className={moduleHeaderActionClassNames.danger}
              onClick={() => page.setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          ) : null}
          {!page.isReadonly ? (
            <button
              type="submit"
              className={moduleHeaderActionClassNames.primary}
              disabled={page.isMutating}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          ) : null}
        </div>
      }
    />
  );
}
