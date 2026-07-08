"use client";

import { usePathname } from "next/navigation";
import { useOfficialReceiptActionForm } from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceipt";
import type { OfficialReceiptActionMode } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { OfficialReceiptActionHeader } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionHeader";
import { OfficialReceiptDetailsForm } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptDetailsForm";
import { OfficialReceiptEntries } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptEntries";

export function OfficialReceiptActionPage() {
  const pathname = usePathname();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const receiptForm = useOfficialReceiptActionForm(mode);

  return (
    <section className="grid gap-5">
      <OfficialReceiptActionHeader
        mode={mode}
        values={receiptForm.values}
        onCopyFrom={receiptForm.applyCopyFrom}
        onSubmit={receiptForm.submitReceipt}
      />
      <OfficialReceiptDetailsForm
        isReadonly={isReadonly}
        values={receiptForm.values}
        onUpdateField={receiptForm.updateField}
      />
      <OfficialReceiptEntries
        entryView={receiptForm.entryView}
        isReadonly={isReadonly}
        rows={receiptForm.values.lineEntries}
        onEntryViewChange={receiptForm.setEntryView}
        onRowsChange={receiptForm.updateLineEntries}
      />
    </section>
  );
}

function getModeFromPathname(pathname: string): OfficialReceiptActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
