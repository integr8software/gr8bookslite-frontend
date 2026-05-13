import { erpCompanies } from "@/app/src/data/modules/companies/ErpCompaniesData";
import {
  erpBranches,
  erpNavigation,
  erpNotifications,
  erpProfile,
} from "@/app/src/data/modules/workspace/ErpWorkspaceShellData";

export function getWorkspaceShellData() {
  return {
    companies: erpCompanies,
    branches: erpBranches,
    navigation: erpNavigation,
    notifications: erpNotifications,
    profile: erpProfile,
    currentCompany: erpCompanies[0],
  };
}
