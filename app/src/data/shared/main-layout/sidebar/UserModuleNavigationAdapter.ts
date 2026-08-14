import type {
  MainAccessKey,
  MainIconName,
  MainNavigationItem,
  MainNavigationSection,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { getModuleRoute, MODULE_ROUTE_FALLBACK } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { AuthUserModuleItem } from "@/app/src/types/auth/AuthTypes";

const HiddenModuleKeys = new Set(["system-administration-approver-setup"]);
const ApprovalManagementHref = "/system-administration/approval-management";

const SectionAccess: Record<string, MainAccessKey> = {
  dashboard: "dashboard",
  maintenance: "maintenance.chartOfAccounts",
  "financial-maintenance": "maintenance.chartOfAccounts",
  "item-management": "maintenance.item",
  "party-management": "maintenance.party",
  "warehouse-management": "maintenance.warehouse",
  "delivery-vehicle-management": "maintenance.deliveryVehicle",
  "cash-receipt": "cashReceipt",
  "cash-disbursement": "cashDisbursement",
  "accounts-payable": "accountsPayable",
  "general-journal": "generalJournal",
  sales: "sales",
  inventory: "inventory",
  purchasing: "purchasing",
  others: "fixedAsset",
  "system-administration": "settings",
  "approval-management": "maintenance.approval",
};

const SectionIcons = new Set<MainIconName>([
  "asset",
  "cashIn",
  "cashOut",
  "dashboard",
  "inventory",
  "journal",
  "maintenance",
  "payable",
  "purchasing",
  "sales",
  "settings",
]);

export function MapUserModulesToNavigation(items: AuthUserModuleItem[]): MainNavigationSection[] {
  return items.filter((item) => !isHiddenModuleItem(item)).flatMap((item): MainNavigationSection[] => {
    const accessKey = getAccessKey(item);
    const icon = SectionIcons.has(item.iconName as MainIconName) ? (item.iconName as MainIconName) : "settings";
    if (item.itemType === "SECTION") {
      return [
        {
          key: item.key,
          title: item.label,
          icon,
          iconName: item.iconName,
          accessKey,
          items: item.children
            .filter((child) => !isHiddenModuleItem(child))
            .map(mapItem),
        },
      ];
    }
    const mappedItem = mapItem(item);

    return [
      {
        key: `${item.key}-root`,
        title: item.label,
        href: mappedItem.href,
        icon,
        iconName: item.iconName,
        accessKey,
        permissionCode: mappedItem.permissionCode,
        items: [mappedItem],
      },
    ];
  });
}

function mapItem(item: AuthUserModuleItem): MainNavigationItem {
  if (item.key === "system-administration-approval-management") {
    return {
      key: item.key,
      label: item.label,
      href: ApprovalManagementHref,
      accessKey: "maintenance.approval",
      permissionCode: item.permissionCode ?? undefined,
      requiredActions: item.requiredActions?.includes("view") ? ["view"] : undefined,
      iconName: item.iconName,
      children: [
        {
          key: "system-administration-approval-setup",
          label: "Approver Setup",
          href: ApprovalManagementHref,
          accessKey: "maintenance.approval",
          permissionCode: item.permissionCode ?? undefined,
          requiredActions: item.requiredActions?.includes("view") ? ["view"] : undefined,
          iconName: "shieldCheck",
        },
        {
          key: "system-administration-approval-transactions",
          label: "Approval Transactions",
          href: `${ApprovalManagementHref}/approval-transactions`,
          accessKey: "maintenance.approval",
          permissionCode: item.permissionCode ?? undefined,
          requiredActions: item.requiredActions?.includes("view") ? ["view"] : undefined,
          iconName: "clipboardCheck",
        },
      ],
    };
  }

  const firstLink = findFirstLink(item);
  const moduleHref =
    item.itemType === "LINK" ? getModuleRoute(item.moduleCode) : firstLink ? getModuleRoute(firstLink.moduleCode) : MODULE_ROUTE_FALLBACK;
  return {
    key: item.key,
    label: item.label,
    href: moduleHref,
    accessKey: getAccessKey(item),
    permissionCode: item.permissionCode ?? undefined,
    requiredActions: item.requiredActions?.includes("view") ? ["view"] : undefined,
    iconName: item.iconName,
    children: item.children.length
      ? item.children.filter((child) => !isHiddenModuleItem(child)).map(mapItem)
      : undefined,
  };
}

function isHiddenModuleItem(item: AuthUserModuleItem) {
  return HiddenModuleKeys.has(item.key);
}

function findFirstLink(item: AuthUserModuleItem): AuthUserModuleItem | undefined {
  if (item.itemType === "LINK") return item;
  for (const child of item.children) {
    const link = findFirstLink(child);
    if (link) return link;
  }
}

function getAccessKey(item: AuthUserModuleItem): MainAccessKey {
  const sectionKey = item.key
    .split("-")
    .slice(0, item.key.startsWith("cash-") || item.key.startsWith("general-") || item.key.startsWith("accounts-") ? 2 : 1)
    .join("-");
  if (item.key.includes("user")) return "maintenance.users";
  if (item.key.includes("audit")) return "maintenance.audit";
  if (item.key.includes("approval")) return "maintenance.approval";
  if (item.key.includes("charts-of-accounts")) return "maintenance.chartOfAccounts";
  if (item.key.includes("bank-masterfile")) return "maintenance.bankMasterfile";
  if (item.key.includes("default-account")) return "maintenance.defaultAccount";
  if (item.key.includes("services-maintenance")) return "maintenance.servicesMaintenance";
  if (item.key.includes("discount-maintenance")) return "maintenance.discount";
  if (item.key.includes("payment-type")) return "maintenance.paymentType";
  if (item.key.includes("responsibility-center")) return "maintenance.responsibilityCenter";
  if (item.key.includes("terms-maintenance")) return "maintenance.term";
  if (item.key.includes("delivery-vehicle")) return "maintenance.deliveryVehicle";
  if (item.key.includes("warehouse")) return "maintenance.warehouse";
  if (item.key.includes("item")) return "maintenance.item";
  if (item.key.includes("party-management")) return "maintenance.party";
  return SectionAccess[item.key] ?? SectionAccess[sectionKey] ?? "settings";
}
