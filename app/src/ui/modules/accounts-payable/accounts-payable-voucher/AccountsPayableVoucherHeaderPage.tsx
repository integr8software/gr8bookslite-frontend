import Link from "next/link";
import { ArrowLeft, Ban, Save } from "lucide-react";
import {
  AccountsPayableVoucherActionCopy,
  AccountsPayableVoucherHref,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import type { useAccountsPayableVoucherFormPage } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucherFormPage";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type AccountsPayableVoucherHeaderPageProps = {
  onPreview?: () => void;
  page: ReturnType<typeof useAccountsPayableVoucherFormPage>;
};

export function AccountsPayableVoucherHeaderPage({
  onPreview,
  page,
}: AccountsPayableVoucherHeaderPageProps) {
  const copy = AccountsPayableVoucherActionCopy[page.mode];
  const transactionLabel =
    page.existingRecord?.transactionNo ||
    page.values.transactionNo ||
    "Accounts payable voucher";
  const title =
    page.mode === "view"
      ? page.existingRecord?.transactionNo
        ? `View Accounts Payable Voucher | ${page.existingRecord.transactionNo}`
        : copy.title
      : page.mode === "edit"
        ? page.existingRecord?.transactionNo
          ? `Edit Accounts Payable Voucher | ${page.existingRecord.transactionNo}`
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
            href={AccountsPayableVoucherHref}
            className={moduleHeaderActionClassNames.secondary}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
          {page.mode === "view" && page.existingRecord ? (
            <Link
              href={`${AccountsPayableVoucherHref}/edit/${page.existingRecord.id}`}
              className={moduleHeaderActionClassNames.primary}
            >
              Edit
            </Link>
          ) : null}
          {!page.isReadonly && page.mode !== "view" ? (
            <>
              {page.mode === "edit" ? (
                <button
                  type="button"
                  className={moduleHeaderActionClassNames.danger}
                  onClick={() => page.setIsCancelDialogOpen(true)}
                >
                  <Ban className="h-4 w-4" aria-hidden="true" />
                  Cancel
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
