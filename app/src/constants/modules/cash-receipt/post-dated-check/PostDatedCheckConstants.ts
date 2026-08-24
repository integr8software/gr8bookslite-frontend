import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
export const PostDatedCheckHref = getModuleRoute("PDCW");
export const PostDatedCheckApiPath = "/cash-receipt/post-dated-check";
export const PostDatedCheckStorageKey = "gr8booksneo:cash-receipt:post-dated-check:records";
export const PostDatedCheckStatuses = ["Draft", "For Approval", "Posted", "Disapproved", "Cancelled"] as const;
export const PostDatedCheckTypeOptions = [
  { label: "Lodgment", name: "Lodgment", value: "Lodgment" },
  { label: "Release", name: "Release", value: "Release" },
] as const;
export const PostDatedCheckCopyFromSources = ["Sales Invoice", "Billing Invoice", "Service Invoice"] as const;
