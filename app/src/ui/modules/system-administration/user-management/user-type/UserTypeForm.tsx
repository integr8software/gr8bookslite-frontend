import Link from "next/link";
import type { FormEvent } from "react";
import {
  UserAccessRoleOptions,
  type UserTypeFormValues,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserTypeFormErrors } from "@/app/src/types/modules/user-management/UserManagementTypes";

export function UserTypeForm({
  backHref,
  errors,
  isReadonly,
  values,
  onSubmit,
  onToggleAccessRole,
  onUpdateField,
}: {
  backHref: string;
  errors: UserTypeFormErrors;
  isReadonly: boolean;
  values: UserTypeFormValues;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleAccessRole: (role: string) => void;
  onUpdateField: (field: keyof UserTypeFormValues, value: string | string[]) => void;
}) {
  return (
    <form id="user-type-form" onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <UserTypeField label="Name" error={errors.name} required>
            <input
              value={values.name}
              onChange={(event) => onUpdateField("name", event.target.value)}
              readOnly={isReadonly}
              className={fieldClassName}
            />
          </UserTypeField>
          <UserTypeField label="Status">
            <select
              value={values.status}
              onChange={(event) => onUpdateField("status", event.target.value)}
              disabled={isReadonly}
              className={fieldClassName}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </UserTypeField>
          <UserTypeField label="Description" className="lg:col-span-2">
            <textarea
              value={values.description}
              onChange={(event) =>
                onUpdateField("description", event.target.value)
              }
              readOnly={isReadonly}
              rows={3}
              className={fieldClassName}
            />
          </UserTypeField>
          <div className="lg:col-span-2">
            <p className="mb-2 text-sm font-semibold text-darknavy">
              Access Roles <span className="text-coralpink">*</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {UserAccessRoleOptions.map((role) => (
                <label
                  key={role.value}
                  className="flex min-h-11 items-center gap-3 rounded-md border border-darknavy/10 px-3"
                >
                  <input
                    type="checkbox"
                    checked={values.accessRoles.includes(role.value)}
                    disabled={isReadonly}
                    onChange={() => onToggleAccessRole(role.value)}
                    className="h-4 w-4 rounded border-darknavy/20 text-skyblue"
                  />
                  <span className="text-sm font-semibold text-darknavy">
                    {role.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.accessRoles ? (
              <span className="mt-1 block text-xs font-medium text-coralpink">
                {errors.accessRoles}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <Link href={backHref} className="text-sm font-semibold text-skyblue">
        Back to list
      </Link>
    </form>
  );
}

function UserTypeField({
  children,
  className,
  error,
  label,
  required,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="text-coralpink"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-coralpink">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
