import { erpCompanies } from "@/app/src/data/modules/companies/ErpCompaniesData";
import {
  erpApprovalQueue,
  erpDashboardStats,
  erpRecentActivity,
  erpSystemNotifications,
} from "@/app/src/data/modules/dashboard/ErpDashboardData";

export function getWorkspaceDashboardData() {
  return {
    stats: erpDashboardStats,
    companies: erpCompanies,
    approvalQueue: erpApprovalQueue,
    recentActivity: erpRecentActivity,
    systemNotifications: erpSystemNotifications,
  };
}
