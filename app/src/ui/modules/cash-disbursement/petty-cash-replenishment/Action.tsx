"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Plus, Save, X } from "lucide-react";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { PettyCashReplenishmentCopyFromDialog, type CopyFromRecord } from "./CopyFromDialog";

const inputClassName =
  "h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20";
const readOnlyClassName =
  "h-10 w-full rounded-lg border border-darknavy/10 bg-slate-100/80 px-3 text-sm text-darknavy/70 outline-none";
const labelClassName = "text-sm font-semibold text-darknavy/70";

interface PettyCashEntry {
  id: string;
  pettyCashDate: string;
  pettyCashNo: string;
  code: string;
  name: string;
  totalAmount: string;
  netAmount: string;
  vatAmount: string;
  remarks: string;
}

const initialEntries: PettyCashEntry[] = [
  {
    id: "1",
    pettyCashDate: "2026-05-21",
    pettyCashNo: "PC-001",
    code: "101-300",
    name: "Office Supplies",
    totalAmount: "8,750.00",
    netAmount: "8,000.00",
    vatAmount: "750.00",
    remarks: "Stationery and printer ink",
  },
];

export function PettyCashReplenishmentAction() {
  const [vceCode, setVceCode] = useState("");
  const [vceName, setVceName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [transNo, setTransNo] = useState("");
  const [documentDate, setDocumentDate] = useState("2026-05-21");
  const [status, setStatus] = useState("Active");
  const [projectRef, setProjectRef] = useState("");
  const [projectName, setProjectName] = useState("");
  const [entries, setEntries] = useState<PettyCashEntry[]>(initialEntries);
  const [copyFromOpen, setCopyFromOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("");

  function handleCopyFrom(source: string) {
    setSelectedSource(source);
    setCopyDialogOpen(true);
    setCopyFromOpen(false);
  }

  function handleCopySelect(record: CopyFromRecord) {
    setVceCode(record.vceCode);
    setVceName(record.vceName);
    setDocumentDate(record.documentDate);
    setCopyDialogOpen(false);
  }

  const totals = useMemo(() => {
    const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.totalAmount.replace(/,/g, "")), 0);
    const vatAmount = entries.reduce((sum, entry) => sum + Number(entry.vatAmount.replace(/,/g, "")), 0);
    const netAmount = entries.reduce((sum, entry) => sum + Number(entry.netAmount.replace(/,/g, "")), 0);
    return {
      totalAmount: totalAmount.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      netAmount: netAmount.toFixed(2),
    };
  }, [entries]);

  function addEntry() {
    setEntries((current) => [
      ...current,
      {
        id: String(Date.now()),
        pettyCashDate: "",
        pettyCashNo: "",
        code: "",
        name: "",
        totalAmount: "0.00",
        netAmount: "0.00",
        vatAmount: "0.00",
        remarks: "",
      },
    ]);
  }

  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-background px-4 py-6 text-darknavy sm:-mx-5 sm:px-6 lg:-mx-6">
      <div className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-6">
        <ModuleHeader
          variant="panel"
          title="Petty Cash Replenishment"
          titleAs="h1"
          description="Create or view petty cash replenishment details in a modern action layout."
          eyebrow="Cash disbursement"
          actions={
            <Link
              href="/cash-disbursement/petty-cash-replenishment"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to replenishments
            </Link>
          }
        />

        <div className="rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-darknavy/80">Replenishment Report</p>
              <p className="mt-1 text-sm text-darknavy/60">
                Complete the main details and entries for the petty cash replenishment record.
              </p>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
              <div className="relative inline-flex">
                <button
                  type="button"
                  onClick={() => setCopyFromOpen((current) => !current)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-slate-50"
                  aria-expanded={copyFromOpen}
                  aria-haspopup="menu"
                >
                  Copy From
                  <ChevronDown className="h-4 w-4" />
                </button>
                {copyFromOpen ? (
                  <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-darknavy/10 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => handleCopyFrom("Petty Cash Voucher")}
                      className="w-full px-4 py-3 text-left text-sm text-darknavy transition hover:bg-skyblue/10"
                    >
                      Petty Cash Voucher
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyFrom("Petty Cash Fund")}
                      className="w-full rounded-b-xl px-4 py-3 text-left text-sm text-darknavy transition hover:bg-skyblue/10"
                    >
                      Petty Cash Fund
                    </button>
                  </div>
                ) : null}
              </div>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-darknavy px-4 text-sm font-semibold text-white transition hover:bg-darknavy/90">
                <Save className="h-4 w-4" />
                Save
              </button>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-slate-50">
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_380px]">
            <div className="rounded-3xl border border-darknavy/10 bg-offwhite/80 p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="VCE Code *">
                  <input
                    value={vceCode}
                    onChange={(event) => setVceCode(event.target.value)}
                    className={inputClassName}
                    placeholder="Enter VCE code"
                  />
                </Field>
                <Field label="VCE Name *">
                  <input
                    value={vceName}
                    onChange={(event) => setVceName(event.target.value)}
                    className={inputClassName}
                    placeholder="Enter VCE name"
                  />
                </Field>
                <Field label="Remarks">
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className={`${inputClassName} min-h-[7rem] resize-none py-3`}
                    placeholder="Optional remarks"
                  />
                </Field>
              </div>
            </div>

            <aside className="space-y-5 rounded-3xl border border-darknavy/10 bg-offwhite/80 p-6">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-semibold text-darknavy/80">Total Amount</p>
                  <div className={readOnlyClassName}>{totals.totalAmount}</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-darknavy/80">VAT Amount</p>
                  <div className={readOnlyClassName}>{totals.vatAmount}</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-darknavy/80">Net Amount</p>
                  <div className={readOnlyClassName}>{totals.netAmount}</div>
                </div>
              </div>

              <div className="grid gap-4">
                <Field label="Trans No. *">
                  <input
                    value={transNo}
                    onChange={(event) => setTransNo(event.target.value)}
                    className={inputClassName}
                    placeholder="Enter transaction number"
                  />
                </Field>
                <Field label="Document Date">
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(event) => setDocumentDate(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className={inputClassName}
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>
                </Field>
                <Field label="Project Ref">
                  <input
                    value={projectRef}
                    onChange={(event) => setProjectRef(event.target.value)}
                    className={inputClassName}
                    placeholder="Project reference"
                  />
                </Field>
                <Field label="Project Name">
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    className={inputClassName}
                    placeholder="Project name"
                  />
                </Field>
              </div>
            </aside>
          </div>

          <div className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-darknavy">Entries</p>
                <p className="mt-1 text-sm text-darknavy/60">
                  Add or edit the underlying petty cash expense rows for this replenishment.
                </p>
              </div>
              <button
                type="button"
                onClick={addEntry}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10"
              >
                <Plus className="h-4 w-4" />
                Add row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm text-darknavy">
                <thead className="bg-skyblue/10 text-left text-xs uppercase tracking-[0.12em] text-darknavy/70">
                  <tr>
                    <th className="border-b border-darknavy/10 px-3 py-3">No.</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Petty Cash Date</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Petty Cash No.</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Code</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Name</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Total Amount</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Net Amount</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">VAT Amount</th>
                    <th className="border-b border-darknavy/10 px-3 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-darknavy/10 last:border-b-0">
                      <td className="px-3 py-3 text-sm font-semibold text-darknavy/80">{index + 1}</td>
                      <td className="px-3 py-3">
                        <input
                          type="date"
                          value={entry.pettyCashDate}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], pettyCashDate: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.pettyCashNo}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], pettyCashNo: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="Enter ref"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.code}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], code: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="Enter code"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.name}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], name: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="Enter name"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.totalAmount}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], totalAmount: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.netAmount}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], netAmount: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.vatAmount}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], vatAmount: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          value={entry.remarks}
                          onChange={(event) => {
                            const updated = [...entries];
                            updated[index] = {...updated[index], remarks: event.target.value};
                            setEntries(updated);
                          }}
                          className={inputClassName}
                          placeholder="Remarks"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <PettyCashReplenishmentCopyFromDialog
          isOpen={copyDialogOpen}
          source={selectedSource}
          onClose={() => setCopyDialogOpen(false)}
          onSelect={handleCopySelect}
        />
      </div>
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className={labelClassName}>{label}</span>
      {children}
    </label>
  );
}
