import { useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import {
  UserAccessRoleOptions,
  UserPermissionActions,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserRoleAccessToggle } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleAccessToggle";
import {
  getEnabledCount,
  getModulePermissionState,
  getModuleActionState,
  getSubmoduleState,
  togglePermission,
  toggleModuleAction,
  toggleModulePermissions,
  toggleSubmodulePermissions,
  type AccessModule,
} from "@/app/src/ui/modules/system-administration/user-management/user-role/utils";

export function UserRolePermissionsPanel({
  error,
  isReadonly,
  values,
  onUpdateAccessRoles,
}: {
  error?: string;
  isReadonly: boolean;
  values: string[];
  onUpdateAccessRoles: (accessRoles: string[]) => void;
}) {
  const [selectedModuleValue, setSelectedModuleValue] = useState<string>(
    UserAccessRoleOptions[0]?.value ?? "",
  );
  const selectedModule =
    UserAccessRoleOptions.find((item) => item.value === selectedModuleValue) ??
    UserAccessRoleOptions[0];
  const moduleStats = useMemo(
    () =>
      UserAccessRoleOptions.map((accessModule) => ({
        accessModule,
        enabledCount: getEnabledCount(accessModule, values),
        totalCount: accessModule.children.length * UserPermissionActions.length,
      })),
    [values],
  );

  function updateModuleAction(accessModule: AccessModule, actionValue: string) {
    onUpdateAccessRoles(toggleModuleAction(accessModule, actionValue, values));
  }

  function updateSubmoduleAll(submoduleValue: string) {
    onUpdateAccessRoles(toggleSubmodulePermissions(submoduleValue, values));
  }

  function updateModuleAll(accessModule: AccessModule) {
    onUpdateAccessRoles(toggleModulePermissions(accessModule, values));
  }

  function updateSinglePermission(permission: string) {
    onUpdateAccessRoles(togglePermission(permission, values));
  }

  const selectedModulePermissionState = getModulePermissionState(
    selectedModule,
    values,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white">
      <div className="flex items-start gap-3 border-b border-darknavy/10 px-4 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-darknavy">
            Default Access Permission
          </h3>
          <p className="mt-1 text-xs text-darknavy/55">
            Choose a module, then set its submodule access.
          </p>
        </div>
      </div>

      <div className="grid lg:items-start lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-darknavy/10 bg-darknavy/1.5 p-3 lg:border-b-0 lg:border-r">
          <div className="grid gap-2">
            {moduleStats.map(({ accessModule, enabledCount, totalCount }) => {
              const isActive = accessModule.value === selectedModule.value;
              const modulePermissionState = getModulePermissionState(
                accessModule,
                values,
              );

              return (
                <div
                  key={accessModule.value}
                  className={[
                    "grid gap-1 rounded border px-3 py-2 text-left transition",
                    isActive
                      ? "border-blue-200 bg-white shadow-sm"
                      : "border-transparent hover:border-darknavy/10 hover:bg-white/70",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedModuleValue(accessModule.value)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-darknavy">
                          {accessModule.label}
                        </span>
                        <span
                          className={[
                            "rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700",
                            enabledCount ? "" : "invisible",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {enabledCount || 0}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-medium text-darknavy/48">
                        {accessModule.children.length} submodules - {enabledCount} of{" "}
                        {totalCount} allowed
                      </span>
                    </button>
                    <PermissionCheckCell
                      checked={modulePermissionState.checked}
                      disabled={isReadonly}
                      isPartial={modulePermissionState.isPartial}
                      label={`All permissions for ${accessModule.label}`}
                      onChange={() => updateModuleAll(accessModule)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="border-b border-darknavy/10 px-4 py-4">
            <div>
              <h4 className="text-base font-semibold text-darknavy">
                {selectedModule.label}
              </h4>
              <p className="mt-1 text-xs font-medium text-darknavy/50">
                Choose Read Only for view access, or tune each action below.
              </p>
            </div>
          </div>

          <div className="grid gap-3 p-4">
            <div className="grid gap-3 xl:hidden">
              {selectedModule.children.map((submodule) => {
                const submoduleState = getSubmoduleState(
                  submodule.value,
                  values,
                );

                return (
                  <article
                    key={submodule.value}
                    className="rounded border border-darknavy/10 bg-white p-3"
                  >
                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={() => updateSubmoduleAll(submodule.value)}
                        disabled={isReadonly}
                        className="flex min-w-0 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span
                          className={[
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded border leading-none",
                            submoduleState.checked
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : submoduleState.isPartial
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-darknavy/10 bg-darknavy/2 text-darknavy/35",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          <Check
                            className={[
                              "h-4 w-4 shrink-0",
                              submoduleState.enabledCount
                                ? "opacity-100"
                                : "opacity-0",
                            ].join(" ")}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-darknavy">
                            {submodule.label}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-darknavy/48">
                            {submoduleState.enabledCount} of{" "}
                            {UserPermissionActions.length} permissions allowed
                          </span>
                        </span>
                      </button>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {UserPermissionActions.map((action) => {
                          const permission = `${submodule.value}.${action.value}`;

                          return (
                            <UserRoleAccessToggle
                              key={permission}
                              checked={values.includes(permission)}
                              disabled={isReadonly}
                              label={action.label}
                              onChange={() => updateSinglePermission(permission)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded border border-darknavy/10 xl:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-230 border-collapse text-left">
                  <thead className="bg-darknavy/3 text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/45">
                    <tr>
                      <th className="px-4 py-3">Submodule</th>
                      <th className="px-4 py-3 text-center">
                        <HeaderPermissionButton
                          checked={selectedModulePermissionState.checked}
                          disabled={isReadonly}
                          isPartial={selectedModulePermissionState.isPartial}
                          label="All"
                          onClick={() => updateModuleAll(selectedModule)}
                        />
                      </th>
                      {UserPermissionActions.map((action) => (
                        <th
                          key={action.value}
                          className="px-3 py-3 text-center"
                        >
                          <HeaderPermissionButton
                            checked={
                              getModuleActionState(
                                selectedModule,
                                action.value,
                                values,
                              ).checked
                            }
                            disabled={isReadonly}
                            isPartial={
                              getModuleActionState(
                                selectedModule,
                                action.value,
                                values,
                              ).isPartial
                            }
                            label={action.label}
                            onClick={() =>
                              updateModuleAction(selectedModule, action.value)
                            }
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedModule.children.map((submodule) => {
                      const submoduleState = getSubmoduleState(
                        submodule.value,
                        values,
                      );

                      return (
                        <tr
                          key={submodule.value}
                          className="border-t border-darknavy/8"
                        >
                          <td className="px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-darknavy">
                                {submodule.label}
                              </p>
                              <p className="mt-1 text-xs text-darknavy/48">
                                {submoduleState.enabledCount} of{" "}
                                {UserPermissionActions.length} enabled
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <PermissionCheckCell
                              checked={submoduleState.checked}
                              disabled={isReadonly}
                              isPartial={submoduleState.isPartial}
                              label={`All permissions for ${submodule.label}`}
                              onChange={() => updateSubmoduleAll(submodule.value)}
                            />
                          </td>
                          {UserPermissionActions.map((action) => {
                            const permission = `${submodule.value}.${action.value}`;

                            return (
                              <td
                                key={permission}
                                className="px-3 py-3 text-center"
                              >
                                <PermissionCheckCell
                                  checked={values.includes(permission)}
                                  disabled={isReadonly}
                                  label={`${submodule.label} ${action.label}`}
                                  onChange={() => updateSinglePermission(permission)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-5 border-t border-darknavy/10 px-4 py-3 text-xs font-semibold text-darknavy/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-600" />
          Allowed
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-500" />
          Partial
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-darknavy/20 bg-white" />
          Not allowed
        </span>
      </div>

      {error ? (
        <span className="block px-4 pb-4 text-xs font-medium text-coralpink">
          {error}
        </span>
      ) : null}
    </div>
  );
}

function PermissionCheckCell({
  checked,
  disabled,
  isPartial,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  isPartial?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={[
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border align-middle leading-none transition",
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : isPartial
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-darknavy/10 bg-white text-darknavy/30",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-blue-200 hover:bg-blue-50/50",
      ].join(" ")}
      title={label}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        className="sr-only"
      />
      <Check
        className={[
          "h-4 w-4 shrink-0",
          checked || isPartial ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </label>
  );
}

function HeaderPermissionButton({
  checked,
  disabled,
  isPartial,
  label,
  onClick,
}: {
  checked: boolean;
  disabled: boolean;
  isPartial?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-center text-[11px] font-semibold uppercase leading-none tracking-[0.18em] transition",
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : isPartial
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-darknavy/10 bg-white text-darknavy/55",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-blue-200 hover:bg-blue-50/60",
      ].join(" ")}
      aria-pressed={checked}
      title={label}
    >
      <span className="block max-w-full truncate">{label}</span>
    </button>
  );
}
