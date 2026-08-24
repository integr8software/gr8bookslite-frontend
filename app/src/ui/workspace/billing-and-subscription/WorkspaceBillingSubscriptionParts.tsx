import { CreditCard, Lock, X, type LucideIcon } from "lucide-react";
import type { BillingPaymentFormErrors, BillingPaymentFormValues } from "@/app/src/data/billing/BillingTypes";
import {
  formatWorkspaceBillingCurrency,
  formatWorkspaceBillingPromotionExpiry,
  formatWorkspaceBillingPromotionValue,
} from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSubscriptionData";
import type {
  WorkspaceBillingAddOnQuote,
  WorkspaceBillingCompanyAccount,
  WorkspaceBillingPromotionOption,
} from "@/app/src/types/workspace/billing-and-subscription/WorkspaceBillingSubscriptionTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ModuleInfoTooltip as InfoTooltip } from "@/app/src/ui/shared/module/ModuleInfoTooltip";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

export const NewPayMongoCardPaymentMethodId = "new-paymongo-card";

type BillingDetailBadgeTone = "neutral" | "discount" | "percent";

type PriceLineBadge = {
  label: string;
  tone?: BillingDetailBadgeTone;
};

type PriceLineComparison = {
  discountPercent: number;
  regularValue: number;
};

export function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
      <Icon className="h-4 w-4 text-skyblue" aria-hidden="true" />
      {title}
    </div>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-darknavy/45">{label}</p>
      <p className="mt-1 font-semibold text-darknavy">{value}</p>
    </div>
  );
}

export function UsageMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-darknavy/10 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-darknavy/45">{label}</p>
      <p className="mt-1 text-lg font-semibold text-darknavy">{value}</p>
    </div>
  );
}

export function EmptyTableRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm font-medium text-darknavy/55">
        {message}
      </td>
    </tr>
  );
}

export function getAddOnAmount(account: WorkspaceBillingCompanyAccount, key: WorkspaceBillingAddOnQuote["key"]) {
  return account.addOns.find((addOn) => addOn.key === key)?.billingAmount ?? 0;
}

export function PriceLine({
  badges,
  comparison,
  helper,
  label,
  tone,
  tooltip,
  value,
}: {
  badges?: PriceLineBadge[];
  comparison?: PriceLineComparison;
  helper?: string;
  label: string;
  tone?: "discount" | "strong";
  tooltip?: string;
  value: number;
}) {
  const normalizedValue = Object.is(value, -0) ? 0 : value;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="min-w-0 text-darknavy/58">
        <span className="inline-flex items-center gap-1">
          {label}
          <InfoTooltip label={`${label} details`} title={tooltip} />
        </span>
        {helper ? <span className="mt-0.5 block text-xs text-darknavy/42">{helper}</span> : null}
        {badges?.length ? (
          <span className="mt-1 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <BillingDetailBadge key={`${badge.tone ?? "neutral"}-${badge.label}`} label={badge.label} tone={badge.tone} />
            ))}
          </span>
        ) : null}
      </dt>
      <dd className="flex shrink-0 items-center gap-2">
        {comparison ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            {comparison.discountPercent}% off
          </span>
        ) : null}
        <span className="text-right">
          {comparison ? (
            <span className="block text-xs font-semibold text-darknavy/38 line-through">
              {formatWorkspaceBillingCurrency(comparison.regularValue)}
            </span>
          ) : null}
          <span
            className={joinClasses(
              "block font-semibold text-darknavy",
              tone === "discount" && value < 0 && "text-emerald-600",
              tone === "strong" && "text-base",
            )}
          >
            {formatWorkspaceBillingCurrency(normalizedValue)}
          </span>
        </span>
      </dd>
    </div>
  );
}

export function BillingDetailBadge({ label, tone = "neutral" }: { label: string; tone?: BillingDetailBadgeTone }) {
  return (
    <span
      className={joinClasses("inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-semibold ring-1", getBillingDetailBadgeClassName(tone))}
    >
      {label}
    </span>
  );
}

export function AddOnDetail({ addOn }: { addOn: WorkspaceBillingAddOnQuote }) {
  return (
    <div className="rounded-md border border-darknavy/10 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1 text-sm font-semibold text-darknavy">
          {addOn.label}
          <InfoTooltip label={`${addOn.label} reduction details`} title={addOn.reductionTooltip} />
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {addOn.reductionAmount > 0 ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              {addOn.reductionPercent}% off
            </span>
          ) : null}
          <div className="text-right">
            {addOn.reductionAmount > 0 ? (
              <p className="text-xs font-semibold text-darknavy/38 line-through">
                {formatWorkspaceBillingCurrency(addOn.grossBillingAmount)}
              </p>
            ) : null}
            <p className="text-sm font-semibold text-darknavy">{formatWorkspaceBillingCurrency(addOn.billingAmount)}</p>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs leading-5 text-darknavy/55">
        {addOn.includedCount} included, {addOn.actualCount} active, {addOn.extraCount} add-on at{" "}
        {formatWorkspaceBillingCurrency(addOn.monthlyRate)} monthly
      </p>
    </div>
  );
}

export function AppliedPromotionDetail({
  promotion,
  onClearPromotion,
}: {
  promotion: WorkspaceBillingPromotionOption | null;
  onClearPromotion: () => void;
}) {
  if (!promotion) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-md bg-offwhite px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-darknavy">{promotion.code}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <BillingDetailBadge label={promotion.type} />
          <BillingDetailBadge label={formatWorkspaceBillingPromotionValue(promotion)} tone={getPromotionValueBadgeTone(promotion)} />
        </div>
      </div>
      <button
        type="button"
        onClick={onClearPromotion}
        aria-label={`Clear ${promotion.code}`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-coralpink/30 hover:text-coralpink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/15"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function PromotionDropdown({
  account,
  onApplyPromotion,
  onClearPromotion,
}: {
  account: WorkspaceBillingCompanyAccount;
  onApplyPromotion: (assignmentId: string) => void;
  onClearPromotion: () => void;
}) {
  const options = createPromotionDropdownOptions(account.possessedPromotions);
  const selectedPromotionId = account.appliedPromotion?.applicationMode === "Possession" ? account.appliedPromotion.assignmentId : "";

  return (
    <AppAdvancedDropdown
      emptyMessage="No voucher or coupon available."
      isClearable
      menuPortal={false}
      options={options}
      placeholder="Select voucher or coupon"
      searchPlaceholder="Search voucher or coupon"
      showSelectedDetails
      value={selectedPromotionId}
      onChange={(value) => {
        const nextValue = Array.isArray(value) ? (value[0] ?? "") : value;

        if (nextValue) {
          onApplyPromotion(nextValue);
          return;
        }

        onClearPromotion();
      }}
    />
  );
}

export function PromotionCodeForm({
  error,
  value,
  onApplyPromotionCode,
  onChange,
}: {
  error?: string;
  value: string;
  onApplyPromotionCode: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <form
      className="grid gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        onApplyPromotionCode();
      }}
    >
      <label className="block">
        <span className="sr-only">Promo code</span>
        <span className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter promo code"
            className={joinClasses(
              "h-10 min-w-0 flex-1 rounded-md border bg-white px-3 text-sm font-semibold uppercase text-darknavy shadow-sm outline-none transition placeholder:normal-case placeholder:font-medium placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15",
              error ? "border-coralpink/50" : "border-darknavy/10",
            )}
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-darknavy px-3 text-sm font-semibold text-offwhite shadow-sm transition hover:bg-coralpink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/20"
          >
            Apply
          </button>
        </span>
      </label>
      {error ? <p className="text-xs font-semibold text-coralpink">{error}</p> : null}
    </form>
  );
}

export function BillingPaymentCardForm({
  errors,
  values,
  onChange,
}: {
  errors: BillingPaymentFormErrors;
  values: BillingPaymentFormValues;
  onChange: (field: keyof BillingPaymentFormValues, value: string) => void;
}) {
  const fieldClassName =
    "h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/35 placeholder:font-normal focus:border-skyblue focus:ring-4 focus:ring-skyblue/15";

  return (
    <div className="rounded-lg border border-darknavy/10 bg-offwhite/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-skyblue" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wider text-darknavy/70">Card Details (PayMongo)</p>
        <span className="ml-auto inline-flex items-center gap-1 text-[0.7rem] text-darknavy/45">
          <Lock className="h-3 w-3" /> Secure tokenization
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <BillingFormField label="Cardholder Name" error={errors.cardholderName?.[0]} required>
          <input
            name="cardholderName"
            value={values.cardholderName}
            onChange={(e) => onChange("cardholderName", e.target.value)}
            placeholder="John Doe"
            autoComplete="cc-name"
            className={fieldClassName}
          />
        </BillingFormField>

        <BillingFormField label="Billing Email" error={errors.billingEmail?.[0]} required>
          <input
            name="billingEmail"
            type="email"
            value={values.billingEmail}
            onChange={(e) => onChange("billingEmail", e.target.value)}
            placeholder="billing@company.com"
            autoComplete="email"
            className={fieldClassName}
          />
        </BillingFormField>

        <div className="sm:col-span-2">
          <BillingFormField label="Card Number" error={errors.cardNumber?.[0]} required>
            <input
              name="cardNumber"
              value={values.cardNumber}
              onChange={(e) => onChange("cardNumber", e.target.value)}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              maxLength={23}
              autoComplete="cc-number"
              className={fieldClassName}
            />
          </BillingFormField>
        </div>

        <BillingFormField label="Expiry Month" error={errors.expiryMonth?.[0]} required>
          <input
            name="expiryMonth"
            value={values.expiryMonth}
            onChange={(e) => onChange("expiryMonth", e.target.value)}
            placeholder="MM"
            inputMode="numeric"
            maxLength={2}
            autoComplete="cc-exp-month"
            className={fieldClassName}
          />
        </BillingFormField>

        <BillingFormField label="Expiry Year" error={errors.expiryYear?.[0]} required>
          <input
            name="expiryYear"
            value={values.expiryYear}
            onChange={(e) => onChange("expiryYear", e.target.value)}
            placeholder="YYYY"
            inputMode="numeric"
            maxLength={4}
            autoComplete="cc-exp-year"
            className={fieldClassName}
          />
        </BillingFormField>

        <BillingFormField label="CVC" error={errors.cvc?.[0]} required>
          <input
            name="cvc"
            value={values.cvc}
            onChange={(e) => onChange("cvc", e.target.value)}
            placeholder="123"
            inputMode="numeric"
            maxLength={4}
            autoComplete="cc-csc"
            className={fieldClassName}
          />
        </BillingFormField>

        <BillingFormField label="Contact Number" error={errors.contactNumber?.[0]} required>
          <input
            name="contactNumber"
            value={values.contactNumber}
            onChange={(e) => onChange("contactNumber", e.target.value)}
            placeholder="+63 912 345 6789"
            autoComplete="tel"
            className={fieldClassName}
          />
        </BillingFormField>

        <div className="sm:col-span-2">
          <BillingFormField label="Billing Address" error={errors.billingAddress?.[0]} required>
            <input
              name="billingAddress"
              value={values.billingAddress}
              onChange={(e) => onChange("billingAddress", e.target.value)}
              placeholder="123 Business St, Bonifacio Global City, Taguig"
              autoComplete="street-address"
              className={fieldClassName}
            />
          </BillingFormField>
        </div>
      </div>
    </div>
  );
}

function BillingFormField({
  children,
  error,
  label,
  required = false,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-darknavy/70">
        <span>
          {label}
          <ModuleFieldRequiredMark className="ml-0.5 text-coralpink" fallbackRequired={required} label={label} />
        </span>
      </span>
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-coralpink">{error}</p> : null}
    </label>
  );
}

export function getPromotionValueBadgeTone(promotion: Pick<WorkspaceBillingPromotionOption, "discountKind">): BillingDetailBadgeTone {
  return promotion.discountKind === "Percent" ? "percent" : "discount";
}

function createPromotionDropdownOptions(promotions: WorkspaceBillingPromotionOption[]): AppAdvancedDropdownOption[] {
  return promotions.map((promotion) => ({
    description: promotion.description,
    label: `${promotion.type} - ${formatWorkspaceBillingPromotionValue(promotion)} - saves ${formatWorkspaceBillingCurrency(
      promotion.discountAmount,
    )} - ${formatWorkspaceBillingPromotionExpiry(promotion.expiresAt)}`,
    name: promotion.code,
    value: promotion.assignmentId,
  }));
}

function getBillingDetailBadgeClassName(tone: BillingDetailBadgeTone) {
  switch (tone) {
    case "discount":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "percent":
      return "bg-citron/40 text-darknavy ring-citron/60";
    case "neutral":
      return "bg-offwhite text-darknavy/70 ring-darknavy/10";
  }
}

export function getTrialStateClassName(daysRemaining: number | null) {
  if (daysRemaining !== null && daysRemaining <= 3) {
    return "bg-coralpink/12 text-coralpink ring-coralpink/20";
  }

  if (daysRemaining !== null && daysRemaining <= 7) {
    return "bg-citron/45 text-darknavy ring-citron/60";
  }

  if (daysRemaining !== null && daysRemaining <= 15) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  return "bg-skyblue/14 text-darknavy ring-skyblue/25";
}

export function getCompanyStatusClassName(status: WorkspaceBillingCompanyAccount["status"]) {
  switch (status) {
    case "Active":
      return "bg-citron/35 text-darknavy";
    case "Trial":
      return "bg-skyblue/18 text-darknavy";
    case "Past Due":
      return "bg-coralpink/15 text-coralpink";
    case "Scheduled":
      return "bg-darknavy/8 text-darknavy/70";
  }
}

export function getRenewalStateClassName(state: WorkspaceBillingCompanyAccount["renewalState"]) {
  switch (state) {
    case "Overdue":
      return "bg-coralpink/12 text-coralpink ring-coralpink/20";
    case "Due today":
      return "bg-citron/45 text-darknavy ring-citron/60";
    case "Due soon":
      return "bg-skyblue/14 text-darknavy ring-skyblue/25";
    case "Scheduled":
      return "bg-offwhite text-darknavy/70 ring-darknavy/10";
  }
}
