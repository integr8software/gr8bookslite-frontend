import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { GoodsReceiptHref } from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import type {
  GoodsReceiptActionMode,
  GoodsReceiptFormValues,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type GoodsReceiptFormHeaderProps = {
  copyFromRecords: AppCopyFromRecord[];
  mode: GoodsReceiptActionMode;
  onCopyFromSource: (recordIds: string[]) => void;
  onPreview: () => void;
  values: GoodsReceiptFormValues;
  onSubmit: () => void;
};

export function GoodsReceiptFormHeader({
  copyFromRecords,
  mode,
  onCopyFromSource,
  onPreview,
  onSubmit,
  values,
}: GoodsReceiptFormHeaderProps) {
  const title =
    mode === "view"
      ? `View Goods Receipt | ${values.transactionNo}`
      : mode === "edit"
        ? `Edit Goods Receipt | ${values.transactionNo}`
        : "Add Goods Receipt";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={values.transactionType || "Goods Receipt"}
      title={title}
      description={
        mode === "view"
          ? "Review transaction, warehouse, references, and received item entries."
          : "Complete transaction, warehouse, Party Code, references, and received item entries before saving."
      }
      actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
      actions={
        <GoodsReceiptHeaderActions
          copyFromRecords={copyFromRecords}
          mode={mode}
          onCopyFromSource={onCopyFromSource}
          onPreview={onPreview}
          onSubmit={onSubmit}
        />
      }
    />
  );
}

function GoodsReceiptHeaderActions({
  copyFromRecords,
  mode,
  onCopyFromSource,
  onPreview,
  onSubmit,
}: {
  copyFromRecords: AppCopyFromRecord[];
  mode: GoodsReceiptActionMode;
  onCopyFromSource: (recordIds: string[]) => void;
  onPreview: () => void;
  onSubmit: () => void;
}) {
  const overflowItems = createOverflowItems(onSubmit);

  return (
    <>
      <Link href={GoodsReceiptHref} className={moduleHeaderActionClassNames.secondary}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      <ReportPreviewAction onPreview={onPreview} />
      {mode === "view" ? null : (
        <>
          <AppCopyFromDropdown
            records={copyFromRecords}
            sources={["Goods Issue", "Sales Invoice", "Inventory Count"]}
            onApply={onCopyFromSource}
          />
          <div className="flex lg:hidden">
            <ModuleActionMenu
              className="[&>button]:h-10 [&>button]:w-10"
              items={overflowItems}
              label="Goods Receipt actions"
            />
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <Link href={GoodsReceiptHref} className={moduleHeaderActionClassNames.secondary}>
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
    { href: GoodsReceiptHref, icon: X, label: "Cancel", type: "link" },
    {
      icon: Save,
      label: "Save",
      onSelect: onSubmit,
      tone: "primary",
      type: "button",
    },
  ];
}
