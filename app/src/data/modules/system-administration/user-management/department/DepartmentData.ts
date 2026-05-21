import type { UserStatus } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export type DepartmentRecord = {
  id: string;
  name: string;
  description: string;
  status: UserStatus;
};

export type DepartmentFormValues = Omit<DepartmentRecord, "id">;

export const InitialDepartmentFormValues: DepartmentFormValues = {
  name: "",
  description: "",
  status: "Active",
};

export const InitialDepartments: DepartmentRecord[] = [
  {
    id: "department-operations",
    name: "Operations",
    description: "Operations team for company management workflows.",
    status: "Active",
  },
  {
    id: "department-finance",
    name: "Finance",
    description: "Finance team for accounting and reporting workflows.",
    status: "Active",
  },
  {
    id: "department-it",
    name: "IT",
    description: "Information technology administration workflows.",
    status: "Active",
  },
  {
    id: "department-hr",
    name: "HR",
    description: "Human resources user administration workflows.",
    status: "Active",
  },
  {
    id: "department-marketing",
    name: "Marketing",
    description: "Marketing and customer activity workflows.",
    status: "Active",
  },
  {
    id: "department-compliance",
    name: "Compliance",
    description: "Audit and compliance review workflows.",
    status: "Active",
  },
  {
    id: "department-purchasing",
    name: "Purchasing",
    description: "Purchasing and payable transaction workflows.",
    status: "Active",
  },
];

export function createDepartmentRecord(
  values: DepartmentFormValues,
): DepartmentRecord {
  return {
    id: `department-${Date.now()}`,
    ...trimDepartmentValues(values),
  };
}

export function updateDepartmentRecord(
  department: DepartmentRecord,
  values: DepartmentFormValues,
): DepartmentRecord {
  return {
    ...department,
    ...trimDepartmentValues(values),
  };
}

function trimDepartmentValues(
  values: DepartmentFormValues,
): DepartmentFormValues {
  return {
    ...values,
    name: values.name.trim(),
    description: values.description.trim(),
  };
}
