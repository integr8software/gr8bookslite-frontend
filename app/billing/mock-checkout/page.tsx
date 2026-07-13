"use client";

import { ArrowLeft, CheckCircle2, Clock3, CreditCard, QrCode, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuildManualPaymentResultUrl } from "@/app/src/services/billing/ManualBillingMockApi";

const CheckoutMethods = [
  "GCash",
  "Maya",
  "QRPh",
  "Visa / Mastercard",
  "BPI Direct Debit",
  "UBP Direct Debit",
];

export default function MockManualCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planName = searchParams.get("planName") || "Selected plan";
  const planCode = searchParams.get("planCode") || "";
  const amountLabel = searchParams.get("amountLabel") || "Pending amount";
  const billingCycle = searchParams.get("billingCycle") || "";
  const companyName = searchParams.get("companyName") || "Company";

  function goToResult(status: "success" | "failed" | "cancelled" | "pending" | "expired") {
    router.push(
      BuildManualPaymentResultUrl({
        amountLabel,
        billingCycle,
        checkoutSessionId: searchParams.get("checkoutSessionId"),
        companyId: searchParams.get("companyId"),
        companyName,
        paymentRequestId: searchParams.get("paymentRequestId"),
        planCode,
        planName,
        purpose: searchParams.get("purpose"),
        returnTo: searchParams.get("returnTo"),
        status,
      }),
    );
  }

  return (
    <main className="min-h-screen bg-offwhite px-4 py-8 text-darknavy sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => goToResult("cancelled")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-darknavy/65 transition hover:text-darknavy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Cancel checkout
          </button>

          <div className="mt-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-darknavy text-offwhite">
              <QrCode className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
              Mock PayMongo Checkout
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Choose a payment outcome
            </h1>
            <p className="mt-3 text-sm leading-6 text-darknavy/62">
              This screen is a frontend placeholder for the hosted PayMongo
              checkout page. Backend checkout-session creation will replace this
              mock in Phase 2.
            </p>
          </div>

          <dl className="mt-8 divide-y divide-darknavy/10 rounded-2xl border border-darknavy/10 bg-offwhite/70 px-4">
            <CheckoutDetail label="Company" value={companyName} />
            <CheckoutDetail label="Plan" value={planName} />
            <CheckoutDetail label="Cycle" value={billingCycle || "Not selected"} />
            <CheckoutDetail label="Amount" value={amountLabel} />
          </dl>
        </article>

        <article className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-skyblue/20 bg-skyblue/8 p-4">
            <p className="text-sm font-semibold text-darknavy">
              Available manual payment methods
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {CheckoutMethods.map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-darknavy shadow-sm"
                >
                  <CreditCard className="h-4 w-4 text-skyblue" aria-hidden="true" />
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <CheckoutAction
              icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
              label="Return successful"
              helper="Simulates PayMongo confirming the one-time payment."
              onClick={() => goToResult("success")}
              tone="success"
            />
            <CheckoutAction
              icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
              label="Return pending"
              helper="Simulates a delayed confirmation such as QR or bank flow."
              onClick={() => goToResult("pending")}
            />
            <CheckoutAction
              icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
              label="Return failed"
              helper="Simulates a declined or failed payment."
              onClick={() => goToResult("failed")}
              tone="danger"
            />
            <CheckoutAction
              icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
              label="Return expired"
              helper="Simulates an expired checkout session."
              onClick={() => goToResult("expired")}
            />
          </div>
        </article>
      </section>
    </main>
  );
}

function CheckoutDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-darknavy/50">{label}</dt>
      <dd className="text-right font-semibold text-darknavy">{value}</dd>
    </div>
  );
}

function CheckoutAction({
  helper,
  icon,
  label,
  onClick,
  tone = "neutral",
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/35 hover:bg-emerald-50"
      : tone === "danger"
        ? "border-coralpink/35 hover:bg-coralpink/8"
        : "border-darknavy/10 hover:bg-skyblue/8";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 items-center gap-4 rounded-2xl border bg-white p-4 text-left transition ${toneClass}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-darknavy text-offwhite">
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-darknavy">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-darknavy/58">
          {helper}
        </span>
      </span>
    </button>
  );
}
