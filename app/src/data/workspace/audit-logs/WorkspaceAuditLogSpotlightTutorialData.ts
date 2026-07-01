import { WorkspaceAuditLogsHref } from "@/app/src/constants/workspace/audit-logs/WorkspaceAuditLogConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const WorkspaceAuditLogSpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-audit-logs-spotlight-open";
export const WorkspaceAuditLogSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.v1.${WorkspaceAuditLogsHref}`;

export const WorkspaceAuditLogSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with workspace audit logs",
    description:
      "Use this page to review company activity across branches, users, modules, records, and approval-sensitive actions.",
    selectors: ["[data-spotlight-id='workspace-audit-header']"],
  },
  {
    key: "summary",
    title: "Check audit activity at a glance",
    description:
      "These cards show matched records, represented branches, and the total volume of available audit logs.",
    selectors: ["[data-spotlight-id='workspace-audit-summary']"],
  },
  {
    key: "filters",
    title: "Narrow the activity stream",
    description:
      "Search the logs and filter by branch, date, module, or action to isolate the activity you need.",
    selectors: ["[data-spotlight-id='workspace-audit-filters']"],
  },
  {
    key: "table",
    title: "Review detailed audit records",
    description:
      "Use the activity table to inspect when an action occurred, who performed it, and which branch or record was affected.",
    selectors: ["[data-spotlight-id='workspace-audit-table']"],
  },
] satisfies readonly SpotlightTourStep[];
