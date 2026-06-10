import {
  UserAccessRoleOptions,
  UserPermissionActions,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export type AccessModule = (typeof UserAccessRoleOptions)[number];
export type AccessSubmodule = AccessModule["children"][number];

export function getSubmodulePermissionActions(submodule: AccessSubmodule) {
  return UserPermissionActions.filter(
    (action) =>
      !submodule.actions || submodule.actions.includes(action.value),
  );
}

export function getEnabledCount(accessModule: AccessModule, values: string[]) {
  return accessModule.children.reduce(
    (count, child) =>
      count +
      getSubmodulePermissionActions(child).filter((action) =>
        values.includes(`${child.permissionCode}.${action.value}`),
      ).length,
    0,
  );
}

export function getModuleActionState(
  accessModule: AccessModule,
  actionValue: string,
  values: string[],
) {
  const childPermissions = accessModule.children
    .filter((child) =>
      getSubmodulePermissionActions(child).some(
        (action) => action.value === actionValue,
      ),
    )
    .map((child) => `${child.permissionCode}.${actionValue}`);
  const allowedCount = childPermissions.filter((permission) =>
    values.includes(permission),
  ).length;

  return {
    checked:
      childPermissions.length > 0 && allowedCount === childPermissions.length,
    isPartial: allowedCount > 0 && allowedCount < childPermissions.length,
  };
}

export function getModulePermissionState(
  accessModule: AccessModule,
  values: string[],
) {
  const modulePermissions = accessModule.children.flatMap((child) =>
    getSubmodulePermissionActions(child).map(
      (action) => `${child.permissionCode}.${action.value}`,
    ),
  );
  const allowedCount = modulePermissions.filter((permission) =>
    values.includes(permission),
  ).length;

  return {
    checked:
      modulePermissions.length > 0 && allowedCount === modulePermissions.length,
    enabledCount: allowedCount,
    isPartial: allowedCount > 0 && allowedCount < modulePermissions.length,
  };
}

export function getSubmoduleState(
  submodule: AccessSubmodule,
  values: string[],
) {
  const permissions = getSubmodulePermissionActions(submodule).map(
    (action) => `${submodule.permissionCode}.${action.value}`,
  );
  const allowedCount = permissions.filter((permission) =>
    values.includes(permission),
  ).length;

  return {
    checked: permissions.length > 0 && allowedCount === permissions.length,
    enabledCount: allowedCount,
    isPartial: allowedCount > 0 && allowedCount < permissions.length,
  };
}

export function toggleModuleAction(
  accessModule: AccessModule,
  actionValue: string,
  values: string[],
) {
  const childPermissions = accessModule.children
    .filter((child) =>
      getSubmodulePermissionActions(child).some(
        (action) => action.value === actionValue,
      ),
    )
    .map((child) => `${child.permissionCode}.${actionValue}`);
  const shouldAllow = childPermissions.some(
    (permission) => !values.includes(permission),
  );

  return shouldAllow
    ? Array.from(new Set([...values, ...childPermissions]))
    : values.filter((permission) => !childPermissions.includes(permission));
}

export function toggleSubmodulePermissions(
  submodule: AccessSubmodule,
  values: string[],
) {
  const submodulePermissions = getSubmodulePermissionActions(submodule).map(
    (action) => `${submodule.permissionCode}.${action.value}`,
  );
  const shouldAllow = submodulePermissions.some(
    (permission) => !values.includes(permission),
  );

  return shouldAllow
    ? Array.from(new Set([...values, ...submodulePermissions]))
    : values.filter((permission) => !submodulePermissions.includes(permission));
}

export function togglePermission(permission: string, values: string[]) {
  return values.includes(permission)
    ? values.filter((currentPermission) => currentPermission !== permission)
    : [...values, permission];
}

export function toggleModulePermissions(
  accessModule: AccessModule,
  values: string[],
) {
  const modulePermissions = accessModule.children.flatMap((child) =>
    getSubmodulePermissionActions(child).map(
      (action) => `${child.permissionCode}.${action.value}`,
    ),
  );
  const shouldAllow = modulePermissions.some(
    (permission) => !values.includes(permission),
  );

  return shouldAllow
    ? Array.from(new Set([...values, ...modulePermissions]))
    : values.filter((permission) => !modulePermissions.includes(permission));
}
