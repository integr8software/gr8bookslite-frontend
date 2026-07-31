import { useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import {
  UserPermissionActions,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserAccessRoleOption } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleData";
import { UserRoleAccessToggle } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleAccessToggle";
import {
  getEnabledCount,
  getModulePermissionState,
  getModuleActionState,
  getSubmodulePermissionActions,
  getSubmoduleState,
  togglePermission,
  toggleModuleAction,
  toggleModulePermissions,
  toggleSubmodulePermissions,
  type AccessModule,
  type AccessSubmodule,
} from "@/app/src/ui/modules/system-administration/user-management/user-role/utils";

export function UserRolePermissionsPanel({
  error,
  isReadonly,
  permissionCatalog,
  values,
  onUpdateAccessRoles,
}: {
  error?: string;
  isReadonly: boolean;
  permissionCatalog: UserAccessRoleOption[];
  values: string[];
  onUpdateAccessRoles: (accessRoles: string[]) => void;
}) {
  const [selectedModuleValue, setSelectedModuleValue] = useState<string>(
    permissionCatalog[0]?.value ?? "",
  );
  const selectedModule =
    permissionCatalog.find((item) => item.value === selectedModuleValue) ??
    permissionCatalog[0];
  const moduleStats = useMemo(
    () =>
      permissionCatalog.map((accessModule) => ({
        accessModule,
        enabledCount: getEnabledCount(accessModule, values),
        totalCount: accessModule.children.reduce(
          (count, submodule) =>
            count + getSubmodulePermissionActions(submodule).length,
          0,
        ),
      })),
    [permissionCatalog, values],
  );

  function updateModuleAction(accessModule: AccessModule, actionValue: string) {
    onUpdateAccessRoles(toggleModuleAction(accessModule, actionValue, values));
  }

  function updateSubmoduleAll(submodule: AccessSubmodule) {
    onUpdateAccessRoles(toggleSubmodulePermissions(submodule, values));
  }

  function updateModuleAll(accessModule: AccessModule) {
    onUpdateAccessRoles(toggleModulePermissions(accessModule, values));
  }

  function updateSinglePermission(permission: string) {
    onUpdateAccessRoles(togglePermission(permission, values));
  }

  const selectedModulePermissionState = selectedModule
    ? getModulePermissionState(selectedModule, values)
    : { checked: false, enabledCount: 0, isPartial: false };

  if (!selectedModule) {
    return (
      <div className="rounded-lg border border-darknavy/10 bg-white p-5 text-sm text-darknavy/55">
        No active permission catalog entries are available for this branch.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white">
      <div className="flex items-start gap-3 border-b border-darknavy/10 px-4 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-darknavy/8 text-darknavy/65">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-darknavy">
            Default Access Permission
          </h3>
          <p className="mt-1 text-xs text-darknavy/55">
            Choose a sidebar section, then set access for its modules.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 xl:items-start xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="min-w-0 overflow-hidden border-b border-darknavy/10 bg-darknavy/[0.015] p-3 xl:border-b-0 xl:border-r xl:border-darknavy/10">
          <div className="grid min-w-0 gap-2">
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
                    "grid min-w-0 gap-1 overflow-hidden rounded border px-3 py-2 text-left transition",
                    isActive
                      ? "permission-neutral-selected shadow-sm"
                      : "border-transparent hover:border-darknavy/15 hover:bg-darknavy/5",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
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
                            "rounded bg-darknavy/8 px-2 py-0.5 text-xs font-semibold text-darknavy/65",
                            enabledCount ? "" : "invisible",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {enabledCount || 0}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs font-medium text-darknavy/48">
                        {accessModule.children.length} modules - {enabledCount} of{" "}
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

        <section className="min-w-0 overflow-hidden">
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
                const submoduleActions =
                  getSubmodulePermissionActions(submodule);
                const submoduleState = getSubmoduleState(submodule, values);

                return (
                  <article
                    key={submodule.permissionCode}
                    className="rounded border border-darknavy/10 bg-white p-3"
                  >
                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={() => updateSubmoduleAll(submodule)}
                        disabled={isReadonly}
                        className="flex min-w-0 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span
                          className={[
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded border leading-none",
                            submoduleState.checked
                              ? "permission-neutral-control"
                              : submoduleState.isPartial
                                ? "border-amber-500/35 bg-amber-500/12 text-amber-500"
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
                            {submoduleActions.length} permissions allowed
                          </span>
                        </span>
                      </button>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {submoduleActions.map((action) => {
                          const permission = `${submodule.permissionCode}.${action.value}`;

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

            <div className="hidden max-w-full overflow-hidden rounded border border-darknavy/10 xl:block">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[71rem] table-fixed border-collapse text-left">
                  <colgroup>
                    <col className="w-[15rem]" />
                    <col className="w-[8rem]" />
                    {UserPermissionActions.map((action) => (
                      <col
                        key={action.value}
                        className="w-[8rem]"
                      />
                    ))}
                  </colgroup>
                  <thead className="bg-darknavy/3 text-[11px] font-semibold uppercase tracking-[0.18em] text-darknavy/45">
                    <tr>
                      <th className="px-4 py-3">Module</th>
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
                      const submoduleActions =
                        getSubmodulePermissionActions(submodule);
                      const submoduleState = getSubmoduleState(
                        submodule,
                        values,
                      );

                      return (
                        <tr
                          key={submodule.permissionCode}
                          className="border-t border-darknavy/8"
                        >
                          <td className="px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-darknavy">
                                {submodule.label}
                              </p>
                              <p className="mt-1 text-xs text-darknavy/48">
                                {submoduleState.enabledCount} of{" "}
                                {submoduleActions.length} enabled
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <PermissionCheckCell
                              checked={submoduleState.checked}
                              disabled={isReadonly}
                              isPartial={submoduleState.isPartial}
                              label={`All permissions for ${submodule.label}`}
                              onChange={() => updateSubmoduleAll(submodule)}
                            />
                          </td>
                          {UserPermissionActions.map((action) => {
                            const permission = `${submodule.permissionCode}.${action.value}`;
                            const isSupported = submoduleActions.some(
                              (submoduleAction) =>
                                submoduleAction.value === action.value,
                            );

                            return (
                              <td
                                key={permission}
                                className="px-3 py-3 text-center"
                              >
                                {isSupported ? (
                                  <PermissionCheckCell
                                    checked={values.includes(permission)}
                                    disabled={isReadonly}
                                    label={`${submodule.label} ${action.label}`}
                                    onChange={() =>
                                      updateSinglePermission(permission)
                                    }
                                  />
                                ) : (
                                  <span
                                    className="text-sm text-darknavy/25"
                                    title={`${action.label} is not supported for ${submodule.label}`}
                                  >
                                    -
                                  </span>
                                )}
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
          <span className="h-3 w-3 rounded bg-darknavy/65" />
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
          ? "permission-neutral-control"
          : isPartial
            ? "border-amber-500/35 bg-amber-500/12 text-amber-500"
            : "border-darknavy/10 bg-white text-darknavy/30",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
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
          ? "permission-neutral-control"
          : isPartial
            ? "border-amber-500/35 bg-amber-500/12 text-amber-500"
            : "border-darknavy/10 bg-white text-darknavy/55",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
      ].join(" ")}
      aria-pressed={checked}
      title={label}
    >
      <span className="block max-w-full truncate">{label}</span>
    </button>
  );
}
