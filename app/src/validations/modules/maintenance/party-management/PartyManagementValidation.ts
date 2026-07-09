import { z } from "zod";
import {
  PartyClassificationOptions,
  PartyInformationStatusOptions,
  PartyTypeOptions,
  VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
  MaxPartyAddressCount,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { DefaultPhilippineContactNumber } from "@/app/src/data/shared/contact/ContactData";
import { isAtcCodeLike } from "@/app/src/data/shared/tax/AtcCode";
import type {
  PartyInformationFormErrors,
  PartyInformationFormValues,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

const PhilippineContactNumberPattern = /^\+63 \d{3} \d{3} \d{4}$/;
const PhilippineTinPattern = /^\d{3}-\d{3}-\d{3}-\d{3}$/;

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
  isDefault: z.boolean(),
  isDelivery: z.boolean(),
  isForeign: z.boolean().optional(),
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
    partyTypes: z
      .array(z.enum(PartyTypeOptions))
      .min(1, "Select at least one party type."),
    status: z.enum(PartyInformationStatusOptions, {
      error: "Select a status.",
    }),
    partyName: z.string().trim(),
    tradeName: z.string().trim(),
    firstName: z.string().trim(),
    middleName: z.string().trim(),
    lastName: z.string().trim(),
    suffixName: z.string().trim(),
    address: z.any().optional(),
    addresses: z
      .array(PartyInformationAddressSchema)
      .min(1, "Add at least one address.")
      .max(
        MaxPartyAddressCount,
        `Add no more than ${MaxPartyAddressCount} addresses.`,
      ),
    activeAddressId: z.string().trim(),
    defaultReceivableAccount: z.string().trim(),
    defaultPayableAccount: z.string().trim(),
    employeeReceivableAccount: z.string().trim(),
    employeeAdvanceAccount: z.string().trim(),
    termId: z.string().trim(),
    termName: z.string().trim(),
    tin: z
      .string()
      .trim()
      .refine((value) => !value || PhilippineTinPattern.test(value), {
        message: "Enter a valid TIN in the format 000-000-000-000.",
      }),
    vatRegistrationType: z.union([
      z.literal(""),
      z.enum(VatRegistrationTypeOptions),
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
        message: "Enter a valid contact number in the format.",
      }),
  })
  .superRefine((values, ctx) => {
    if (
      values.classification === "Non-Individual" &&
      !values.partyName.trim()
    ) {
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

    if (
      values.atcCode &&
      !isAtcCodeLike(values.atcCode)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a valid BIR ATC code from the list.",
        path: ["atcCode"],
      });
    }

    const defaultAddressCount = values.addresses.filter(
      (address) => address.isDefault,
    ).length;

    if (defaultAddressCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Set exactly one default address.",
        path: ["addresses"],
      });
    }

    if (values.addresses.filter((address) => address.isForeign).length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only one foreign address can be added.",
        path: ["addresses"],
      });
    }

    if (
      values.addresses.some(
        (address) =>
          ![
            address.addressLine1,
            address.addressLine2,
            address.barangay,
            address.cityMunicipality,
            address.province,
            address.region,
          ].some((part) => part.trim()),
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a full address for every address entry.",
        path: ["addresses"],
      });
    }
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
    } else if (field === "classification" && !errors.classification) {
      errors.classification = issue.message;
    } else if (field === "contactNo" && !errors.contactNo) {
      errors.contactNo = issue.message;
    } else if (field === "email" && !errors.email) {
      errors.email = issue.message;
    } else if (field === "firstName" && !errors.firstName) {
      errors.firstName = issue.message;
    } else if (field === "lastName" && !errors.lastName) {
      errors.lastName = issue.message;
    } else if (field === "addresses" && !errors.addresses) {
      errors.addresses = issue.message;
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
    } else if (
      field === "cityMunicipalityCode" &&
      !errors.cityMunicipalityCode
    ) {
      errors.cityMunicipalityCode = issue.message;
    } else if (field === "barangayCode" && !errors.barangayCode) {
      errors.barangayCode = issue.message;
    } else if (field === "tin" && !errors.tin) {
      errors.tin = issue.message;
    } else if (
      field === "defaultReceivableAccount" &&
      !errors.defaultReceivableAccount
    ) {
      errors.defaultReceivableAccount = issue.message;
    } else if (
      field === "defaultPayableAccount" &&
      !errors.defaultPayableAccount
    ) {
      errors.defaultPayableAccount = issue.message;
    } else if (
      field === "employeeReceivableAccount" &&
      !errors.employeeReceivableAccount
    ) {
      errors.employeeReceivableAccount = issue.message;
    } else if (
      field === "employeeAdvanceAccount" &&
      !errors.employeeAdvanceAccount
    ) {
      errors.employeeAdvanceAccount = issue.message;
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
