import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { CashSalesInvoiceHref } from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import type {
  CashSalesInvoiceActionMode,
  CashSalesInvoiceFormValues,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type CashSalesInvoiceFormHeaderProps = {
  mode: CashSalesInvoiceActionMode;
  values: CashSalesInvoiceFormValues;
  onSubmit: () => void;
};

export function CashSalesInvoiceFormHeader({
  mode,
  onSubmit,
  values,
}: CashSalesInvoiceFormHeaderProps) {
  const title =
    mode === "view"
      ? `View Cash Sales Invoice | ${values.transNo}`
      : mode === "edit"
        ? `Edit Cash Sales Invoice | ${values.transNo}`
        : "Add Cash Sales Invoice";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={values.drNo || "Cash Sales Invoice"}
      title={title}
      description={
        mode === "view"
          ? "Review party, warehouse, account, and reference details."
          : "Complete party, warehouse, account, and reference details before saving."
      }
      actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
      actions={<CashSalesInvoiceHeaderActions mode={mode} onSubmit={onSubmit} />}
    />
  );
}

function CashSalesInvoiceHeaderActions({
  mode,
  onSubmit,
}: {
  mode: CashSalesInvoiceActionMode;
  onSubmit: () => void;
}) {
  const overflowItems = createOverflowItems(onSubmit);

  return (
    <>
      <Link href={CashSalesInvoiceHref} className={moduleHeaderActionClassNames.secondary}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      {mode === "view" ? null : (
        <>
          <div className="flex lg:hidden">
            <ModuleActionMenu
              className="[&>button]:h-10 [&>button]:w-10"
              items={overflowItems}
              label="Cash sales invoice actions"
            />
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <Link href={CashSalesInvoiceHref} className={moduleHeaderActionClassNames.secondary}>
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </Link>
            <button
              type="button"
              onClick={onSubmit}
              className={moduleHeaderActionClassNames.primary}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          </div>
        </>
      )}
    </>
  );
}

function createOverflowItems(onSubmit: () => void): ModuleActionMenuItem[] {
  return [
    { href: CashSalesInvoiceHref, icon: X, label: "Cancel", type: "link" },
    { icon: Save, label: "Save", onSelect: onSubmit, tone: "primary", type: "button" },
  ];
}
