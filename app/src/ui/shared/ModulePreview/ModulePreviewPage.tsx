import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ModulePreviewData } from "@/app/src/data/shared/MainLayout/ModulePreviewData";

type ModulePreviewPageProps = {
  data: ModulePreviewData;
};

export function ModulePreviewPage({ data }: ModulePreviewPageProps) {
  const Icon = data.icon;

  return (
    <div className="mx-auto flex w-full max-w-376 flex-col gap-6">
      <section className="overflow-hidden rounded-4xl border border-darknavy/10 bg-white shadow-[0_24px_70px_rgba(33,39,56,0.08)]">
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(87,196,229,0.28),transparent_55%),radial-gradient(circle_at_top_right,rgba(249,112,104,0.18),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,1))]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-darknavy/10 bg-offwhite px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/55">
                <Sparkles className="h-3.5 w-3.5 text-skyblue" aria-hidden="true" />
                {data.eyebrow}
              </span>
              <div className="mt-5 flex items-start gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${toneClasses(data.tone)}`}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-darknavy sm:text-4xl">
                    {data.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/62 sm:text-base">
                    {data.description}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-darknavy px-5 text-sm font-semibold text-offwhite transition hover:bg-darknavy/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              Continue Mock Review
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-3xl border border-darknavy/10 bg-white p-5 shadow-[0_18px_50px_rgba(33,39,56,0.06)]"
          >
            <p className="text-sm font-medium text-darknavy/55">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-darknavy">
              {metric.value}
            </p>
            <p className="mt-3 text-sm text-darknavy/48">
              Mock metric for layout validation and stakeholder review.
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[1.75rem] border border-darknavy/10 bg-white p-6 shadow-[0_20px_60px_rgba(33,39,56,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-darknavy">
                Suggested Layout Direction
              </h3>
              <p className="mt-1 text-sm text-darknavy/55">
                A safe mock zone for testing cards, lists, filters, and internal module actions.
              </p>
            </div>
            <span className="rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
              Mockup Only
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PreviewSurface
              icon={data.icon}
              title="Primary Work Area"
              description="Reserved for data tables, task queues, or charts once the backend contract is ready."
            />
            <PreviewSurface
              icon={Sparkles}
              title="Secondary Insights"
              description="A flexible area for summaries, approval panels, or contextual recommendations."
            />
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-darknavy/10 bg-white p-6 shadow-[0_20px_60px_rgba(33,39,56,0.06)]">
          <h3 className="text-lg font-semibold text-darknavy">Why This Helps</h3>
          <div className="mt-5 space-y-3">
            {data.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-darknavy/10 bg-offwhite px-4 py-3 text-sm leading-6 text-darknavy/68"
              >
                {highlight}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

type PreviewSurfaceProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

function PreviewSurface({ description, icon: Icon, title }: PreviewSurfaceProps) {
  return (
    <div className="rounded-3xl border border-dashed border-darknavy/15 bg-[linear-gradient(180deg,rgba(87,196,229,0.08),rgba(255,255,255,0.9))] p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-darknavy shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h4 className="mt-4 text-base font-semibold text-darknavy">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
    </div>
  );
}

function toneClasses(tone: ModulePreviewData["tone"]) {
  switch (tone) {
    case "citron":
      return "bg-citron/30 text-darknavy";
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
