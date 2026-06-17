"use client";

import Link from "next/link";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export function MainFooter() {
  return (
    <footer className="mt-8 flex w-full flex-col gap-3 border-t border-darknavy/10 py-5 text-xs text-darknavy/55 sm:flex-row sm:items-center sm:justify-between">
      <p>&copy; 2026 {AppName}. All rights reserved.</p>
      <nav
        aria-label="Legal links"
        className="flex flex-wrap items-center gap-x-4 gap-y-2"
      >
        <Link
          href="/faq"
          className="transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
        >
          FAQ
        </Link>
        <a
          href="mailto:support@gr8booklite.com"
          className="transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
        >
          Contact Support
        </a>
        <Link
          href="/terms-of-service"
          className="transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
        >
          Terms of Service
        </Link>
        <Link
          href="/privacy-policy"
          className="transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
        >
          Privacy Policy
        </Link>
      </nav>
    </footer>
  );
}
