import { WorkspaceVouchersAndCouponsHref } from "@/app/src/constants/workspace/vouchers-and-coupons/WorkspaceVouchersAndCouponsConstants";
import type { SpotlightTourStep } from "@/app/src/types/shared/tour/SpotlightTourTypes";

export const WorkspaceVouchersAndCouponsSpotlightTutorialOpenEvent =
  "gr8booksneo:workspace-vouchers-and-coupons-spotlight-open";
export const WorkspaceVouchersAndCouponsSpotlightTutorialStorageKey =
  `gr8booksneo.spotlightTutorial.v1.${WorkspaceVouchersAndCouponsHref}`;

export const WorkspaceVouchersAndCouponsSpotlightTutorialSteps = [
  {
    key: "header",
    title: "Start with vouchers and coupons",
    description:
      "Use this page to review voucher and coupon assignments available to workspace subscribers.",
    selectors: ["[data-spotlight-id='workspace-vouchers-header']"],
  },
  {
    key: "metrics",
    title: "Review assignment coverage",
    description:
      "These cards summarize assigned, available, applicable, and used codes across subscribers.",
    selectors: ["[data-spotlight-id='workspace-vouchers-metrics']"],
  },
  {
    key: "filters",
    title: "Find assignments quickly",
    description:
      "Search by company, code, invoice, or owner and narrow the list by assignment status and type.",
    selectors: ["[data-spotlight-id='workspace-vouchers-filters']"],
  },
  {
    key: "table",
    title: "Review voucher and coupon details",
    description:
      "Use the table to check assignment values, availability, expiry, invoice links, and record actions.",
    selectors: ["[data-spotlight-id='workspace-vouchers-table']"],
  },
] satisfies readonly SpotlightTourStep[];
