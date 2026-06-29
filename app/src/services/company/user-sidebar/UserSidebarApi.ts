import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type { AuthUserModuleItem } from "@/app/src/services/auth/AuthApiTypes";

export type UserSidebarApiItem = AuthUserModuleItem;

export type UserSidebarCustomization = {
  companyId: number;
  branchUnitId: number;
  userId: number;
  version: number;
  items: UserSidebarApiItem[];
  availableModules: Array<{ id: number; code: string; name: string; route?: string | null; iconName?: string | null }>;
  supportedIconNames: string[];
};

type SidebarCustomizationScope = {
  branchUnitId: number;
  userId?: number;
};

function CreateScopeParams(scope: SidebarCustomizationScope & { applyScope?: "CURRENT_BRANCH" | "ALL_BRANCHES" }) {
  const params = new URLSearchParams({ branchUnitId: String(scope.branchUnitId) });
  if (scope.userId) params.set("userId", String(scope.userId));
  if (scope.applyScope) params.set("applyScope", scope.applyScope);
  return params.toString();
}

export async function GetUserSidebarCustomization(companyId: number, scope: SidebarCustomizationScope) {
  return (await ApiClient.get<UserSidebarCustomization>(`/companies/${companyId}/user-sidebar/customization?${CreateScopeParams(scope)}`)).data;
}

export async function SaveUserSidebarCustomization(companyId: number, scope: SidebarCustomizationScope, value: Pick<UserSidebarCustomization, "version" | "items"> & { applyScope?: "CURRENT_BRANCH" | "ALL_BRANCHES" }) {
  return (await ApiClient.request<UserSidebarCustomization>({
    method: "PUT",
    url: `/companies/${companyId}/user-sidebar/customization?${CreateScopeParams(scope)}`,
    data: value,
  })).data;
}

export async function ResetUserSidebar(companyId: number, scope: SidebarCustomizationScope & { applyScope?: "CURRENT_BRANCH" | "ALL_BRANCHES" }) {
  return (await ApiClient.post<UserSidebarCustomization>(`/companies/${companyId}/user-sidebar/reset?${CreateScopeParams(scope)}`)).data;
}
