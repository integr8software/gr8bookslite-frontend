import Link from "next/link";
import { LandingPageFooterGroups } from "@/app/src/constants/landing-page/LandingPageConstants";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1.8fr]">
        <div>
          <Link href="/" className="inline-flex text-xl font-semibold"><LogoText brandSuffixClassName="text-sm" /></Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">Accounting and inventory software for teams that need clean books, controlled stock, and practical reporting in one workspace.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {LandingPageFooterGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-slate-950">{group.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {group.links.map((link) => (
                  <li key={link.label}><Link href={link.href} className="transition hover:text-sky-700">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Gr8Books Neo. All rights reserved.</p>
        <p>Built for accounting, inventory, and growing operations.</p>
      </div>
    </footer>
  );
}
