"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Paperclip, ListTree } from "lucide-react";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";

const inputClassName =
  "h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20";

const labelClassName = "text-sm font-semibold text-darknavy/70";

export function PettyCashVoucherAction() {
  return (
    <section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-background px-4 py-6 text-darknavy sm:-mx-5 sm:px-6 lg:-mx-6">
      <div className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-6">
        <ModuleHeader
          variant="panel"
          title="Petty Cash Voucher"
          titleAs="h1"
          description="Record a new petty cash voucher using the same modern module action layout."
          eyebrow={
            <>
              <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
              Cash disbursement
            </>
          }
          actions={
            <Link
              href="/cash-disbursement/petty-cash-voucher"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to vouchers
            </Link>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_360px]">
          <div className="rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-skyblue/10 p-4 text-sm font-semibold text-darknavy">
              <FileText className="h-5 w-5 text-skyblue" />
              Voucher details
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="VCE Code *">
                <input className={inputClassName} placeholder="Enter VCE code" />
              </Field>
              <Field label="Transaction No. *">
                <input className={inputClassName} placeholder="Enter transaction number" />
              </Field>
              <Field label="VCE Name *">
                <input className={inputClassName} placeholder="Enter VCE name" />
              </Field>
              <Field label="Document Date">
                <input type="date" className={inputClassName} />
              </Field>
              <Field label="Account Code *">
                <input className={inputClassName} placeholder="Enter account code" />
              </Field>
              <Field label="Status">
                <select className={inputClassName}>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Cancelled</option>
                </select>
              </Field>
              <Field label="Account Title *">
                <input className={inputClassName} placeholder="Enter account title" />
              </Field>
              <Field label="Amount">
                <input className={inputClassName} placeholder="0.00" />
              </Field>
              <Field label="Cost Center">
                <input className={inputClassName} placeholder="Select cost center" />
              </Field>
              <Field label="Vatable">
                <select className={inputClassName}>
                  <option>False</option>
                  <option>True</option>
                </select>
              </Field>
              <Field label="Vat Amount">
                <input className={inputClassName} placeholder="0.00" />
              </Field>
              <Field label="Net Amount">
                <input className={inputClassName} placeholder="0.00" />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Remarks">
                <textarea
                  className={`${inputClassName} min-h-[8rem] resize-none py-3`}
                  placeholder="Optional remarks"
                />
              </Field>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-sm font-semibold text-darknavy/80">
                <Paperclip className="h-4 w-4 text-darknavy/50" aria-hidden="true" />
                File attachments
              </div>
              <p className="mt-3 text-sm text-darknavy/65">
                Attach supporting documents to keep the voucher audit-ready.
              </p>
              <div className="mt-4 grid gap-3">
                <button className="inline-flex h-10 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10">
                  Add attachment
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-darknavy/80">Actions</p>
              <div className="mt-4 grid gap-3">
                <button className="inline-flex h-10 items-center justify-center rounded-lg bg-darknavy text-sm font-semibold text-white transition hover:bg-darknavy/90">
                  Save voucher
                </button>
                <button className="inline-flex h-10 items-center justify-center rounded-lg border border-darknavy/10 bg-white text-sm font-semibold text-darknavy transition hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          </aside>
        </div>
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
    <label className="grid gap-2">
      <span className={labelClassName}>{label}</span>
      {children}
    </label>
  );
}
