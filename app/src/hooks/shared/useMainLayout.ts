"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  MainLayoutMockData,
  MainNavigationSections,
  MainSearchItems,
  filterMainNavigationSections,
  filterMainSearchItems,
  getAccessibleBranches,
  getHelpArticleForPath,
  hasAccess,
  type MainBranch,
  type MainNavigationItem,
  type MainNavigationSection,
  type MainNotification,
  type MainSearchItem,
} from "@/app/src/data/shared/MainLayoutData";

const DefaultExpandedKeys = [
  "dashboard",
  "maintenance",
  "cash-receipt",
  "cash-disbursement",
  "sales",
  "inventory",
  "reports",
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
  const branchLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const [lazyLoadedBranches, setLazyLoadedBranches] =
    useState<MainBranch[] | null>(null);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [notifications, setNotifications] = useState<MainNotification[]>(
    MainLayoutMockData.notifications,
  );
  const query = queryState.pathname === pathname ? queryState.value : "";
  const isSearchOpen = searchOpenPath === pathname;
  const isNotificationsOpen = notificationsOpenPath === pathname;
  const isHelpOpen = helpOpenPath === pathname;

  const subscription = MainLayoutMockData.activeSubscription;

  const navigationSections = useMemo(
    () =>
      filterMainNavigationSections(
        MainNavigationSections,
        MainLayoutMockData.currentUser,
        subscription,
      ),
    [subscription],
  );

  const availableSearchItems = useMemo(
    () =>
      filterMainSearchItems(
        MainSearchItems,
        MainLayoutMockData.currentUser,
        subscription,
      ),
    [subscription],
  );

  const favoriteModules = useMemo(
    () =>
      findSearchItemsByKeys(
        availableSearchItems,
        MainLayoutMockData.favoriteNavigationKeys,
      ),
    [availableSearchItems],
  );

  const recentlyVisitedModules = useMemo(
    () =>
      findSearchItemsByKeys(
        availableSearchItems,
        MainLayoutMockData.recentlyVisitedNavigationKeys,
      ),
    [availableSearchItems],
  );

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
        label: `${branch.name}${branch.isMain ? " (Main)" : ""}`,
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
        href: "/settings/branches",
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
        currentBranch,
        branchDropdownItems,
        hasBranchAccess,
        isBranchLoading,
      }),
    [
      branchDropdownItems,
      currentBranch,
      hasBranchAccess,
      isBranchLoading,
      navigationSections,
      pathname,
    ],
  );

  const currentHelpArticle = useMemo(
    () =>
      getHelpArticleForPath(pathname, MainLayoutMockData.helpArticles) ??
      MainLayoutMockData.helpArticles[0],
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
    breadcrumbs,
    canSwitchCompany: MainLayoutMockData.availableCompanies.length > 0,
    currentBranch,
    currentCompany: MainLayoutMockData.currentCompany,
    currentHelpArticle,
    currentUser: MainLayoutMockData.currentUser,
    expandedKeys,
    favoriteModules,
    hasBranchAccess,
    helpArticles: MainLayoutMockData.helpArticles,
    isCurrentPageFavorite,
    isHelpOpen,
    isNotificationsOpen,
    isSearchOpen,
    isSidebarOpen,
    navigationSections,
    notificationTab,
    query,
    quickListTab,
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
    setNotificationTab,
    setQuery: updateQuery,
    setQuickListTab,
    setSelectedHelpArticleKey: selectHelpArticle,
    toggleCurrentPageFavorite,
    toggleExpandedKey,
    toggleNotifications,
    toggleSearch,
    toggleSidebar,
  };
}

function buildBreadcrumbs({
  pathname,
  navigationSections,
  currentBranch,
  branchDropdownItems,
  hasBranchAccess,
  isBranchLoading,
}: {
  pathname: string;
  navigationSections: MainNavigationSection[];
  currentBranch: MainBranch | null;
  branchDropdownItems: MainBreadcrumbDropdownItem[];
  hasBranchAccess: boolean;
  isBranchLoading: boolean;
}): MainBreadcrumb[] {
  const trail = findNavigationTrail(navigationSections, pathname);
  const fallbackTrail =
    trail.length > 0
      ? trail
      : [
          {
            key: "workspace",
            label: "Workspace",
            href: pathname,
          },
        ];

  return [
    {
      key: "branch",
      label: currentBranch?.name ?? "No Branch Access",
      href: currentBranch?.href,
      canOpenDropdown: hasBranchAccess,
      dropdownItems: branchDropdownItems,
      isLoading: isBranchLoading,
    },
    ...fallbackTrail.map((item) => ({
      key: item.key,
      label: item.label,
      href: item.href,
      canOpenDropdown: Boolean(item.dropdownItems?.length),
      dropdownItems: item.dropdownItems,
    })),
  ];
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
  const sectionItems = section.items.map(toDropdownItem);

  if (section.key !== "dashboard") {
    return sectionItems;
  }

  return [
    ...sectionItems,
    {
      key: "dashboard-management",
      label: "Dashboard Management",
      href: "/dashboard/management",
      helperText: "Manage dashboard records",
      isManagementAction: true,
    },
  ];
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

function toDropdownItem(
  item: MainNavigationItem,
): MainBreadcrumbDropdownItem {
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
