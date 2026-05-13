"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function ModulePlaceholderPage({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-slate-900">
          Workspace-ready route
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          This module is now routed into the ERP workspace shell and ready for
          deeper CRUD screens, services, and branch-aware logic when you want to
          expand it next.
        </p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
