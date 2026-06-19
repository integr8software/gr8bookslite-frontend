import { Quote, Star } from "lucide-react";

const TestimonialMetrics = [
  { value: "12 hrs", label: "saved per team per week on average" },
  { value: "94%", label: "reduction in manual data entry errors" },
  { value: "3 days", label: "average time to full onboarding", accent: true },
  { value: "4.9", label: "average rating across 800+ reviews", rating: true },
] as const;

function RatingStars({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <div className="flex gap-0.5 text-citron" aria-label="Five star rating">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={compact ? "h-3 w-3 fill-current" : "h-4 w-4 fill-current"}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="landing-section bg-white">
      <div className="landing-section-content grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col justify-center">
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-darknavy sm:text-5xl">
            Join 2,000+ teams who{" "}
            <span className="text-darknavy/75">ditched the spreadsheet.</span>
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {TestimonialMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-darknavy/10 bg-white p-5 shadow-[0_8px_24px_rgba(33,39,56,0.06)] sm:p-6"
              >
                <p
                  className={`flex items-center gap-1 text-2xl font-bold tracking-[-0.045em] sm:text-3xl ${
                    "accent" in metric && metric.accent
                      ? "text-sky-700"
                      : "text-darknavy"
                  }`}
                >
                  {metric.value}
                  {"rating" in metric && metric.rating ? (
                    <Star className="h-5 w-5 fill-darknavy text-darknavy" />
                  ) : null}
                </p>
                <p className="mt-2 text-xs leading-5 text-darknavy/50">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

        </div>

        <div className="space-y-4">
          <article className="rounded-3xl border border-darknavy/10 bg-white p-7 shadow-[0_14px_40px_rgba(33,39,56,0.08)] sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-skyblue/10 text-sky-700">
                <Quote className="h-5 w-5 rotate-180 fill-current" />
              </div>
            </div>

            <blockquote className="mt-7 text-lg font-semibold leading-7 tracking-[-0.02em] text-darknavy sm:text-xl sm:leading-8">
              &quot;Gr8Books Neo cut our month-end close from five days to a few
              hours. The AI categorization is eerily accurate—we&apos;re talking
              98% hit rate out of the box. I genuinely can&apos;t imagine
              running our finances without it.&quot;
            </blockquote>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-darknavy/10 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-skyblue to-sky-700 text-sm font-bold text-white">
                  PN
                </div>
                <div>
                  <p className="text-sm font-bold text-darknavy">Priya Nair</p>
                  <p className="text-xs text-darknavy/45">
                    CFO &amp; Co-Founder, Fintelo
                  </p>
                </div>
              </div>
              <RatingStars />
            </div>
          </article>

          <article className="rounded-2xl border border-darknavy/10 bg-white p-5 shadow-[0_8px_28px_rgba(33,39,56,0.06)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-citron to-skyblue text-xs font-bold text-darknavy">
                MW
              </div>
              <div>
                <RatingStars compact />
                <p className="mt-2 text-sm leading-6 text-darknavy/75">
                  &quot;Set up in an afternoon. Our accountant was amazed at the
                  reports it generates automatically.&quot;
                </p>
                <p className="mt-2 text-xs text-darknavy/40">
                  — Marcus Webb, CEO at Parcelr
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
