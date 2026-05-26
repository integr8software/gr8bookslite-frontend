"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { formatCurrency, formatDateLabel } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementVoucherCopyFromRecord,
  DisbursementVoucherCopySource,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

type DisbursementVoucherCopyFromDialogProps = {
  isOpen: boolean;
  records: DisbursementVoucherCopyFromRecord[];
  source: DisbursementVoucherCopySource;
  onClose: () => void;
  onSelect: (record: DisbursementVoucherCopyFromRecord) => void;
};

export function DisbursementVoucherCopyFromDialog({
  isOpen,
  records,
  source,
  onClose,
  onSelect,
}: DisbursementVoucherCopyFromDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuery("");
    setSelectedId("");
  }, [isOpen, source]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      if (record.source !== source) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        record.sourceNo,
        record.partyCode,
        record.partyName,
        record.templateValues.remarks,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, records, source]);

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedId) ?? null;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[95] flex items-center justify-center bg-darknavy/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.18)]">
        <div className="border-b border-darknavy/10 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-skyblue">
            Copy From
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-darknavy">
            {source}
          </h3>
          <p className="mt-1 text-sm text-darknavy/58">
            Select a source record to copy its payment details, references,
            entries, and attachments into this voucher.
          </p>
        </div>

        <div className="border-b border-darknavy/10 px-6 py-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search source no., party code, party name, or remarks"
              className="h-11 w-full rounded-xl border border-darknavy/12 bg-white pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20"
            />
          </label>
        </div>

        <div className="max-h-[26rem] overflow-auto px-6 py-5">
          <div className="overflow-hidden rounded-[20px] border border-darknavy/10">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">
                <tr>
                  <th className="px-4 py-3">Select</th>
                  <th className="px-4 py-3">Source No.</th>
                  <th className="px-4 py-3">Party Code</th>
                  <th className="px-4 py-3">Party Name</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Document Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const isSelected = selectedId === record.id;

                  return (
                    <tr
                      key={record.id}
                      className={`border-t border-darknavy/8 transition hover:bg-skyblue/5 ${
                        isSelected ? "bg-skyblue/10" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(record.id)}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded border transition ${
                            isSelected
                              ? "theme-accent-contrast-text border-skyblue bg-skyblue"
                              : "border-darknavy/20 bg-white"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : null}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                        {record.sourceNo}
                      </td>
                      <td className="px-4 py-4 text-sm text-darknavy/72">
                        {record.partyCode}
                      </td>
                      <td className="px-4 py-4 text-sm text-darknavy/72">
                        {record.partyName}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-darknavy">
                        {formatCurrency(Number(record.amount || 0))}
                      </td>
                      <td className="px-4 py-4 text-sm text-darknavy/72">
                        {formatDateLabel(record.documentDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-darknavy/12 bg-offwhite/60 px-4 py-12 text-center text-sm text-darknavy/55">
              No source records found for the current search.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-darknavy/10 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-darknavy/12 bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedRecord}
            onClick={() => {
              if (!selectedRecord) {
                return;
              }

              onSelect(selectedRecord);
              onClose();
            }}
            className="theme-accent-contrast-text inline-flex h-11 items-center justify-center rounded-xl bg-skyblue px-5 text-sm font-semibold shadow-[0_12px_30px_rgb(var(--skyblue-rgb)/0.24)] transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:bg-darknavy/18 disabled:text-darknavy/35 disabled:shadow-none"
          >
            Copy Selected
          </button>
        </div>
      </section>
    </div>
  );
}
