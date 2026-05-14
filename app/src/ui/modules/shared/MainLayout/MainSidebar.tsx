"use client";

import { createElement, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeDollarSign,
  BadgePercent,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock3,
  Coins,
  CreditCard,
  FileBarChart,
  FileCheck2,
  FileText,
  Gauge,
  GitBranch,
  Landmark,
  LayoutDashboard,
  ListTree,
  Mail,
  Package,
  Receipt,
  ReceiptText,
  Ruler,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tags,
  UserCog,
  UserCircle,
  Users,
  WalletCards,
  Warehouse,
  X,
} from "lucide-react";
import type {
  MainIconName,
  MainNavigationItem,
  MainNavigationSection,
  MainSearchItem,
} from "@/app/src/data/modules/shared/MainLayoutData";

const QuickListInitialCount = 4;
const QuickListBatchSize = 6;
const SectionInitialCount = 8;
const SectionBatchSize = 8;
const DashboardInitialCount = 3;
const DashboardBatchSize = 3;
const NestedInitialCount = 5;
const NestedBatchSize = 6;

type MainSidebarProps = {
  activeHref: string;
  companyName: string;
  enabledQuickListTabs: Array<"favorites" | "recent">;
  expandedKeys: string[];
  favoriteModules: MainSearchItem[];
  homeHref: string;
  isOpen: boolean;
  navigationSections: MainNavigationSection[];
  quickListTab: "favorites" | "recent";
  recentlyVisitedModules: MainSearchItem[];
  onClose: () => void;
  onQuickListTabChange: (tab: "favorites" | "recent") => void;
  onToggleExpandedKey: (key: string) => void;
};

const MainIcons: Record<MainIconName, LucideIcon> = {
  approval: ShieldCheck,
  asset: Building2,
  branch: GitBranch,
  cashIn: ReceiptText,
  cashOut: WalletCards,
  dashboard: LayoutDashboard,
  favorite: Star,
  inventory: Boxes,
  journal: BookOpen,
  maintenance: Settings,
  payable: CreditCard,
  profile: UserCircle,
  purchasing: ShoppingCart,
  reports: BarChart3,
  sales: BadgeDollarSign,
  settings: Settings,
};

const SidebarItemIcons: Record<string, LucideIcon> = {
  "workspace-overview": Gauge,
  "workspace-companies": Building2,
  "workspace-users-roles": UserCog,
  "workspace-permissions": ShieldCheck,
  "workspace-audit": Activity,
  "workspace-module-financial-management": Landmark,
  "workspace-module-sales-management": BadgeDollarSign,
  "workspace-module-purchasing": ShoppingCart,
  "workspace-module-inventory": Boxes,
  "workspace-module-projects": ClipboardList,
  "workspace-module-human-resources": Users,
  "workspace-module-reports-analytics": FileBarChart,
  "dashboard-management": LayoutDashboard,
  "maintenance-financial": Landmark,
  "maintenance-charts-of-accounts": ListTree,
  "maintenance-currency": Coins,
  "maintenance-discount": BadgePercent,
  "maintenance-term": CalendarClock,
  "maintenance-transaction-type": Receipt,
  "maintenance-inventory-warehouse": Warehouse,
  "maintenance-warehouse": Warehouse,
  "maintenance-item": Package,
  "maintenance-item-category": Tags,
  "maintenance-item-sub-category": Tags,
  "maintenance-item-type": Package,
  "maintenance-item-sub-type": Package,
  "maintenance-item-unit": Ruler,
  "maintenance-party-management": Users,
  "maintenance-party": Users,
  "cash-disbursement-voucher": FileCheck2,
  "cash-disbursement-request-payment": FileText,
  "purchasing-canvass-form": ClipboardList,
  "reports-maintenance": Settings,
  "reports-financial": FileBarChart,
  "reports-books-of-accounts": BookOpen,
  "reports-general-ledger": BookOpen,
  "reports-journal-ledger": BookOpen,
  "reports-trial-balance": FileBarChart,
  "reports-balance-sheet": FileBarChart,
  "reports-income-statement": FileBarChart,
  "reports-cash-flow": FileBarChart,
  "reports-accounts-receivable": CreditCard,
  "reports-ar-aging": CalendarClock,
  "reports-ar-statement": FileText,
  "reports-inventory": Boxes,
  "reports-inventory-audit": Activity,
  "reports-inventory-item-query": Package,
  "reports-inventory-stock-movement": Warehouse,
  "reports-inventory-valuation": FileBarChart,
  "reports-bir": FileText,
  "reports-bir-vat-relief": FileText,
  "reports-bir-alpha-list": FileText,
  "maintenance-users": UserCog,
  "maintenance-approval": ShieldCheck,
  "maintenance-audit": Activity,
  "maintenance-mail": Mail,
  "system-transaction-numbering": ReceiptText,
};

export function MainSidebar({
  activeHref,
  companyName,
  enabledQuickListTabs,
  expandedKeys,
  favoriteModules,
  homeHref,
  isOpen,
  navigationSections,
  quickListTab,
  recentlyVisitedModules,
  onClose,
  onQuickListTabChange,
  onToggleExpandedKey,
}: MainSidebarProps) {
  const quickListItems =
    quickListTab === "favorites" ? favoriteModules : recentlyVisitedModules;
  const shouldShowQuickList = enabledQuickListTabs.length > 0;
  const [
    quickListVisibleCount,
    hasMoreQuickListItems,
    setQuickListSentinel,
  ] = useIncrementalVisibleCount(
    quickListItems.length,
    QuickListInitialCount,
    QuickListBatchSize,
    true,
  );
  const visibleQuickListItems = quickListItems.slice(
    0,
    quickListVisibleCount,
  );

  return (
    <aside
      data-main-sidebar-root
      className={joinClasses(
        "fixed inset-y-0 left-0 z-50 w-78 transform-gpu overflow-hidden border-r border-darknavy/10 bg-white shadow-[18px_0_45px_rgba(33,39,56,0.10)] transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none lg:bottom-0 lg:top-16 lg:z-20 lg:h-auto lg:shadow-none",
        isOpen
          ? "translate-x-0"
          : "pointer-events-none -translate-x-full",
      )}
    >
      <div className="flex h-full min-h-0 w-78 flex-col">
        <div className="flex items-center justify-between border-b border-darknavy/10 px-4 py-4">
          <Link
            href={homeHref}
            aria-label={`${companyName} dashboard`}
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-darknavy text-sm font-bold text-offwhite">
              G8
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold leading-5 text-darknavy">
                Gr8Books Lite
              </span>
              <span className="block truncate text-xs text-darknavy/55">
                {companyName}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          {shouldShowQuickList ? (
            <div className="mb-5">
              <div
                className={joinClasses(
                  "mb-2 grid gap-1 rounded-md bg-darknavy/5 p-1",
                  enabledQuickListTabs.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-2",
                )}
              >
                {enabledQuickListTabs.includes("favorites") ? (
                  <QuickListButton
                    icon={Star}
                    isActive={quickListTab === "favorites"}
                    label="Favorites"
                    onClick={() => onQuickListTabChange("favorites")}
                  />
                ) : null}
                {enabledQuickListTabs.includes("recent") ? (
                  <QuickListButton
                    icon={Clock3}
                    isActive={quickListTab === "recent"}
                    label="Recently"
                    onClick={() => onQuickListTabChange("recent")}
                  />
                ) : null}
              </div>

              <div className="space-y-1">
                {visibleQuickListItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={handleMobileNavigation(onClose)}
                    className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-darknavy/75 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-citron" />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                  </Link>
                ))}
                {hasMoreQuickListItems ? (
                  <div
                    ref={setQuickListSentinel}
                    className="h-3"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            {navigationSections.map((section) =>
              section.key === "workspace" || section.key === "workspace-modules" ? (
                <div key={section.key} className="space-y-3">
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/38">
                    {section.title}
                  </p>
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.key}
                      activeHref={activeHref}
                      expandedKeys={expandedKeys}
                      item={item}
                      depth={-1}
                      onNavigate={onClose}
                      onToggleExpandedKey={onToggleExpandedKey}
                    />
                  ))}
                </div>
              ) : (
                <SidebarSection
                  key={section.key}
                  activeHref={activeHref}
                  expandedKeys={expandedKeys}
                  section={section}
                  onNavigate={onClose}
                  onToggleExpandedKey={onToggleExpandedKey}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

type QuickListButtonProps = {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function QuickListButton({
  icon: Icon,
  isActive,
  label,
  onClick,
}: QuickListButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={joinClasses(
        "flex min-h-8 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
        isActive
          ? "bg-white text-darknavy shadow-sm"
          : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

type SidebarSectionProps = {
  activeHref: string;
  expandedKeys: string[];
  section: MainNavigationSection;
  onNavigate: () => void;
  onToggleExpandedKey: (key: string) => void;
};

function SidebarSection({
  activeHref,
  expandedKeys,
  section,
  onNavigate,
  onToggleExpandedKey,
}: SidebarSectionProps) {
  const Icon = MainIcons[section.icon];
  const isExpanded = expandedKeys.includes(section.key);
  const sectionInitialCount =
    section.key === "dashboard" ? DashboardInitialCount : SectionInitialCount;
  const sectionBatchSize =
    section.key === "dashboard" ? DashboardBatchSize : SectionBatchSize;
  const [
    sectionVisibleCount,
    hasMoreSectionItems,
    setSectionSentinel,
  ] = useIncrementalVisibleCount(
    section.items.length,
    sectionInitialCount,
    sectionBatchSize,
    isExpanded,
  );
  const visibleSectionItems = section.items.slice(
    0,
    sectionVisibleCount,
  );

  return (
    <section>
      <button
        type="button"
        onClick={() => onToggleExpandedKey(section.key)}
        aria-expanded={isExpanded}
        className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
      >
        <Icon className="h-4 w-4 shrink-0 text-darknavy/65" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{section.title}</span>
        <ChevronRight
          className={joinClasses(
            "h-4 w-4 shrink-0 text-darknavy/45 transition",
            isExpanded && "rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className={joinClasses(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-1 space-y-1">
            {visibleSectionItems.map((item) => (
              <SidebarItem
                key={item.key}
                activeHref={activeHref}
                expandedKeys={expandedKeys}
                item={item}
                depth={0}
                onNavigate={onNavigate}
                onToggleExpandedKey={onToggleExpandedKey}
              />
            ))}
            {hasMoreSectionItems ? (
              <div
                ref={setSectionSentinel}
                className="h-3"
                aria-hidden="true"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

type SidebarItemProps = {
  activeHref: string;
  depth: number;
  expandedKeys: string[];
  item: MainNavigationItem;
  onNavigate: () => void;
  onToggleExpandedKey: (key: string) => void;
};

function SidebarItem({
  activeHref,
  depth,
  expandedKeys,
  item,
  onNavigate,
  onToggleExpandedKey,
}: SidebarItemProps) {
  const hasChildren = Boolean(item.children?.length);
  const shouldShowIcon = depth < 0 || hasChildren;
  const shouldShowModuleDot = !shouldShowIcon;
  const childItems = item.children ?? [];
  const isExpanded = expandedKeys.includes(item.key);
  const isActive = hasChildren
    ? activeHref === item.href || activeHref.startsWith(`${item.href}/`)
    : activeHref === item.href;
  const paddingClass =
    depth < 0
      ? "px-3"
      : depth === 0
        ? "pl-8 pr-3"
      : depth === 1
        ? "pl-11 pr-3"
        : "pl-14 pr-3";
  const [
    childVisibleCount,
    hasMoreChildItems,
    setChildSentinel,
  ] = useIncrementalVisibleCount(
    childItems.length,
    NestedInitialCount,
    NestedBatchSize,
    hasChildren && isExpanded,
  );
  const visibleChildItems = childItems.slice(0, childVisibleCount);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleExpandedKey(item.key)}
          aria-expanded={isExpanded}
          className={joinClasses(
            "group relative flex min-h-9 w-full items-center gap-2 rounded-md py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
            paddingClass,
            isActive
              ? "rounded-2xl bg-blue-50 font-semibold text-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.10)] ring-1 ring-blue-100 hover:bg-blue-50"
              : "text-darknavy/70 hover:bg-blue-50/70 hover:text-blue-600",
          )}
        >
          {shouldShowIcon ? renderSidebarItemIcon(item, isActive) : null}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <ChevronRight
            className={joinClasses(
              "h-4 w-4 shrink-0 transition",
              isActive
                ? "text-blue-500/70"
                : "text-darknavy/40 group-hover:text-blue-500",
              isExpanded && "rotate-90",
            )}
            aria-hidden="true"
          />
        </button>

        <div
          className={joinClasses(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-1 space-y-1">
              {visibleChildItems.map((childItem) => (
                <SidebarItem
                  key={childItem.key}
                  activeHref={activeHref}
                  expandedKeys={expandedKeys}
                  item={childItem}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                  onToggleExpandedKey={onToggleExpandedKey}
                />
              ))}
              {hasMoreChildItems ? (
                <div
                  ref={setChildSentinel}
                  className="h-3"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={handleMobileNavigation(onNavigate)}
      className={joinClasses(
        "group relative flex min-h-9 items-center gap-2 rounded-md py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
        paddingClass,
        depth < 0 && "font-semibold",
        isActive
          ? "rounded-2xl bg-blue-50 font-semibold text-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.10)] ring-1 ring-blue-100 hover:bg-blue-50"
          : "text-darknavy/65 hover:bg-blue-50/70 hover:text-blue-600",
      )}
    >
      {shouldShowIcon ? renderSidebarItemIcon(item, isActive) : null}
      {shouldShowModuleDot ? (
        <span
          className={joinClasses(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-[background-color,box-shadow] group-hover:bg-blue-500 group-hover:shadow-[0_0_8px_rgba(37,99,235,0.38)]",
            isActive ? "bg-darknavy/25" : "bg-darknavy/30",
          )}
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function renderSidebarItemIcon(item: MainNavigationItem, isActive: boolean) {
  return createElement(getSidebarItemIcon(item), {
    "aria-hidden": true,
    className: joinClasses(
      "h-4 w-4 shrink-0 transition-[color,filter] group-hover:text-blue-600 group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.38)]",
      isActive ? "text-blue-600" : "text-darknavy/45",
    ),
  });
}

function getSidebarItemIcon(item: MainNavigationItem) {
  const exactIcon = SidebarItemIcons[item.key];

  if (exactIcon) {
    return exactIcon;
  }

  if (item.key.includes("invoice") || item.key.includes("receipt")) {
    return ReceiptText;
  }

  if (item.key.includes("voucher")) {
    return FileCheck2;
  }

  if (item.key.includes("bank")) {
    return Landmark;
  }

  if (item.key.includes("report")) {
    return FileBarChart;
  }

  switch (item.accessKey) {
    case "dashboard":
      return LayoutDashboard;
    case "cashReceipt":
      return ReceiptText;
    case "cashDisbursement":
      return WalletCards;
    case "accountsPayable":
      return CreditCard;
    case "generalJournal":
      return BookOpen;
    case "sales":
      return BadgeDollarSign;
    case "inventory":
      return Boxes;
    case "purchasing":
      return ShoppingCart;
    case "canvass":
      return ClipboardList;
    case "fixedAsset":
      return Building2;
    case "maintenance.mail":
      return Mail;
    case "maintenance.users":
      return UserCog;
    case "maintenance.approval":
      return ShieldCheck;
    case "maintenance.audit":
      return Activity;
    case "maintenance.warehouse":
      return Warehouse;
    case "maintenance.item":
      return Package;
    case "maintenance.party":
      return Users;
    case "maintenance.discount":
      return BadgePercent;
    case "reports.accounting":
    case "reports.inventory":
      return FileBarChart;
    default:
      return FileText;
  }
}

function handleMobileNavigation(onNavigate: () => void) {
  return () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onNavigate();
    }
  };
}

function useIncrementalVisibleCount(
  totalItems: number,
  initialCount: number,
  batchSize: number,
  isEnabled: boolean,
) {
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(totalItems, initialCount),
  );
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelNode(node);
  }, []);
  const clampedVisibleCount = Math.min(visibleCount, totalItems);

  useEffect(() => {
    if (!isEnabled || clampedVisibleCount >= totalItems || !sentinelNode) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((current) =>
          Math.min(totalItems, current + batchSize),
        );
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(sentinelNode);

    return () => {
      observer.disconnect();
    };
  }, [batchSize, clampedVisibleCount, isEnabled, sentinelNode, totalItems]);

  return [
    clampedVisibleCount,
    clampedVisibleCount < totalItems,
    sentinelRef,
  ] as const;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
