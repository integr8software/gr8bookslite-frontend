"use client";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CreditCard,
  Download,
  GitBranch,
  ReceiptText,
  Search,
  TicketPercent,
  Users,
} from "lucide-react";
import Link from "next/link";
import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import {
  formatWorkspaceBillingCurrency,
  formatWorkspaceBillingDate,
  formatWorkspaceBillingPromotionValue,
  formatWorkspaceBillingRecordCategory,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { useWorkspaceBillingSubscriptionPage } from "@/app/src/hooks/workspace/billing-and-subscription/useWorkspaceBillingSubscriptionPage";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import type {
  WorkspaceBillingAddOnQuote,
  WorkspaceBillingCompanyAccount,
  WorkspaceBillingCompanyTab,
  WorkspaceBillingInvoiceRecord,
  WorkspaceBillingPaymentMethodRecord,
  WorkspaceBillingPaymentRecord,
  WorkspaceBillingPromotionOption,
  WorkspaceBillingRecordStatus,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { BillingMethodSelector } from "@/app/src/ui/billing/BillingMethodSelector";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleInfoTooltip as InfoTooltip } from "@/app/src/ui/shared/module/ModuleInfoTooltip";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WorkspaceBillingSubscriptionRecordActions } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionRecordActions";
import {
  AddOnDetail,
  AppliedPromotionDetail,
  BillingDetailBadge,
  EmptyTableRow,
  InfoLine,
  PriceLine,
  PromotionCodeForm,
  PromotionDropdown,
  SectionTitle,
  UsageMetric,
  getAddOnAmount,
  getCompanyStatusClassName,
  getPromotionValueBadgeTone,
  getRenewalStateClassName,
  getTrialStateClassName,
} from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionParts";
import { WorkspaceBillingSpotlightTutorial } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSpotlightTutorial";

const AutoBillingMode = "AUTO";
const AllTransactionStatusFilter = "all";
const TransactionStatusOptions = ["PAID", "OPEN", "PENDING", "FAILED", "CANCELED", "REFUNDED"] as const;

type WorkspaceBillingStatusFilterValue = WorkspaceBillingRecordStatus | typeof AllTransactionStatusFilter;

export function WorkspaceBillingSubscriptionPage() {
  const page = useWorkspaceBillingSubscriptionPage();

  return (
    <section className="grid gap-5">
      <WorkspaceBillingSpotlightTutorial />
      <ModuleHeader
        data-spotlight-id="workspace-billing-header"
        variant="card"
        titleAs="h1"
        eyebrow="Workspace billing"
        title="Billing & Subscription"
        description={`${page.subscriber.name} subscription billing, company pricing, renewal checks, cards, and promotions.`}
      />
      <div data-spotlight-id="workspace-billing-metrics">
        <ModuleStatisticCards
          items={[
            {
              icon: Building2,
              label: "Companies",
              helper: page.subscriber.planName,
              tone: "blue",
              value: page.summary.subscriberCount,
            },
            {
              icon: CalendarClock,
              label: "Upcoming Billing",
              helper: "Due soon or overdue",
              tone: "amber",
              value: formatWorkspaceBillingCurrency(page.summary.dueTotal),
            },
            {
              icon: GitBranch,
              label: "Outstanding",
              helper: "Open balances",
              tone: "violet",
              value: formatWorkspaceBillingCurrency(
                page.accounts.reduce((total, account) => total + page.getWorkspaceBillingOutstandingAmount(account.id), 0),
              ),
            },
            {
              icon: ReceiptText,
              label: "Needs Attention",
              helper: `${page.summary.pastDueCompanies} past due`,
              tone: "cyan",
              value: page.summary.renewalAlerts,
            },
          ]}
        />
      </div>

      <section
        data-spotlight-id="workspace-billing-table"
        className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5"
      >
        <div
          data-spotlight-id="workspace-billing-filters"
          className="grid gap-3 border-b border-darknavy/10 p-4 lg:grid-cols-[minmax(18rem,1fr)_13rem]"
        >
          <label className="relative block min-w-0">
            <span className="sr-only">Search companies</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/42" aria-hidden="true" />
            <input
              type="search"
              value={page.query}
              onChange={(event) => page.setQuery(event.target.value)}
              placeholder="Search company, renewal, or code"
              className="h-11 w-full rounded-md border border-darknavy/10 bg-white pl-10 pr-3 text-sm text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
            />
          </label>
          <label className="block">
            <span className="sr-only">Renewal filter</span>
            <select
              value={page.renewalFilter}
              onChange={(event) => page.setRenewalFilter(event.target.value as typeof page.renewalFilter)}
              className="h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
            >
              {page.renewalFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[86rem] border-collapse text-left text-sm text-darknavy">
            <thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
              <tr>
                <th className="w-[20rem] px-4 py-3">Company</th>
                <th className="w-[14rem] px-4 py-3">Price</th>
                <th className="w-[17rem] px-4 py-3">Usage and add-ons</th>
                <th className="w-[13rem] px-4 py-3">Renewal</th>
                <th className="w-[15rem] px-4 py-3">Payment</th>
                <th className="w-[18rem] px-4 py-3">Promotion</th>
                <th className="w-[6rem] px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darknavy/10">
              {page.filteredAccounts.length > 0 ? (
                page.filteredAccounts.map((account) => {
                  return (
                    <CompanyBillingRows
                      key={account.id}
                      account={account}
                      paymentMethods={page.paymentMethods}
                      selectedBillingMode={page.getSelectedBillingMode(account.id)}
                      selectedPaymentMethodId={page.getSelectedPaymentMethodId(account.id)}
                      onCancelSubscription={() => page.cancelSubscription(account.id)}
                      onPay={() => page.payCompany(account.id)}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-medium text-darknavy/55">
                    No companies match the current billing filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

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
        description={`${account.planName} billing, invoices, payments, subscription settings, usage, and promotions.`}
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
        selectedBillingMode={page.getSelectedBillingMode(account.id)}
        selectedPaymentMethod={selectedPaymentMethod}
        payments={page.getFilteredPayments(account.id)}
        onUpdateBillingMode={(billingMode) => page.updateBillingMode(account.id, billingMode)}
        onApplyPromotion={(assignmentId) => page.applyPromotion(account.id, assignmentId)}
        onApplyPromotionCode={() => page.applyPromotionCode(account.id)}
        onClearPromotion={() => page.clearPromotion(account.id)}
        onSelectInvoice={page.setSelectedInvoice}
        onTabChange={(tab) => page.updateActiveCompanyTab(account.id, tab)}
        onPromotionCodeChange={(code) => page.updatePromotionCode(account.id, code)}
        onTransactionQueryChange={(query) => page.updateTransactionQuery(account.id, query)}
        onTransactionStatusFilterChange={(status) => page.updateTransactionStatusFilter(account.id, status)}
        outstandingAmount={page.getWorkspaceBillingOutstandingAmount(account.id)}
        promotionCodeError={page.getPromotionCodeError(account.id)}
        promotionCodeValue={page.getPromotionCodeValue(account.id)}
        transactionQuery={page.getTransactionQuery(account.id)}
        transactionStatusFilter={page.getTransactionStatusFilter(account.id)}
      />
      <InvoiceDetailDrawer invoice={page.selectedInvoice} onClose={() => page.setSelectedInvoice(null)} companyName={account.name} />
    </section>
  );
}

type CompanyBillingRowsProps = {
  account: WorkspaceBillingCompanyAccount;
  paymentMethods: WorkspaceBillingPaymentMethodRecord[];
  selectedBillingMode: BillingMode;
  selectedPaymentMethodId: string;
  onCancelSubscription: () => void;
  onPay: () => void;
};

function CompanyBillingRows({
  account,
  paymentMethods,
  selectedBillingMode,
  selectedPaymentMethodId,
  onCancelSubscription,
  onPay,
}: CompanyBillingRowsProps) {
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedPaymentMethodId);

  return (
    <tr className="align-top transition hover:bg-skyblue/5">
      <td className="px-4 py-4">
        <div className="flex min-w-0 gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-darknavy">{account.name}</p>
            <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-darknavy/38">{account.planName}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={joinClasses("rounded-md px-2 py-0.5 text-xs font-semibold", getCompanyStatusClassName(account.status))}>
                {account.status}
              </span>
              <span className="rounded-md bg-offwhite px-2 py-0.5 text-xs font-semibold text-darknavy/65">{account.billingCycle}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="font-semibold text-darknavy">{formatWorkspaceBillingCurrency(account.totalDue)}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-darknavy/55">
          <span>Base {formatWorkspaceBillingCurrency(account.baseAmount)}</span>
          <InfoTooltip label={`${account.planName} base price breakdown`} title={account.planPrice.tooltip} />
        </p>
        {account.discountAmount > 0 ? (
          <p className="mt-1 text-xs font-semibold text-emerald-600">Less {formatWorkspaceBillingCurrency(account.discountAmount)}</p>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <AddOnMiniSummary addOns={account.addOns} />
      </td>
      <td className="px-4 py-4">
        <RenewalBadge account={account} />
      </td>
      <td className="px-4 py-4">
        <div className="grid gap-2">
          <span className="inline-flex w-fit rounded-full bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
            {selectedBillingMode === AutoBillingMode ? "Auto renewal" : "Manual payment"}
          </span>
          {selectedBillingMode === AutoBillingMode ? (
            <p className="text-xs font-medium text-darknavy/60">
              {selectedPaymentMethod ? `${selectedPaymentMethod.brand} ending ${selectedPaymentMethod.last4}` : "No saved payment method"}
            </p>
          ) : (
            <p className="text-xs font-medium text-darknavy/60">Hosted checkout</p>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <PromotionSummary promotion={account.appliedPromotion} />
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <Link
            href={`${WorkspaceBillingSubscriptionHref}/${account.id}`}
            className="inline-flex h-9 items-center rounded-md border border-darknavy/10 px-3 text-xs font-semibold text-darknavy transition hover:border-skyblue hover:bg-skyblue/10"
          >
            View
          </Link>
          <WorkspaceBillingSubscriptionRecordActions account={account} onCancelSubscription={onCancelSubscription} onPay={onPay} />
        </div>
      </td>
    </tr>
  );
}

function AddOnMiniSummary({ addOns }: { addOns: WorkspaceBillingAddOnQuote[] }) {
  return (
    <div className="grid gap-1.5">
      {addOns.map((addOn) => (
        <div key={addOn.key} className="flex items-center gap-2 text-xs">
          {addOn.key === "branch" ? (
            <GitBranch className="h-3.5 w-3.5 text-darknavy/45" />
          ) : (
            <Users className="h-3.5 w-3.5 text-darknavy/45" />
          )}
          <span className="font-semibold text-darknavy">{addOn.actualCount}</span>
          <span className="text-darknavy/55">{addOn.label}</span>
          <span className="ml-auto font-semibold text-darknavy/70">{formatWorkspaceBillingCurrency(addOn.billingAmount)}</span>
        </div>
      ))}
    </div>
  );
}

function RenewalBadge({ account }: { account: WorkspaceBillingCompanyAccount }) {
  if (account.status === "Trial" && account.trialStatusLabel) {
    return (
      <div className="grid gap-1">
        <span
          className={joinClasses(
            "inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
            getTrialStateClassName(account.trialDaysRemaining),
          )}
        >
          {account.trialStatusLabel}
        </span>
        <span className="text-xs font-medium text-darknavy/55">
          Ends {formatWorkspaceBillingDate(account.trialEndsAt ?? account.renewalDate)}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      <span
        className={joinClasses(
          "inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
          getRenewalStateClassName(account.renewalState),
        )}
      >
        {account.renewalStatusLabel}
      </span>
      <span className="text-xs font-medium text-darknavy/55">{formatWorkspaceBillingDate(account.renewalDate)}</span>
    </div>
  );
}

function PromotionSummary({ promotion }: { promotion: WorkspaceBillingPromotionOption | null }) {
  if (!promotion) {
    return <span className="text-xs font-medium text-darknavy/45">None</span>;
  }

  return (
    <div className="grid gap-1.5">
      <span className="font-semibold text-darknavy">{promotion.code}</span>
      <span className="flex flex-wrap gap-1">
        <BillingDetailBadge label={promotion.type} />
        <BillingDetailBadge label={formatWorkspaceBillingPromotionValue(promotion)} tone={getPromotionValueBadgeTone(promotion)} />
      </span>
    </div>
  );
}

type ExpandedCompanyBillingProps = {
  activeTab: WorkspaceBillingCompanyTab;
  account: WorkspaceBillingCompanyAccount;
  invoices: WorkspaceBillingInvoiceRecord[];
  payments: WorkspaceBillingPaymentRecord[];
  selectedBillingMode: BillingMode;
  selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
  onUpdateBillingMode: (billingMode: BillingMode) => void;
  onApplyPromotion: (assignmentId: string) => void;
  onApplyPromotionCode: () => void;
  onClearPromotion: () => void;
  onSelectInvoice: (invoice: WorkspaceBillingInvoiceRecord) => void;
  onTabChange: (tab: WorkspaceBillingCompanyTab) => void;
  onPromotionCodeChange: (code: string) => void;
  onTransactionQueryChange: (query: string) => void;
  onTransactionStatusFilterChange: (status: WorkspaceBillingStatusFilterValue) => void;
  outstandingAmount: number;
  promotionCodeError?: string;
  promotionCodeValue: string;
  transactionQuery: string;
  transactionStatusFilter: WorkspaceBillingStatusFilterValue;
};

function ExpandedCompanyBilling({
  activeTab,
  account,
  invoices,
  payments,
  selectedBillingMode,
  selectedPaymentMethod,
  onUpdateBillingMode,
  onApplyPromotion,
  onApplyPromotionCode,
  onClearPromotion,
  onSelectInvoice,
  onTabChange,
  onPromotionCodeChange,
  onTransactionQueryChange,
  onTransactionStatusFilterChange,
  outstandingAmount,
  promotionCodeError,
  promotionCodeValue,
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
          selectedBillingMode={selectedBillingMode}
          selectedPaymentMethod={selectedPaymentMethod}
          onApplyPromotion={onApplyPromotion}
          onApplyPromotionCode={onApplyPromotionCode}
          onClearPromotion={onClearPromotion}
          onPromotionCodeChange={onPromotionCodeChange}
          onUpdateBillingMode={onUpdateBillingMode}
          promotionCodeError={promotionCodeError}
          promotionCodeValue={promotionCodeValue}
        />
      ) : null}
    </div>
  );
}

function CompanyOverviewTab({
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
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.98fr)_minmax(0,0.72fr)]">
      <section className="rounded-lg border border-darknavy/10 bg-white p-3">
        <SectionTitle icon={ReceiptText} title="Current Bill" />
        <dl className="mt-2 divide-y divide-darknavy/10 text-sm">
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
          <PriceLine label="Discount" value={account.discountAmount > 0 ? -account.discountAmount : 0} tone="discount" />
          <PriceLine label="Total" value={account.totalDue} tone="strong" />
        </dl>
      </section>
      <section className="rounded-lg border border-darknavy/10 bg-white p-3">
        <SectionTitle icon={CalendarClock} title="Billing Status" />
        <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <InfoLine label="Plan" value={account.planName} />
          <InfoLine label="Status" value={account.status} />
          <InfoLine label="Next Billing" value={formatWorkspaceBillingDate(account.renewalDate)} />
          <InfoLine label="Billing Mode" value={selectedBillingMode} />
          <InfoLine
            label="Payment Method"
            value={
              selectedBillingMode === AutoBillingMode && selectedPaymentMethod
                ? `${selectedPaymentMethod.brand} ending ${selectedPaymentMethod.last4}`
                : "Hosted checkout"
            }
          />
          <InfoLine label="Outstanding" value={formatWorkspaceBillingCurrency(outstandingAmount)} />
        </div>
      </section>
      <section className="rounded-lg border border-darknavy/10 bg-white p-3">
        <SectionTitle icon={GitBranch} title="Usage" />
        <div className="mt-2 grid gap-2">
          <UsageMetric label="Branches" value={account.branchCount} />
          <UsageMetric label="Users" value={account.userCount} />
          <UsageMetric label="Additional companies" value={account.companyCount} />
        </div>
      </section>
    </div>
  );
}

function CompanyInvoicesTab({
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

function CompanyPaymentsTab({
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

function CompanySubscriptionTab({
  account,
  onApplyPromotion,
  onApplyPromotionCode,
  onClearPromotion,
  onPromotionCodeChange,
  onUpdateBillingMode,
  promotionCodeError,
  promotionCodeValue,
  selectedBillingMode,
  selectedPaymentMethod,
}: {
  account: WorkspaceBillingCompanyAccount;
  onApplyPromotion: (assignmentId: string) => void;
  onApplyPromotionCode: () => void;
  onClearPromotion: () => void;
  onPromotionCodeChange: (code: string) => void;
  onUpdateBillingMode: (billingMode: BillingMode) => void;
  promotionCodeError?: string;
  promotionCodeValue: string;
  selectedBillingMode: BillingMode;
  selectedPaymentMethod?: WorkspaceBillingPaymentMethodRecord;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-lg border border-darknavy/10 bg-white p-4">
        <SectionTitle icon={CreditCard} title="Billing Method" />
        <div className="mt-3">
          <BillingMethodSelector mode={selectedBillingMode} onChange={onUpdateBillingMode} />
        </div>
        <div className="mt-3 rounded-md bg-offwhite px-3 py-2 text-xs text-darknavy/65">
          {selectedBillingMode === AutoBillingMode && selectedPaymentMethod
            ? `${selectedPaymentMethod.label}: ${selectedPaymentMethod.brand} ending ${selectedPaymentMethod.last4}, expires ${selectedPaymentMethod.expiryLabel}`
            : "Manual payment uses hosted checkout. No automatic deduction is configured."}
        </div>
      </section>
      <section className="rounded-lg border border-darknavy/10 bg-white p-4">
        <SectionTitle icon={TicketPercent} title="Promotion" />
        <div className="mt-3 grid gap-3">
          <AppliedPromotionDetail promotion={account.appliedPromotion} onClearPromotion={onClearPromotion} />
          <PromotionDropdown account={account} onApplyPromotion={onApplyPromotion} onClearPromotion={onClearPromotion} />
          <PromotionCodeForm
            error={promotionCodeError}
            value={promotionCodeValue}
            onApplyPromotionCode={onApplyPromotionCode}
            onChange={onPromotionCodeChange}
          />
        </div>
      </section>
      <section className="rounded-lg border border-darknavy/10 bg-white p-4 lg:col-span-2">
        <SectionTitle icon={GitBranch} title="Usage and add-ons" />
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {account.addOns.map((addOn) => (
            <AddOnDetail key={addOn.key} addOn={addOn} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TransactionFilters({
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
          className="h-10 w-full rounded-md border border-darknavy/10 bg-white pl-10 pr-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
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

function InvoiceDetailDrawer({
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
      contentClassName="pb-24"
      footer={
        <div className="flex justify-end gap-2 pr-16 sm:pr-20">
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
            className="inline-flex h-10 items-center rounded-md bg-darknavy px-3 text-sm font-semibold text-offwhite"
          >
            Close
          </button>
        </div>
      }
    >
      {invoice ? (
        <div className="grid gap-4 pb-4">
          <div className="rounded-lg border border-darknavy/10 bg-offwhite p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/45">Total</p>
                <p className="mt-1 text-2xl font-semibold text-darknavy">{formatWorkspaceBillingCurrency(invoice.amount)}</p>
              </div>
              <ModuleStatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="rounded-lg border border-darknavy/10">
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
