"use client";

import { FileCheck2, LayoutTemplate, LockKeyhole, Ruler, Sparkles } from "lucide-react";
import {
  BankCheckTemplateDrawerFormId,
  BankCheckTemplateOrientationOptions,
} from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import { useBankCheckTemplateDrawer } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankCheckTemplateDrawer";
import type { BankMasterfile } from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { FormField } from "@/app/src/ui/shared/field-management/ModuleFormField";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";

export function BankCheckTemplateDrawer({ bank, isOpen, onClose }: { bank?: BankMasterfile; isOpen: boolean; onClose: () => void }) {
  const page = useBankCheckTemplateDrawer(bank?.id);

  return (
    <ModuleDrawer
      description="Create bank-specific check layouts now and connect them to the report designer when that service is available."
      eyebrow="Bank Masterfile"
      formId={BankCheckTemplateDrawerFormId}
      isOpen={isOpen}
      maxWidthClassName="max-w-6xl"
      onClose={onClose}
      submitLabel="Save Template Draft"
      title="Bank Check Templates"
      actions={
        <button
          type="button"
          disabled
          title="Available after Report Maker/Writer integration"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-darknavy/[0.03] px-3 text-sm font-semibold text-darknavy/40"
        >
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Open Designer
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      }
    >
      <form id={BankCheckTemplateDrawerFormId} onSubmit={page.handleSubmit} className="grid gap-6 px-6 py-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]">
        <div className="grid content-start gap-5">
          <section className="rounded-lg border border-darknavy/10 bg-offwhite/55 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-skyblue/15 text-skyblue">
                <FileCheck2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-darknavy">{bank?.bankName || "Selected bank"}</p>
                <p className="mt-0.5 truncate text-sm text-darknavy/60">
                  {[bank?.branch, bank?.accountNumber].filter(Boolean).join(" · ") || "Bank account details"}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold text-darknavy">Template details</h3>
              <p className="mt-1 text-xs leading-5 text-darknavy/55">Name and size the physical check stock that will be mapped in the report designer.</p>
            </div>
            <FormField label="Template Name" error={page.errors.name} required>
              <input name="name" value={page.values.name} onChange={page.handleInputChange} placeholder="e.g. BDO Standard Check" />
            </FormField>
            <FormField label="Description" error={page.errors.description}>
              <textarea
                id="bank-check-template-description"
                name="description"
                value={page.values.description}
                onChange={page.handleInputChange}
                rows={3}
                maxLength={240}
                placeholder="Optional notes about printer, check stock, or usage"
                className="w-full resize-none rounded-lg border border-darknavy/10 bg-white px-3 py-2.5 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Width (inches)" error={page.errors.paperWidth} required>
                <input name="paperWidth" type="number" min="2" max="20" step="0.01" value={page.values.paperWidth} onChange={page.handleInputChange} />
              </FormField>
              <FormField label="Height (inches)" error={page.errors.paperHeight} required>
                <input name="paperHeight" type="number" min="2" max="20" step="0.01" value={page.values.paperHeight} onChange={page.handleInputChange} />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Orientation" error={page.errors.orientation} required>
                <select name="orientation" value={page.values.orientation} onChange={page.handleInputChange}>
                  {BankCheckTemplateOrientationOptions.map((orientation) => <option key={orientation}>{orientation}</option>)}
                </select>
              </FormField>
              <FormField label="Default Template">
                <AppSwitch
                  value={page.values.isDefault}
                  onChange={page.handleDefaultChange}
                  trueOption={{ label: "Yes", value: true }}
                  falseOption={{ label: "No", value: false }}
                />
              </FormField>
            </div>
          </section>

          {page.templates.length > 0 ? (
            <section className="grid gap-2 border-t border-darknavy/10 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-darknavy">Saved drafts</h3>
                <span className="rounded-full bg-darknavy/5 px-2.5 py-1 text-xs font-semibold text-darknavy/60">{page.templates.length}</span>
              </div>
              {page.templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between gap-3 rounded-lg border border-darknavy/10 bg-white px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-darknavy">{template.name}</p>
                    <p className="text-xs text-darknavy/50">{template.paperWidth} × {template.paperHeight} in · {template.orientation}</p>
                  </div>
                  {template.isDefault ? <span className="rounded-full bg-citron/25 px-2 py-1 text-[11px] font-semibold text-darknavy">Default</span> : null}
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <div className="grid content-start gap-4">
          <section className="overflow-hidden rounded-xl border border-darknavy/10 bg-slate-100 shadow-inner">
            <div className="flex items-center justify-between border-b border-darknavy/10 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
                <Ruler className="h-4 w-4 text-skyblue" aria-hidden="true" />
                Check preview
              </div>
              <span className="text-xs font-medium text-darknavy/50">{page.values.paperWidth || "–"} × {page.values.paperHeight || "–"} in</span>
            </div>
            <div className="flex min-h-[420px] items-center justify-center overflow-auto p-6">
              <div
                className={`relative w-full overflow-hidden border border-slate-300 bg-[#fffdf7] p-6 shadow-lg ${page.values.orientation === "Portrait" ? "max-w-[330px]" : "max-w-[650px]"}`}
                style={{ aspectRatio: `${Math.max(Number(page.values.paperWidth) || 8.5, 2)} / ${Math.max(Number(page.values.paperHeight) || 3.5, 2)}` }}
              >
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <span>{bank?.bankName || "Bank name"}</span><span>Check no. 000001</span>
                </div>
                <div className="mt-8 grid grid-cols-[72px_1fr_90px] items-end gap-2 text-[10px] text-slate-500">
                  <span>Pay to the order of</span><span className="border-b border-slate-500 pb-1 font-semibold text-slate-800">Sample Payee</span><span className="border-b border-slate-500 pb-1 text-right">09/08/2026</span>
                </div>
                <div className="mt-6 grid grid-cols-[1fr_110px] items-end gap-3 text-[10px] text-slate-500">
                  <span className="border-b border-slate-500 pb-1 font-medium text-slate-700">ONE THOUSAND PESOS AND 00/100 ONLY</span>
                  <span className="border-b border-slate-500 pb-1 text-right text-sm font-bold text-slate-900">₱ 1,000.00</span>
                </div>
                <div className="absolute bottom-5 left-6 right-6 flex justify-between text-[9px] text-slate-400">
                  <span>Account payee only</span><span className="w-36 border-t border-slate-500 pt-1 text-center">Authorized signature</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-skyblue/20 bg-skyblue/[0.07] p-4">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-skyblue" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-darknavy">Ready for report designer integration</p>
                <p className="mt-1 text-xs leading-5 text-darknavy/60">Template setup is saved as a browser draft. Field positioning, printer calibration, PDF preview, and server persistence will be enabled when Report Maker/Writer is connected.</p>
              </div>
            </div>
          </section>
        </div>
      </form>
    </ModuleDrawer>
  );
}
