"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Download,
  Edit3,
  Eye,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagement";

export function FinancialManagementDiscountManagementMain() {
  const discounts = useDiscountManagementStore((s) => s.discounts);
  const deleteDiscount = useDiscountManagementStore((s) => s.deleteDiscount);
  const isMutating = useDiscountManagementStore((s) => s.isMutating);
  const [pendingDelete, setPendingDelete] = useState<any | null>(null);

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteDiscount(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-darknavy">Discount Management</h2>
          <p className="mt-1 text-sm text-darknavy/55">Maintain discount definitions and map them to chart of accounts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <Link
            href={`/maintenance/financial-management/discount-management/add`}
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Discount
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <div className="grid grid-cols-[0.9fr_1fr_0.8fr_8rem] gap-4 border-b border-darknavy/10 bg-darknavy/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/50">
          <span>Description</span>
          <span>Discount %</span>
          <span>Account</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-darknavy/10">
          {discounts.length > 0 ? (
            discounts.map((d) => (
              <article key={d.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[0.9fr_1fr_0.8fr_8rem] lg:items-center lg:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-darknavy truncate">{d.description}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-darknavy">{d.percentage}%</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-darknavy truncate">{d.accountCode} - {d.accountTitle}</p>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Link href={`/maintenance/financial-management/discount-management/view/${d.id}`} aria-label={`View ${d.description}`} className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href={`/maintenance/financial-management/discount-management/edit/${d.id}`} aria-label={`Edit ${d.description}`} className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35">
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button type="button" onClick={() => setPendingDelete(d)} aria-label={`Delete ${d.description}`} className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-darknavy">No discounts yet</p>
              <p className="mt-1 text-sm text-darknavy/55">Add a discount to start mapping promotions to accounts.</p>
            </div>
          )}
        </div>
      </div>

      <AppConfirmDialog isOpen={Boolean(pendingDelete)} isPending={isMutating} title="Delete discount?" description={`This will remove ${pendingDelete?.description ?? "the selected discount"}.`} confirmLabel="Delete" tone="danger" onCancel={() => setPendingDelete(null)} onConfirm={handleConfirmDelete} />
    </section>
  );
}
