"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getWorkspaceCompanyBranchesHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
  getBranchDisplayLabel,
  stripHeadOfficeLabel,
} from "@/app/src/data/shared/branch/BranchDisplayData";
import {
  type MainAccessAction,
  type MainCurrentUser,
  type MainBranch,
  type MainCompany,
  type MainPermissionMap,
  type MainNavigationItem,
  type MainNavigationScope,
  type MainNavigationSection,
  type MainNotification,
  type MainSearchItem,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import {
  filterMainNavigationSections,
  filterMainSearchItems,
  getAccessibleBranches,
  hasAccess,
} from "@/app/src/data/shared/main-layout/sidebar/SidebarUtils";
import {
  MainCompanyNavigationSections,
  MainCompanySearchItems,
  MainMasterNavigationSections,
  MainMasterSearchItems,
  MainWorkspaceNavigationSections,
  MainWorkspaceSearchItems,
} from "@/app/src/data/shared/main-layout/sidebar/SidebarNavigationData";
import { MainLayoutData } from "@/app/src/data/shared/main-layout/MainLayoutData";
import { ModuleHelpArticles } from "@/app/src/data/shared/module/module-help/ModuleHelpData";
import { getHelpArticleForPath } from "@/app/src/data/shared/module/module-help/ModuleHelpUtils";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  useWorkspaceCompanyMainLayoutBranches,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyMainLayoutBranches";
import {
  GetAuthProfileAccess,
  GetAuthProfileCompanyId,
  ResolveAuthProfileEffectiveRole,
} from "@/app/src/services/auth/AuthProfileAccess";
import type { AuthProfileResponse } from "@/app/src/services/auth/AuthApiTypes";
import type {
  MainBreadcrumb,
  MainBreadcrumbDropdownItem,
  MainNotificationTab,
  MainQuickListTab,
} from "@/app/src/types/shared/main-layout/MainLayoutTypes";

const DefaultExpandedKeys = [
  "workspace-dashboard-section",
  "workspace-company-management-section",
  "workspace-user-management-section",
  "workspace-billing-and-subscription-section",
  "workspace-voucher-coupon-promotion-section",
  "workspace-reports-analytics-section",
  "workspace-audit-logs-section",
  "workspace-system-settings-section",
  "master-dashboard-section",
  "master-announcement-section",
  "master-subscriber-management-section",
  "master-company-management-section",
  "master-branch-management-section",
  "master-user-management-section",
  "master-plan-and-packages-section",
  "master-subscription-section",
  "master-invoices-section",
  "master-promotions-section",
  "master-subscriber-promotions-section",
  "master-logs-section",
  "master-support-tickets-section",
  "master-system-settings-section",
  "dashboard",
  "maintenance",
  "maintenance-financial",
  "maintenance-item-management",
  "cash-receipt",
  "cash-disbursement",
  "sales",
  "inventory",
  "reports",
  "reporting-analytics",
  "system-administration",
];

const WorkspaceRoutePrefix = "/workspace";
const MasterRoutePrefix = "/master";
const WorkspaceHomeHref = "/workspace/dashboard";
const MasterHomeHref = "/master/dashboard";
const CompanyFallbackHomeHref = "/profile";
const MaxBlockingProfileLoadMs = 4500;
const BranchUsersContextParam = "workspaceBranchId";
const CompanyUsersContextParam = "workspaceCompanyId";
const BranchUsersNameParam = "branchName";
const EmptyCompany: MainCompany = {
  id: "",
  name: "Company",
  status: "Active",
  branches: [],
  totalBranches: 0,
};
const EmptyCurrentUser: MainCurrentUser = {
  id: "",
  activeCompanyId: undefined,
  companyIds: [],
  firstName: "",
  lastName: "",
  name: "Account",
  shortName: "Account",
  initials: "U",
  userRole: "User",
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
  const searchParams = useSearchParams();
  const storedAccessToken = useAppStore((state) => state.accessToken);
  const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
  const sidebarTransitionFrameRef = useRef<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarTransitionEnabled, setIsSidebarTransitionEnabled] =
    useState(false);
  const [searchOpenPath, setSearchOpenPath] = useState<string | null>(null);
  const [notificationsOpenPath, setNotificationsOpenPath] = useState<
    string | null
  >(null);
  const [hasProfileLoadTimedOut, setHasProfileLoadTimedOut] = useState(false);
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
    MainLayoutData.activeBranchId,
  );
  const missingRecordActionRedirectHref =
    getMissingRecordActionRedirectHref(pathname);
  const routedCompanyId = searchParams.get(CompanyUsersContextParam);
  const routedBranchId = searchParams.get(BranchUsersContextParam);
  const routedBranchName = searchParams.get(BranchUsersNameParam);
  const accessToken = storedAccessToken;
  const { data: authProfile, isLoading: isAuthProfileLoading } =
    useAuthProfileQuery({ accessToken });
  const isMasterRoute = isMasterPath(pathname);
  const isWorkspaceRoute = isWorkspacePath(pathname);
  const hasMasterAccess = authProfile
    ? ProfileHasMasterAccess(authProfile)
    : false;
  const hasWorkspaceAccess = authProfile
    ? ProfileHasWorkspaceAccess(authProfile)
    : false;
  const displayUser = authProfile
    ? CreateWorkspaceCurrentUserFromProfile(authProfile)
    : EmptyCurrentUser;
  const isProfileLoading = isAuthProfileLoading && !hasProfileLoadTimedOut;
  const activeNavigationScope: MainNavigationScope =
    hasMasterAccess && isMasterRoute
      ? "master"
      : hasWorkspaceAccess && isWorkspaceRoute
        ? "workspace"
        : "company";
  const workspaceCompanies = authProfile
    ? MapProfileCompaniesToMainCompanies(authProfile)
    : [];
  const profileActiveCompanyId = authProfile
    ? GetAuthProfileCompanyId(authProfile)
    : null;
  const [activeCompanyId, setActiveCompanyId] = useState("");
  const [notifications, setNotifications] = useState<MainNotification[]>(
    MainLayoutData.notifications,
  );
  const query = queryState.pathname === pathname ? queryState.value : "";
  const isSearchOpen = searchOpenPath === pathname;
  const isNotificationsOpen = notificationsOpenPath === pathname;
  const isHelpOpen = helpOpenPath === pathname;

  const subscription = MainLayoutData.activeSubscription;
  const availableCompanies = workspaceCompanies;
  const currentCompany =
    availableCompanies.find((company) => company.id === activeCompanyId) ??
    availableCompanies[0] ??
    EmptyCompany;
  const { branches, isLoading: isBranchLoading } =
    useWorkspaceCompanyMainLayoutBranches({
      company:
        activeNavigationScope === "company" ? currentCompany : undefined,
    });

  const navigationSections = useMemo(() => {
    const sourceSections =
      activeNavigationScope === "master"
        ? MainMasterNavigationSections
        : activeNavigationScope === "workspace"
          ? MainWorkspaceNavigationSections
          : MainCompanyNavigationSections;

    return filterMainNavigationSections(
      sourceSections,
      displayUser,
      subscription,
    );
  }, [activeNavigationScope, displayUser, subscription]);
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
      activeNavigationScope === "master"
        ? MainMasterSearchItems
        : activeNavigationScope === "workspace"
          ? MainWorkspaceSearchItems
          : MainCompanySearchItems;

    return filterMainSearchItems(sourceItems, displayUser, subscription);
  }, [activeNavigationScope, displayUser, subscription]);
  const companySearchItems = useMemo(
    () =>
      filterMainSearchItems(MainCompanySearchItems, displayUser, subscription),
    [displayUser, subscription],
  );
  const companyHomeHref = getCompanyHomeHref(
    companySearchItems,
    MainLayoutData.recentNavigationKeys,
  );
  const homeHref =
    activeNavigationScope === "master"
      ? MasterHomeHref
      : activeNavigationScope === "workspace"
        ? WorkspaceHomeHref
        : companyHomeHref;

  const recentlyVisitedModules = useMemo(() => {
    if (activeNavigationScope !== "company") {
      return [];
    }

    return findSearchItemsByKeys(
      availableSearchItems,
      MainLayoutData.recentNavigationKeys,
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
  const canManageBranches = hasAccess(displayUser, "branch.management");

  useEffect(() => {
    if (profileActiveCompanyId == null) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the layout company switcher synced with the loaded profile.
    setActiveCompanyId(String(profileActiveCompanyId));
  }, [profileActiveCompanyId]);

  useEffect(() => {
    if (!routedCompanyId) {
      return;
    }

    if (!availableCompanies.some((company) => company.id === routedCompanyId)) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- route context shortcuts should sync the topbar company when available.
    setActiveCompanyId(routedCompanyId);
  }, [availableCompanies, routedCompanyId]);

  useEffect(() => {
    if (!routedBranchId && !routedBranchName) {
      return;
    }

    const normalizedRoutedBranchName = normalizeBranchRouteToken(
      routedBranchName ?? "",
    );
    const routedBranch = accessibleBranches.find((branch) => {
      if (branch.id === routedBranchId) {
        return true;
      }

      if (!normalizedRoutedBranchName) {
        return false;
      }

      return (
        normalizeBranchRouteToken(branch.name) === normalizedRoutedBranchName ||
        normalizeBranchRouteToken(getBranchSwitcherLabel(branch)) ===
          normalizedRoutedBranchName ||
        normalizeBranchRouteToken(branch.code) === normalizedRoutedBranchName
      );
    });

    if (!routedBranch) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- route context shortcuts should sync the topbar branch when available.
    setActiveBranchId(routedBranch.id);
  }, [accessibleBranches, routedBranchId, routedBranchName]);

  const branchDropdownItems = useMemo(() => {
    if (!shouldShowBranchSwitcher) {
      return [];
    }

    const branchItems = accessibleBranches
      .filter((branch) => branch.kind)
      .map((branch) => ({
        key: branch.id,
        label: getBranchSwitcherLabel(branch),
        href: companyHomeHref,
        branchId: branch.id,
        kind: branch.kind,
      }));

    if (!canManageBranches) {
      return branchItems;
    }

    return [
      ...branchItems,
      {
        key: "branch-management",
        label: "Branch Management",
        href: getWorkspaceCompanyBranchesHref(currentCompany.id),
        helperText: "Manage workspace companies, branches, and satellites",
        isManagementAction: true,
      },
    ];
  }, [
    accessibleBranches,
    canManageBranches,
    companyHomeHref,
    currentCompany.id,
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
      if (sidebarTransitionFrameRef.current !== null) {
        cancelAnimationFrame(sidebarTransitionFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!missingRecordActionRedirectHref) {
      return;
    }

    router.replace(missingRecordActionRedirectHref);
  }, [missingRecordActionRedirectHref, router]);

  useEffect(() => {
    if (!isAuthProfileLoading || hasProfileLoadTimedOut) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setHasProfileLoadTimedOut(true);
    }, MaxBlockingProfileLoadMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hasProfileLoadTimedOut, isAuthProfileLoading]);

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
    sidebarTransitionFrameRef.current = requestAnimationFrame(() => {
      setIsSidebarTransitionEnabled(true);
      sidebarTransitionFrameRef.current = null;
    });
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
    // Branches are loaded from the active workspace company unit API.
    return undefined;
  }

  function selectBranch(branchId: string) {
    setActiveBranchId(branchId);
  }

  function selectCompany(companyId: string) {
    setActiveCompanyId(companyId);
    setActiveBranchId("");
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

  function switchToMaster() {
    if (!hasMasterAccess) {
      return;
    }

    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    router.push(MasterHomeHref);
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
    canAccessMaster: hasMasterAccess,
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
    isShellLoading: !isAuthSessionReady || isProfileLoading,
    isProfileLoading,
    isBranchLoading,
    shouldShowBranchSwitcher,
    isHelpOpen,
    isNotificationsOpen,
    isSearchOpen,
    isSidebarOpen,
    isSidebarTransitionEnabled,
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
    switchToMaster,
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
  const effectiveRole = ResolveAuthProfileEffectiveRole(profile);

  if (effectiveRole === "SUPER_ADMIN" || effectiveRole === "ADMIN") {
    return true;
  }

  return (
    profile.companies?.some((company) => company.role === "ADMIN") ?? false
  );
}

function ProfileHasMasterAccess(profile: AuthProfileResponse) {
  return ResolveAuthProfileEffectiveRole(profile) === "SUPER_ADMIN";
}

function CreateWorkspaceCurrentUserFromProfile(
  profile: AuthProfileResponse,
): MainCurrentUser {
  const [firstName, ...lastNameParts] = profile.user.name.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");
  const activeAccess = GetAuthProfileAccess(profile);
  const activeCompanyId = GetAuthProfileCompanyId(profile);
  const activeCompanyMembership =
    profile.companies?.find(
      (company) => company.companyId === activeCompanyId,
    ) ?? profile.companies?.[0];
  const companyRoleName = FormatCompanyRoleName(
    activeAccess?.companyRoleCode ?? activeCompanyMembership?.companyRoleCode,
  );
  const effectiveRole = ResolveAuthProfileEffectiveRole(profile);
  const userRole =
    effectiveRole === "SUPER_ADMIN"
      ? "Super Admin"
      : effectiveRole === "ADMIN"
        ? "Admin"
        : "User";
  const profilePermissionMap = CreateProfilePermissionMap(
    activeAccess?.permissions,
  );
  const adminPermissionMap = HasPermissionEntries(profilePermissionMap)
    ? profilePermissionMap
    : CreateNavigationPermissionMap();
  const userRoleDetails = companyRoleName
    ? {
        id:
          activeAccess?.companyRoleCode ??
          activeCompanyMembership?.companyRoleCode ??
          "user-role-workspace",
        name: companyRoleName,
        permissions:
          effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN"
            ? adminPermissionMap
            : profilePermissionMap,
      }
    : effectiveRole === "ADMIN"
      ? {
          id: "user-role-admin",
          name: "Admin",
          permissions: adminPermissionMap,
        }
      : undefined;

  return {
    id: String(profile.user.id),
    activeCompanyId:
      activeCompanyId == null ? undefined : String(activeCompanyId),
    companyIds: (profile.companies ?? []).map((company) =>
      String(company.companyId),
    ),
    firstName: firstName || profile.user.name,
    lastName,
    name: profile.user.name,
    shortName: BuildShortName(profile.user.name),
    initials: BuildInitials(profile.user.name),
    profileImageUrl: profile.user.avatarPublicUrl ?? undefined,
    userRole,
    userRoleDetails,
  };
}

function MapProfileCompaniesToMainCompanies(profile: AuthProfileResponse) {
  return (profile.companies ?? [])
    .filter((company) => company.membershipStatus === "ACTIVE")
    .map((company) => ({
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

function CreateProfilePermissionMap(permissions: unknown[] | undefined) {
  const permissionMap: MainPermissionMap = {};

  for (const permission of permissions ?? []) {
    if (typeof permission !== "string") {
      continue;
    }

    const [accessKey, backendAction] = permission.split(":");
    const action = MapBackendPermissionAction(backendAction);

    if (!accessKey || !action) {
      continue;
    }

    const currentAccess = permissionMap[accessKey as keyof MainPermissionMap] ?? {};
    permissionMap[accessKey as keyof MainPermissionMap] = {
      ...currentAccess,
      [action]: true,
    };
  }

  return permissionMap;
}

function HasPermissionEntries(permissionMap: MainPermissionMap) {
  return Object.keys(permissionMap).length > 0;
}

function CreateNavigationPermissionMap() {
  const permissionMap: MainPermissionMap = {};
  const sections = [
    ...MainMasterNavigationSections,
    ...MainWorkspaceNavigationSections,
    ...MainCompanyNavigationSections,
  ];

  for (const section of sections) {
    GrantNavigationAccess(permissionMap, section.accessKey);

    for (const item of section.items) {
      AddNavigationItemPermissions(permissionMap, item);
    }
  }

  return permissionMap;
}

function AddNavigationItemPermissions(
  permissionMap: MainPermissionMap,
  item: MainNavigationItem,
) {
  GrantNavigationAccess(permissionMap, item.accessKey);

  for (const child of item.children ?? []) {
    AddNavigationItemPermissions(permissionMap, child);
  }
}

function GrantNavigationAccess(
  permissionMap: MainPermissionMap,
  accessKey: MainNavigationItem["accessKey"],
) {
  permissionMap[accessKey] = {
    add: true,
    cancel: true,
    delete: true,
    edit: true,
    uncancel: true,
    view: true,
  };
}

function MapBackendPermissionAction(
  action: string | undefined,
): MainAccessAction | undefined {
  if (action === "view") {
    return "view";
  }

  if (action === "create") {
    return "add";
  }

  if (action === "update") {
    return "edit";
  }

  if (action === "delete" || action === "cancel" || action === "uncancel") {
    return action;
  }

  return undefined;
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

  if (isMissingRecordActionPath(extraSegments)) {
    return trail;
  }

  const actionBreadcrumbs = getActionBreadcrumbs({
    extraSegments,
    pathname,
  });

  if (actionBreadcrumbs.length > 0) {
    return [...trail, ...actionBreadcrumbs];
  }

  return [
    ...trail,
    ...extraSegments.map((segment, index) => ({
      key: `path-${extraSegments.slice(0, index + 1).join("-")}`,
      label: titleFromPathSegment(segment),
      href: index === extraSegments.length - 1 ? pathname : undefined,
    })),
  ];
}

function getActionBreadcrumbs({
  extraSegments,
  pathname,
}: {
  extraSegments: string[];
  pathname: string;
}): NavigationTrailNode[] {
  const [actionSegment, recordId] = extraSegments;

  if (!actionSegment || !isPageActionSegment(actionSegment)) {
    return [];
  }

  const breadcrumbs: NavigationTrailNode[] = [
    {
      key: `path-${actionSegment}`,
      label: titleFromPathSegment(actionSegment),
    },
  ];

  if (recordId) {
    breadcrumbs.push({
      key: `path-${actionSegment}-${recordId}`,
      label: recordId,
      href: pathname,
    });
  }

  return breadcrumbs;
}

function isPageActionSegment(segment: string) {
  return segment === "add" || segment === "edit" || segment === "view";
}

function isMissingRecordActionPath(extraSegments: string[]) {
  const [actionSegment, recordId] = extraSegments;

  return (actionSegment === "edit" || actionSegment === "view") && !recordId;
}

function getMissingRecordActionRedirectHref(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const actionSegment = segments.at(-1);

  if (actionSegment !== "edit" && actionSegment !== "view") {
    return null;
  }

  const parentSegments = segments.slice(0, -1);

  return parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "/";
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
  return findActiveItemAncestorKeys(items, pathname) ?? [];
}

function findActiveItemAncestorKeys(
  items: MainNavigationItem[],
  pathname: string,
): string[] | null {
  for (const item of items) {
    if (item.children?.length) {
      const childKeys = findActiveItemAncestorKeys(item.children, pathname);

      if (childKeys || pathMatches(item.href, pathname)) {
        return [item.key, ...(childKeys ?? [])];
      }
    }

    if (pathMatches(item.href, pathname)) {
      return [];
    }
  }

  return null;
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

function isMasterPath(pathname: string) {
  return (
    pathname === MasterRoutePrefix ||
    pathname.startsWith(`${MasterRoutePrefix}/`)
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
  "maintenance-financial-management-responsibility-center":
    "Maintain accountability centers for financial reporting.",
  "maintenance-warehouse-management":
    "Maintain warehouse records and storage locations.",
  "maintenance-item-management":
    "Maintain item master records, categories, and classifications.",
  "maintenance-items": "Maintain item master records.",
  "maintenance-warehouse": "Maintain warehouse records and storage locations.",
  "maintenance-item": "Maintain item master records.",
  "maintenance-item-category": "Group items by category.",
  "maintenance-item-sub-category": "Group items by subcategory.",
  "maintenance-item-type": "Maintain item type classifications.",
  "maintenance-item-sub-type": "Maintain item subtype classifications.",
  "maintenance-party-management":
    "Maintain customers, suppliers, vendors, members, and employees.",
  "maintenance-party":
    "Maintain customers, suppliers, vendors, members, and employees.",
  "maintenance-form-signatory":
    "Manage authorized signatories for official documents.",
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
  "cash-disbursement-petty-cash": "Record petty cash vouchers.",
  "cash-disbursement-petty-cash-voucher": "Record petty cash vouchers.",
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
  "reports-beginning-balance-general-ledger-uploader":
    "Upload beginning general ledger balances.",
  "reports-beginning-balance-subsidiary-ledger-uploader":
    "Upload beginning subsidiary ledger balances.",
  "reports-budget-uploader": "Upload financial budget records.",
  "reports-verifier": "Verify uploaded financial records.",
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
  "maintenance-user-management": "Manage users and roles.",
  "maintenance-users": "Create and maintain system user accounts.",
  "maintenance-user-role": "Maintain user role classifications.",
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
  return getBranchDisplayLabel(branch);
}

function normalizeBranchRouteToken(value: string) {
  return stripHeadOfficeLabel(value).toLowerCase();
}

function matchesSearchQuery(item: MainSearchItem, query: string) {
  return [item.label, item.section, ...item.trail]
    .join(" ")
    .toLowerCase()
    .includes(query);
}
