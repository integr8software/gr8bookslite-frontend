"use client";

import { Save, Upload } from "lucide-react";
import { BeginningBalanceUploaderPageCopy } from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import { useBeginningBalanceUploaderFormPage } from "@/app/src/hooks/modules/beginning-balance-uploader/useBeginningBalanceUploaderFormPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { BeginningBalanceUploaderActionButton } from "./BeginningBalanceUploaderActionButton";
import { BeginningBalanceUploaderEntriesTable } from "./BeginningBalanceUploaderEntriesTable";
import { BeginningBalanceUploaderHeaderPanel } from "./BeginningBalanceUploaderHeaderPanel";

export function BeginningBalanceUploaderFormPage() {
  const {
    addRows,
    deleteRow,
    documentDate,
    pasteRows,
    remarks,
    rowBatchSize,
    rows,
    setDocumentDate,
    setRemarks,
    setRowBatchSize,
    totals,
    updateRow,
  } = useBeginningBalanceUploaderFormPage();

  return (
    <div className="mx-auto flex w-full max-w-[94rem] flex-col gap-4">
      <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <ModuleHeader
          title={BeginningBalanceUploaderPageCopy.title}
          titleAs="h1"
          description={BeginningBalanceUploaderPageCopy.description}
          actions={
            <>
              <BeginningBalanceUploaderActionButton
                icon={Upload}
                label="Import"
              />
              <BeginningBalanceUploaderActionButton
                icon={Save}
                label="Save Draft"
                primary
              />
            </>
          }
        />
      </section>

      <BeginningBalanceUploaderHeaderPanel
        date={documentDate}
        remarks={remarks}
        onDateChange={setDocumentDate}
        onRemarksChange={setRemarks}
      />

      <BeginningBalanceUploaderEntriesTable
        rowBatchSize={rowBatchSize}
        rows={rows}
        totals={totals}
        onAddRows={addRows}
        onDeleteRow={deleteRow}
        onPasteRows={pasteRows}
        onRowBatchSizeChange={setRowBatchSize}
        onUpdateRow={updateRow}
      />
    </div>
  );
}
