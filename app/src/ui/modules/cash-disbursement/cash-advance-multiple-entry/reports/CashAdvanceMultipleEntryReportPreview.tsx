"use client";

import {
  calculateCashAdvanceMultipleEntryTotal,
  formatCashAdvanceMultipleEntryAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { formatCashAdvanceDate } from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type {
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type CashAdvanceMultipleEntryReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  values: CashAdvanceMultipleEntryFormValues;
};

export function CashAdvanceMultipleEntryReportPreview({
  isOpen,
  onClose,
  responsibilityCenterOptions,
  values,
}: CashAdvanceMultipleEntryReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Cash Advance Multiple Entry Preview"
      description="Review the cash advance request and cash advance entries."
      onClose={onClose}
    >
      <CashAdvanceMultipleEntryReportDocument
        responsibilityCenterOptions={responsibilityCenterOptions}
        values={values}
      />
    </ReportPreviewDrawer>
  );
}

function CashAdvanceMultipleEntryReportDocument({
  responsibilityCenterOptions,
  values,
}: {
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  values: CashAdvanceMultipleEntryFormValues;
}) {
  const totalAmount = calculateCashAdvanceMultipleEntryTotal(values.items);
  const responsibilityCenterNames = getResponsibilityCenterNames(
    values.items,
    responsibilityCenterOptions,
  );

  return (
    <div className="mx-auto min-w-[68rem] max-w-[68rem] bg-white p-6 text-[12px] leading-normal text-black shadow-sm">
      <div className="border-2 border-black">
        <div className="grid min-h-32 grid-cols-[10rem_1fr_10rem] items-start px-7 py-4">
          <div className="grid h-24 w-28 place-items-center text-4xl font-black tracking-tighter text-skyblue">
            integr8
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">Your Company Name Here</p>
            <p className="mt-2">VAT REG TIN : 000-000-000</p>
            <p className="mt-2">ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT</p>
            <p className="mt-5">Telephone No: 0967-237-4514</p>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-[1fr_18rem] items-end border-y-2 border-black px-3 py-1">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Cash Advance Multiple Entry
          </h2>
          <p className="font-bold">
            Date: <span className="font-normal">{formatCompactDate(values.documentDate)}</span>
          </p>
        </div>

        <div className="grid grid-cols-4 border-b-2 border-black">
          <PreviewField label="Entry No." value={values.transNo} />
          <PreviewField label="Party Name" value={values.partyName} />
          <PreviewField label="Project" value={values.projectRef || values.projectCode} />
          <PreviewField label="Total Amount" value={formatCashAdvanceMultipleEntryAmount(totalAmount)} />
        </div>
        <div className="grid grid-cols-2 border-b-2 border-black">
          <PreviewField label="Responsibility Center" value={responsibilityCenterNames} />
          <PreviewField label="Status" value={values.status} />
        </div>
        <div className="min-h-12 border-b-2 border-black px-2 py-1">
          <span className="font-bold uppercase">Remarks: </span>
          <span>{values.remarks || "\u00a0"}</span>
        </div>

        <ReportSectionTitle title="Cash Advance Entries" />
        <table className="w-full table-fixed border-b-2 border-black text-left">
          <thead>
            <tr className="border-b-2 border-black text-[11px] uppercase">
              <TableHeader className="w-10 text-center">#</TableHeader>
              <TableHeader>Party Name</TableHeader>
              <TableHeader>Responsibility Center</TableHeader>
              <TableHeader>Particulars</TableHeader>
              <TableHeader className="w-32 text-right">Amount</TableHeader>
            </tr>
          </thead>
          <tbody>
            {values.items.map((row, index) => (
              <ItemRow
                key={row.id}
                index={index}
                responsibilityCenterOptions={responsibilityCenterOptions}
                row={row}
              />
            ))}
            <tr className="border-t-2 border-black font-bold">
              <td className="px-2 py-2" colSpan={4}>
                Total
              </td>
              <td className="px-2 py-2 text-right">{formatCashAdvanceMultipleEntryAmount(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid min-h-20 grid-cols-3 border-t-2 border-black">
          <SignatureBox label="Prepared by:" />
          <SignatureBox label="Checked by:" />
          <SignatureBox label="Approved by:" />
        </div>
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-h-11 border-r-2 border-black px-2 py-1 last:border-r-0">
      <p className="text-[10px] font-bold uppercase">{label}</p>
      <p className="mt-1 font-medium">{value || "\u00a0"}</p>
    </div>
  );
}

function ReportSectionTitle({ title }: { title: string }) {
  return <h3 className="border-b-2 border-black px-2 py-1 text-sm font-black uppercase">{title}</h3>;
}

function TableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`border-r-2 border-black px-2 py-1 last:border-r-0 ${className}`}>{children}</th>;
}

function ItemRow({
  index,
  responsibilityCenterOptions,
  row,
}: {
  index: number;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  row: CashAdvanceMultipleEntryItem;
}) {
  return (
    <tr className="border-b border-black/45">
      <td className="border-r border-black/45 px-2 py-2 text-center">{index + 1}</td>
      <td className="border-r border-black/45 px-2 py-2">{row.partyName || "\u00a0"}</td>
      <td className="border-r border-black/45 px-2 py-2">
        {getResponsibilityCenterName(row.responsibilityCenter, responsibilityCenterOptions) || "\u00a0"}
      </td>
      <td className="border-r border-black/45 px-2 py-2">{row.particulars || "\u00a0"}</td>
      <td className="px-2 py-2 text-right">
        {formatCashAdvanceMultipleEntryAmount(row.amount)}
      </td>
    </tr>
  );
}

function SignatureBox({ label }: { label: string }) {
  return <div className="border-r-2 border-black px-2 py-1 last:border-r-0">{label}</div>;
}

function formatCompactDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  return year && month && day ? `${month}/${day}/${year}` : formatCashAdvanceDate(value);
}

function getResponsibilityCenterNames(
  rows: CashAdvanceMultipleEntryItem[],
  options: AppAdvancedDropdownOption[],
) {
  return Array.from(
    new Set(
      rows
        .map((row) => getResponsibilityCenterName(row.responsibilityCenter, options))
        .filter(Boolean),
    ),
  ).join(", ");
}

function getResponsibilityCenterName(
  value: string,
  options: AppAdvancedDropdownOption[],
) {
  if (!value) {
    return "";
  }

  return (
    options.find(
      (option) => option.value === value || option.label === value || option.name === value,
    )?.name ?? value
  );
}
