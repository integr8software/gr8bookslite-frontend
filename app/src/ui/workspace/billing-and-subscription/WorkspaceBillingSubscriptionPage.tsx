import {
  Building2,
  CalendarClock,
  GitBranch,
  ReceiptText,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";
import {
  formatWorkspaceBillingCurrency,
  formatWorkspaceBillingDate,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import { useWorkspaceBillingSubscriptionPage } from "@/app/src/hooks/workspace/billing-and-subscription/useWorkspaceBillingSubscriptionPage";
import type {
  WorkspaceBillingAddOnQuote,
  WorkspaceBillingCompanyAccount,
  WorkspaceBillingPaymentMethodRecord,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleInfoTooltip as InfoTooltip } from "@/app/src/ui/shared/module/ModuleInfoTooltip";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { WorkspaceBillingSubscriptionRecordActions } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionRecordActions";
import {
  getCompanyStatusClassName,
  getRenewalStateClassName,
  getTrialStateClassName,
} from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSubscriptionParts";
import { WorkspaceBillingSpotlightTutorial } from "@/app/src/ui/workspace/billing-and-subscription/WorkspaceBillingSpotlightTutorial";

const AutoBillingMode = "AUTO";

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
        description={`${page.subscriber.name} subscription billing, company pricing, renewal checks, and cards.`}
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
              placeholder="Search company, renewal, or plan"
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
          <table className="w-full min-w-[70rem] border-collapse text-left text-sm text-darknavy">
            <thead className="bg-offwhite text-xs font-bold uppercase tracking-[0.08em] text-darknavy/55">
              <tr>
                <th className="w-[20rem] px-4 py-3">Company</th>
                <th className="w-[14rem] px-4 py-3">Price</th>
                <th className="w-[17rem] px-4 py-3">Usage and add-ons</th>
                <th className="w-[13rem] px-4 py-3">Renewal</th>
                <th className="w-[15rem] px-4 py-3">Payment</th>
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
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-darknavy/55">
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

export {
  WorkspaceBillingSubscriptionCompanyPage,
  ExpandedCompanyBilling,
  CompanyOverviewTab,
  OverviewUsageMetric,
  CompanyInvoicesTab,
  CompanyPaymentsTab,
  CompanySubscriptionTab,
  TransactionFilters,
  InvoiceDetailDrawer,
} from "./WorkspaceBillingSubscriptionCompanyPage";
