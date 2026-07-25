import { z } from "zod";
import {
  PartyClassificationOptions,
  PartyInformationStatusOptions,
  PartyTypeOptions,
  PurchaseTaxClassificationOptions,
  VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { isAtcCodeLike } from "@/app/src/data/shared/tax/AtcCode";
import type {
  PartyInformationFormErrors,
  PartyInformationFormValues,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

const PhilippineContactNumberPattern = /^\+63 \d{3} \d{3} \d{4}$/;
const PhilippineTinPattern = /^\d{3}-\d{3}-\d{3}-\d{3}$/;

export const PartyInformationRequiredFieldsToastMessage =
  "Please fill up the required party fields.";

const PartyInformationAddressSchema = z.object({
  id: z.string().trim().min(1),
  addressName: z.string().trim().min(1, "Enter an address name."),
  addressLine1: z.string().trim(),
  addressLine2: z.string().trim(),
  barangay: z.string().trim(),
  barangayCode: z.string().trim(),
  cityMunicipality: z.string().trim(),
  cityMunicipalityCode: z.string().trim(),
  isBilling: z.boolean(),
  isBuilding: z.boolean().optional().default(false),
  isDefault: z.boolean(),
  isDelivery: z.boolean(),
  isForeign: z.boolean().optional().default(false),
  isHome: z.boolean().optional().default(false),
  province: z.string().trim(),
  provinceCode: z.string().trim(),
  region: z.string().trim(),
  regionCode: z.string().trim(),
});

export const PartyInformationFormSchema = z
  .object({
    partyCodeNo: z.string().trim().min(1, "Party code is required."),
    classification: z.enum(PartyClassificationOptions, {
      error: "Select a party classification first.",
    }),
    partyTypes: z.array(z.enum(PartyTypeOptions)).min(1, "Select at least one party type."),
    status: z.enum(PartyInformationStatusOptions, {
      error: "Select a status.",
    }),
    partyName: z.string().trim(),
    tradeName: z.string().trim(),
    firstName: z.string().trim(),
    middleName: z.string().trim(),
    lastName: z.string().trim(),
    suffixName: z.string().trim(),
    honorific: z.string().trim(),
    gender: z.string().trim(),
    civilStatus: z.string().trim(),
    nationality: z.string().trim(),
    memberRegistrationDate: z
      .string()
      .trim()
      .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: "Enter a valid member registration date.",
      }),
    address: z.any().optional(),
    addresses: z
      .array(PartyInformationAddressSchema)
      .min(1, "Add at least one address.")
      .max(3, "Add only one address per address type."),
    activeAddressId: z.string().trim(),
    defaultReceivableAccount: z.string().trim(),
    customerAdvanceAccount: z.string().trim(),
    defaultPayableAccount: z.string().trim(),
    vendorAdvanceAccount: z.string().trim(),
    employeeAdvanceAccount: z.string().trim(),
    employeePayableAccount: z.string().trim(),
    termId: z.string().trim(),
    termName: z.string().trim(),
    tin: z
      .string()
      .trim()
      .refine((value) => !value || PhilippineTinPattern.test(value), {
        message: "Enter a valid TIN in the format 000-000-000-000.",
      }),
    vatRegistrationType: z.union([z.literal(""), z.enum(VatRegistrationTypeOptions)]),
    defaultPurchaseTaxClassification: z.union([
      z.literal(""),
      z.enum(PurchaseTaxClassificationOptions),
    ]),
    atcCode: z.string().trim(),
    email: z
      .string()
      .trim()
      .refine((value) => !value || isValidEmail(value), {
        message: "Enter a valid email address.",
      }),
    contactNo: z
      .string()
      .trim()
      .refine((value) => !value || isValidContactNo(value), {
        message: "Enter a valid mobile number in the format.",
      }),
    landline: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.classification === "Non-Individual" && !values.partyName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Party name is required.",
        path: ["partyName"],
      });
    }

    if (values.classification === "Individual") {
      if (!values.firstName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "First name is required.",
          path: ["firstName"],
        });
      }

      if (!values.lastName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last name is required.",
          path: ["lastName"],
        });
      }
    }

    if (values.atcCode && !isAtcCodeLike(values.atcCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a valid BIR ATC code from the list.",
        path: ["atcCode"],
      });
    }

    const defaultAddressCount = values.addresses.filter((address) => address.isDefault).length;

    if (defaultAddressCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Set exactly one default address.",
        path: ["addresses"],
      });
    }

    if (
      values.classification === "Non-Individual" &&
      (values.partyTypes.includes("Employee") || values.partyTypes.includes("Member"))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee and Member are only available for individual parties.",
        path: ["partyTypes"],
      });
    }

    if (values.partyTypes.includes("Member")) {
      if (!values.gender.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Gender is required for members.",
          path: ["gender"],
        });
      }

      if (!values.civilStatus.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Civil status is required for members.",
          path: ["civilStatus"],
        });
      }

      if (!values.nationality.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nationality is required for members.",
          path: ["nationality"],
        });
      }

      if (!values.memberRegistrationDate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Member registration date is required.",
          path: ["memberRegistrationDate"],
        });
      }
    }

    const requiredAccountingFields = [
      {
        enabled: values.partyTypes.includes("Customer"),
        field: "defaultReceivableAccount",
        message: "Default receivable account is required.",
      },
      {
        enabled: values.partyTypes.includes("Customer"),
        field: "customerAdvanceAccount",
        message: "Default customer advance account is required.",
      },
      {
        enabled: values.partyTypes.includes("Vendor"),
        field: "defaultPayableAccount",
        message: "Default payable account is required.",
      },
      {
        enabled: values.partyTypes.includes("Vendor"),
        field: "vendorAdvanceAccount",
        message: "Default vendor advance account is required.",
      },
      {
        enabled: values.partyTypes.includes("Employee"),
        field: "employeeAdvanceAccount",
        message: "Default employee advance account is required.",
      },
      {
        enabled: values.partyTypes.includes("Employee"),
        field: "employeePayableAccount",
        message: "Default employee payable account is required.",
      },
    ] as const;

    requiredAccountingFields.forEach((accountField) => {
      if (accountField.enabled && !values[accountField.field].trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: accountField.message,
          path: [accountField.field],
        });
      }
    });

    const addressRoleChecks = [
      {
        enabled: values.partyTypes.includes("Customer") || values.partyTypes.includes("Vendor"),
        field: "isBilling",
        label: "billing",
      },
      {
        enabled: values.partyTypes.includes("Customer"),
        field: "isDelivery",
        label: "delivery",
      },
      {
        enabled: values.partyTypes.includes("Employee") || values.partyTypes.includes("Member"),
        field: "isHome",
        label: "home",
      },
    ] as const;

    addressRoleChecks.forEach((role) => {
      const selectedCount = values.addresses.filter((address) =>
        Boolean(address[role.field]),
      ).length;

      if (selectedCount > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Select only one ${role.label} address.`,
          path: ["addresses"],
        });
      }

      if (role.enabled && selectedCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Complete the ${role.label} address.`,
          path: ["addresses"],
        });
      }

      if (!role.enabled && selectedCount > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Remove the ${role.label} address role for this party type.`,
          path: ["addresses"],
        });
      }
    });

    values.addresses.forEach((address, index) => {
      if (address.isForeign) {
        if (!address.addressLine1.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter the complete foreign address.",
            path: ["addresses", index, "addressLine1"],
          });
        }

        return;
      }

      if (!address.regionCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a region.",
          path: ["addresses", index, "regionCode"],
        });
      }

      if (!address.provinceCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a province.",
          path: ["addresses", index, "provinceCode"],
        });
      }

      if (!address.cityMunicipalityCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a city or municipality.",
          path: ["addresses", index, "cityMunicipalityCode"],
        });
      }

      if (!address.barangayCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a barangay.",
          path: ["addresses", index, "barangayCode"],
        });
      }
    });
  });

export function validatePartyInformationForm(
  values: PartyInformationFormValues,
): PartyInformationFormErrors {
  const parsed = PartyInformationFormSchema.safeParse(values);

  if (parsed.success) {
    return {};
  }

  const errors: PartyInformationFormErrors = {};

  for (const issue of parsed.error.issues) {
    const field = issue.path[issue.path.length - 1];

    if (field === "atcCode" && !errors.atcCode) {
      errors.atcCode = issue.message;
    } else if (field === "gender" && !errors.gender) {
      errors.gender = issue.message;
    } else if (field === "civilStatus" && !errors.civilStatus) {
      errors.civilStatus = issue.message;
    } else if (field === "nationality" && !errors.nationality) {
      errors.nationality = issue.message;
    } else if (field === "classification" && !errors.classification) {
      errors.classification = issue.message;
    } else if (field === "contactNo" && !errors.contactNo) {
      errors.contactNo = issue.message;
    } else if (field === "landline" && !errors.landline) {
      errors.landline = issue.message;
    } else if (field === "memberRegistrationDate" && !errors.memberRegistrationDate) {
      errors.memberRegistrationDate = issue.message;
    } else if (field === "email" && !errors.email) {
      errors.email = issue.message;
    } else if (field === "firstName" && !errors.firstName) {
      errors.firstName = issue.message;
    } else if (field === "lastName" && !errors.lastName) {
      errors.lastName = issue.message;
    } else if (field === "addresses" && !errors.addresses) {
      errors.addresses = issue.message;
    } else if (field === "addressLine1" && !errors.addressLine1) {
      errors.addressLine1 = issue.message;
    } else if (field === "addressLine2" && !errors.addressLine2) {
      errors.addressLine2 = issue.message;
    } else if (field === "partyCodeNo" && !errors.partyCodeNo) {
      errors.partyCodeNo = issue.message;
    } else if (field === "partyName" && !errors.partyName) {
      errors.partyName = issue.message;
    } else if (field === "partyTypes" && !errors.partyTypes) {
      errors.partyTypes = issue.message;
    } else if (field === "status" && !errors.status) {
      errors.status = issue.message;
    } else if (field === "regionCode" && !errors.regionCode) {
      errors.regionCode = issue.message;
    } else if (field === "provinceCode" && !errors.provinceCode) {
      errors.provinceCode = issue.message;
    } else if (field === "cityMunicipalityCode" && !errors.cityMunicipalityCode) {
      errors.cityMunicipalityCode = issue.message;
    } else if (field === "barangayCode" && !errors.barangayCode) {
      errors.barangayCode = issue.message;
    } else if (field === "tin" && !errors.tin) {
      errors.tin = issue.message;
    } else if (field === "defaultReceivableAccount" && !errors.defaultReceivableAccount) {
      errors.defaultReceivableAccount = issue.message;
    } else if (field === "customerAdvanceAccount" && !errors.customerAdvanceAccount) {
      errors.customerAdvanceAccount = issue.message;
    } else if (field === "defaultPayableAccount" && !errors.defaultPayableAccount) {
      errors.defaultPayableAccount = issue.message;
    } else if (field === "vendorAdvanceAccount" && !errors.vendorAdvanceAccount) {
      errors.vendorAdvanceAccount = issue.message;
    } else if (field === "employeeAdvanceAccount" && !errors.employeeAdvanceAccount) {
      errors.employeeAdvanceAccount = issue.message;
    } else if (field === "employeePayableAccount" && !errors.employeePayableAccount) {
      errors.employeePayableAccount = issue.message;
    } else if (field === "termId" && !errors.termId) {
      errors.termId = issue.message;
    }
  }

  return errors;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidContactNo(value: string) {
  const contactNo = value.trim();

  return (
    contactNo === DefaultPhilippineContactNumber.trim() ||
    PhilippineContactNumberPattern.test(contactNo)
  );
}
