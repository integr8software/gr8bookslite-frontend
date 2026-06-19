import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCtaSection() {
  return (
    <section className="landing-section bg-white">
      <div className="landing-section-content flex flex-col items-start justify-between gap-6 rounded-lg bg-white p-8 text-slate-950 ring-1 ring-slate-200 sm:p-10 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal">Ready to organize your books and inventory?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Start with a clean workspace and choose the package that fits your company.</p>
        </div>
        <Link href="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700">
          Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
