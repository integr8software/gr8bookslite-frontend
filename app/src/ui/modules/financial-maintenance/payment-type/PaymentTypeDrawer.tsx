"use client";

import {
  PaymentTypeDrawerFormId,
  PaymentTypeFieldClassName,
  PaymentTypeParentLabel,
  PaymentTypeTitle,
} from "@/app/src/constants/modules/financial-maintenance/payment-type/PaymentTypeConstants";
import { PaymentTypeOptions } from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import { usePaymentTypeFormPage } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentTypeFormPage";
import type {
  PaymentTypeActionMode,
  PaymentTypeClassification,
  PaymentTypeDrawerProps,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

const PaymentTypeActionCopy = {
  add: {
    description: "Create a payment type and choose how the voucher should collect payment details.",
    title: "Add Payment Type",
  },
  edit: {
    description: "Update the payment type name, category, and active status.",
    title: "Edit Payment Type",
  },
  view: {
    description: "Review the payment type setup.",
    title: "View Payment Type",
  },
} satisfies Record<PaymentTypeActionMode, { description: string; title: string }>;

export function PaymentTypeDrawer({ isOpen, mode, onClose, paymentType }: PaymentTypeDrawerProps) {
  return (
    <PaymentTypeDrawerPanel
      key={`${mode}-${paymentType?.id ?? "new"}`}
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
      paymentType={paymentType}
    />
  );
}

function PaymentTypeDrawerPanel({ isOpen, mode, onClose, paymentType }: PaymentTypeDrawerProps) {
  const page = usePaymentTypeFormPage({
    existingPaymentType: paymentType,
    isOpen,
    mode,
    onSaved: onClose,
  });
  const copy = PaymentTypeActionCopy[mode];

  function handleClose() {
    page.saveDraft();
    onClose();
  }

  function handleCancel() {
    page.discardDraft();
    onClose();
  }

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow={PaymentTypeParentLabel}
      formId={PaymentTypeDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isSubmitting}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onCancel={handleCancel}
      onClose={handleClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Payment Type" : "Save Payment Type"}
      title={copy.title}
    >
      <form id={PaymentTypeDrawerFormId} onSubmit={page.handleSubmit} className="grid gap-5 px-6 py-5">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">
            Payment Type Name <span className="text-coralpink">*</span>
          </span>
          <input
            value={page.values.paymentType}
            readOnly={page.isReadonly}
            onChange={(event) => page.handleInputChange("paymentType", event.target.value)}
            className={PaymentTypeFieldClassName}
          />
          {page.errors.paymentType ? <span className="text-xs font-semibold text-coralpink">{page.errors.paymentType}</span> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">
            Category <span className="text-coralpink">*</span>
          </span>
          <select
            value={page.values.type}
            disabled={page.isReadonly}
            onChange={(event) => page.handleInputChange("type", event.target.value as PaymentTypeClassification)}
            className={PaymentTypeFieldClassName}
          >
            <option value="">--Select Category--</option>
            {PaymentTypeOptions.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {typeOption}
              </option>
            ))}
          </select>
          {page.errors.type ? <span className="text-xs font-semibold text-coralpink">{page.errors.type}</span> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Description</span>
          <AppLimitedTextarea
            value={page.values.description}
            readOnly={page.isReadonly}
            onChange={(event) => page.handleInputChange("description", event.target.value)}
            className={`${PaymentTypeFieldClassName} min-h-24 py-3`}
            counterMode="used"
          />
          {page.errors.description ? <span className="text-xs font-semibold text-coralpink">{page.errors.description}</span> : null}
        </label>

        <label className="grid max-w-xs gap-2">
          <span className="text-sm font-semibold text-darknavy">
            Status <span className="text-coralpink">*</span>
          </span>
          <AppSwitch
            falseOption={MaintenanceInactiveStatusSwitchOption}
            value={page.values.status}
            readOnly={page.isReadonly}
            onChange={(status) => page.handleInputChange("status", status)}
            trueOption={MaintenanceActiveStatusSwitchOption}
          />
          {page.errors.status ? <span className="text-xs font-semibold text-coralpink">{page.errors.status}</span> : null}
        </label>
      </form>
    </ModuleDrawer>
  );
}
