import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export const metadata: Metadata = {
  title: `${AppName} | Accounting and Inventory SaaS`,
  description:
    "Accounting, inventory, purchasing, sales, approvals, and reporting in one clean SaaS workspace.",
};

const Benefits = [
  "Accounting and inventory in one operating view",
  "Approvals, audit trails, and role-based workspace control",
  "Reports that stay connected to day-to-day transactions",
] as const;

const Modules = [
  {
    icon: ReceiptText,
    label: "Accounting",
    text: "Clean ledgers, vouchers, journals, and connected financial records.",
  },
  {
    icon: Warehouse,
    label: "Inventory",
    text: "Track items, warehouses, receiving, releasing, and stock movement.",
  },
  {
    icon: FileText,
    label: "Sales",
    text: "Manage customer transactions from documents to posting workflows.",
  },
  {
    icon: ClipboardCheck,
    label: "Purchasing",
    text: "Control requests, orders, supplier documents, and approvals.",
  },
  {
    icon: BadgeCheck,
    label: "Approvals",
    text: "Route work through accountable reviews with audit-ready actions.",
  },
  {
    icon: BarChart3,
    label: "Reports",
    text: "Turn daily activity into practical financial and operational insight.",
  },
] as const;

const Highlights = [
  {
    icon: PackageCheck,
    title: "Inventory-aware books",
    text: "Stock movement, receiving, delivery, and valuation stay close to the financial records.",
  },
  {
    icon: ShieldCheck,
    title: "Controlled operations",
    text: "Users, branches, approvals, and audit trails help keep work accountable as the company grows.",
  },
  {
    icon: Building2,
    title: "Built for teams",
    text: "One SaaS workspace for companies that need practical accounting workflows without scattered files.",
  },
] as const;

const FooterGroups = [
  {
    title: "Product",
    links: [
      { label: "Modules", href: "#modules" },
      { label: "Why Gr8Books", href: "#why" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create workspace", href: "/signup" },
      { label: "Forgot password", href: "/forgot-password" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact Support", href: "mailto:support@gr8booklite.com" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
] as const;

export default function Home() {
  return (
    <main className="landing-page min-h-screen bg-[#f6f9fc] text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0 text-xl font-semibold">
          <LogoText brandSuffixClassName="text-sm" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <a href="#modules" className="transition hover:text-sky-700">
            Modules
          </a>
          <a href="#why" className="transition hover:text-sky-700">
            Why Gr8Books
          </a>
          <Link href="/pricing" className="transition hover:text-sky-700">
            Pricing
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="hidden rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
          >
            Start free
          </Link>
        </div>
      </header>

      <section className="landing-hero-section relative overflow-hidden border-b border-slate-200">
        <HeroBackground />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[0.92fr_0.78fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
          <div className="max-w-3xl">
            <p className="landing-hero-eyebrow text-sm font-bold uppercase text-sky-700">
              Accounting + inventory SaaS
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              Clear books. Controlled stock. One workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Gr8Books Neo connects accounting, inventory, sales, purchasing,
              approvals, and reporting so your team can work from clean records
              instead of separate spreadsheets.
            </p>
            <ul className="mt-8 space-y-3 text-sm font-medium text-slate-700">
              {Benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-sky-700" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
              >
                Create workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="modules"
        className="landing-modules-section border-y border-slate-200 bg-white px-5 py-18 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div className="max-w-xl">
              <p className="landing-section-kicker text-sm font-bold uppercase text-sky-700">
                Core modules
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
                The daily back-office work, connected.
              </h2>
            </div>
            <div className="landing-modules-summary lg:justify-self-end">
              <p className="text-sm leading-6 text-slate-600">
                Use the accounting package alone, or add inventory when your
                operations need item, warehouse, and stock movement control.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <strong>6</strong>
                  <span>Core workflows</span>
                </div>
                <div>
                  <strong>1</strong>
                  <span>Shared workspace</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Operational view</span>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-module-marquee-wrap mt-12">
            <div className="landing-module-marquee">
              <div className="landing-module-marquee-track">
                {[...Modules, ...Modules].map((module, index) => (
                  <ModuleMarqueeCard
                    key={`${module.label}-${index}`}
                    module={module}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
          {Highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-lg bg-white p-7 ring-1 ring-slate-200"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-lg bg-white p-8 text-slate-950 ring-1 ring-slate-200 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">
              Ready to organize your books and inventory?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Start with a clean workspace and choose the package that fits your
              company.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <Link href="/" className="inline-flex text-xl font-semibold">
              <LogoText brandSuffixClassName="text-sm" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Accounting and inventory software for teams that need clean books,
              controlled stock, and practical reporting in one workspace.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FooterGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold text-slate-950">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition hover:text-sky-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Gr8Books Neo. All rights reserved.
          </p>
          <p>Built for accounting, inventory, and growing operations.</p>
        </div>
      </footer>
    </main>
  );
}

function ModuleMarqueeCard({
  module,
}: Readonly<{
  module: (typeof Modules)[number];
}>) {
  return (
    <article className="landing-module-card group">
      <div className="flex items-start justify-between gap-4">
        <div className="landing-module-icon flex h-12 w-12 items-center justify-center rounded-md bg-sky-50 text-sky-700 transition group-hover:bg-white">
          <module.icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="landing-module-signal" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">
        {module.label}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{module.text}</p>
    </article>
  );
}

function HeroMetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: Readonly<{
  icon: typeof ReceiptText;
  label: string;
  value: string;
  accent: "sky" | "cyan";
}>) {
  const accentClassName =
    accent === "sky" ? "bg-sky-50 text-sky-700" : "bg-cyan-50 text-cyan-700";

  return (
    <div className="landing-hero-metric rounded-lg border border-slate-200 bg-white/78 p-3">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-md ${accentClassName}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="h-2 w-12 rounded-full bg-slate-200" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="landing-hero-glow absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_90%_72%,rgba(34,211,238,0.12),transparent_25%)]" />
      <div className="landing-hero-grid absolute inset-0" />
      <div className="landing-3d-stage absolute right-[8%] top-[13%] hidden h-[30rem] w-[34rem] lg:block">
        <div className="landing-3d-plane landing-3d-plane-a" />
        <div className="landing-3d-plane landing-3d-plane-b" />
        <div className="landing-3d-plane landing-3d-plane-c" />
        <div className="landing-3d-cube landing-3d-cube-a" />
        <div className="landing-3d-cube landing-3d-cube-b" />
        <div className="landing-3d-cube landing-3d-cube-c" />
      </div>
      <HeroConnectedAnimation />
    </div>
  );
}

function HeroConnectedAnimation() {
  return (
    <div className="landing-connected-flow absolute right-6 top-[17%] hidden h-[27rem] w-[38rem] xl:block">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 608 464"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="landing-flow-path"
          d="M136 116 C220 76 332 76 432 116"
        />
        <path
          className="landing-flow-path landing-flow-path-delay"
          d="M136 116 C190 206 250 248 304 236 C360 224 410 170 432 116"
        />
        <path
          className="landing-flow-path"
          d="M176 330 C236 272 374 272 432 330"
        />
        <path
          className="landing-flow-path landing-flow-path-delay"
          d="M176 330 C202 236 238 188 304 236 C374 286 410 248 432 116"
        />
        <circle className="landing-flow-dot" cx="136" cy="116" r="4" />
        <circle className="landing-flow-dot" cx="432" cy="116" r="4" />
        <circle className="landing-flow-dot" cx="304" cy="236" r="5" />
        <circle className="landing-flow-dot" cx="176" cy="330" r="4" />
        <circle className="landing-flow-dot" cx="432" cy="330" r="4" />
      </svg>

      <HeroConnectedNode
        className="left-3 top-[3.25rem]"
        icon={ReceiptText}
        label="Accounting"
        value="Posted books"
      />
      <HeroConnectedNode
        className="right-3 top-[3.25rem]"
        icon={Warehouse}
        label="Inventory"
        value="Live stock"
      />
      <HeroConnectedNode
        className="left-10 bottom-[3.5rem]"
        icon={ClipboardCheck}
        label="Purchasing"
        value="Approved flow"
      />
      <HeroConnectedNode
        className="right-3 bottom-[3.5rem]"
        icon={BarChart3}
        label="Reports"
        value="Clean insights"
      />
    </div>
  );
}

function HeroConnectedNode({
  className,
  icon: Icon,
  label,
  value,
}: Readonly<{
  className: string;
  icon: typeof ReceiptText;
  label: string;
  value: string;
}>) {
  return (
    <div
      className={`landing-connected-node absolute flex w-48 items-center gap-3.5 rounded-lg border border-sky-200/80 bg-white/90 p-3.5 shadow-xl shadow-sky-900/10 backdrop-blur ${className}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold leading-5 text-slate-950">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
          {value}
        </p>
      </div>
    </div>
  );
}
