"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MainCompanyNavigationSections,
  MainCompanySearchItems,
  MainLayoutMockData,
  MainWorkspaceNavigationSections,
  MainWorkspaceSearchItems,
  filterMainNavigationSections,
  filterMainSearchItems,
  getAccessibleBranches,
  hasAccess,
  type MainBranch,
  type MainNavigationItem,
  type MainNavigationScope,
  type MainNavigationSection,
  type MainNotification,
  type MainSearchItem,
} from "@/app/src/data/modules/shared/MainLayoutData";
import {
  MainHelpArticles,
  getHelpArticleForPath,
} from "@/app/src/data/modules/shared/MainHelpData";

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
];

export type MainQuickListTab = "favorites" | "recent";

export type MainNotificationTab = "all" | "unread" | "read";

export type MainBreadcrumbDropdownItem = {
  key: string;
  label: string;
  href: string;
  helperText?: string;
  branchId?: string;
  isManagementAction?: boolean;
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
  const branchLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchOpenPath, setSearchOpenPath] = useState<string | null>(null);
  const [notificationsOpenPath, setNotificationsOpenPath] = useState<
    string | null
  >(null);
  const [helpOpenPath, setHelpOpenPath] = useState<string | null>(null);
  const [isCurrentPageFavorite, setIsCurrentPageFavorite] = useState(true);
  const [quickListTab, setQuickListTab] =
    useState<MainQuickListTab>("favorites");
  const [notificationTab, setNotificationTab] =
    useState<MainNotificationTab>("all");
  const [expandedKeys, setExpandedKeys] =
    useState<string[]>(DefaultExpandedKeys);
  const [queryState, setQueryState] = useState({
    pathname,
    value: "",
  });
  const [activeBranchId, setActiveBranchId] = useState(
    MainLayoutMockData.activeBranchId,
  );
  const isSuperAdmin =
    MainLayoutMockData.currentUser.userRole === "Super Admin";
  const [activeNavigationScope, setActiveNavigationScope] =
    useState<MainNavigationScope>(() =>
      isSuperAdmin ? "workspace" : "company",
    );
  const [activeCompanyId, setActiveCompanyId] = useState(
    MainLayoutMockData.currentCompany.id,
  );
  const [lazyLoadedBranches, setLazyLoadedBranches] = useState<
    MainBranch[] | null
  >(null);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [notifications, setNotifications] = useState<MainNotification[]>(
    MainLayoutMockData.notifications,
  );
  const query = queryState.pathname === pathname ? queryState.value : "";
  const isSearchOpen = searchOpenPath === pathname;
  const isNotificationsOpen = notificationsOpenPath === pathname;
  const isHelpOpen = helpOpenPath === pathname;

  const subscription = MainLayoutMockData.activeSubscription;
  const availableCompanies = MainLayoutMockData.availableCompanies;
  const currentCompany =
    availableCompanies.find((company) => company.id === activeCompanyId) ??
    MainLayoutMockData.currentCompany;

  const navigationSections = useMemo(() => {
    const sourceSections =
      activeNavigationScope === "workspace"
        ? MainWorkspaceNavigationSections
        : MainCompanyNavigationSections;

    return filterMainNavigationSections(
      sourceSections,
      MainLayoutMockData.currentUser,
      subscription,
    );
  }, [activeNavigationScope, subscription]);

  const availableSearchItems = useMemo(() => {
    const sourceItems =
      activeNavigationScope === "workspace"
        ? MainWorkspaceSearchItems
        : MainCompanySearchItems;

    return filterMainSearchItems(
      sourceItems,
      MainLayoutMockData.currentUser,
      subscription,
    );
  }, [activeNavigationScope, subscription]);

  const favoriteModules = useMemo(() => {
    if (activeNavigationScope !== "company") {
      return [];
    }

    return findSearchItemsByKeys(
      availableSearchItems,
      MainLayoutMockData.favoriteNavigationKeys,
    );
  }, [activeNavigationScope, availableSearchItems]);

  const recentlyVisitedModules = useMemo(() => {
    if (activeNavigationScope !== "company") {
      return [];
    }

    return findSearchItemsByKeys(
      availableSearchItems,
      MainLayoutMockData.recentlyVisitedNavigationKeys,
    );
  }, [activeNavigationScope, availableSearchItems]);

  const enabledQuickListTabs = useMemo(() => {
    if (activeNavigationScope !== "company") {
      return [] as MainQuickListTab[];
    }

    const settings = MainLayoutMockData.quickListSettings;
    const tabs: MainQuickListTab[] = [];

    if (settings.favorites) {
      tabs.push("favorites");
    }

    if (settings.recently) {
      tabs.push("recent");
    }

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
    () => getAccessibleBranches(MainLayoutMockData.branches),
    [],
  );
  const hasBranchAccess = accessibleBranches.length > 0;
  const currentBranch =
    accessibleBranches.find((branch) => branch.id === activeBranchId) ??
    accessibleBranches[0] ??
    null;
  const canManageBranches = hasAccess(
    MainLayoutMockData.currentUser,
    "branch.management",
  );

  const branchDropdownItems = useMemo(() => {
    const branchItems =
      lazyLoadedBranches?.map((branch) => ({
        key: branch.id,
        label: `${branch.name}${branch.isMain ? " (Head Office)" : ""}`,
        href: branch.href,
        helperText: branch.code,
        branchId: branch.id,
      })) ?? [];

    if (!canManageBranches) {
      return branchItems;
    }

    return [
      ...branchItems,
      {
        key: "branch-management",
        label: "Branch Management",
        href: "/settings",
        helperText: "Manage branch records",
        isManagementAction: true,
      },
    ];
  }, [canManageBranches, lazyLoadedBranches]);

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
      getHelpArticleForPath(pathname, MainHelpArticles) ?? MainHelpArticles[0],
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

  function toggleCurrentPageFavorite() {
    setIsCurrentPageFavorite((current) => !current);
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
    setExpandedKeys((current) =>
      current.includes(key)
        ? current.filter((expandedKey) => expandedKey !== key)
        : [...current, key],
    );
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
    setActiveNavigationScope("company");
  }

  function selectCompany(companyId: string) {
    setActiveCompanyId(companyId);
    setActiveNavigationScope("company");
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    router.push("/dashboard");
  }

  function switchToWorkspace() {
    if (!isSuperAdmin) {
      return;
    }

    setActiveNavigationScope("workspace");
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    router.push("/dashboard");
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

  return {
    activeHref: pathname,
    activeNavigationScope,
    availableCompanies,
    branchDropdownItems,
    breadcrumbs,
    canAccessWorkspace: isSuperAdmin,
    canSwitchCompany: availableCompanies.length > 1,
    currentBranch,
    currentCompany,
    currentHelpArticle,
    currentUser: MainLayoutMockData.currentUser,
    enabledQuickListTabs,
    expandedKeys,
    favoriteModules,
    hasBranchAccess,
    helpArticles: MainHelpArticles,
    isCurrentPageFavorite,
    isBranchLoading,
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
    unreadNotificationCount,
    visibleNotifications,
    closeHelp,
    closeNotifications,
    closeSearch,
    closeSidebar,
    loadBranchOptions,
    markNotificationAsRead,
    openHelp,
    selectBranch,
    selectCompany,
    setNotificationTab,
    setQuery: updateQuery,
    setQuickListTab,
    setSelectedHelpArticleKey: selectHelpArticle,
    toggleCurrentPageFavorite,
    toggleExpandedKey,
    toggleNotifications,
    toggleSearch,
    toggleSidebar,
    switchToWorkspace,
  };
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

  return normalizedTrail.map((item) => ({
    key: item.key,
    label: item.label,
    href: item.href,
  }));
}

function findNavigationTrail(
  sections: MainNavigationSection[],
  pathname: string,
): NavigationTrailNode[] {
  for (const section of sections) {
    const itemTrail = findItemTrail(section.items, pathname);

    if (itemTrail.length > 0) {
      return [
        {
          key: section.key,
          label: section.title,
          href: section.href ?? section.items[0]?.href,
          dropdownItems: getSectionDropdownItems(section),
        },
        ...itemTrail,
      ];
    }

    if (section.href && pathMatches(section.href, pathname)) {
      return [
        {
          key: section.key,
          label: section.title,
          href: section.href,
          dropdownItems: getSectionDropdownItems(section),
        },
      ];
    }
  }

  return [];
}

function getSectionDropdownItems(
  section: MainNavigationSection,
): MainBreadcrumbDropdownItem[] {
  return section.items.map(toDropdownItem);
}

function findItemTrail(
  items: MainNavigationItem[],
  pathname: string,
): NavigationTrailNode[] {
  for (const item of items) {
    const childTrail = item.children
      ? findItemTrail(item.children, pathname)
      : [];

    if (childTrail.length > 0) {
      return [
        {
          key: item.key,
          label: item.label,
          href: item.href,
          dropdownItems: item.children?.map(toDropdownItem),
        },
        ...childTrail,
      ];
    }

    const isCurrentItem = item.children?.length
      ? pathMatches(item.href, pathname)
      : item.href === pathname;

    if (isCurrentItem) {
      return [
        {
          key: item.key,
          label: item.label,
          href: item.href,
          dropdownItems: item.children?.map(toDropdownItem),
        },
      ];
    }
  }

  return [];
}

function pathMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPathFallbackTitle(pathname: string) {
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  if (!lastSegment) {
    return "Dashboard";
  }

  return lastSegment
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toDropdownItem(item: MainNavigationItem): MainBreadcrumbDropdownItem {
  return {
    key: item.key,
    label: item.label,
    href: item.href,
  };
}

function findSearchItemsByKeys(items: MainSearchItem[], keys: string[]) {
  return keys
    .map((key) => items.find((item) => item.key === key))
    .filter((item): item is MainSearchItem => Boolean(item));
}

function matchesSearchQuery(item: MainSearchItem, query: string) {
  return [item.label, item.section, ...item.trail]
    .join(" ")
    .toLowerCase()
    .includes(query);
}
