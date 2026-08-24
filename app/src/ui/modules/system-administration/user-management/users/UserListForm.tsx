import type { ChangeEvent, FormEvent } from "react";
import { UserListStatusOptions } from "@/app/src/constants/modules/user-management/UserListConstants";
import type { UserFormValues, UserRoleRecord } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { DefaultPhilippineContactNumber, PhilippineContactNumberPlaceholder } from "@/app/src/data/shared/contact/ContactData";
import type { UserFormErrors } from "@/app/src/types/modules/user-management/UserManagementTypes";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

export function UserListForm({
  errors,
  isReadonly,
  userRoles,
  values,
  onChange,
  onSubmit,
  onUpdateField,
}: {
  errors: UserFormErrors;
  isReadonly: boolean;
  userRoles: UserRoleRecord[];
  values: UserFormValues;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateField: (field: keyof UserFormValues, value: string) => void;
}) {
  return (
    <form id="users-form" onSubmit={onSubmit} className="grid gap-5">
      <div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <UserListField label="Full Name" error={errors.name} required>
            <input name="name" value={values.name} onChange={onChange} readOnly={isReadonly} className={UserListFieldClassName} />
          </UserListField>
          <UserListField label="Email" error={errors.email} required>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={onChange}
              readOnly={isReadonly}
              className={UserListFieldClassName}
            />
          </UserListField>
          <UserListField label="Contact No." error={errors.contactNumber} required>
            <input
              name="contactNumber"
              type="tel"
              inputMode="numeric"
              value={values.contactNumber}
              onChange={onChange}
              onFocus={() => {
                if (!values.contactNumber) {
                  onUpdateField("contactNumber", DefaultPhilippineContactNumber);
                }
              }}
              readOnly={isReadonly}
              maxLength={16}
              className={UserListFieldClassName}
              placeholder={PhilippineContactNumberPlaceholder}
            />
          </UserListField>
          <UserListField label="Status">
            <select name="status" value={values.status} onChange={onChange} disabled={isReadonly} className={UserListFieldClassName}>
              {UserListStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </UserListField>
          <UserListField label="User Role">
            <select
              name="userRoleId"
              value={values.userRoleId}
              onChange={onChange}
              disabled={isReadonly}
              className={UserListFieldClassName}
            >
              {userRoles.map((userRole) => (
                <option key={userRole.id} value={userRole.id}>
                  {userRole.name}
                </option>
              ))}
            </select>
          </UserListField>
        </div>
      </div>
    </form>
  );
}

function UserListField({
  children,
  error,
  label,
  required,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={required} label={label} leadingSpace />
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}

const UserListFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
