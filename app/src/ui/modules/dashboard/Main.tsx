import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  PanelsTopLeft,
  Plus,
  Share2,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { MainDashboardWidget } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { hasAccess } from "@/app/src/data/shared/MainLayout/ModuleShellUtils";
import { ModuleShellMockData } from "@/app/src/data/shared/MainLayout/ModuleShellMockData";

const DashboardLibrary = [
  {
    title: "Dashboard",
    owner: "System",
    visibility: "Everyone with dashboard view",
    widgets: "Configurable dashboards",
  },
];

const ActivityItems = [
  "Dashboard was updated.",
  "Dashboard widget settings were reviewed.",
  "Dashboard access rules were synchronized.",
];

export function ManagementMain() {
  const canAddDashboard = hasAccess(
    ModuleShellMockData.currentUser,
    "dashboard",
    ["add"],
  );

  return (
    <div className="mx-auto flex w-full max-w-[94rem] flex-col gap-4">
      <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Dashboard" tone="sky" />
              <StatusPill label="Customizable" tone="citron" />
              {canAddDashboard ? (
                <StatusPill label="Add enabled" tone="dark" />
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            {canAddDashboard ? (
              <ActionButton icon={Plus} label="Add Dashboard" />
            ) : null}
            <ActionButton icon={SlidersHorizontal} label="Customize" />
            <ActionButton icon={Share2} label="Share" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ModuleShellMockData.dashboardWidgets.map((widget) => (
          <WidgetCard key={widget.id} widget={widget} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel title="Dashboard Library" icon={LayoutDashboard}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-darknavy/45">
                  <th className="border-b border-darknavy/10 px-3 py-3">
                    Dashboard
                  </th>
                  <th className="border-b border-darknavy/10 px-3 py-3">
                    Owner
                  </th>
                  <th className="border-b border-darknavy/10 px-3 py-3">
                    Visibility
                  </th>
                  <th className="border-b border-darknavy/10 px-3 py-3">
                    Widgets
                  </th>
                </tr>
              </thead>
              <tbody>
                {DashboardLibrary.map((dashboard) => (
                  <tr key={dashboard.title} className="text-darknavy">
                    <td className="border-b border-darknavy/5 px-3 py-3 font-semibold">
                      {dashboard.title}
                    </td>
                    <td className="border-b border-darknavy/5 px-3 py-3 text-darknavy/70">
                      {dashboard.owner}
                    </td>
                    <td className="border-b border-darknavy/5 px-3 py-3 text-darknavy/70">
                      {dashboard.visibility}
                    </td>
                    <td className="border-b border-darknavy/5 px-3 py-3 font-medium">
                      {dashboard.widgets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Builder Preview" icon={PanelsTopLeft}>
          <div className="grid min-h-72 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <PreviewBlock label="Summary" />
              <PreviewBlock label="Saved View" />
            </div>
            <PreviewBlock label="Chart Area" tall />
            <div className="grid grid-cols-3 gap-3">
              <PreviewBlock label="Queue" />
              <PreviewBlock label="Notes" />
              <PreviewBlock label="Links" />
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Team Access" icon={Users}>
          <div className="space-y-3">
            <AccessRow label="Administrators" value="Can view, add, edit" />
            <AccessRow label="Managers" value="Can view shared dashboards" />
            <AccessRow label="Staff" value="Can view assigned dashboards" />
          </div>
        </Panel>

        <Panel title="Recent Dashboard Activity" icon={BarChart3}>
          <div className="space-y-2">
            {ActivityItems.map((activity) => (
              <div
                key={activity}
                className="rounded-md border border-darknavy/10 px-4 py-3 text-sm font-medium text-darknavy/72"
              >
                {activity}
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

type WidgetCardProps = {
  widget: MainDashboardWidget;
};

function WidgetCard({ widget }: WidgetCardProps) {
  return (
    <article className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-md ${bgTone(widget.tone)}`}
        >
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55">
          Widget
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-darknavy/55">
        {widget.title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-darknavy">{widget.value}</p>
      <p className="mt-2 text-sm text-darknavy/55">{widget.supportingText}</p>
    </article>
  );
}

type PanelProps = {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
};

function Panel({ children, icon: Icon, title }: PanelProps) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-darknavy/55" aria-hidden="true" />
        <h2 className="text-base font-semibold text-darknavy">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type ActionButtonProps = {
  icon: LucideIcon;
  label: string;
};

function ActionButton({ icon: Icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

type StatusPillProps = {
  label: string;
  tone: "sky" | "citron" | "dark";
};

function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded px-2.5 text-xs font-semibold ${pillTone(tone)}`}
    >
      {label}
    </span>
  );
}

type PreviewBlockProps = {
  label: string;
  tall?: boolean;
};

function PreviewBlock({ label, tall }: PreviewBlockProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border border-dashed border-darknavy/15 bg-darknavy/5 px-3 text-center text-xs font-semibold text-darknavy/45 ${tall ? "min-h-28" : "min-h-16"
        }`}
    >
      {label}
    </div>
  );
}

type AccessRowProps = {
  label: string;
  value: string;
};

function AccessRow({ label, value }: AccessRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 px-4 py-3">
      <span className="min-w-0 text-sm font-semibold text-darknavy">
        {label}
      </span>
      <span className="text-right text-sm text-darknavy/55">{value}</span>
    </div>
  );
}

function bgTone(tone: MainDashboardWidget["tone"]) {
  switch (tone) {
    case "citron":
      return "bg-citron/25 text-darknavy";
    case "coral":
      return "bg-coralpink/15 text-coralpink";
    case "dark":
      return "bg-darknavy/10 text-darknavy";
    default:
      return "bg-skyblue/15 text-darknavy";
  }
}

function pillTone(tone: StatusPillProps["tone"]) {
  switch (tone) {
    case "citron":
      return "bg-citron/25 text-darknavy";
    case "dark":
      return "bg-darknavy text-offwhite";
    default:
      return "bg-skyblue/15 text-darknavy";
  }
}
