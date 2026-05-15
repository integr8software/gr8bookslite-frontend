"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import {
  MainCompanyNavigationSections,
  MainCompanySearchItems,
  ModuleShellMockData,
  MainWorkspaceNavigationSections,
  MainWorkspaceSearchItems,
  filterMainNavigationSections,
  filterMainSearchItems,
  getAccessibleBranches,
  hasAccess,
  type MainCurrentUser,
  type MainBranch,
  type MainNavigationItem,
  type MainNavigationScope,
  type MainNavigationSection,
  type MainNotification,
  type MainSearchItem,
} from "@/app/src/data/modules/shared/MainLayoutData";
import {
  ModuleHelpArticles,
  getHelpArticleForPath,
} from "@/app/src/data/modules/shared/ModuleHelp";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useBranchManagementStore } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagement";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";
import type { AuthProfileResponse } from "@/app/src/services/auth/AuthApiTypes";

const DefaultExpandedKeys = [
  "workspace",
  "workspace-modules",
  "dashboard",
  "maintenance",
  "maintenance-financial",
  "maintenance-inventory-warehouse",
  "cash-receipt",
  "cash-disbursement",
  "sales",
  "inventory",
  "reports",
  "reporting-analytics",
  "system-administration",
];

const WorkspaceRoutePrefix = "/workspace";
const WorkspaceHomeHref = "/workspace/dashboard";
const CompanyFallbackHomeHref = "/profile";

export type MainQuickListTab = "recent";

export type MainNotificationTab = "all" | "unread" | "read";

export type MainBreadcrumbDropdownItem = {
  key: string;
  label: string;
  href: string;
  helperText?: string;
  branchId?: string;
  isManagementAction?: boolean;
  kind?: MainBranch["kind"];
};

export type MainBreadcrumb = {
  key: string;
  label: string;
  href?: string;
  canOpenDropdown?: boolean;
  dropdownItems?: MainBreadcrumbDropdownItem[];
  isLoading?: boolean;
};

type NavigationTrailNode = {
  key: string;
  label: string;
  href?: string;
  dropdownItems?: MainBreadcrumbDropdownItem[];
};

export function useMainLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const storedAccessToken = useAppStore((state) => state.accessToken);
  const branchLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchOpenPath, setSearchOpenPath] = useState<string | null>(null);
  const [notificationsOpenPath, setNotificationsOpenPath] = useState<
    string | null
  >(null);
  const [helpOpenPath, setHelpOpenPath] = useState<string | null>(null);
  const [quickListTab, setQuickListTab] = useState<MainQuickListTab>("recent");
  const [notificationTab, setNotificationTab] =
    useState<MainNotificationTab>("all");
  const [manualExpandedKeys, setManualExpandedKeys] =
    useState<string[]>(DefaultExpandedKeys);
  const [sidebarNavigationPath, setSidebarNavigationPath] = useState<
    string | null
  >(null);
  const [queryState, setQueryState] = useState({
    pathname,
    value: "",
  });
  const [activeBranchId, setActiveBranchId] = useState(
    ModuleShellMockData.activeBranchId,
  );
  const accessToken = storedAccessToken;
  const { data: authProfile, isLoading: isAuthProfileLoading } =
    useAuthProfileQuery({ accessToken });
  const isWorkspaceRoute = isWorkspacePath(pathname);
  const hasWorkspaceAccess =
    isWorkspaceRoute && authProfile
      ? ProfileHasWorkspaceAccess(authProfile)
      : ModuleShellMockData.currentUser.userRole === "Super Admin";
  const displayUser =
    isWorkspaceRoute && authProfile
      ? CreateWorkspaceCurrentUserFromProfile(authProfile)
      : ModuleShellMockData.currentUser;
  const isProfileLoading =
    Boolean(accessToken) && isWorkspaceRoute ? isAuthProfileLoading : false;
  const activeNavigationScope: MainNavigationScope =
    hasWorkspaceAccess && isWorkspaceRoute ? "workspace" : "company";
  const workspaceCompanies =
    isWorkspaceRoute && authProfile
      ? MapProfileCompaniesToMainCompanies(authProfile)
      : null;
  const [activeCompanyId, setActiveCompanyId] = useState(
    ModuleShellMockData.currentCompany.id,
  );
  const [lazyLoadedBranches, setLazyLoadedBranches] = useState<
    MainBranch[] | null
  >(null);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [notifications, setNotifications] = useState<MainNotification[]>(
    ModuleShellMockData.notifications,
  );
  const branches = useBranchManagementStore((state) => state.branches);
  const query = queryState.pathname === pathname ? queryState.value : "";
  const isSearchOpen = searchOpenPath === pathname;
  const isNotificationsOpen = notificationsOpenPath === pathname;
  const isHelpOpen = helpOpenPath === pathname;

  const subscription = ModuleShellMockData.activeSubscription;
  const availableCompanies =
    workspaceCompanies ?? ModuleShellMockData.availableCompanies;
  const currentCompany =
    availableCompanies.find((company) => company.id === activeCompanyId) ??
    availableCompanies[0] ??
    ModuleShellMockData.currentCompany;

  const navigationSections = useMemo(() => {
    const sourceSections =
      activeNavigationScope === "workspace"
        ? MainWorkspaceNavigationSections
        : MainCompanyNavigationSections;

    return filterMainNavigationSections(
      sourceSections,
      ModuleShellMockData.currentUser,
      subscription,
    );
  }, [activeNavigationScope, subscription]);
  const activeExpandedKeys = useMemo(
    () => getActiveExpandedKeys(navigationSections, pathname),
    [navigationSections, pathname],
  );
  const shouldAutoRevealActiveRoute = sidebarNavigationPath !== pathname;
  const expandedKeys = useMemo(
    () =>
      Array.from(
        new Set([
          ...manualExpandedKeys,
          ...(shouldAutoRevealActiveRoute ? activeExpandedKeys : []),
        ]),
      ),
    [activeExpandedKeys, manualExpandedKeys, shouldAutoRevealActiveRoute],
  );

  const availableSearchItems = useMemo(() => {
    const sourceItems =
      activeNavigationScope === "workspace"
        ? MainWorkspaceSearchItems
        : MainCompanySearchItems;

    return filterMainSearchItems(
      sourceItems,
      ModuleShellMockData.currentUser,
      subscription,
    );
  }, [activeNavigationScope, subscription]);
  const companySearchItems = useMemo(
    () =>
      filterMainSearchItems(
        MainCompanySearchItems,
        ModuleShellMockData.currentUser,
        subscription,
      ),
    [subscription],
  );
  const companyHomeHref = getCompanyHomeHref(
    companySearchItems,
    ModuleShellMockData.recentNavigationKeys,
  );
  const homeHref =
    activeNavigationScope === "workspace" ? WorkspaceHomeHref : companyHomeHref;

  const recentlyVisitedModules = useMemo(() => {
    if (activeNavigationScope !== "company") {
      return [];
    }

    return findSearchItemsByKeys(
      availableSearchItems,
      ModuleShellMockData.recentNavigationKeys,
    );
  }, [activeNavigationScope, availableSearchItems]);

  const enabledQuickListTabs = useMemo(() => {
    if (activeNavigationScope !== "company") {
      return [] as MainQuickListTab[];
    }

    const tabs: MainQuickListTab[] = [];
    tabs.push("recent");

    return tabs;
  }, [activeNavigationScope]);
  const activeQuickListTab = enabledQuickListTabs.includes(quickListTab)
    ? quickListTab
    : (enabledQuickListTabs[0] ?? quickListTab);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableSearchItems.slice(0, 8);
    }

    return availableSearchItems
      .filter((item) => matchesSearchQuery(item, normalizedQuery))
      .slice(0, 12);
  }, [availableSearchItems, query]);

  const accessibleBranches = useMemo(
    () => sortBranchesByPriority(getAccessibleBranches(branches)),
    [branches],
  );
  const hasBranchAccess = accessibleBranches.length > 0;
  const shouldShowBranchSwitcher = shouldShowBranchControls(accessibleBranches);
  const currentBranch =
    accessibleBranches.find((branch) => branch.id === activeBranchId) ??
    accessibleBranches[0] ??
    null;
  const canManageBranches = hasAccess(
    ModuleShellMockData.currentUser,
    "branch.management",
  );

  useEffect(() => {
    if (!authProfile?.activeCompanyId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the layout company switcher synced with the loaded profile.
    setActiveCompanyId(String(authProfile.activeCompanyId));
  }, [authProfile?.activeCompanyId]);

  const branchDropdownItems = useMemo(() => {
    if (!shouldShowBranchSwitcher) {
      return [];
    }

    const branchItems =
      lazyLoadedBranches
        ?.filter((branch) => branch.kind)
        .map((branch) => ({
          key: branch.id,
          label: getBranchSwitcherLabel(branch),
          href: companyHomeHref,
          branchId: branch.id,
          kind: branch.kind,
        })) ?? [];

    if (!canManageBranches) {
      return branchItems;
    }

    return [
      ...branchItems,
      {
        key: "branch-management",
        label: "Branch Management",
        href: BranchManagementHref,
        helperText: "Manage branch and satellite records",
        isManagementAction: true,
      },
    ];
  }, [
    canManageBranches,
    companyHomeHref,
    lazyLoadedBranches,
    shouldShowBranchSwitcher,
  ]);

  const breadcrumbs = useMemo(
    () =>
      buildBreadcrumbs({
        pathname,
        navigationSections,
        activeNavigationScope,
      }),
    [activeNavigationScope, navigationSections, pathname],
  );
  const moduleTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? "Module";

  const currentHelpArticle = useMemo(
    () =>
      getHelpArticleForPath(pathname, ModuleHelpArticles) ??
      ModuleHelpArticles[0],
    [pathname],
  );
  const [selectedHelpArticleState, setSelectedHelpArticleState] = useState({
    pathname,
    key: currentHelpArticle.key,
  });
  const selectedHelpArticleKey =
    selectedHelpArticleState.pathname === pathname
      ? selectedHelpArticleState.key
      : currentHelpArticle.key;

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const visibleNotifications = notifications.filter((notification) => {
    if (notificationTab === "all") {
      return true;
    }

    return notificationTab === "unread"
      ? !notification.isRead
      : notification.isRead;
  });

  useEffect(
    () => () => {
      if (branchLoadTimerRef.current) {
        clearTimeout(branchLoadTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function syncSidebarToViewport(
      event: MediaQueryList | MediaQueryListEvent,
    ) {
      setIsSidebarOpen(event.matches);
    }

    syncSidebarToViewport(mediaQuery);
    mediaQuery.addEventListener("change", syncSidebarToViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebarToViewport);
    };
  }, []);

  function toggleSidebar() {
    setIsSidebarOpen((current) => !current);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function toggleSearch() {
    setSearchOpenPath((current) => (current === pathname ? null : pathname));
    setNotificationsOpenPath(null);
  }

  function closeSearch() {
    setSearchOpenPath(null);
    setQueryState({ pathname, value: "" });
  }

  function toggleNotifications() {
    setNotificationsOpenPath((current) =>
      current === pathname ? null : pathname,
    );
    setSearchOpenPath(null);
  }

  function closeNotifications() {
    setNotificationsOpenPath(null);
  }

  function openHelp() {
    setSelectedHelpArticleState({ pathname, key: currentHelpArticle.key });
    setHelpOpenPath(pathname);
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
  }

  function closeHelp() {
    setHelpOpenPath(null);
  }

  function updateQuery(value: string) {
    setQueryState({ pathname, value });
  }

  function selectHelpArticle(articleKey: string) {
    setSelectedHelpArticleState({ pathname, key: articleKey });
  }

  function toggleExpandedKey(key: string) {
    setManualExpandedKeys((current) =>
      current.includes(key)
        ? current.filter((expandedKey) => expandedKey !== key)
        : [...current, key],
    );
  }

  function markSidebarNavigation(href: string) {
    setSidebarNavigationPath(href);
  }

  function loadBranchOptions() {
    if (lazyLoadedBranches || isBranchLoading) {
      return;
    }

    setIsBranchLoading(true);
    branchLoadTimerRef.current = setTimeout(() => {
      setLazyLoadedBranches(accessibleBranches);
      setIsBranchLoading(false);
    }, 280);
  }

  function selectBranch(branchId: string) {
    setActiveBranchId(branchId);
  }

  function selectCompany(companyId: string) {
    setActiveCompanyId(companyId);
    setActiveBranchId(getDefaultAccessibleBranchId(branches));
    setLazyLoadedBranches(null);
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    router.push(companyHomeHref);
  }

  function switchToWorkspace() {
    if (!hasWorkspaceAccess) {
      return;
    }

    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    router.push(WorkspaceHomeHref);
  }

  function markNotificationAsRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  }

  function markAllNotificationsAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
  }

  return {
    activeHref: pathname,
    activeNavigationScope,
    availableCompanies,
    branchDropdownItems,
    breadcrumbs,
    canAccessWorkspace: hasWorkspaceAccess,
    canSwitchCompany: availableCompanies.length > 1,
    currentBranch,
    currentCompany,
    currentHelpArticle,
    currentUser: displayUser,
    enabledQuickListTabs,
    expandedKeys,
    hasBranchAccess,
    helpArticles: ModuleHelpArticles,
    homeHref,
    isProfileLoading,
    isBranchLoading,
    shouldShowBranchSwitcher,
    isHelpOpen,
    isNotificationsOpen,
    isSearchOpen,
    isSidebarOpen,
    moduleTitle,
    navigationSections,
    notificationTab,
    query,
    quickListTab: activeQuickListTab,
    recentlyVisitedModules,
    searchResults,
    selectedHelpArticleKey,
    shouldAutoRevealActiveRoute,
    unreadNotificationCount,
    visibleNotifications,
    closeHelp,
    closeNotifications,
    closeSearch,
    closeSidebar,
    loadBranchOptions,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    markSidebarNavigation,
    openHelp,
    selectBranch,
    selectCompany,
    setNotificationTab,
    setQuery: updateQuery,
    setQuickListTab,
    setSelectedHelpArticleKey: selectHelpArticle,
    toggleExpandedKey,
    toggleNotifications,
    toggleSearch,
    toggleSidebar,
    switchToWorkspace,
  };
}

function shouldShowBranchControls(branches: MainBranch[]) {
  if (branches.length === 0) {
    return false;
  }

  if (!branches.some((branch) => branch.kind)) {
    return false;
  }

  if (branches.length === 1 && branches[0]?.kind === "satellite") {
    return false;
  }

  return true;
}

function ProfileHasWorkspaceAccess(profile: AuthProfileResponse) {
  if (profile.user.systemRole === "SUPER_ADMIN") {
    return true;
  }

  if (profile.activeAccess?.membershipRole === "ADMIN") {
    return true;
  }

  return (
    profile.companies?.some((company) => company.role === "ADMIN") ?? false
  );
}

function CreateWorkspaceCurrentUserFromProfile(
  profile: AuthProfileResponse,
): MainCurrentUser {
  const fallbackUserType = ModuleShellMockData.currentUser.userType;
  const [firstName, ...lastNameParts] = profile.user.name.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");
  const activeCompanyMembership =
    profile.companies?.find(
      (company) => company.companyId === profile.activeCompanyId,
    ) ?? profile.companies?.[0];
  const companyRoleName = FormatCompanyRoleName(
    activeCompanyMembership?.companyRoleCode,
  );

  return {
    ...ModuleShellMockData.currentUser,
    firstName: firstName || profile.user.name,
    lastName,
    name: profile.user.name,
    shortName: BuildShortName(profile.user.name),
    initials: BuildInitials(profile.user.name),
    userRole:
      profile.user.systemRole === "SUPER_ADMIN"
        ? "Super Admin"
        : profile.activeAccess?.membershipRole === "ADMIN"
          ? "Admin"
          : "User",
    userType: companyRoleName
      ? {
          ...(fallbackUserType ?? {
            id: "user-type-workspace",
            name: "Workspace User",
            permissions: {},
          }),
          id:
            activeCompanyMembership?.companyRoleCode ??
            fallbackUserType?.id ??
            "user-type-workspace",
          name: companyRoleName,
        }
      : undefined,
  };
}

function MapProfileCompaniesToMainCompanies(profile: AuthProfileResponse) {
  return (profile.companies ?? []).map((company) => ({
    id: String(company.companyId),
    name: company.companyName,
    logoUrl: undefined,
    status: "Active" as const,
    businessKind: undefined,
    subscriptionPackage: undefined,
    branches: [],
    totalBranches: 0,
    branchCode: undefined,
    branchName: undefined,
    helperText: company.role === "ADMIN" ? "Admin access" : "User access",
  }));
}

function FormatCompanyRoleName(companyRoleCode: string | null | undefined) {
  if (!companyRoleCode) {
    return undefined;
  }

  return companyRoleCode
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function BuildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function BuildShortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return name;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function buildBreadcrumbs({
  pathname,
  navigationSections,
  activeNavigationScope,
}: {
  pathname: string;
  navigationSections: MainNavigationSection[];
  activeNavigationScope: MainNavigationScope;
}): MainBreadcrumb[] {
  const trail = findNavigationTrail(navigationSections, pathname);
  const fallbackLabel =
    activeNavigationScope === "workspace"
      ? "Dashboard"
      : getPathFallbackTitle(pathname);
  const fallbackTrail =
    trail.length > 0
      ? trail
      : [
          {
            key: `${activeNavigationScope}-fallback`,
            label: fallbackLabel,
            href: pathname,
          },
        ];
  const normalizedTrail =
    activeNavigationScope === "workspace" &&
    fallbackTrail[0]?.label === "Workspace"
      ? fallbackTrail.slice(1)
      : fallbackTrail;
  const completeTrail = appendPathSegmentBreadcrumbs(normalizedTrail, pathname);

  return completeTrail.map((item) => ({
    key: item.key,
    label: item.label,
    href: item.href,
    canOpenDropdown: Boolean(item.dropdownItems?.length),
    dropdownItems: item.dropdownItems,
  }));
}

function findNavigationTrail(
  sections: MainNavigationSection[],
  pathname: string,
): NavigationTrailNode[] {
  const sectionDropdownItems = sections.map(toSectionDropdownItem);

  for (const section of sections) {
    const itemTrail = findItemTrail(section.items, pathname);
    const sectionHref = getSectionTargetHref(section);

    if (itemTrail.length > 0) {
      return [
        {
          key: section.key,
          label: section.title,
          href: sectionHref,
          dropdownItems: sectionDropdownItems,
        },
        ...itemTrail,
      ];
    }

    if (section.href && pathMatches(section.href, pathname)) {
      return [
        {
          key: section.key,
          label: section.title,
          href: sectionHref,
          dropdownItems: sectionDropdownItems,
        },
      ];
    }
  }

  return [];
}

function appendPathSegmentBreadcrumbs(
  trail: NavigationTrailNode[],
  pathname: string,
): NavigationTrailNode[] {
  const lastHref = trail[trail.length - 1]?.href;

  if (!lastHref || lastHref === pathname || !pathMatches(lastHref, pathname)) {
    return trail;
  }

  const extraSegments = pathname
    .slice(lastHref.length)
    .split("/")
    .filter(Boolean);

  return [
    ...trail,
    ...extraSegments.map((segment, index) => ({
      key: `path-${extraSegments.slice(0, index + 1).join("-")}`,
      label: titleFromPathSegment(segment),
      href: index === extraSegments.length - 1 ? pathname : undefined,
    })),
  ];
}

function findItemTrail(
  items: MainNavigationItem[],
  pathname: string,
): NavigationTrailNode[] {
  const siblingDropdownItems = items.map(toDropdownItem);

  for (const item of items) {
    const childTrail = item.children
      ? findItemTrail(item.children, pathname)
      : [];

    if (childTrail.length > 0) {
      return [
        {
          key: item.key,
          label: item.label,
          href: getItemTargetHref(item),
          dropdownItems: siblingDropdownItems,
        },
        ...childTrail,
      ];
    }

    const isCurrentItem = pathMatches(item.href, pathname);

    if (isCurrentItem) {
      return [
        {
          key: item.key,
          label: item.label,
          href: getItemTargetHref(item),
          dropdownItems: siblingDropdownItems,
        },
      ];
    }
  }

  return [];
}

function getActiveExpandedKeys(
  sections: MainNavigationSection[],
  pathname: string,
): string[] {
  const activeKeys: string[] = [];

  for (const section of sections) {
    const itemKeys = getActiveItemAncestorKeys(section.items, pathname);

    if (
      itemKeys.length > 0 ||
      (section.href && pathMatches(section.href, pathname))
    ) {
      activeKeys.push(section.key, ...itemKeys);
    }
  }

  return activeKeys;
}

function getActiveItemAncestorKeys(
  items: MainNavigationItem[],
  pathname: string,
): string[] {
  for (const item of items) {
    if (item.children?.length) {
      const childKeys = getActiveItemAncestorKeys(item.children, pathname);

      if (childKeys.length > 0 || pathMatches(item.href, pathname)) {
        return [item.key, ...childKeys];
      }
    }

    if (pathMatches(item.href, pathname)) {
      return [];
    }
  }

  return [];
}

function pathMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isWorkspacePath(pathname: string) {
  return (
    pathname === WorkspaceRoutePrefix ||
    pathname.startsWith(`${WorkspaceRoutePrefix}/`)
  );
}

function getPathFallbackTitle(pathname: string) {
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  if (!lastSegment) {
    return "Dashboard";
  }

  return titleFromPathSegment(lastSegment);
}

function titleFromPathSegment(segment: string) {
  return segment
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toSectionDropdownItem(
  section: MainNavigationSection,
): MainBreadcrumbDropdownItem {
  const firstItem = section.items[0];

  return {
    key: section.key,
    label: section.title,
    href: getSectionTargetHref(section),
    helperText:
      getNavigationDropdownHelperText(section.key) ??
      (firstItem ? `Starts at ${firstItem.label}` : undefined),
  };
}

function toDropdownItem(item: MainNavigationItem): MainBreadcrumbDropdownItem {
  const firstChild = item.children?.[0];

  return {
    key: item.key,
    label: item.label,
    href: getItemTargetHref(item),
    helperText:
      getNavigationDropdownHelperText(item.key) ??
      (firstChild ? `Starts at ${firstChild.label}` : undefined),
  };
}

function getNavigationDropdownHelperText(key: string) {
  if (key.startsWith("workspace")) {
    return undefined;
  }

  return NavigationDropdownHelperText[key];
}

const NavigationDropdownHelperText: Record<string, string> = {
  dashboard: "View company activity, approvals, and performance.",
  maintenance: "Maintain reusable setup records for company operations.",
  "cash-receipt": "Record and reconcile incoming payments.",
  "cash-disbursement": "Prepare and track outgoing payments.",
  "accounts-payable": "Manage supplier obligations and payable records.",
  "general-journal": "Post manual journal entries and adjustments.",
  sales: "Manage customer sales, billing, and account documents.",
  inventory: "Track stock movements, requests, receipts, and issues.",
  purchasing: "Manage purchase requests, canvassing, and supplier orders.",
  others: "Track supporting asset and miscellaneous records.",
  "reporting-analytics":
    "Generate accounting, inventory, and compliance reports.",
  "system-administration":
    "Manage users, approvals, audits, numbering, and mail setup.",
  "dashboard-overview": "View company activity, approvals, and performance.",
  "maintenance-financial-management":
    "Maintain financial setup records used by accounting workflows.",
  "maintenance-financial-management-charts-of-accounts":
    "Maintain account codes used by transactions and reports.",
  "maintenance-financial-management-multi-currency-setup":
    "Configure currencies and exchange settings.",
  "maintenance-financial-management-discount-management":
    "Maintain discount rules for sales and purchasing.",
  "maintenance-financial-management-term-management":
    "Manage payment and collection terms.",
  "maintenance-financial-management-transaction-type":
    "Configure transaction classifications and numbering behavior.",
  "maintenance-inventory-warehouse-management-warehouse-management":
    "Maintain warehouse records and storage locations.",
  "maintenance-warehouse": "Maintain warehouse records and storage locations.",
  "maintenance-inventory-warehouse-management-item-management":
    "Maintain item master records.",
  "maintenance-item": "Maintain item master records.",
  "maintenance-inventory-warehouse-management-item-category":
    "Group items by category.",
  "maintenance-item-category": "Group items by category.",
  "maintenance-inventory-warehouse-management-item-subcategory":
    "Group items by subcategory.",
  "maintenance-item-sub-category": "Group items by subcategory.",
  "maintenance-inventory-warehouse-management-item-type":
    "Maintain item type classifications.",
  "maintenance-item-type": "Maintain item type classifications.",
  "maintenance-inventory-warehouse-management-item-subtype":
    "Maintain item subtype classifications.",
  "maintenance-item-sub-type": "Maintain item subtype classifications.",
  "maintenance-inventory-warehouse-management-item-uom":
    "Manage item units of measure.",
  "maintenance-item-unit": "Manage item units of measure.",
  "maintenance-inventory-warehouse-management":
    "Maintain inventory items, classifications, units, and warehouses.",
  "maintenance-party-management":
    "Maintain parties used across sales, purchasing, and accounting.",
  "maintenance-party-management-party-management":
    "Maintain customers, suppliers, vendors, members, and employees.",
  "maintenance-party":
    "Maintain customers, suppliers, vendors, members, and employees.",
  "cash-receipt-official-receipt": "Record official customer payments.",
  "cash-receipt-collection-receipt":
    "Record collections received from customers.",
  "cash-receipt-acknowledgement-receipt":
    "Acknowledge received payments before official posting.",
  "cash-receipt-provisional-receipt":
    "Record temporary receipts pending final confirmation.",
  "cash-receipt-bank-reconciliation":
    "Match bank transactions against company records.",
  "cash-receipt-product-distribution-center-warehouse":
    "Track product distribution center warehouse receipts.",
  "cash-disbursement-disbursement-voucher":
    "Prepare and track payment vouchers.",
  "cash-disbursement-voucher": "Prepare and track payment vouchers.",
  "cash-disbursement-cash-advance": "Record employee cash advances.",
  "cash-disbursement-cash-advance-multiple-entry":
    "Record cash advances across multiple entries.",
  "cash-disbursement-cash-advance-multiple":
    "Record cash advances across multiple entries.",
  "cash-disbursement-petty-cash-disbursement":
    "Record petty cash disbursements.",
  "cash-disbursement-petty-cash": "Record petty cash disbursements.",
  "cash-disbursement-petty-cash-fund":
    "Manage petty cash fund setup and balances.",
  "cash-disbursement-petty-cash-replenishment": "Replenish petty cash funds.",
  "cash-disbursement-petty-cash-advance": "Record petty cash advances.",
  "cash-disbursement-request-for-payment": "Create and track payment requests.",
  "cash-disbursement-request-payment": "Create and track payment requests.",
  "cash-disbursement-advances-to-supplier":
    "Record supplier advances before final billing.",
  "accounts-payable-accounts-payable-voucher":
    "Create and track supplier payable vouchers.",
  "accounts-payable-voucher": "Create and track supplier payable vouchers.",
  "general-journal-journal-voucher":
    "Post manual journal entries and adjustments.",
  "general-journal-voucher": "Post manual journal entries and adjustments.",
  "sales-debit-memo": "Record debit adjustments to customer accounts.",
  "sales-credit-memo": "Record credit adjustments to customer accounts.",
  "sales-sales-quotation": "Prepare customer sales quotations.",
  "sales-quotation": "Prepare customer sales quotations.",
  "sales-sales-order": "Convert approved quotes into sales orders.",
  "sales-order": "Convert approved quotes into sales orders.",
  "sales-sales-invoice": "Bill customers for delivered goods or services.",
  "sales-invoice": "Bill customers for delivered goods or services.",
  "sales-billing": "Manage customer billing records.",
  "sales-billing-statement": "Generate customer billing statements.",
  "sales-billing-invoice": "Create billing invoices.",
  "sales-service-invoice": "Bill customers for services rendered.",
  "sales-cash-sales-invoice": "Record immediate cash sales invoices.",
  "sales-sales-journal": "Review and post sales journal entries.",
  "sales-journal": "Review and post sales journal entries.",
  "sales-statement-of-account": "Generate customer account statements.",
  "sales-statement-account": "Generate customer account statements.",
  "inventory-receiving-report": "Record received inventory items.",
  "inventory-goods-receipt": "Record goods received into inventory.",
  "inventory-inventory-account": "Monitor inventory account balances.",
  "inventory-account": "Monitor inventory account balances.",
  "inventory-material-request": "Request materials from inventory.",
  "inventory-pick-list": "Prepare items for picking and release.",
  "inventory-goods-issue": "Issue goods out of inventory.",
  "inventory-delivery-receipt": "Record delivered goods and receipts.",
  "purchasing-purchase-request": "Request items or services for purchase.",
  "purchasing-request": "Request items or services for purchase.",
  "purchasing-canvass-form": "Compare supplier canvass details.",
  "purchasing-purchase-order": "Create and track supplier purchase orders.",
  "purchasing-order": "Create and track supplier purchase orders.",
  "purchasing-purchase-journal": "Review and post purchase journal entries.",
  "purchasing-journal": "Review and post purchase journal entries.",
  "others-fixed-asset": "Track fixed asset records and movements.",
  "fixed-asset-default": "Track fixed asset records and movements.",
  "reports-maintenance": "Configure reusable report definitions and settings.",
  "reports-financial": "Generate financial statements and ledger reports.",
  "reports-books-of-accounts": "Generate books of accounts reports.",
  "reports-general-ledger": "Review general ledger account activity.",
  "reports-journal-ledger": "Review journal ledger entries.",
  "reports-trial-balance": "Generate trial balance summaries.",
  "reports-balance-sheet": "Generate balance sheet statements.",
  "reports-income-statement": "Generate income statement reports.",
  "reports-cash-flow": "Generate cash flow statements.",
  "reports-accounts-receivable": "Review customer receivable reports.",
  "reports-ar-aging": "Analyze overdue customer balances by aging bucket.",
  "reports-ar-statement": "Generate customer statements of account.",
  "reports-inventory": "Generate inventory movement and valuation reports.",
  "reports-inventory-audit": "Review inventory audit history.",
  "reports-inventory-item-query": "Build item-level inventory queries.",
  "reports-inventory-stock-movement": "Review stock movement activity.",
  "reports-inventory-valuation": "Generate inventory valuation reports.",
  "reports-bir": "Generate BIR compliance reports.",
  "reports-bir-vat-relief": "Prepare VAT relief reporting data.",
  "reports-bir-alpha-list": "Prepare alpha list reporting data.",
  "maintenance-users": "Manage users, user types, and user groups.",
  "maintenance-user-list": "Create and maintain system user accounts.",
  "maintenance-user-type": "Maintain user type classifications.",
  "maintenance-user-group": "Organize users into permission groups.",
  "branch-management": "Maintain branch and satellite records.",
  "maintenance-approval": "Configure approval workflows and rules.",
  "maintenance-audit": "Review audit trail activity.",
  "transaction-number-setup": "Configure transaction numbering sequences.",
  "maintenance-mail": "Maintain mail server and notification settings.",
};

function getSectionTargetHref(section: MainNavigationSection) {
  return section.items[0]
    ? getItemTargetHref(section.items[0])
    : (section.href ?? "/");
}

function getItemTargetHref(item: MainNavigationItem): string {
  if (!item.children?.length || item.module) {
    return item.href;
  }

  return getItemTargetHref(item.children[0]);
}

function findSearchItemsByKeys(items: MainSearchItem[], keys: string[]) {
  return keys
    .map((key) => items.find((item) => item.key === key))
    .filter((item): item is MainSearchItem => Boolean(item));
}

function getCompanyHomeHref(items: MainSearchItem[], recentKeys: string[]) {
  const dashboard = items.find((item) => item.key === "dashboard-overview");

  if (dashboard) {
    return dashboard.href;
  }

  return (
    findSearchItemsByKeys(items, recentKeys)[0]?.href ??
    items[0]?.href ??
    CompanyFallbackHomeHref
  );
}

function getDefaultAccessibleBranchId(branches: MainBranch[] | undefined) {
  const accessibleBranches = getAccessibleBranches(branches ?? []);
  const mainBranch = accessibleBranches.find((branch) => branch.isMain);

  return mainBranch?.id ?? accessibleBranches.at(-1)?.id ?? "";
}

function sortBranchesByPriority(branches: MainBranch[]) {
  return [...branches].sort((first, second) => {
    const priorityDelta = getBranchPriority(first) - getBranchPriority(second);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return first.name.localeCompare(second.name);
  });
}

function getBranchPriority(branch: MainBranch) {
  if (branch.isMain) {
    return 0;
  }

  return branch.kind === "satellite" ? 2 : 1;
}

function getBranchSwitcherLabel(branch: MainBranch) {
  return `${branch.name}${branch.isMain ? " (Head Office)" : ""}`;
}

function matchesSearchQuery(item: MainSearchItem, query: string) {
  return [item.label, item.section, ...item.trail]
    .join(" ")
    .toLowerCase()
    .includes(query);
}
