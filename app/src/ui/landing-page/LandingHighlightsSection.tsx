import { LandingPageHighlights } from "@/app/src/data/landing-page/LandingPageData";
import { LandingPageIcon } from "@/app/src/ui/landing-page/LandingPageIcon";

export function LandingHighlightsSection() {
  return (
    <section className="landing-section landing-highlights-section">
      <div className="landing-section-content grid gap-4 lg:grid-cols-3">
        {LandingPageHighlights.map((item) => (
          <article key={item.title} className="rounded-lg bg-white p-7 ring-1 ring-slate-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700"><LandingPageIcon name={item.icon} className="h-5 w-5" /></div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
