import { useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import {
  UserAccessRoleOptions,
  UserPermissionActions,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserRoleAccessToggle } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleAccessToggle";
import {
  getEnabledCount,
  getModuleActionState,
  getSubmoduleState,
  toggleModuleAction,
  toggleSubmodulePermissions,
  type AccessModule,
} from "@/app/src/ui/modules/system-administration/user-management/user-role/utils";

export function UserRolePermissionsPanel({
  error,
  isReadonly,
  values,
  onUpdateAccessRoles,
  onToggleAccessRole,
}: {
  error?: string;
  isReadonly: boolean;
  values: string[];
  onUpdateAccessRoles: (accessRoles: string[]) => void;
  onToggleAccessRole: (role: string) => void;
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

      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-darknavy/10 bg-darknavy/[0.015] p-3 lg:border-b-0 lg:border-r">
          <div className="grid gap-2">
            {moduleStats.map(({ accessModule, enabledCount, totalCount }) => {
              const isActive = accessModule.value === selectedModule.value;

              return (
                <button
                  key={accessModule.value}
                  type="button"
                  onClick={() => setSelectedModuleValue(accessModule.value)}
                  className={[
                    "grid gap-1 rounded border px-3 py-2 text-left transition",
                    isActive
                      ? "border-blue-200 bg-white shadow-sm"
                      : "border-transparent hover:border-darknavy/10 hover:bg-white/70",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-darknavy">
                      {accessModule.label}
                    </span>
                    {enabledCount ? (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {enabledCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-medium text-darknavy/48">
                    {accessModule.children.length} submodules - {enabledCount} of{" "}
                    {totalCount} allowed
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="border-b border-darknavy/10 px-4 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h4 className="text-base font-semibold text-darknavy">
                  {selectedModule.label}
                </h4>
                <p className="mt-1 text-xs font-medium text-darknavy/50">
                  Apply permissions by action or tune each submodule below.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-7">
                {UserPermissionActions.map((action) => {
                  const state = getModuleActionState(
                    selectedModule,
                    action.value,
                    values,
                  );

                  return (
                    <UserRoleAccessToggle
                      key={`${selectedModule.value}.${action.value}`}
                      checked={state.checked}
                      disabled={isReadonly}
                      isPartial={state.isPartial}
                      label={action.label}
                      onChange={() =>
                        updateModuleAction(selectedModule, action.value)
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4">
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
                  <div className="grid gap-3 xl:grid-cols-[minmax(14rem,1fr)_auto] xl:items-center">
                    <button
                      type="button"
                      onClick={() => updateSubmoduleAll(submodule.value)}
                      disabled={isReadonly}
                      className="flex min-w-0 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded border",
                          submoduleState.checked
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : submoduleState.isPartial
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-darknavy/10 bg-darknavy/[0.02] text-darknavy/35",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {submoduleState.enabledCount ? (
                          <Check className="h-4 w-4" />
                        ) : null}
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
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-7">
                      {UserPermissionActions.map((action) => {
                        const permission = `${submodule.value}.${action.value}`;

                        return (
                          <UserRoleAccessToggle
                            key={permission}
                            checked={values.includes(permission)}
                            disabled={isReadonly}
                            label={action.label}
                            onChange={() => onToggleAccessRole(permission)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
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
