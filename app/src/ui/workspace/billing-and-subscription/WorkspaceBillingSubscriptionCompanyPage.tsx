"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Download,
  GitBranch,
  ReceiptText,
  Search,
} from "lucide-react";
import Link from "next/link";
import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import {
  InitialBillingPaymentFormValues,
  type BillingMode,
  type BillingPaymentFormErrors,
  type BillingPaymentFormValues,
} from "@/app/src/data/billing/BillingTypes";
import {
  formatWorkspaceBillingCurrency,
  formatWorkspaceBillingDate,
  formatWorkspaceBillingRecordCategory,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { useWorkspaceBillingSubscriptionPage } from "@/app/src/hooks/workspace/billing-and-subscription/useWorkspaceBillingSubscriptionPage";
import type {
  WorkspaceBillingCompanyAccount,
  WorkspaceBillingCompanyTab,
  WorkspaceBillingInvoiceRecord,
  WorkspaceBillingPaymentMethodRecord,
  WorkspaceBillingPaymentRecord,
  WorkspaceBillingRecordStatus,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { BillingMethodSelector } from "@/app/src/ui/billing/BillingMethodSelector";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  AddOnDetail,
  BillingPaymentCardForm,
  EmptyTableRow,
  InfoLine,
  NewPayMongoCardPaymentMethodId,
  PriceLine,
  SectionTitle,
  getAddOnAmount,
} from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionParts";
import { validateBillingPaymentForm } from "@/app/src/validations/billing/BillingValidation";

const AutoBillingMode = "AUTO";
const AllTransactionStatusFilter = "all";
const TransactionStatusOptions = ["PAID", "OPEN", "PENDING", "FAILED", "CANCELED", "REFUNDED"] as const;

type WorkspaceBillingStatusFilterValue = WorkspaceBillingRecordStatus | typeof AllTransactionStatusFilter;

export function WorkspaceBillingSubscriptionCompanyPage({ companyId }: { companyId: string }) {
  const page = useWorkspaceBillingSubscriptionPage();
  const account = page.accounts.find((current) => current.id === companyId);
  const selectedPaymentMethod = account
    ? (page.paymentMethods.find((method) => method.id === page.getSelectedPaymentMethodId(account.id)) ?? page.paymentMethods[0])
    : undefined;

  if (!account) {
    return (
      <section className="grid gap-5">
        <ModuleHeader
          variant="card"
          titleAs="h1"
          eyebrow="Workspace billing"
          title="Company billing not found"
          description="The selected company billing record does not exist in the current mock workspace data."
          actions={
            <Link
              href={WorkspaceBillingSubscriptionHref}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-darknavy/10 px-3 text-sm font-semibold text-darknavy"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="card"
        titleAs="h1"
        eyebrow="Billing & Subscription"
        title={account.name}
        description={`${account.planName} billing, invoices, payments, subscription settings, and usage.`}
        actions={
          <Link
            href={WorkspaceBillingSubscriptionHref}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-darknavy/10 px-3 text-sm font-semibold text-darknavy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        }
      />
      <ExpandedCompanyBilling
        account={account}
        activeTab={page.getActiveCompanyTab(account.id)}
        invoices={page.getFilteredInvoices(account.id)}
        paymentMethods={page.paymentMethods}
        selectedBillingMode={page.getSelectedBillingMode(account.id)}
        selectedPaymentMethod={selectedPaymentMethod}
        payments={page.getFilteredPayments(account.id)}
        onPayNow={() => page.payCompany(account.id)}
        onSaveBillingMethod={page.saveCompanyBillingMethod}
        onSelectInvoice={page.setSelectedInvoice}
        onTabChange={(tab) => page.updateActiveCompanyTab(account.id, tab)}
        onTransactionQueryChange={(query) => page.updateTransactionQuery(account.id, query)}
        onTransactionStatusFilterChange={(status) => page.updateTransactionStatusFilter(account.id, status)}
        outstandingAmount={page.getWorkspaceBillingOutstandingAmount(account.id)}
        transactionQuery={page.getTransactionQuery(account.id)}
        transactionStatusFilter={page.getTransactionStatusFilter(account.id)}
      />
      <InvoiceDetailDrawer invoice={page.selectedInvoice} onClose={() => page.setSelectedInvoice(null)} companyName={account.name} />
    </section>
  );
}

type ExpandedCompanyBillingProps = {
  activeTab: WorkspaceBillingCompanyTab;
  account: WorkspaceBillingCompanyAccount;
  invoices: WorkspaceBillingInvoiceRecord[];
  payments: WorkspaceBillingPaymentRecord[];
  paymentMethods: WorkspaceBillingPaymentMethodRecord[];
  selectedBillingMode: BillingMode;
  selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
  onPayNow: () => void;
  onSaveBillingMethod: (payload: {
    companyId: string;
    billingMode: BillingMode;
    paymentMethodId?: string;
    newCardValues?: BillingPaymentFormValues;
  }) => Promise<void>;
  onSelectInvoice: (invoice: WorkspaceBillingInvoiceRecord) => void;
  onTabChange: (tab: WorkspaceBillingCompanyTab) => void;
  onTransactionQueryChange: (query: string) => void;
  onTransactionStatusFilterChange: (status: WorkspaceBillingStatusFilterValue) => void;
  outstandingAmount: number;
  transactionQuery: string;
  transactionStatusFilter: WorkspaceBillingStatusFilterValue;
};

export function ExpandedCompanyBilling({
  activeTab,
  account,
  invoices,
  payments,
  paymentMethods,
  selectedBillingMode,
  selectedPaymentMethod,
  onPayNow,
  onSaveBillingMethod,
  onSelectInvoice,
  onTabChange,
  onTransactionQueryChange,
  onTransactionStatusFilterChange,
  outstandingAmount,
  transactionQuery,
  transactionStatusFilter,
}: ExpandedCompanyBillingProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "invoices", label: "Invoices", badge: invoices.length },
    { id: "payments", label: "Payments", badge: payments.length },
    { id: "subscription", label: "Subscription" },
  ] as const;

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-darknavy/10 bg-white p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-darknavy">{account.name}</p>
            <p className="text-xs text-darknavy/55">
              {account.planName} · {selectedBillingMode} ·{" "}
              {selectedPaymentMethod ? `${selectedPaymentMethod.brand} ending ${selectedPaymentMethod.last4}` : "No saved payment method"}
            </p>
          </div>
          {outstandingAmount > 0 ? (
            <ModuleStatusBadge status={`${formatWorkspaceBillingCurrency(outstandingAmount)} open`} />
          ) : (
            <ModuleStatusBadge status="No outstanding balance" />
          )}
        </div>
        <ModuleTabs activeTab={activeTab} ariaLabel={`${account.name} billing sections`} onTabChange={onTabChange} tabs={tabs} />
      </div>

      {activeTab === "overview" ? (
        <CompanyOverviewTab
          account={account}
          outstandingAmount={outstandingAmount}
          selectedBillingMode={selectedBillingMode}
          selectedPaymentMethod={selectedPaymentMethod}
        />
      ) : null}
      {activeTab === "invoices" ? (
        <CompanyInvoicesTab
          invoices={invoices}
          onSelectInvoice={onSelectInvoice}
          query={transactionQuery}
          statusFilter={transactionStatusFilter}
          onQueryChange={onTransactionQueryChange}
          onStatusFilterChange={onTransactionStatusFilterChange}
        />
      ) : null}
      {activeTab === "payments" ? (
        <CompanyPaymentsTab
          payments={payments}
          query={transactionQuery}
          statusFilter={transactionStatusFilter}
          onQueryChange={onTransactionQueryChange}
          onStatusFilterChange={onTransactionStatusFilterChange}
        />
      ) : null}
      {activeTab === "subscription" ? (
        <CompanySubscriptionTab
          account={account}
          paymentMethods={paymentMethods}
          selectedBillingMode={selectedBillingMode}
          selectedPaymentMethod={selectedPaymentMethod}
          onPayNow={onPayNow}
          onSaveBillingMethod={onSaveBillingMethod}
        />
      ) : null}
    </div>
  );
}

export function CompanyOverviewTab({
  account,
  outstandingAmount,
  selectedBillingMode,
  selectedPaymentMethod,
}: {
  account: WorkspaceBillingCompanyAccount;
  outstandingAmount: number;
  selectedBillingMode: BillingMode;
  selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
}) {
  const statusDotClassName =
    account.status === "Active"
      ? "bg-emerald-500"
      : account.status === "Trial"
        ? "bg-skyblue"
        : account.status === "Past Due"
          ? "bg-coralpink"
          : "bg-darknavy/40";

  const outstandingClassName = outstandingAmount > 0 ? "text-amber-600" : "text-darknavy";

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.75fr)]">
      {/* Current Bill */}
      <section className="relative overflow-hidden rounded-xl border border-darknavy/10 bg-white shadow-sm shadow-darknavy/[0.04]">
        <div className="px-5 pb-3 pt-5">
          <SectionTitle icon={ReceiptText} title="Current Bill" />
          <p className="mt-4 text-3xl font-bold tracking-tight text-darknavy">
            {formatWorkspaceBillingCurrency(account.totalDue)}
          </p>
          <p className="mt-1 text-xs font-medium text-darknavy/40">{account.billingCycle} · {account.planName}</p>
        </div>
        <dl className="divide-y divide-darknavy/8 border-t border-darknavy/8 px-5 text-sm">
          <PriceLine
            label="Base Plan"
            value={account.baseAmount}
            comparison={
              account.planPrice.discountAmount > 0
                ? {
                    discountPercent: account.planPrice.discountPercent,
                    regularValue: account.planPrice.listAmount,
                  }
                : undefined
            }
            tooltip={account.planPrice.tooltip}
          />
          <PriceLine label="Branches" value={getAddOnAmount(account, "branch")} />
          <PriceLine label="Users" value={getAddOnAmount(account, "user")} />
          {account.discountAmount > 0 ? (
            <PriceLine label="Discount" value={-account.discountAmount} tone="discount" />
          ) : null}
          <PriceLine label="Total" value={account.totalDue} tone="strong" />
        </dl>
        <div className="h-1 bg-gradient-to-r from-skyblue to-skyblue/50" />
      </section>

      {/* Billing Status */}
      <section className="overflow-hidden rounded-xl border border-darknavy/10 bg-white shadow-sm shadow-darknavy/[0.04]">
        <div className="p-5">
          <SectionTitle icon={CalendarClock} title="Billing Status" />
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">Plan</p>
              <p className="mt-1 text-sm font-semibold text-darknavy">{account.planName}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">Status</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-darknavy">
                <span className={joinClasses("inline-block h-2 w-2 rounded-full", statusDotClassName)} />
                {account.status}
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">Next Billing</p>
              <p className="mt-1 text-sm font-semibold text-darknavy">{formatWorkspaceBillingDate(account.renewalDate)}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">Billing Mode</p>
              <div className="mt-1">
                <span className="inline-flex rounded-md bg-offwhite px-2 py-0.5 text-xs font-semibold text-darknavy/70 ring-1 ring-darknavy/10">
                  {selectedBillingMode}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">Payment Method</p>
              <p className="mt-1 text-sm font-semibold text-darknavy">
                {selectedBillingMode === AutoBillingMode && selectedPaymentMethod
                  ? `${selectedPaymentMethod.brand} ending ${selectedPaymentMethod.last4}`
                  : "Hosted checkout"}
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">Outstanding</p>
              <p className={joinClasses("mt-1 text-sm font-semibold", outstandingClassName)}>
                {formatWorkspaceBillingCurrency(outstandingAmount)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className="overflow-hidden rounded-xl border border-darknavy/10 bg-white shadow-sm shadow-darknavy/[0.04]">
        <div className="p-5">
          <SectionTitle icon={GitBranch} title="Usage" />
          <div className="mt-4 grid gap-5">
            <OverviewUsageMetric label="Branches" value={account.branchCount} maxVisual={20} />
            <OverviewUsageMetric label="Users" value={account.userCount} maxVisual={50} />
          </div>
        </div>
      </section>
    </div>
  );
}

export function OverviewUsageMetric({ label, maxVisual, value }: { label: string; maxVisual: number; value: number }) {
  const percentage = Math.min((value / maxVisual) * 100, 100);
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-darknavy/40">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-darknavy">{value}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-darknavy/8">
        <div
          className="h-full rounded-full bg-skyblue transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CompanyInvoicesTab({
  invoices,
  onQueryChange,
  onSelectInvoice,
  onStatusFilterChange,
  query,
  statusFilter,
}: {
  invoices: WorkspaceBillingInvoiceRecord[];
  onQueryChange: (query: string) => void;
  onSelectInvoice: (invoice: WorkspaceBillingInvoiceRecord) => void;
  onStatusFilterChange: (status: WorkspaceBillingStatusFilterValue) => void;
  query: string;
  statusFilter: WorkspaceBillingStatusFilterValue;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white">
      <TransactionFilters
        query={query}
        statusFilter={statusFilter}
        onQueryChange={onQueryChange}
        onStatusFilterChange={onStatusFilterChange}
        placeholder="Search invoice, description, or reference"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[58rem] text-left text-sm">
          <thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
            <tr>
              <th className="px-4 py-3">Invoice No.</th>
              <th className="px-4 py-3">Billing Period</th>
              <th className="px-4 py-3">Issued Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darknavy/10">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-skyblue/5">
                  <td className="px-4 py-3 font-semibold text-darknavy">
                    {invoice.invoiceNo}
                    <p className="mt-1 text-xs font-normal text-darknavy/45">{formatWorkspaceBillingRecordCategory(invoice.category)}</p>
                  </td>
                  <td className="px-4 py-3 text-darknavy/65">
                    {formatWorkspaceBillingDate(invoice.billingPeriodStart)} - {formatWorkspaceBillingDate(invoice.billingPeriodEnd)}
                  </td>
                  <td className="px-4 py-3 text-darknavy/65">{formatWorkspaceBillingDate(invoice.issuedDate)}</td>
                  <td className="px-4 py-3">
                    <ModuleStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-darknavy">{formatWorkspaceBillingCurrency(invoice.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectInvoice(invoice)}
                      className="rounded-md border border-darknavy/10 px-3 py-1.5 text-xs font-semibold text-darknavy transition hover:border-skyblue hover:bg-skyblue/10"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyTableRow colSpan={6} message="No invoices yet." />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CompanyPaymentsTab({
  onQueryChange,
  onStatusFilterChange,
  payments,
  query,
  statusFilter,
}: {
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: WorkspaceBillingStatusFilterValue) => void;
  payments: WorkspaceBillingPaymentRecord[];
  query: string;
  statusFilter: WorkspaceBillingStatusFilterValue;
}) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white">
      <TransactionFilters
        query={query}
        statusFilter={statusFilter}
        onQueryChange={onQueryChange}
        onStatusFilterChange={onStatusFilterChange}
        placeholder="Search payment reference, invoice, or method"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[58rem] text-left text-sm">
          <thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment Reference</th>
              <th className="px-4 py-3">Invoice No.</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darknavy/10">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-skyblue/5">
                  <td className="px-4 py-3 text-darknavy/65">{formatWorkspaceBillingDate(payment.date)}</td>
                  <td className="px-4 py-3 font-semibold text-darknavy">{payment.paymentReference}</td>
                  <td className="px-4 py-3 text-darknavy/65">{payment.invoiceNo}</td>
                  <td className="px-4 py-3 text-darknavy/65">{payment.paymentMethodDisplay}</td>
                  <td className="px-4 py-3">
                    <ModuleStatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-darknavy">{formatWorkspaceBillingCurrency(payment.amount)}</td>
                </tr>
              ))
            ) : (
              <EmptyTableRow colSpan={6} message="No payments yet." />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CompanySubscriptionTab({
  account,
  paymentMethods,
  selectedBillingMode,
  selectedPaymentMethod,
  onPayNow,
  onSaveBillingMethod,
}: {
  account: WorkspaceBillingCompanyAccount;
  paymentMethods: WorkspaceBillingPaymentMethodRecord[];
  selectedBillingMode: BillingMode;
  selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
  onPayNow: () => void;
  onSaveBillingMethod: (payload: {
    companyId: string;
    billingMode: BillingMode;
    paymentMethodId?: string;
    newCardValues?: BillingPaymentFormValues;
  }) => Promise<void>;
}) {
  const [stagedBillingMode, setStagedBillingMode] = useState<BillingMode>(selectedBillingMode);
  const [stagedPaymentMethodId, setStagedPaymentMethodId] = useState<string>(
    selectedPaymentMethod?.id ?? paymentMethods[0]?.id ?? NewPayMongoCardPaymentMethodId,
  );
  const [newCardValues, setNewCardValues] = useState<BillingPaymentFormValues>(InitialBillingPaymentFormValues);
  const [newCardErrors, setNewCardErrors] = useState<BillingPaymentFormErrors>({});
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAddingNewCard = stagedBillingMode === AutoBillingMode && stagedPaymentMethodId === NewPayMongoCardPaymentMethodId;

  function handleStagedModeChange(mode: BillingMode) {
    setStagedBillingMode(mode);
  }

  function handlePaymentMethodSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStagedPaymentMethodId(e.target.value);
    setNewCardErrors({});
  }

  function handleNewCardFieldChange(field: keyof BillingPaymentFormValues, value: string) {
    setNewCardValues((prev) => ({ ...prev, [field]: value }));
    setNewCardErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmitAttempt() {
    if (isAddingNewCard) {
      const validation = validateBillingPaymentForm(newCardValues);
      if (Object.keys(validation.errors).length > 0) {
        setNewCardErrors(validation.errors);
        return;
      }
    }
    setIsConfirmDialogOpen(true);
  }

  async function handleConfirmSave() {
    setIsSaving(true);
    try {
      await onSaveBillingMethod({
        companyId: account.id,
        billingMode: stagedBillingMode,
        paymentMethodId: stagedPaymentMethodId,
        newCardValues: isAddingNewCard ? newCardValues : undefined,
      });
      setIsConfirmDialogOpen(false);
      if (isAddingNewCard) {
        setNewCardValues(InitialBillingPaymentFormValues);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const selectedSavedCard = paymentMethods.find((m) => m.id === stagedPaymentMethodId);

  const confirmDescription =
    stagedBillingMode === AutoBillingMode
      ? isAddingNewCard
        ? `This will tokenize and save your card details with PayMongo and activate automatic renewals for ${account.name}.`
        : `This will set ${selectedSavedCard?.label ?? "the selected card"} as the default payment method for automatic renewal for ${account.name}.`
      : `This will switch ${account.name} to manual hosted checkout. Automatic recurring deductions will be disabled and renewals must be settled via PayMongo.`;

  return (
    <div className="grid gap-4">
      {/* Billing Method Section */}
      <section className="rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/[0.04]">
        <SectionTitle icon={CreditCard} title="Billing Method" />
        <p className="mt-1 text-xs text-darknavy/55">
          Select how you want subscription renewals and invoices for {account.name} to be processed.
        </p>

        <div className="mt-4">
          <BillingMethodSelector mode={stagedBillingMode} onChange={handleStagedModeChange} />
        </div>

        {stagedBillingMode === AutoBillingMode ? (
          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-darknavy/70">
                Payment Method <span className="text-coralpink">*</span>
              </span>
              <select
                value={stagedPaymentMethodId}
                onChange={handlePaymentMethodSelectChange}
                className="h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label ? `${method.label} (Expires ${method.expiryLabel})` : `${method.brand} ending ${method.last4}`}
                  </option>
                ))}
                <option value={NewPayMongoCardPaymentMethodId}>+ Add new PayMongo card</option>
              </select>
            </label>

            {isAddingNewCard ? (
              <BillingPaymentCardForm
                errors={newCardErrors}
                values={newCardValues}
                onChange={handleNewCardFieldChange}
              />
            ) : selectedSavedCard ? (
              <div className="rounded-lg border border-darknavy/10 bg-offwhite/50 p-3.5 text-xs text-darknavy/65">
                <p className="font-semibold text-darknavy">Active Card On File</p>
                <p className="mt-0.5">
                  {selectedSavedCard.brand} ending in {selectedSavedCard.last4} · Expires {selectedSavedCard.expiryLabel}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-skyblue/20 bg-skyblue/5 p-4 text-xs leading-relaxed text-darknavy/75">
            <p className="font-semibold text-darknavy">Manual Hosted Checkout</p>
            <p className="mt-1 text-darknavy/60">
              No card will be automatically charged on renewal dates. You can initiate hosted checkout payments directly via PayMongo when invoices are issued.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={onPayNow}
                className="inline-flex items-center gap-1.5 rounded-md bg-darknavy px-3 py-1.5 text-xs font-semibold text-offwhite transition hover:bg-darknavy/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
              >
                <span>Pay via PayMongo Hosted Checkout</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end border-t border-darknavy/8 pt-4">
          <button
            type="button"
            onClick={handleSubmitAttempt}
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-md bg-darknavy px-4 text-sm font-semibold text-offwhite shadow-sm transition hover:bg-skyblue hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Billing Method"}
          </button>
        </div>
      </section>

      {/* Usage and Add-ons Section */}
      <section className="rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/[0.04]">
        <SectionTitle icon={GitBranch} title="Usage and add-ons" />
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {account.addOns.map((addOn) => (
            <AddOnDetail key={addOn.key} addOn={addOn} />
          ))}
        </div>
      </section>

      {/* Confirmation Dialog */}
      <AppDialog
        isOpen={isConfirmDialogOpen}
        isPending={isSaving}
        title="Save billing method changes?"
        description={confirmDescription}
        confirmLabel={stagedBillingMode === "MANUAL" ? "Confirm & Set Manual" : "Confirm & Save Card"}
        onCancel={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}

export function TransactionFilters({
  onQueryChange,
  onStatusFilterChange,
  placeholder,
  query,
  statusFilter,
}: {
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: WorkspaceBillingStatusFilterValue) => void;
  placeholder: string;
  query: string;
  statusFilter: WorkspaceBillingStatusFilterValue;
}) {
  return (
    <div className="grid gap-3 border-b border-darknavy/10 p-3 lg:grid-cols-[1fr_14rem]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/42" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-darknavy/10 bg-white pl-9 pr-3 text-sm font-semibold text-darknavy outline-none transition placeholder:font-medium placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
        />
      </label>
      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value as WorkspaceBillingStatusFilterValue)}
        className="h-10 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
      >
        <option value={AllTransactionStatusFilter}>All statuses</option>
        {TransactionStatusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InvoiceDetailDrawer({
  companyName,
  invoice,
  onClose,
}: {
  companyName: string;
  invoice: WorkspaceBillingInvoiceRecord | null;
  onClose: () => void;
}) {
  return (
    <ModuleDrawer
      isOpen={Boolean(invoice)}
      onClose={onClose}
      title={invoice?.invoiceNo ?? "Invoice"}
      eyebrow="Invoice detail"
      description={invoice?.description}
      maxWidthClassName="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled
            className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md border border-darknavy/10 px-3 text-sm font-semibold text-darknavy/35"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Mock only
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-md bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/90"
          >
            Close
          </button>
        </div>
      }
    >
      {invoice ? (
        <div className="grid gap-5 px-6 py-5">
          <div className="rounded-lg border border-darknavy/10 bg-offwhite p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/45">Total</p>
                <p className="mt-1 text-2xl font-semibold text-darknavy">{formatWorkspaceBillingCurrency(invoice.amount)}</p>
              </div>
              <ModuleStatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoLine label="Company" value={companyName} />
            <InfoLine label="Billing Mode" value={invoice.billingMode} />
            <InfoLine
              label="Billing Period"
              value={`${formatWorkspaceBillingDate(invoice.billingPeriodStart)} - ${formatWorkspaceBillingDate(invoice.billingPeriodEnd)}`}
            />
            <InfoLine label="Issued" value={formatWorkspaceBillingDate(invoice.issuedDate)} />
            <InfoLine label="Paid" value={invoice.paidDate ? formatWorkspaceBillingDate(invoice.paidDate) : "-"} />
            <InfoLine label="Payment Method" value={invoice.paymentMethodDisplay ?? "-"} />
            <InfoLine
              label="Provider Reference"
              value={invoice.providerReference ? `${invoice.provider ?? "Provider"} · ${invoice.providerReference}` : "-"}
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-darknavy/10">
            {invoice.lineItems.map((line) => (
              <div key={line.label} className="flex justify-between gap-4 border-b border-darknavy/10 px-4 py-3 last:border-b-0">
                <span className="text-sm text-darknavy/65">{line.label}</span>
                <span className="text-sm font-semibold text-darknavy">{formatWorkspaceBillingCurrency(line.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </ModuleDrawer>
  );
}
