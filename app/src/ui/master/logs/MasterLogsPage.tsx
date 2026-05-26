import Link from "next/link";
import { Activity, ArrowRight, FileText } from "lucide-react";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";

const MasterLogCards = [
  {
    title: "System Logs",
    description:
      "Review platform events, background jobs, integrations, and operational signals.",
    href: "/master/logs/system-logs",
    icon: FileText,
    metric: "1.4K",
    metricLabel: "Events Today",
    tone: "sky",
  },
  {
    title: "Audit Logs",
    description:
      "Trace user actions, administrative changes, and sensitive record updates.",
    href: "/master/logs/audit-logs",
    icon: Activity,
    metric: "312",
    metricLabel: "Tracked Actions",
    tone: "coral",
  },
] as const;

export function MasterLogsPage() {
  return (
    <div className="mx-auto flex w-full max-w-376 flex-col gap-6">
      <ModuleHeader
        title="Logs"
        description="Choose the log area you want to review."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {MasterLogCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex min-h-64 flex-col justify-between rounded-lg border border-darknavy/10 bg-white p-6 shadow-[0_18px_50px_rgba(33,39,56,0.06)] transition hover:-translate-y-0.5 hover:border-skyblue/40 hover:shadow-[0_24px_70px_rgba(33,39,56,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getToneClasses(card.tone)}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-darknavy/10 text-darknavy/55 transition group-hover:border-skyblue/40 group-hover:text-skyblue">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-darknavy">
                  {card.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-darknavy/62">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 rounded-lg border border-darknavy/10 bg-offwhite px-4 py-3">
                <p className="text-xs font-semibold uppercase text-darknavy/45">
                  {card.metricLabel}
                </p>
                <p className="mt-2 text-2xl font-semibold text-darknavy">
                  {card.metric}
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function getToneClasses(tone: (typeof MasterLogCards)[number]["tone"]) {
  if (tone === "coral") {
    return "bg-coralpink/18 text-coralpink";
  }

  return "bg-skyblue/18 text-darknavy";
}
