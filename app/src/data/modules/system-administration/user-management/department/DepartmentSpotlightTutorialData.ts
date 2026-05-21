import { DepartmentHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/SpotlightTourTypes";

export const DepartmentSpotlightTutorialStorageVersion = "v1";
export const DepartmentSpotlightTutorialOpenEvent =
  "gr8bookslite:department-spotlight-open";
export const DepartmentSpotlightTutorialStorageKey =
  `gr8bookslite.spotlightTutorial.${DepartmentSpotlightTutorialStorageVersion}.${DepartmentHref}`;

export const DepartmentSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with the department overview",
    description:
      "This page helps admins organize people into departments, teams, or operational units.",
    selectors: ["[data-spotlight-id='department-header']"],
  },
  {
    key: "add-group",
    title: "Create new departments here",
    description:
      "Use this action when you need a new department or team grouping before assigning users into it.",
    selectors: ["[data-spotlight-id='department-add']"],
  },
  {
    key: "list",
    title: "Review the current department structure",
    description:
      "This list shows each department, its description, and current status so admins can keep teams organized.",
    selectors: ["[data-spotlight-id='department-list']"],
  },
  {
    key: "actions",
    title: "Manage each department from its action area",
    description:
      "Use the card actions to view, edit, or mark departments inactive as your organizational structure changes.",
    selectors: ["[data-spotlight-id='department-actions']"],
  },
] satisfies readonly SpotlightTourStep[];
