"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { WorkspaceCompaniesHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type { ManualBillingCheckoutStatus } from "@/app/src/data/billing/BillingTypes";
import {
  ClearPendingAdditionalCompanyManualCheckoutDraft,
  ReadPendingAdditionalCompanyManualCheckoutDraft,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyPendingManualCheckoutData";
import { GetManualPaymentAttemptStatus } from "@/app/src/services/billing/ManualBillingApi";
import { CreateWorkspaceCompany } from "@/app/src/services/workspace/companies/WorkspaceCompanyApi";

const ManualPaymentStatus = {
  cancelled: "cancelled",
  expired: "expired",
  failed: "failed",
  pending: "pending",
  success: "success",
} as const satisfies Record<ManualBillingCheckoutStatus, ManualBillingCheckoutStatus>;

const StatusCopy: Record<
  ManualBillingCheckoutStatus,
  {
    eyebrow: string;
    helper: string;
    icon: typeof CheckCircle2;
    title: string;
    toneClass: string;
  }
> = {
  [ManualPaymentStatus.cancelled]: {
    eyebrow: "Payment cancelled",
    helper: "The checkout session was cancelled. No payment method was saved and no automatic renewal was enabled.",
    icon: XCircle,
    title: "Manual payment was cancelled",
    toneClass: "bg-coralpink/12 text-coralpink",
  },
  [ManualPaymentStatus.expired]: {
    eyebrow: "Payment expired",
    helper: "The checkout session expired before payment was confirmed. Start a new manual payment when ready.",
    icon: AlertCircle,
    title: "Checkout session expired",
    toneClass: "bg-citron/25 text-darknavy",
  },
  [ManualPaymentStatus.failed]: {
    eyebrow: "Payment failed",
    helper: "PayMongo did not confirm the payment. You can retry manual checkout or choose auto renewal.",
    icon: XCircle,
    title: "Manual payment failed",
    toneClass: "bg-coralpink/12 text-coralpink",
  },
  [ManualPaymentStatus.pending]: {
    eyebrow: "Payment pending",
    helper: "The payment is waiting for provider confirmation. Access will activate after PayMongo confirms the payment.",
    icon: Clock3,
    title: "Payment confirmation is pending",
    toneClass: "bg-skyblue/14 text-darknavy",
  },
  [ManualPaymentStatus.success]: {
    eyebrow: "Payment successful",
    helper: "PayMongo returned from hosted checkout. If payment is confirmed, access activation may continue in the background.",
    icon: CheckCircle2,
    title: "Manual payment completed",
    toneClass: "bg-emerald-100 text-emerald-700",
  },
};

function NormalizeStatus(value: string | string[] | undefined): ManualBillingCheckoutStatus {
  const status = Array.isArray(value) ? value[0] : value;

  if (Object.values(ManualPaymentStatus).includes(status as ManualBillingCheckoutStatus)) {
    return status as ManualBillingCheckoutStatus;
  }

  return ManualPaymentStatus.pending;
}

function IsOnboardingReturnUrl(value: string) {
  return value === "/onboarding" || value.startsWith("/onboarding?");
}

function GetAppliedReturnUrl(value: string) {
  if (!IsOnboardingReturnUrl(value)) {
    return value;
  }

  return `/onboarding?manualBillingStatus=${ManualPaymentStatus.success}`;
}

export default function ManualPaymentResultPage() {
  const params = useParams<{ status: string }>();
  const searchParams = useSearchParams();
  const status = NormalizeStatus(params.status);
  const copy = StatusCopy[status];
  const Icon = copy.icon;
  const returnTo = searchParams.get("returnTo") || "/workspace/billing-and-subscription";
  const planName = searchParams.get("planName") || "Selected plan";
  const companyName = searchParams.get("companyName") || "Company";
  const amountLabel = searchParams.get("amountLabel") || "Pending amount";
  const retryUrl = returnTo;
  const paymentAttemptId = searchParams.get("paymentAttemptId") || searchParams.get("paymentRequestId");
  const purpose = searchParams.get("purpose");
  const [providerStatus, setProviderStatus] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<string | null>(null);
  const [companyCreationStatus, setCompanyCreationStatus] = useState<"idle" | "creating" | "created" | "failed">("idle");
  const [companyCreationError, setCompanyCreationError] = useState<string | null>(null);
  const hasStartedAdditionalCompanyCreationRef = useRef(false);
  const isOnboardingReturn = IsOnboardingReturnUrl(returnTo);
  const isAdditionalCompanyReturn = purpose === "ADDITIONAL_COMPANY";
  const isApplied = applicationStatus === "APPLIED";
  const continueUrl = isAdditionalCompanyReturn ? WorkspaceCompaniesHref : GetAppliedReturnUrl(returnTo);
  const isPayMongoTerminal =
    providerStatus === "FAILED" || providerStatus === "EXPIRED" || providerStatus === "CANCELED" || providerStatus === "CANCELLED";
  const shouldWaitForOnboardingApplication =
    isOnboardingReturn &&
    (status === ManualPaymentStatus.success || status === ManualPaymentStatus.pending) &&
    !isApplied &&
    !isPayMongoTerminal;

  useEffect(() => {
    if (!paymentAttemptId) {
      return;
    }

    const resolvedPaymentAttemptId = paymentAttemptId;
    let isMounted = true;
    let intervalId: number | undefined;

    async function refreshPaymentAttemptStatus() {
      try {
        const paymentAttempt = await GetManualPaymentAttemptStatus(resolvedPaymentAttemptId);

        if (isMounted) {
          setProviderStatus(paymentAttempt.status);
          setApplicationStatus(paymentAttempt.applicationStatus);
          setInvoiceStatus(paymentAttempt.invoice.status);
        }
      } catch {
        if (isMounted) {
          setProviderStatus("UNAVAILABLE");
          setApplicationStatus("UNAVAILABLE");
          setInvoiceStatus("UNAVAILABLE");
        }
      }
    }

    void refreshPaymentAttemptStatus();

    if (status === ManualPaymentStatus.success || status === ManualPaymentStatus.pending) {
      intervalId = window.setInterval(() => {
        void refreshPaymentAttemptStatus();
      }, 2500);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [paymentAttemptId, status]);

  useEffect(() => {
    if (!isAdditionalCompanyReturn) {
      return;
    }

    if (
      status === ManualPaymentStatus.failed ||
      status === ManualPaymentStatus.cancelled ||
      status === ManualPaymentStatus.expired ||
      isPayMongoTerminal
    ) {
      ClearPendingAdditionalCompanyManualCheckoutDraft();
      return;
    }

    if (status !== ManualPaymentStatus.success && status !== ManualPaymentStatus.pending) {
      return;
    }

    if (providerStatus !== "PAID" || invoiceStatus !== "PAID" || !paymentAttemptId || hasStartedAdditionalCompanyCreationRef.current) {
      return;
    }

    const draft = ReadPendingAdditionalCompanyManualCheckoutDraft();

    if (!draft) {
      hasStartedAdditionalCompanyCreationRef.current = true;
      window.setTimeout(() => {
        setCompanyCreationStatus("failed");
        setCompanyCreationError("The pending company draft was not found. No company was created.");
      }, 0);
      return;
    }

    hasStartedAdditionalCompanyCreationRef.current = true;
    window.setTimeout(() => {
      setCompanyCreationStatus("creating");
      setCompanyCreationError(null);
    }, 0);

    CreateWorkspaceCompany(draft.values, {
      paymentAttemptId: draft.paymentAttemptId ?? paymentAttemptId,
    })
      .then(() => {
        ClearPendingAdditionalCompanyManualCheckoutDraft();
        setCompanyCreationStatus("created");
      })
      .catch((error: unknown) => {
        setCompanyCreationStatus("failed");
        setCompanyCreationError(error instanceof Error ? error.message : "Company creation failed after payment confirmation.");
      });
  }, [invoiceStatus, isAdditionalCompanyReturn, isPayMongoTerminal, paymentAttemptId, providerStatus, status]);

  return (
    <main className="min-h-screen bg-offwhite px-4 py-8 text-darknavy sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-3xl border border-darknavy/10 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${copy.toneClass}`}>
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-darknavy/45">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-darknavy/62">{copy.helper}</p>
        {shouldWaitForOnboardingApplication ? (
          <p className="mx-auto mt-3 max-w-2xl rounded-2xl border border-skyblue/30 bg-skyblue/10 px-4 py-3 text-sm leading-6 text-darknavy/70">
            Waiting for PayMongo confirmation and backend activation. Keep this page open; Continue will become available once the payment
            is applied to your onboarding draft.
          </p>
        ) : null}
        {isAdditionalCompanyReturn && (status === ManualPaymentStatus.success || status === ManualPaymentStatus.pending) ? (
          <p className="mx-auto mt-3 max-w-2xl rounded-2xl border border-skyblue/30 bg-skyblue/10 px-4 py-3 text-sm leading-6 text-darknavy/70">
            {companyCreationStatus === "created"
              ? "Payment is confirmed and the company has been created."
              : companyCreationStatus === "creating"
                ? "Payment is confirmed. Creating the company and required workspace records now."
                : companyCreationStatus === "failed"
                  ? companyCreationError
                  : "Waiting for PayMongo confirmation. The company will be created only after payment is confirmed."}
          </p>
        ) : null}

        <dl className="mx-auto mt-8 max-w-xl divide-y divide-darknavy/10 rounded-2xl border border-darknavy/10 bg-offwhite/65 px-4 text-left">
          <ResultDetail label="Company" value={companyName} />
          <ResultDetail label="Plan" value={planName} />
          <ResultDetail label="Amount" value={amountLabel} />
          <ResultDetail label="Checkout session" value={searchParams.get("checkoutSessionId") || "PayMongo checkout"} />
          <ResultDetail label="Payment status" value={providerStatus ?? "Checking webhook status"} />
          <ResultDetail label="Invoice status" value={invoiceStatus ?? "Checking invoice status"} />
          <ResultDetail label="Activation status" value={applicationStatus ?? "Checking activation status"} />
        </dl>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {status === ManualPaymentStatus.success || status === ManualPaymentStatus.pending ? (
            shouldWaitForOnboardingApplication ? (
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-darknavy/45 px-5 text-sm font-semibold text-offwhite"
              >
                Waiting for confirmation
                <Clock3 className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : isAdditionalCompanyReturn && companyCreationStatus !== "created" ? (
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-darknavy/45 px-5 text-sm font-semibold text-offwhite"
              >
                {companyCreationStatus === "failed" ? "Company not created" : "Waiting for company creation"}
                <Clock3 className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href={continueUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-darknavy px-5 text-sm font-semibold text-offwhite transition hover:bg-coralpink"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )
          ) : (
            <Link
              href={retryUrl}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-darknavy px-5 text-sm font-semibold text-offwhite transition hover:bg-coralpink"
            >
              Retry manual payment
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          <Link
            href={returnTo}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-darknavy/12 px-5 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
          >
            Back to billing
          </Link>
        </div>
      </section>
    </main>
  );
}

function ResultDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-darknavy/50">{label}</dt>
      <dd className="text-right font-semibold text-darknavy">{value}</dd>
    </div>
  );
}
