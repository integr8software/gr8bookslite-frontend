"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { WorkspaceCompaniesHref, getWorkspaceCompanyHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
  InitialWorkspaceCompanyFormValues,
  createWorkspaceCompanyFormValues,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyData";
import { SavePendingAdditionalCompanyManualCheckoutDraft } from "@/app/src/data/workspace/companies/WorkspaceCompanyPendingManualCheckoutData";
import { GetSyncedReportEndDate, GetSyncedReportStartDate } from "@/app/src/data/onboarding/OnboardingData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { CreatePaymongoCardPaymentMethod } from "@/app/src/services/billing/PaymongoClient";
import { CreateManualCheckout } from "@/app/src/services/billing/ManualBillingApi";
import {
  useWorkspaceCompanyManagementStore,
  useWorkspaceCompanyRecord,
  useWorkspaceCompanyRouteParams,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import { useOnboardingReferenceData } from "@/app/src/hooks/onboarding/useOnboardingReferenceData";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import { validateWorkspaceCompanyForm } from "@/app/src/validations/workspace/companies/WorkspaceCompanyValidation";
import type {
  WorkspaceCompanyFormErrors,
  WorkspaceCompanyFormMode,
  WorkspaceCompanyFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

function getDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string) {
  return getDigitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

const CompanyNameTakenMessage = "Company name is already taken.";
const AutoBillingMode = "AUTO";
const ManualBillingMode = "MANUAL";
const NewPayMongoCardPaymentMethodId = "new-paymongo-card";

function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getCompanyDisplayName(values: WorkspaceCompanyFormValues) {
  if (values.taxpayerType === "individual") {
    return [values.firstName, values.middleName, values.lastName]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");
  }

  return values.companyName;
}

function isCompanyNameTakenError(error: unknown) {
  return error instanceof ApiClientError && error.status === 409 && error.message === CompanyNameTakenMessage;
}

export function useWorkspaceCompanyFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useWorkspaceCompanyRouteParams();
  const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
  const addCompany = useWorkspaceCompanyManagementStore((state) => state.addCompany);
  const updateCompany = useWorkspaceCompanyManagementStore((state) => state.updateCompany);
  const isMutating = useWorkspaceCompanyManagementStore((state) => state.isMutating);
  const isLoading = useWorkspaceCompanyManagementStore((state) => state.isLoading);
  const companyQuery = useWorkspaceCompanyRecord(params.companyId);
  const referenceData = useOnboardingReferenceData();
  const baseCurrencyWasManuallySelectedRef = useRef(false);
  const mode: WorkspaceCompanyFormMode = pathname.includes("/edit") ? "edit" : "add";
  const existingCompany = companies.find((company) => company.id === params.companyId) ?? companyQuery.data;
  const baseValues = useMemo(
    () => (mode === "edit" && existingCompany ? createWorkspaceCompanyFormValues(existingCompany) : InitialWorkspaceCompanyFormValues),
    [existingCompany, mode],
  );
  const [draftValues, setDraftValues] = useState<WorkspaceCompanyFormValues | null>(null);
  const values = draftValues ?? baseValues;
  const [errors, setErrors] = useState<WorkspaceCompanyFormErrors>({});
  const companyHref = existingCompany ? getWorkspaceCompanyHref(existingCompany.id) : WorkspaceCompaniesHref;
  const cancelHref = mode === "edit" ? companyHref : WorkspaceCompaniesHref;

  function updateField(field: keyof WorkspaceCompanyFormValues, value: string) {
    if (field === "countryCode") {
      const country = referenceData.countries.find((record) => record.code === value);

      setDraftValues((current) => ({
        ...(current ?? baseValues),
        countryCode: value,
        ...(baseCurrencyWasManuallySelectedRef.current ? {} : { baseCurrencyCode: country?.defaultCurrencyCode ?? "" }),
      }));
      setErrors((current) => ({
        ...current,
        countryCode: undefined,
        baseCurrencyCode: undefined,
      }));
      return;
    }

    if (field === "baseCurrencyCode") {
      baseCurrencyWasManuallySelectedRef.current = true;
    }

    if (field === "reportStartDate") {
      setDraftValues((current) => ({
        ...(current ?? baseValues),
        reportStartDate: value,
        reportEndDate: GetSyncedReportEndDate(value),
      }));
      setErrors((current) => ({
        ...current,
        reportStartDate: undefined,
        reportEndDate: undefined,
      }));
      return;
    }

    if (field === "reportEndDate") {
      setDraftValues((current) => ({
        ...(current ?? baseValues),
        reportStartDate: GetSyncedReportStartDate(value),
        reportEndDate: value,
      }));
      setErrors((current) => ({
        ...current,
        reportStartDate: undefined,
        reportEndDate: undefined,
      }));
      return;
    }

    if (field === "billingCardNumber") {
      setDraftValues((current) => ({
        ...(current ?? baseValues),
        billingCardNumber: formatCardNumber(value),
      }));
      setErrors((current) => ({ ...current, billingCardNumber: undefined }));
      return;
    }

    if (field === "billingExpiryMonth") {
      setDraftValues((current) => ({
        ...(current ?? baseValues),
        billingExpiryMonth: getDigitsOnly(value).slice(0, 2),
      }));
      setErrors((current) => ({ ...current, billingExpiryMonth: undefined }));
      return;
    }

    if (field === "billingExpiryYear") {
      setDraftValues((current) => ({
        ...(current ?? baseValues),
        billingExpiryYear: getDigitsOnly(value).slice(0, 4),
      }));
      setErrors((current) => ({ ...current, billingExpiryYear: undefined }));
      return;
    }

    if (field === "billingCvc") {
      setDraftValues((current) => ({
        ...(current ?? baseValues),
        billingCvc: getDigitsOnly(value).slice(0, 4),
      }));
      setErrors((current) => ({ ...current, billingCvc: undefined }));
      return;
    }

    setDraftValues((current) => ({
      ...(current ?? baseValues),
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateLogoFile(file: File | null) {
    setDraftValues((current) => ({
      ...(current ?? baseValues),
      logoFile: file,
    }));
    setErrors((current) => ({ ...current, logoName: undefined }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = event.target.name === "contactNumber" ? FormatPhilippineContactNumber(event.target.value) : event.target.value;

    updateField(event.target.name as keyof WorkspaceCompanyFormValues, value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCompany()) {
      return;
    }

    void saveCompany();
  }

  function validateCompany() {
    const nextErrors = validateWorkspaceCompanyForm(values, {
      requireBillingPlan: mode === "add",
    });
    const submittedName = normalizeCompanyName(getCompanyDisplayName(values));
    const existingCompanyWithName = companies.find(
      (company) => normalizeCompanyName(company.name) === submittedName && company.id !== existingCompany?.id,
    );

    if (submittedName && values.taxpayerType === "non-individual" && existingCompanyWithName) {
      nextErrors.companyName = CompanyNameTakenMessage;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  }

  async function saveCompany() {
    if (mode === "edit" && existingCompany) {
      try {
        await updateCompany(existingCompany.id, values);
        router.push(companyHref);
      } catch (error) {
        if (isCompanyNameTakenError(error)) {
          setErrors((current) => ({
            ...current,
            companyName: CompanyNameTakenMessage,
          }));
        }
        // The mutation owns the toast message; keep the user on the form.
      }
      return;
    }

    let didCreatePaymentMethod = false;

    try {
      if (values.billingMode === ManualBillingMode) {
        const checkout = await CreateManualCheckout({
          billingCycle: values.billingCycle,
          companyName: getCompanyDisplayName(values),
          planCode: values.billingPlanCode,
          planName: values.billingPlanCode,
          purpose: "ADDITIONAL_COMPANY",
          returnTo: WorkspaceCompaniesHref,
        });

        SavePendingAdditionalCompanyManualCheckoutDraft({
          paymentAttemptId: checkout.paymentAttemptId,
          values,
        });
        toast.success("Opening PayMongo hosted checkout.");
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      const valuesToSave = await createTokenizedCompanyValues(values);
      didCreatePaymentMethod = values.billingPaymentMethodId === NewPayMongoCardPaymentMethodId;

      await addCompany(valuesToSave);
      router.push(WorkspaceCompaniesHref);
    } catch (error) {
      if (isCompanyNameTakenError(error)) {
        setErrors((current) => ({
          ...current,
          companyName: CompanyNameTakenMessage,
        }));
        return;
      }

      if (didCreatePaymentMethod) {
        return;
      }

      if (values.billingPaymentMethodId === NewPayMongoCardPaymentMethodId) {
        toast.error(error instanceof Error ? error.message : "We could not create the PayMongo payment method right now.");
      }
    }
  }

  return {
    cancelHref,
    countries: referenceData.countries,
    currencies: referenceData.currencies,
    errors,
    existingCompany,
    handleInputChange,
    handleSubmit,
    isLoading:
      isLoading ||
      (mode === "edit" && referenceData.isLoading) ||
      Boolean(mode === "edit" && params.companyId && !existingCompany && (companyQuery.isLoading || companyQuery.isFetching)),
    isReferenceLoading: referenceData.isLoading,
    isMutating,
    mode,
    needsRecord: mode === "edit",
    saveCompany,
    updateField,
    updateLogoFile,
    validateCompany,
    values,
  };
}

async function createTokenizedCompanyValues(values: WorkspaceCompanyFormValues): Promise<WorkspaceCompanyFormValues> {
  if (values.billingMode !== AutoBillingMode || values.billingPaymentMethodId !== NewPayMongoCardPaymentMethodId) {
    return values;
  }

  const paymentMethod = await CreatePaymongoCardPaymentMethod({
    cardholderName: values.billingCardholderName.trim(),
    billingEmail: (values.billingEmail || values.email).trim(),
    cardNumber: values.billingCardNumber.trim(),
    expiryMonth: values.billingExpiryMonth.trim(),
    expiryYear: values.billingExpiryYear.trim(),
    cvc: values.billingCvc.trim(),
    billingAddress: values.billingAddress.trim(),
    contactNumber: values.contactNumber.trim(),
  });

  return {
    ...values,
    billingPaymentMethodId: paymentMethod.paymentMethodId,
  };
}
