import { ArrowRight, GitBranch, MoreVertical } from "lucide-react";
import type {
  WorkspaceApprovalItem,
  WorkspaceCompanyRecord,
  WorkspaceTimelineItem,
} from "@/app/src/data/modules/dashboard/WorkspaceOverviewData";

type WorkspaceOverviewPanelsProps = {
  approvals: WorkspaceApprovalItem[];
  companies: WorkspaceCompanyRecord[];
  recentActivity: WorkspaceTimelineItem[];
  systemNotifications: WorkspaceTimelineItem[];
};

export function WorkspaceOverviewPanels({
  approvals,
  companies,
  recentActivity,
  systemNotifications,
}: WorkspaceOverviewPanelsProps) {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_420px]">
        <article className="overflow-hidden rounded-[1.75rem] border border-darknavy/10 bg-white shadow-[0_20px_60px_rgba(33,39,56,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-darknavy/8 px-6 py-5">
            <div>
              <h3 className="text-xl font-semibold text-darknavy">
                Company Performance Overview
              </h3>
              <p className="mt-1 text-sm text-darknavy/50">
                Snapshot of this month&apos;s revenue, expenses, and momentum.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-190 border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-darknavy/42">
                  <th className="border-b border-darknavy/8 px-6 py-4">Company</th>
                  <th className="border-b border-darknavy/8 px-4 py-4">Status</th>
                  <th className="border-b border-darknavy/8 px-4 py-4">Revenue</th>
                  <th className="border-b border-darknavy/8 px-4 py-4">Expenses</th>
                  <th className="border-b border-darknavy/8 px-4 py-4">Net Profit</th>
                  <th className="border-b border-darknavy/8 px-4 py-4">Trend</th>
                  <th className="border-b border-darknavy/8 px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <CompanyPerformanceRow key={company.id} company={company} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5">
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl text-sm font-semibold text-skyblue transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              View all companies
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </article>

        <article className="overflow-hidden rounded-[1.75rem] border border-darknavy/10 bg-white shadow-[0_20px_60px_rgba(33,39,56,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-darknavy/8 px-6 py-5">
            <div>
              <h3 className="text-xl font-semibold text-darknavy">
                Approval Queue
              </h3>
              <p className="mt-1 text-sm text-darknavy/50">
                Items that need action from workspace admins.
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-skyblue transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-darknavy/8">
            {approvals.map((item) => (
              <ApprovalQueueItem key={item.id} item={item} />
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <TimelinePanel
          title="Recent Activity"
          subtitle="Cross-company updates for your workspace."
          items={recentActivity}
        />
        <TimelinePanel
          title="System Notifications"
          subtitle="Important workspace notices and scheduled events."
          items={systemNotifications}
        />
      </section>
    </>
  );
}

function CompanyPerformanceRow({
  company,
}: {
  company: WorkspaceCompanyRecord;
}) {
  return (
    <tr className="text-sm text-darknavy">
      <td className="border-b border-darknavy/6 px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${companyTone(company.tone)}`}
          >
            {company.initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{company.name}</span>
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-darknavy/45">
              <GitBranch className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {company.branchName} ({company.branchCode})
              </span>
            </span>
          </span>
        </div>
      </td>
      <td className="border-b border-darknavy/6 px-4 py-4">
        <span className={statusTone(company.status)}>{company.status}</span>
      </td>
      <td className="border-b border-darknavy/6 px-4 py-4 font-medium">
        {company.monthlyRevenue}
      </td>
      <td className="border-b border-darknavy/6 px-4 py-4 font-medium">
        {company.monthlyExpenses}
      </td>
      <td className="border-b border-darknavy/6 px-4 py-4 font-semibold text-emerald-600">
        {company.netProfit}
      </td>
      <td className="border-b border-darknavy/6 px-4 py-4">
        <TrendSparkline points={company.trend} />
      </td>
      <td className="border-b border-darknavy/6 px-6 py-4">
        <button
          type="button"
          aria-label={`More options for ${company.name}`}
          className="rounded-xl p-2 text-darknavy/45 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

function ApprovalQueueItem({ item }: { item: WorkspaceApprovalItem }) {
  const Icon = item.icon;

  return (
    <div className="flex gap-4 px-6 py-5">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${summaryTone(item.tone)}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-darknavy">{item.title}</p>
            <p className="mt-1 text-sm text-darknavy/52">{item.company}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-darknavy">{item.amount}</p>
              <p className="mt-1 text-xs text-darknavy/45">{item.dateLabel}</p>
            </div>
            <span className={priorityTone(item.priority)}>{item.priority}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelinePanel({
  items,
  subtitle,
  title,
}: {
  items: WorkspaceTimelineItem[];
  subtitle: string;
  title: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-darknavy/10 bg-white p-6 shadow-[0_20px_60px_rgba(33,39,56,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-darknavy">{title}</h3>
          <p className="mt-1 text-sm text-darknavy/50">{subtitle}</p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-skyblue transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        >
          View all
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-3xl border border-darknavy/8 bg-offwhite px-4 py-4"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${summaryTone(item.tone)}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-6 text-darknavy">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-darknavy/45">{item.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function TrendSparkline({ points }: { points: number[] }) {
  const width = 64;
  const height = 26;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-7 w-16 text-emerald-500"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function companyTone(tone: WorkspaceCompanyRecord["tone"]) {
  switch (tone) {
    case "citron":
      return "bg-citron/30 text-darknavy";
    case "coral":
      return "bg-coralpink/18 text-coralpink";
    case "dark":
      return "bg-darknavy/8 text-darknavy/72";
    case "mint":
      return "bg-emerald-100 text-emerald-700";
    case "violet":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-skyblue/18 text-darknavy";
  }
}

function summaryTone(
  tone: WorkspaceApprovalItem["tone"] | WorkspaceTimelineItem["tone"],
) {
  switch (tone) {
    case "citron":
      return "bg-amber-100 text-amber-700";
    case "coral":
      return "bg-coralpink/18 text-coralpink";
    case "mint":
      return "bg-emerald-100 text-emerald-700";
    case "violet":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-skyblue/18 text-darknavy";
  }
}

function statusTone(status: WorkspaceCompanyRecord["status"]) {
  return status === "Active"
    ? "inline-flex min-h-7 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700"
    : "inline-flex min-h-7 items-center rounded-full bg-darknavy/7 px-3 text-xs font-semibold text-darknavy/48";
}

function priorityTone(priority: WorkspaceApprovalItem["priority"]) {
  switch (priority) {
    case "High":
      return "inline-flex min-h-7 items-center rounded-full bg-coralpink/16 px-3 text-xs font-semibold text-coralpink";
    case "Medium":
      return "inline-flex min-h-7 items-center rounded-full bg-amber-100 px-3 text-xs font-semibold text-amber-700";
    default:
      return "inline-flex min-h-7 items-center rounded-full bg-skyblue/14 px-3 text-xs font-semibold text-skyblue";
  }
}
