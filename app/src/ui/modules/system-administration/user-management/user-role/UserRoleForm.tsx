import type { FormEvent } from "react";
import type {
  UserAccessRoleOption,
  UserRoleFormValues,
} from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";
import type { UserRoleFormErrors } from "@/app/src/types/modules/user-management/UserManagementTypes";
import { UserRolePermissionsPanel } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRolePermissionsPanel";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

export function UserRoleForm({
  errors,
  isReadonly,
  permissionCatalog,
  values,
  onSubmit,
  onUpdateAccessRoles,
  onUpdateField,
}: {
  errors: UserRoleFormErrors;
  isReadonly: boolean;
  permissionCatalog: UserAccessRoleOption[];
  values: UserRoleFormValues;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateAccessRoles: (accessRoles: string[]) => void;
  onUpdateField: (field: keyof UserRoleFormValues, value: string | string[]) => void;
}) {
  return (
    <form id="user-role-form" onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <UserRoleField label="Name" error={errors.name} required>
            <input
              value={values.name}
              onChange={(event) => onUpdateField("name", event.target.value)}
              readOnly={isReadonly}
              className={fieldClassName}
            />
          </UserRoleField>
          <UserRoleField label="Status">
            <select
              value={values.status}
              onChange={(event) => onUpdateField("status", event.target.value)}
              disabled={isReadonly}
              className={fieldClassName}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </UserRoleField>
          <UserRoleField label="Description" className="lg:col-span-2">
            <textarea
              value={values.description}
              onChange={(event) => onUpdateField("description", event.target.value)}
              readOnly={isReadonly}
              rows={3}
              className={fieldClassName}
            />
          </UserRoleField>
          <div className="lg:col-span-2">
            <UserRolePermissionsPanel
              error={errors.accessRoles}
              isReadonly={isReadonly}
              permissionCatalog={permissionCatalog}
              values={values.accessRoles}
              onUpdateAccessRoles={onUpdateAccessRoles}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

function UserRoleField({
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
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
