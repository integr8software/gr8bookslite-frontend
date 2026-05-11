"use client";

import { FormatOnboardingReportDateLabel } from "@/app/src/data/onboarding/OnboardingData";
import type {
  OnboardingFieldErrors,
  OnboardingReportYearBasis,
} from "@/app/src/data/onboarding/OnboardingTypes";

type OnboardingReportYearFieldProps = {
  basis: OnboardingReportYearBasis;
  startDate: string;
  endDate: string;
  errors: OnboardingFieldErrors;
  className?: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export function OnboardingReportYearField({
  basis,
  startDate,
  endDate,
  errors,
  className,
  onStartDateChange,
  onEndDateChange,
}: OnboardingReportYearFieldProps) {
  const startErrorId = "reportStartDate-error";
  const endErrorId = "reportEndDate-error";
  const hasStartError = Boolean(errors.reportStartDate?.length);
  const hasEndError = Boolean(errors.reportEndDate?.length);
  const startDateLabel = FormatOnboardingReportDateLabel(startDate);
  const endDateLabel = FormatOnboardingReportDateLabel(endDate);
  const reportRangeLabel =
    startDateLabel && endDateLabel ? `${startDateLabel} to ${endDateLabel}` : "";

  function getDateInputClassName(hasError: boolean) {
    return `h-14 w-full rounded-md border bg-white px-4 text-base text-darknavy outline-none transition focus:ring-4 ${hasError
      ? "border-coralpink focus:border-coralpink focus:ring-coralpink/20"
      : "border-darknavy/20 focus:border-skyblue focus:ring-skyblue/20"
      }`;
  }

  return (
    <div className={className}>
      <input type="hidden" name="reportYearBasis" value={basis} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="reportStartDate"
            className="mb-2 block text-sm font-medium text-darknavy"
          >
            Reporting Year Start Date
          </label>
          <input
            id="reportStartDate"
            name="reportStartDate"
            type="date"
            value={startDate}
            aria-invalid={hasStartError ? true : undefined}
            aria-describedby={hasStartError ? startErrorId : undefined}
            onChange={(event) => onStartDateChange(event.target.value)}
            className={getDateInputClassName(hasStartError)}
          />
          {hasStartError ? (
            <p id={startErrorId} className="mt-2 text-sm text-coralpink">
              {errors.reportStartDate?.[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="reportEndDate"
            className="mb-2 block text-sm font-medium text-darknavy"
          >
            Reporting Year End Date
          </label>
          <input
            id="reportEndDate"
            name="reportEndDate"
            type="date"
            value={endDate}
            aria-invalid={hasEndError ? true : undefined}
            aria-describedby={hasEndError ? endErrorId : undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            className={getDateInputClassName(hasEndError)}
          />
          {hasEndError ? (
            <p id={endErrorId} className="mt-2 text-sm text-coralpink">
              {errors.reportEndDate?.[0]}
            </p>
          ) : null}
        </div>
      </div>

      {reportRangeLabel ? (
        <p className="mt-3 text-sm font-medium text-darknavy/70">
          {reportRangeLabel}
        </p>
      ) : null}
    </div>
  );
}
