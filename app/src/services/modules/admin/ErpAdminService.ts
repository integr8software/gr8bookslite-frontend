import {
  erpAuditLogs,
  erpPermissionGroups,
  erpUsers,
} from "@/app/src/data/modules/admin/ErpAdminData";

export function getUsersRolesData() {
  return {
    users: erpUsers,
  };
}

export function getPermissionsData() {
  return {
    roleName: "Site Manager",
    scopeLevel: "Branch / Site",
    appliesTo: "Houston Site",
    groups: erpPermissionGroups,
  };
}

export function getAuditLogsData() {
  return {
    logs: erpAuditLogs,
  };
}
