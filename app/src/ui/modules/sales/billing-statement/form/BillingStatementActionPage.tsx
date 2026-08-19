"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileText, Save } from "lucide-react";
import {
  BillingStatementFormPageCopy,
  BillingStatementHref,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import { useBillingStatementFormPage } from "@/app/src/hooks/modules/sales/billing-statement/useBillingStatementFormPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import {
  BillingStatementDetailsForm,
  type BillingStatementDetailsSection,
} from "@/app/src/ui/modules/sales/billing-statement/form/BillingStatementDetailsForm";
import { BillingStatementEntrySection } from "@/app/src/ui/modules/sales/billing-statement/entries/BillingStatementEntrySection";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function BillingStatementActionPage() {
  return (
    <Suspense fallback={<BillingStatementFormSkeleton />}>
      <BillingStatementActionPageInner />
    </Suspense>
  );
}

function BillingStatementActionPageInner() {
  const page = useBillingStatementFormPage();
  const title = getBillingStatementTitle(page.mode, page.existingStatement?.transNo);
  const [activeTab, setActiveTab] = useState<BillingStatementDetailsSection>("customer");

  if (page.needsRecord && !page.existingStatement) {
    return <BillingStatementNotFound />;
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={title}
        description={BillingStatementFormPageCopy[page.mode].description}
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Sales document
          </>
        }
        actions={<BillingStatementHeaderActions page={page} />}
      />

      <div className="grid min-w-0 gap-5">
        <ModuleTabs activeTab={activeTab} ariaLabel="Billing statement sections" tabs={BillingStatementTabs} onTabChange={setActiveTab} />
        <BillingStatementDetailsForm
          errors={page.errors}
          isReadonly={page.isReadonly}
          section={activeTab}
          values={page.values}
          onUpdateField={page.updateField}
        />
        <BillingStatementEntrySection
          accountingRows={page.values.accountingEntries}
          error={page.errors.items}
          isReadonly={page.isReadonly}
          rows={page.values.items}
          onAccountingRowsChange={page.updateAccountingEntries}
          onRowsChange={page.updateItems}
        />
      </div>
    </section>
  );
}

type BillingStatementFormPageState = ReturnType<typeof useBillingStatementFormPage>;

function BillingStatementHeaderActions({ page }: { page: BillingStatementFormPageState }) {
  return (
    <>
      <Link href={BillingStatementHref} className={moduleHeaderActionClassNames.secondary}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        List
      </Link>
      {page.mode === "view" ? (
        <Link href={`${BillingStatementHref}/edit/${page.existingStatement?.id ?? ""}`} className={moduleHeaderActionClassNames.primary}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Edit
        </Link>
      ) : (
        <>
          <AppCopyFromDropdown
            records={BillingStatementCopyFromRecords}
            sources={["SQ"]}
            onApply={() => undefined}
          />
          <button
            type="button"
            disabled={page.isSubmitting}
            onClick={page.handleSubmit}
            className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {page.isSubmitting ? "Saving..." : "Save"}
          </button>
        </>
      )}
    </>
  );
}

function BillingStatementNotFound() {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Billing Statement Not Found"
        description="The selected billing statement could not be found."
        actions={
          <Link href={BillingStatementHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        }
      />
    </section>
  );
}

function BillingStatementFormSkeleton() {
  return (
    <section className="grid gap-5">
      <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
      <div className="h-72 animate-pulse rounded-lg bg-white shadow-sm" />
    </section>
  );
}

function getBillingStatementTitle(mode: string, transNo?: string) {
  if (mode === "add") return BillingStatementFormPageCopy.add.title;
  if (mode === "edit") return `${BillingStatementFormPageCopy.edit.title} ${transNo ?? ""}`;
  return `${BillingStatementFormPageCopy.view.title} ${transNo ?? ""}`;
}

const BillingStatementCopyFromRecords: AppCopyFromRecord[] = [];

const BillingStatementTabs = [
  { id: "customer", label: "Customer / Billing" },
  { id: "attachment", label: "File Attachment" },
] satisfies ModuleTabItem<BillingStatementDetailsSection>[];
