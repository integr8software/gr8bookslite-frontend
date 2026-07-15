import type { MainAccessKey, MainIconName, MainNavigationItem, MainNavigationSection } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { getModuleRoute, MODULE_ROUTE_FALLBACK } from "@/app/src/data/shared/modules/ModuleRouteMap";
import type { AuthUserModuleItem } from "@/app/src/services/auth/AuthApiTypes";

const SectionAccess: Record<string, MainAccessKey> = {
  dashboard: "dashboard", maintenance: "maintenance.chartOfAccounts", "cash-receipt": "cashReceipt",
  "cash-disbursement": "cashDisbursement", "accounts-payable": "accountsPayable", "general-journal": "generalJournal",
  sales: "sales", inventory: "inventory", purchasing: "purchasing", others: "fixedAsset",
  "system-administration": "settings",
};

const SectionIcons = new Set<MainIconName>([
  "asset", "cashIn", "cashOut", "dashboard", "inventory", "journal", "maintenance", "payable", "purchasing", "sales", "settings",
]);

export function MapUserModulesToNavigation(items: AuthUserModuleItem[]): MainNavigationSection[] {
  return items.flatMap((item): MainNavigationSection[] => {
    const accessKey = getAccessKey(item);
    const icon = SectionIcons.has(item.iconName as MainIconName) ? item.iconName as MainIconName : "settings";
    if (item.itemType === "SECTION") {
      return [{ key: item.key, title: item.label, icon, iconName: item.iconName, accessKey, items: item.children.map(mapItem) }];
    }
    const mappedItem = mapItem(item);

    return [{
      key: `${item.key}-root`,
      title: item.label,
      href: mappedItem.href,
      icon,
      iconName: item.iconName,
      accessKey,
      permissionCode: mappedItem.permissionCode,
      items: [mappedItem],
    }];
  });
}

function mapItem(item: AuthUserModuleItem): MainNavigationItem {
  const firstLink = findFirstLink(item);
  const moduleHref =
    item.itemType === "LINK"
      ? getModuleRoute(item.moduleCode)
      : firstLink
        ? getModuleRoute(firstLink.moduleCode)
        : MODULE_ROUTE_FALLBACK;
  return {
    key: item.key,
    label: item.label,
    href: moduleHref,
    accessKey: getAccessKey(item),
    permissionCode: item.permissionCode ?? undefined,
    requiredActions: item.requiredActions?.includes("view") ? ["view"] : undefined,
		iconName: item.iconName,
    children: item.children.length ? item.children.map(mapItem) : undefined,
  };
}

function findFirstLink(item: AuthUserModuleItem): AuthUserModuleItem | undefined {
  if (item.itemType === "LINK") return item;
  for (const child of item.children) {
    const link = findFirstLink(child);
    if (link) return link;
  }
}

function getAccessKey(item: AuthUserModuleItem): MainAccessKey {
  const sectionKey = item.key.split("-").slice(0, item.key.startsWith("cash-") || item.key.startsWith("general-") || item.key.startsWith("accounts-") ? 2 : 1).join("-");
  if (item.key.includes("user")) return "maintenance.users";
  if (item.key.includes("audit")) return "maintenance.audit";
  if (item.key.includes("approval")) return "maintenance.approval";
  if (item.key.includes("tax-maintenance")) return "maintenance.taxMaintenance";
  if (item.key.includes("warehouse")) return "maintenance.warehouse";
  if (item.key.includes("item")) return "maintenance.item";
  return SectionAccess[item.key] ?? SectionAccess[sectionKey] ?? "settings";
}
