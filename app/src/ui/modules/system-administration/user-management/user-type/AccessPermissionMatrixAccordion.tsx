import { ChevronDown, ShieldCheck } from "lucide-react";
import {
  UserAccessRoleOptions,
  UserPermissionActions,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export function AccessPermissionMatrixAccordion({
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
  function updateModuleAction(
    accessModule: (typeof UserAccessRoleOptions)[number],
    actionValue: string,
  ) {
    const childPermissions = accessModule.children.map(
      (child) => `${child.value}.${actionValue}`,
    );
    const shouldAllow = childPermissions.some(
      (permission) => !values.includes(permission),
    );
    const nextValues = shouldAllow
      ? Array.from(new Set([...values, ...childPermissions]))
      : values.filter((permission) => !childPermissions.includes(permission));

    onUpdateAccessRoles(nextValues);
  }

  function getModuleActionState(
    accessModule: (typeof UserAccessRoleOptions)[number],
    actionValue: string,
  ) {
    const childPermissions = accessModule.children.map(
      (child) => `${child.value}.${actionValue}`,
    );
    const allowedCount = childPermissions.filter((permission) =>
      values.includes(permission),
    ).length;

    return {
      checked:
        childPermissions.length > 0 && allowedCount === childPermissions.length,
      isPartial: allowedCount > 0 && allowedCount < childPermissions.length,
    };
  }

  function getEnabledCount(accessModule: (typeof UserAccessRoleOptions)[number]) {
    return accessModule.children.reduce(
      (count, child) =>
        count +
        UserPermissionActions.filter((action) =>
          values.includes(`${child.value}.${action.value}`),
        ).length,
      0,
    );
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
            Set the default access this record has for each module and action.
          </p>
        </div>
      </div>

      <div className="divide-y divide-darknavy/10">
        {UserAccessRoleOptions.map((accessModule, index) => {
          const enabledCount = getEnabledCount(accessModule);
          const totalCount =
            accessModule.children.length * UserPermissionActions.length;

          return (
            <details
              key={accessModule.value}
              open={index < 2}
              className="group"
            >
              <summary className="grid cursor-pointer gap-3 px-4 py-3 transition hover:bg-skyblue/[0.04] lg:grid-cols-[minmax(16rem,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-darknavy/45 transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-darknavy">
                      {accessModule.label}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-darknavy/50">
                      {accessModule.children.length} submodules - {enabledCount} of{" "}
                      {totalCount} permissions allowed
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {UserPermissionActions.map((action) => {
                    const state = getModuleActionState(
                      accessModule,
                      action.value,
                    );

                    return (
                      <PermissionToggle
                        key={`${accessModule.value}.${action.value}`}
                        checked={state.checked}
                        isPartial={state.isPartial}
                        label={action.label}
                        disabled={isReadonly}
                        ariaLabel={`${action.label} all ${accessModule.label} submodules`}
                        onChange={() => updateModuleAction(accessModule, action.value)}
                      />
                    );
                  })}
                </div>
              </summary>

              <div className="border-t border-darknavy/8 bg-darknavy/[0.012] px-4 py-3">
                <div className="hidden grid-cols-[minmax(12rem,1fr)_repeat(4,5.5rem)] gap-2 px-3 pb-2 text-xs font-semibold text-darknavy/55 md:grid">
                  <span>Submodule</span>
                  {UserPermissionActions.map((action) => (
                    <span key={action.value} className="text-center">
                      {action.label}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2">
                  {accessModule.children.map((submodule) => (
                    <div
                      key={submodule.value}
                      className="grid gap-3 rounded border border-darknavy/8 bg-white px-3 py-3 md:grid-cols-[minmax(12rem,1fr)_repeat(4,5.5rem)] md:items-center"
                    >
                      <span className="text-sm font-medium text-darknavy">
                        {submodule.label}
                      </span>
                      <div className="grid grid-cols-4 gap-2 md:contents">
                        {UserPermissionActions.map((action) => {
                          const permission = `${submodule.value}.${action.value}`;

                          return (
                            <PermissionToggle
                              key={permission}
                              checked={values.includes(permission)}
                              label={action.label}
                              disabled={isReadonly}
                              ariaLabel={`${action.label} ${submodule.label}`}
                              onChange={() => onToggleAccessRole(permission)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-5 px-4 py-3 text-xs font-semibold text-darknavy/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-600" />
          Allowed
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

function PermissionToggle({
  ariaLabel,
  checked,
  disabled,
  isPartial,
  label,
  onChange,
}: {
  ariaLabel: string;
  checked: boolean;
  disabled: boolean;
  isPartial?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={[
        "flex h-8 items-center justify-center gap-2 rounded border px-2 text-xs font-semibold transition",
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : isPartial
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-darknavy/10 bg-white text-darknavy/55",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-blue-200",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "h-2.5 w-2.5 rounded-full",
          checked ? "bg-blue-600" : isPartial ? "bg-amber-500" : "bg-darknavy/18",
        ].join(" ")}
      />
      <span className="truncate">{label}</span>
    </label>
  );
}
