"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useChartsOfAccounts } from "@/app/src/hooks/modules/maintenance/financial-management/charts-of-accounts/useChartsOfAccounts";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagement";

export function FinancialManagementDiscountManagementAction() {
  const router = useRouter();
  const { accounts } = useChartsOfAccounts();
  const addDiscount = useDiscountManagementStore((s) => s.addDiscount);

  const [description, setDescription] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [accountQuery, setAccountQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const matchedAccounts = useMemo(() => {
    const q = accountQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) => a.accountName.toLowerCase().includes(q) || a.accountNumber.toLowerCase().includes(q),
    );
  }, [accountQuery, accounts]);

  function handleSave() {
    const id = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    addDiscount({
      id,
      description,
      percentage: Number(discountPct || 0),
      accountId: selectedAccountId ?? undefined,
      accountCode: accounts.find((a) => a.id === selectedAccountId)?.accountNumber,
      accountTitle: accounts.find((a) => a.id === selectedAccountId)?.accountName,
    });

    router.push("/maintenance/financial-management/discount-management");
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-darknavy/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-darknavy mb-4">Add Discount</h2>
        <div className="grid grid-cols-2 gap-4 items-end">
          <label className="flex flex-col">
            <span className="mb-1 text-sm font-medium text-darknavy">Description:</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 text-sm font-medium text-darknavy">Discount Percentage:</span>
            <input value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} type="number" min="0" max="100" step="0.01" className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-sm font-medium text-darknavy">Account code:</span>
            <input value={accounts.find((a) => a.id === selectedAccountId)?.accountNumber ?? ""} readOnly className="w-full rounded-md bg-slate-100 border border-slate-200 px-3 py-2 text-sm" />
          </label>

          <label className="flex flex-col">
            <span className="mb-1 text-sm font-medium text-darknavy">Account title:</span>
            <div className="relative">
              <input value={accountQuery} onChange={(e) => { setAccountQuery(e.target.value); setSelectedAccountId(null); }} placeholder="Search account by name or number" className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              {accountQuery.length > 0 && matchedAccounts.length > 0 && (
                <ul className="absolute z-20 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-md">
                  {matchedAccounts.map((a) => (
                    <li key={a.id} onClick={() => { setSelectedAccountId(a.id); setAccountQuery(a.accountName); }} className="cursor-pointer px-3 py-2 hover:bg-slate-50">
                      {a.accountNumber} - {a.accountName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => router.back()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-6 text-sm font-semibold text-darknavy">Cancel</button>
          <button onClick={handleSave} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white">Save</button>
        </div>
      </div>
    </section>
  );
}
