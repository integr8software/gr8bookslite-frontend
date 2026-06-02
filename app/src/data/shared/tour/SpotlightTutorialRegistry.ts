import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import { ChartsOfAccountsHref } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import {
  UserListHref,
  UserRoleHref,
} from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { BranchDashboardSpotlightTutorialOpenEvent } from "@/app/src/data/modules/dashboard/BranchDashboardSpotlightTutorialData";
import { WorkspaceSpotlightTutorialOpenEvent } from "@/app/src/data/modules/dashboard/WorkspaceSpotlightTutorialData";
import { ChartsOfAccountsSpotlightTutorialOpenEvent } from "@/app/src/data/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsSpotlightTutorialData";
import { BranchManagementSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/branch-management/BranchManagementSpotlightTutorialData";
import { UserRoleSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorialData";
import { UserListSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/users/UserListSpotlightTutorialData";
import { WorkspaceCompaniesHref, WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { WorkspaceBillingSubscriptionHref } from "@/app/src/constants/workspace/billing-and-subscription/WorkspaceBillingSubscriptionConstants";
import { WorkspaceBillingSpotlightTutorialOpenEvent } from "@/app/src/data/workspace/billing-and-subscription/WorkspaceBillingSpotlightTutorialData";
import { WorkspaceCompanyAddHref, WorkspaceCompanySpotlightTutorialOpenEvent } from "@/app/src/data/workspace/companies/WorkspaceCompanySpotlightTutorialData";
import { WorkspaceUsersSpotlightTutorialOpenEvent } from "@/app/src/data/workspace/users-management/WorkspaceUsersSpotlightTutorialData";
import {
  WorkspaceUserDrawerSpotlightTutorialOpenEvent,
  WorkspaceUserDrawerSpotlightTutorialPathnamePrefixes,
} from "@/app/src/data/workspace/users-management/WorkspaceUserDrawerSpotlightTutorialData";
import {
  MaintenanceAddSpotlightTutorialOpenEvent,
  MaintenanceAddSpotlightTutorialConfigs,
  MaintenanceSpotlightTutorialConfigs,
  MaintenanceSpotlightTutorialOpenEvent,
} from "@/app/src/data/modules/maintenance/MaintenanceSpotlightTutorialData";

const SpotlightTutorialEventsByHref: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    MaintenanceSpotlightTutorialConfigs.map(({ href }) => [
      href,
      MaintenanceSpotlightTutorialOpenEvent,
    ]),
  ),
  "/dashboard": BranchDashboardSpotlightTutorialOpenEvent,
  "/master/dashboard": WorkspaceSpotlightTutorialOpenEvent,
  "/workspace/dashboard": WorkspaceSpotlightTutorialOpenEvent,
  [WorkspaceBillingSubscriptionHref]: WorkspaceBillingSpotlightTutorialOpenEvent,
  [WorkspaceCompaniesHref]: WorkspaceCompanySpotlightTutorialOpenEvent,
  [WorkspaceCompanyAddHref]: WorkspaceCompanySpotlightTutorialOpenEvent,
  [WorkspaceUsersManagementHref]: WorkspaceUsersSpotlightTutorialOpenEvent,
  [BranchManagementHref]: BranchManagementSpotlightTutorialOpenEvent,
  [ChartsOfAccountsHref]: ChartsOfAccountsSpotlightTutorialOpenEvent,
  [UserListHref]: UserListSpotlightTutorialOpenEvent,
  [UserRoleHref]: UserRoleSpotlightTutorialOpenEvent,
};

export function getSpotlightTutorialOpenEvent(href: string) {
  const normalizedHref = href.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const maintenanceAddConfig = MaintenanceAddSpotlightTutorialConfigs.find(
    (config) => normalizedHref === `${config.href}/add`,
  );

  return (
    SpotlightTutorialEventsByHref[normalizedHref] ??
    (maintenanceAddConfig ? MaintenanceAddSpotlightTutorialOpenEvent : null) ??
    (WorkspaceUserDrawerSpotlightTutorialPathnamePrefixes.some(
      (pathnamePrefix) => normalizedHref.startsWith(pathnamePrefix),
    )
      ? WorkspaceUserDrawerSpotlightTutorialOpenEvent
      : null)
  );
}
