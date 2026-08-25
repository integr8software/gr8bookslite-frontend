import { PaymentTypeOptions } from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import type {
  PaymentTypeFormErrors,
  PaymentTypeFormValues,
  PaymentTypeStatus,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  paymentTypeAccentPrimaryButtonClassName,
  paymentTypeFieldClassName,
} from "@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog.constants";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

type PaymentTypeFormMode = "add" | "edit" | "view";

export function PaymentTypeFormView({
  draft,
  errors,
  formError,
  isMutating,
  mode,
  onBack,
  onDraftFieldChange,
  onSave,
}: {
  draft: PaymentTypeFormValues;
  errors: PaymentTypeFormErrors;
  formError: string;
  isMutating: boolean;
  mode: PaymentTypeFormMode;
  onBack: () => void;
  onDraftFieldChange: <TKey extends keyof PaymentTypeFormValues>(field: TKey, value: PaymentTypeFormValues[TKey]) => void;
  onSave: () => void;
}) {
  const isReadonly = mode === "view";
  const nameInputId = "payment-type-dialog-name";
  const descriptionInputId = "payment-type-dialog-description";
  const sortOrderInputId = "payment-type-dialog-sort-order";
  const typeInputId = "payment-type-dialog-category";
  const statusInputId = "payment-type-dialog-status";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor={nameInputId} className="text-sm font-semibold text-darknavy">
              Name
              <ModuleFieldRequiredMark fallbackRequired label="Name" />
            </label>
            <input
              id={nameInputId}
              value={draft.paymentType}
              readOnly={isReadonly}
              onChange={(event) => onDraftFieldChange("paymentType", event.target.value)}
              aria-invalid={Boolean(errors.paymentType)}
              aria-describedby={errors.paymentType ? `${nameInputId}-error` : undefined}
              className={paymentTypeFieldClassName}
            />
            {errors.paymentType ? (
              <span id={`${nameInputId}-error`} className="text-xs font-semibold text-coralpink">
                {errors.paymentType}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor={sortOrderInputId} className="text-sm font-semibold text-darknavy">
              Order
              <ModuleFieldRequiredMark fallbackRequired label="Order" />
            </label>
            <input
              id={sortOrderInputId}
              type="number"
              min={0}
              step={1}
              value={draft.sortOrder}
              readOnly={isReadonly}
              onChange={(event) => onDraftFieldChange("sortOrder", event.target.value)}
              aria-invalid={Boolean(errors.sortOrder)}
              aria-describedby={errors.sortOrder ? `${sortOrderInputId}-error` : undefined}
              className={paymentTypeFieldClassName}
            />
            {errors.sortOrder ? (
              <span id={`${sortOrderInputId}-error`} className="text-xs font-semibold text-coralpink">
                {errors.sortOrder}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor={descriptionInputId} className="text-sm font-semibold text-darknavy">
              Description
            </label>
            <AppLimitedTextarea
              id={descriptionInputId}
              value={draft.description}
              readOnly={isReadonly}
              onChange={(event) => onDraftFieldChange("description", event.target.value)}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? `${descriptionInputId}-error` : undefined}
              className={`${paymentTypeFieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
            {errors.description ? (
              <span id={`${descriptionInputId}-error`} className="text-xs font-semibold text-coralpink">
                {errors.description}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor={typeInputId} className="text-sm font-semibold text-darknavy">
              Category
              <ModuleFieldRequiredMark fallbackRequired label="Category" />
            </label>
            <select
              id={typeInputId}
              value={draft.type}
              disabled={isReadonly}
              onChange={(event) => onDraftFieldChange("type", event.target.value as PaymentTypeFormValues["type"])}
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? `${typeInputId}-error` : undefined}
              className={paymentTypeFieldClassName}
            >
              <option value="">Select category</option>
              {PaymentTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type ? (
              <span id={`${typeInputId}-error`} className="text-xs font-semibold text-coralpink">
                {errors.type}
              </span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor={statusInputId} className="text-sm font-semibold text-darknavy">
              Status
              <ModuleFieldRequiredMark fallbackRequired label="Status" />
            </label>
            <select
              id={statusInputId}
              value={draft.status}
              disabled={isReadonly}
              onChange={(event) => onDraftFieldChange("status", event.target.value as PaymentTypeStatus)}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? `${statusInputId}-error` : undefined}
              className={paymentTypeFieldClassName}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status ? (
              <span id={`${statusInputId}-error`} className="text-xs font-semibold text-coralpink">
                {errors.status}
              </span>
            ) : null}
          </div>
          {formError ? <p className="rounded-md bg-coralpink/10 px-3 py-2 text-sm font-semibold text-coralpink">{formError}</p> : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-darknavy/10 px-5 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          {isReadonly ? (
            <button type="button" onClick={onBack} className={`${paymentTypeAccentPrimaryButtonClassName} h-10 w-full sm:w-auto`}>
              Back
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isMutating}
                onClick={onSave}
                className={`${paymentTypeAccentPrimaryButtonClassName} h-10 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 sm:w-auto"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
