"use client";

import {
  PaymentTypeDrawerFormId,
  PaymentTypeParentLabel,
} from "@/app/src/constants/modules/financial-maintenance/payment-type/PaymentTypeConstants";
import { usePaymentTypeFormPage } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentTypeFormPage";
import type {
  PaymentTypeActionMode,
  PaymentTypeDrawerProps,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { PaymentTypeFields } from "@/app/src/ui/modules/financial-maintenance/payment-type/PaymentTypeFields";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

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
      <form id={PaymentTypeDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <PaymentTypeFields
          errors={page.errors}
          isReadonly={page.isReadonly}
          onInputChange={page.handleInputChange}
          values={page.values}
        />
      </form>
    </ModuleDrawer>
  );
}
