"use client";

import { useBeginningBalanceUploaderFormPage } from "@/app/src/hooks/modules/beginning-balance-uploader/useBeginningBalanceUploaderFormPage";
import { BeginningBalanceUploaderActionHeader } from "./BeginningBalanceUploaderActionHeader";
import { BeginningBalanceUploaderEntriesTable } from "./BeginningBalanceUploaderEntriesTable";
import { BeginningBalanceUploaderHeaderPanel } from "./BeginningBalanceUploaderHeaderPanel";
import { BeginningBalanceUploaderNotFound } from "./BeginningBalanceUploaderNotFound";

export function BeginningBalanceUploaderActionPage() {
  const page = useBeginningBalanceUploaderFormPage();

  if (page.needsRecord && !page.existingRecord) {
    return <BeginningBalanceUploaderNotFound />;
  }

  return (
    <form onSubmit={page.handleSubmit} className="grid gap-5">
      <BeginningBalanceUploaderActionHeader
        existingRecord={page.existingRecord}
        isMutating={page.isMutating}
        mode={page.mode}
      />

      <BeginningBalanceUploaderHeaderPanel
        currencyRate={page.values.currencyRate}
        currencyType={page.values.currencyType}
        date={page.values.documentDate}
        isReadonly={page.isReadonly}
        remarks={page.values.remarks}
        transactionNumber={page.values.transactionNumber}
        onCurrencyRateChange={(value) => page.updateHeaderField("currencyRate", value)}
        onCurrencyTypeChange={(value) => page.updateHeaderField("currencyType", value)}
        onDateChange={(value) => page.updateHeaderField("documentDate", value)}
        onRemarksChange={(value) => page.updateHeaderField("remarks", value)}
      />

      <BeginningBalanceUploaderEntriesTable
        error={page.validationError}
        isReadonly={page.isReadonly}
        rows={page.values.rows}
        totals={page.totals}
        onAddRows={page.addRows}
        onDeleteRow={page.deleteRow}
        onDuplicateRow={page.duplicateRow}
        onInsertRow={page.insertRow}
        onMoveRow={page.moveRow}
        onPasteRows={page.pasteRows}
        onUpdateRow={page.updateRow}
        onUpdateRowFields={page.updateRowFields}
      />
    </form>
  );
}
