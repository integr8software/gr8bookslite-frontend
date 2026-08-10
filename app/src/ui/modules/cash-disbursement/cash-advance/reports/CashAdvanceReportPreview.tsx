"use client";

import {
  formatCashAdvanceCurrency,
  formatCashAdvanceDate,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type CashAdvanceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: CashAdvanceFormValues;
};

export function CashAdvanceReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  values,
}: CashAdvanceReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Cash Advance PDF Preview"
      description="Review the printable cash advance document."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
      printLabel="Open PDF"
    >
      <CashAdvanceReportDocument values={values} />
    </ReportPreviewDrawer>
  );
}

function CashAdvanceReportDocument({ values }: { values: CashAdvanceFormValues }) {
  const amount = Number(values.amount || 0);

  return (
    <div className="mx-auto min-w-[48rem] max-w-[48rem] bg-white p-8 text-sm leading-relaxed text-darknavy shadow-sm">
      <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
        <div className="grid h-20 w-24 place-items-center rounded border border-darknavy/20 text-xs font-bold text-skyblue">
          LOGO
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">Your Company Name Here</p>
          <p className="text-xs text-darknavy/65">VAT REG TIN : 000-000-000-000</p>
          <p className="text-xs text-darknavy/65">
            Abc, 123, Sample, Malamig, City Of Mandaluyong, NCR
          </p>
          <p className="mt-1 text-xs text-darknavy/65">Telephone No: 0967-237-4514</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-4 border-b-2 border-darknavy pb-3">
        <h2 className="text-xl font-bold uppercase tracking-wide">Cash Advance</h2>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-darknavy/60">Advance No.</p>
          <p className="text-base font-bold">{values.transNo || "-"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
        <PreviewField label="Document Date" value={formatPreviewDate(values.documentDate)} />
        <PreviewField label="Status" value={values.status} />
        <PreviewField label="Party Code" value={values.partyCode} />
        <PreviewField label="Party Name" value={values.partyName} />
        <PreviewField label="Account Code" value={values.accountCode} />
        <PreviewField label="Cost Center" value={values.costCenter} />
        <PreviewField label="Amount" value={formatCashAdvanceCurrency(amount)} />
        <PreviewField label="Tax" value={createTaxSummary(values)} />
      </div>

      <div className="mt-6 rounded-lg border border-darknavy/15">
        <div className="border-b border-darknavy/15 bg-offwhite/60 px-4 py-2 font-semibold">
          References
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-4">
          <PreviewField label="Container No." value={values.referenceFields.containerNo} />
          <PreviewField label="Ref No." value={values.referenceFields.refNo} />
          <PreviewField label="Project Ref" value={values.referenceFields.projectRef} />
          <PreviewField
            label="Importation Ref No."
            value={values.referenceFields.importationRefNo}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase text-darknavy/60">Remarks</p>
        <div className="mt-1 min-h-20 rounded border border-darknavy/15 px-3 py-2">
          {values.remarks || "\u00a0"}
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <div className="w-56 text-center">
          <div className="border-b border-darknavy px-3 py-3">&nbsp;</div>
          <p className="mt-1 text-xs text-darknavy/65">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-darknavy/60">{label}</p>
      <p className="mt-0.5 min-h-6 border-b border-darknavy/20 pb-1 font-medium">
        {value || "\u00a0"}
      </p>
    </div>
  );
}

function createTaxSummary(values: CashAdvanceFormValues) {
  const { taxDetails, taxRate } = values.taxValue;

  if (taxRate === "0%" && !taxDetails.ewtCode) {
    return "No VAT";
  }

  return `${taxRate}${taxDetails.ewtCode ? ` / ${taxDetails.ewtCode}` : ""}`;
}

function formatPreviewDate(value: string) {
  return value ? formatCashAdvanceDate(value) : "";
}
