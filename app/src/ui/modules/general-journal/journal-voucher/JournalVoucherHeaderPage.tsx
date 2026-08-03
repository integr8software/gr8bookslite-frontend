import Link from "next/link";
import { ArrowLeft, Save, Trash2, X } from "lucide-react";
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
  const transactionLabel =
    page.existingRecord?.transactionNo ||
    page.values.transactionNo ||
    "Journal voucher";
  const title =
    page.mode === "view"
      ? page.existingRecord?.transactionNo
        ? `View Journal Voucher | ${page.existingRecord.transactionNo}`
        : copy.title
      : page.mode === "edit"
        ? page.existingRecord?.transactionNo
          ? `Edit Journal Voucher | ${page.existingRecord.transactionNo}`
          : copy.title
        : copy.title;

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description={copy.description}
      eyebrow={transactionLabel}
      actionsClassName="items-center gap-1"
      actions={
        <>
          <Link
            href={JournalVoucherHref}
            className={moduleHeaderActionClassNames.secondary}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
          {!page.isReadonly && page.mode !== "view" ? (
            <>
              <Link
                href={JournalVoucherHref}
                className={moduleHeaderActionClassNames.secondary}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
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
              <button
                type="submit"
                className={moduleHeaderActionClassNames.primary}
                disabled={page.isMutating}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </>
          ) : null}
        </>
      }
    />
  );
}
