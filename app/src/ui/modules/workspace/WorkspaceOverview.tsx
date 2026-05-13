import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  Mail,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { MainLayoutMockData } from "@/app/src/data/shared/MainLayoutData";

const WorkspaceStats = [
  {
    label: "Companies",
    value: String(MainLayoutMockData.availableCompanies.length),
    supportingText: "Joined workspaces",
    icon: Building2,
    tone: "sky",
  },
  {
    label: "Users",
    value: "128",
    supportingText: "Across active companies",
    icon: UserCog,
    tone: "citron",
  },
  {
    label: "Approvals",
    value: "24",
    supportingText: "Pending global rules",
    icon: ShieldCheck,
    tone: "coral",
  },
  {
    label: "Audit Events",
    value: "1.4k",
    supportingText: "Logged this month",
    icon: Activity,
    tone: "dark",
  },
];

const WorkspaceQueues = [
  "Company access reviews",
  "Global approval rule updates",
  "Mail template maintenance",
];

export function WorkspaceOverview() {
  return (
    <div className="mx-auto flex w-full max-w-[94rem] flex-col gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WorkspaceStats.map((stat) => (
          <WorkspaceStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Workspace Queue" icon={ShieldCheck}>
          <div className="space-y-2">
            {WorkspaceQueues.map((item) => (
              <div
                key={item}
                className="rounded-md border border-darknavy/10 px-4 py-3 text-sm font-medium text-darknavy/72"
              >
                {item}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Mail Maintenance" icon={Mail}>
          <div className="grid gap-3">
            <MetricRow label="Active templates" value="18" />
            <MetricRow label="Pending approvals" value="4" />
            <MetricRow label="Recent revisions" value="11" />
          </div>
        </Panel>
      </section>
    </div>
  );
}

type WorkspaceStatCardProps = {
  stat: (typeof WorkspaceStats)[number];
};

function WorkspaceStatCard({ stat }: WorkspaceStatCardProps) {
  const Icon = stat.icon;

  return (
    <article className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-md ${bgTone(stat.tone)}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55">
          GEN
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-darknavy/55">
        {stat.label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-darknavy">{stat.value}</p>
      <p className="mt-2 text-sm text-darknavy/55">{stat.supportingText}</p>
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

type MetricRowProps = {
  label: string;
  value: string;
};

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 px-4 py-3">
      <span className="min-w-0 text-sm font-semibold text-darknavy">
        {label}
      </span>
      <span className="text-right text-sm text-darknavy/55">{value}</span>
    </div>
  );
}

function bgTone(tone: string) {
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
