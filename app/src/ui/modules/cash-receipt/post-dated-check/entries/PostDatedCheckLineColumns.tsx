import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type { PostDatedCheckDetail } from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";

export function createPostDatedCheckLineColumns({
  detailErrors,
  isReadonly,
  onCheckNumberBlur,
  onUpdateRow,
}: {
  detailErrors?: Record<string, Partial<Record<keyof PostDatedCheckDetail, string>>>;
  isReadonly: boolean;
  onCheckNumberBlur: (id: string, checkNumber: string) => void;
  onUpdateRow: (id: string, field: keyof PostDatedCheckDetail, value: string | number) => void;
}): ModuleDataEntryColumn<PostDatedCheckDetail>[] {
  return [
    {
      id: "lineNumber",
      header: "No.",
      widthClassName: "w-[5rem]",
      renderCell: (row) => <span className="block px-3 text-center text-sm font-semibold text-darknavy/70">{row.lineNumber}</span>,
    },
    {
      id: "pdcDate",
      header: "Check Date",
      widthClassName: "w-[12rem]",
      renderCell: (row) => (
        <EntryInput type="date" value={row.pdcDate} readOnly={isReadonly} onChange={(value) => onUpdateRow(row.id, "pdcDate", value)} />
      ),
    },
    {
      id: "pdcBank",
      header: "Bank",
      widthClassName: "w-[18rem]",
      renderCell: (row) => (
        <EntryInput value={row.pdcBank} readOnly={isReadonly} onChange={(value) => onUpdateRow(row.id, "pdcBank", value)} />
      ),
    },
    {
      id: "pdcNo",
      header: "Check Number",
      widthClassName: "w-[14rem]",
      renderCell: (row) => (
        <EntryInput
          value={row.pdcNo}
          error={detailErrors?.[row.id]?.pdcNo}
          readOnly={isReadonly}
          onChange={(value) => onUpdateRow(row.id, "pdcNo", value)}
          onBlur={(value) => onCheckNumberBlur(row.id, value)}
        />
      ),
    },
    {
      id: "amount",
      header: "Amount",
      widthClassName: "w-[14rem]",
      renderCell: (row) => (
        <EntryInput
          type="number"
          alignRight
          value={String(row.amount || "")}
          readOnly={isReadonly}
          onChange={(value) => onUpdateRow(row.id, "amount", Number(value))}
        />
      ),
    },
    {
      id: "referenceNo",
      header: "Reference No.",
      widthClassName: "w-[14rem]",
      renderCell: (row) => (
        <EntryInput value={row.referenceNo} readOnly={isReadonly} onChange={(value) => onUpdateRow(row.id, "referenceNo", value)} />
      ),
    },
  ];
}

function EntryInput({
  value,
  error,
  readOnly,
  onChange,
  onBlur,
  type = "text",
  alignRight = false,
}: {
  value: string;
  error?: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  type?: string;
  alignRight?: boolean;
}) {
  return (
    <input
      className={joinClasses(
        "h-10 w-full border-0 bg-transparent px-3 text-sm text-darknavy outline-none focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
        alignRight && "text-right tabular-nums",
        readOnly && "bg-offwhite",
        error && "bg-red-50 ring-2 ring-inset ring-red-500",
      )}
      type={type}
      min={type === "number" ? "0.01" : undefined}
      step={type === "number" ? "0.01" : undefined}
      readOnly={readOnly}
      aria-invalid={Boolean(error)}
      title={error}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onBlur?.(event.target.value)}
    />
  );
}
