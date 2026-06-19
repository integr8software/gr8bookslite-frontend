"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LandingPageNavigationLinks } from "@/app/src/constants/landing-page/LandingPageConstants";
import { useLandingNavigation } from "@/app/src/hooks/landing-page/useLandingNavigation";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export function LandingNavigation() {
  const { isMenuOpen, toggleMenu, closeMenu } = useLandingNavigation();

  return (
    <header className="relative z-30 border-b border-slate-200 bg-[#f6f9fc]">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0 text-xl font-semibold">
          <LogoText brandSuffixClassName="text-sm" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          {LandingPageNavigationLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-sky-700">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="/login" className="hidden rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white sm:inline-flex">
            Log in
          </Link>
          <Link href="/signup" className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200">
            Start free
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition hover:bg-white md:hidden"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-navigation"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav id="landing-mobile-navigation" className="absolute inset-x-0 top-full border-y border-slate-200 bg-white p-5 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {LandingPageNavigationLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={closeMenu} className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
