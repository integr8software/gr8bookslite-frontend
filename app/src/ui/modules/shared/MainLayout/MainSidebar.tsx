"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
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
  typeOfCompany: string;
  enabledQuickListTabs: Array<"recent">;
  expandedKeys: string[];
  homeHref: string;
  isOpen: boolean;
  navigationSections: MainNavigationSection[];
  quickListTab: "recent";
  recentlyVisitedModules: MainSearchItem[];
  shouldAutoScrollActiveItem: boolean;
  onClose: () => void;
  onNavigateFromSidebar: (href: string) => void;
  onQuickListTabChange: (tab: "recent") => void;
  onToggleExpandedKey: (key: string) => void;
};

const MainIcons: Record<MainIconName, LucideIcon> = {
  approval: ShieldCheck,
  asset: Building2,
  branch: GitBranch,
  cashIn: ReceiptText,
  cashOut: WalletCards,
  dashboard: LayoutDashboard,
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
  "maintenance-user-list": UserCog,
  "maintenance-user-type": Users,
  "maintenance-user-group": Users,
  "branch-management": GitBranch,
  "maintenance-approval": ShieldCheck,
  "maintenance-audit": Activity,
  "maintenance-mail": Mail,
  "system-transaction-numbering": ReceiptText,
};

export function MainSidebar({
  activeHref,
  companyName,
  typeOfCompany,
  enabledQuickListTabs,
  expandedKeys,
  homeHref,
  isOpen,
  navigationSections,
  quickListTab,
  recentlyVisitedModules,
  shouldAutoScrollActiveItem,
  onClose,
  onNavigateFromSidebar,
  onQuickListTabChange,
  onToggleExpandedKey,
}: MainSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingAutoScrollTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const clearSidebarNavigationTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const sidebarNavigationHrefRef = useRef<string | null>(null);
  const sidebarInteractionUntilRef = useRef(0);
  const quickListItems = recentlyVisitedModules;
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
  const suppressAutoScrollFromSidebarInteraction = useCallback(() => {
    sidebarInteractionUntilRef.current = Date.now() + 1800;

    if (pendingAutoScrollTimeoutRef.current) {
      clearTimeout(pendingAutoScrollTimeoutRef.current);
      pendingAutoScrollTimeoutRef.current = null;
    }
  }, []);
  const handleNavigateFromSidebar = useCallback(
    (href: string) => () => {
      suppressAutoScrollFromSidebarInteraction();
      sidebarNavigationHrefRef.current = href;

      if (clearSidebarNavigationTimeoutRef.current) {
        clearTimeout(clearSidebarNavigationTimeoutRef.current);
      }

      clearSidebarNavigationTimeoutRef.current = setTimeout(() => {
        sidebarNavigationHrefRef.current = null;
        clearSidebarNavigationTimeoutRef.current = null;
      }, 5000);

      onNavigateFromSidebar(href);

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        onClose();
      }
    },
    [onClose, onNavigateFromSidebar, suppressAutoScrollFromSidebarInteraction],
  );

  useEffect(() => {
    if (!isOpen || !shouldAutoScrollActiveItem) {
      return;
    }

    if (Date.now() < sidebarInteractionUntilRef.current) {
      return;
    }

    if (sidebarNavigationHrefRef.current) {
      if (!pathMatches(sidebarNavigationHrefRef.current, activeHref)) {
        return;
      }

      if (clearSidebarNavigationTimeoutRef.current) {
        clearTimeout(clearSidebarNavigationTimeoutRef.current);
      }

      clearSidebarNavigationTimeoutRef.current = setTimeout(() => {
        sidebarNavigationHrefRef.current = null;
        clearSidebarNavigationTimeoutRef.current = null;
      }, 1200);

      return;
    }

    sidebarNavigationHrefRef.current = null;
    if (clearSidebarNavigationTimeoutRef.current) {
      clearTimeout(clearSidebarNavigationTimeoutRef.current);
      clearSidebarNavigationTimeoutRef.current = null;
    }

    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const timeoutId = setTimeout(() => {
      pendingAutoScrollTimeoutRef.current = null;
      const activeItem = scrollContainer.querySelector<HTMLElement>(
        "[data-main-sidebar-active-item='true']",
      );

      activeItem?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }, 360);
    pendingAutoScrollTimeoutRef.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
      if (pendingAutoScrollTimeoutRef.current === timeoutId) {
        pendingAutoScrollTimeoutRef.current = null;
      }
    };
  }, [activeHref, expandedKeys, isOpen, shouldAutoScrollActiveItem]);

  useEffect(() => {
    return () => {
      if (clearSidebarNavigationTimeoutRef.current) {
        clearTimeout(clearSidebarNavigationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <aside
      data-main-sidebar-root
      onPointerDownCapture={suppressAutoScrollFromSidebarInteraction}
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
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-darknavy text-sm font-bold text-offwhite">
              G8
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold leading-5 text-darknavy">
                {companyName}
              </span>
              <span className="block truncate text-xs text-darknavy/55">
                {typeOfCompany}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 scroll-smooth overflow-y-auto overscroll-contain px-3 py-4"
        >
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
                    onClick={handleNavigateFromSidebar(item.href)}
                    className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-darknavy/75 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
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

          <div className="space-y-2">
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
                      onInteract={suppressAutoScrollFromSidebarInteraction}
                      onNavigateFromSidebar={handleNavigateFromSidebar}
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
                  onInteract={suppressAutoScrollFromSidebarInteraction}
                  onNavigateFromSidebar={handleNavigateFromSidebar}
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
        "flex min-h-8 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25",
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
  onInteract: () => void;
  onNavigateFromSidebar: (href: string) => () => void;
  onToggleExpandedKey: (key: string) => void;
};

function SidebarSection({
  activeHref,
  expandedKeys,
  section,
  onInteract,
  onNavigateFromSidebar,
  onToggleExpandedKey,
}: SidebarSectionProps) {
  const Icon = MainIcons[section.icon];
  const isExpanded = expandedKeys.includes(section.key);
  const sectionInitialCount =
    section.key === "dashboard" ? DashboardInitialCount : SectionInitialCount;
  const sectionBatchSize =
    section.key === "dashboard" ? DashboardBatchSize : SectionBatchSize;
  const activeItemVisibleCount = getVisibleCountToActiveItem(
    section.items,
    activeHref,
  );
  const [
    sectionVisibleCount,
    hasMoreSectionItems,
    setSectionSentinel,
  ] = useIncrementalVisibleCount(
    section.items.length,
    Math.max(sectionInitialCount, activeItemVisibleCount),
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
        onClick={() => {
          onInteract();
          onToggleExpandedKey(section.key);
        }}
        aria-expanded={isExpanded}
        className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
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
                onInteract={onInteract}
                onNavigateFromSidebar={onNavigateFromSidebar}
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
  onInteract: () => void;
  onNavigateFromSidebar: (href: string) => () => void;
  onToggleExpandedKey: (key: string) => void;
};

function SidebarItem({
  activeHref,
  depth,
  expandedKeys,
  item,
  onInteract,
  onNavigateFromSidebar,
  onToggleExpandedKey,
}: SidebarItemProps) {
  const hasChildren = Boolean(item.children?.length);
  const shouldShowIcon = depth < 0 || hasChildren;
  const shouldShowModuleDot = !shouldShowIcon;
  const childItems = item.children ?? [];
  const isExpanded = expandedKeys.includes(item.key);
  const isExactActive = activeHref === item.href;
  const isDescendantActive =
    !isExactActive && activeHref.startsWith(`${item.href}/`);
  const isAncestorActive = hasChildren && isDescendantActive;
  const isActive = hasChildren
    ? isExactActive || isDescendantActive
    : pathMatches(item.href, activeHref);
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
    Math.max(NestedInitialCount, getVisibleCountToActiveItem(childItems, activeHref)),
    NestedBatchSize,
    hasChildren && isExpanded,
  );
  const visibleChildItems = childItems.slice(0, childVisibleCount);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            onInteract();
            onToggleExpandedKey(item.key);
          }}
          aria-expanded={isExpanded}
          data-main-sidebar-active-item={isExactActive ? "true" : undefined}
          className={joinClasses(
            "group relative flex min-h-9 w-full items-center gap-2 rounded-md py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
            paddingClass,
            isAncestorActive
              ? "font-semibold text-blue-600 hover:bg-blue-50/45"
              : isExactActive
                ? "rounded-2xl bg-blue-50 font-semibold text-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.10)] ring-1 ring-blue-100 hover:bg-blue-50"
                : "text-darknavy/70 hover:bg-blue-50/70 hover:text-blue-600",
          )}
        >
          {shouldShowIcon
            ? renderSidebarItemIcon(item, isActive, isAncestorActive)
            : null}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <ChevronRight
            className={joinClasses(
              "h-4 w-4 shrink-0 transition",
              isAncestorActive
                ? "text-blue-500/80"
                : isExactActive
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
                  onInteract={onInteract}
                  onNavigateFromSidebar={onNavigateFromSidebar}
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
      onClick={onNavigateFromSidebar(item.href)}
      data-main-sidebar-active-item={isActive ? "true" : undefined}
      className={joinClasses(
        "group relative flex min-h-9 items-center gap-2 rounded-md py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
        paddingClass,
        depth < 0 && "font-semibold",
        isActive
          ? "rounded-2xl bg-blue-50 font-semibold text-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.10)] ring-1 ring-blue-100 hover:bg-blue-50"
          : "text-darknavy/65 hover:bg-blue-50/70 hover:text-blue-600",
      )}
    >
      {shouldShowIcon ? renderSidebarItemIcon(item, isActive, false) : null}
      {shouldShowModuleDot ? (
        <span
          className={joinClasses(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-[background-color,box-shadow] group-hover:bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.36)]",
            isActive
              ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.36)]"
              : "bg-darknavy/30",
          )}
          aria-hidden="true"
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function renderSidebarItemIcon(
  item: MainNavigationItem,
  isActive: boolean,
  isAncestorActive: boolean,
) {
  return createElement(getSidebarItemIcon(item), {
    "aria-hidden": true,
    className: joinClasses(
      "h-4 w-4 shrink-0 transition-[color,filter] group-hover:text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.32)]",
      isAncestorActive
        ? "text-blue-500/80"
        : isActive
          ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.28)]"
          : "text-darknavy/45",
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

function pathMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getVisibleCountToActiveItem(
  items: MainNavigationItem[],
  activeHref: string,
) {
  const activeIndex = items.findIndex((item) => itemMatchesActiveHref(item, activeHref));

  return activeIndex >= 0 ? activeIndex + 1 : 0;
}

function itemMatchesActiveHref(
  item: MainNavigationItem,
  activeHref: string,
): boolean {
  if (pathMatches(item.href, activeHref)) {
    return true;
  }

  return Boolean(
    item.children?.some((child) => itemMatchesActiveHref(child, activeHref)),
  );
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
  const clampedVisibleCount = Math.min(
    Math.max(visibleCount, initialCount),
    totalItems,
  );

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
  }, [
    batchSize,
    clampedVisibleCount,
    isEnabled,
    sentinelNode,
    totalItems,
  ]);

  return [
    clampedVisibleCount,
    clampedVisibleCount < totalItems,
    sentinelRef,
  ] as const;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
