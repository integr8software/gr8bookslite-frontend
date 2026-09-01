"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApprovalAlertStore } from "@/app/src/hooks/modules/approval-management/useApprovalAlertStore";
import { GetApprovalTransactions } from "@/app/src/services/modules/approval-management/ApprovalManagementApi";
import { ApprovalManagementQueryKeys } from "@/app/src/services/modules/approval-management/ApprovalManagementQueryKeys";
import {
  WorkspaceCompanyActiveStatus,
  getWorkspaceCompanyBranchesHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
  MasterSubscriberManagementHref,
  getMasterSubscriberManagementSectionHref,
  getMasterSubscriberManagementSectionPageTitle,
  getMasterSubscriberManagementViewHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import {
  getMasterSubscriberManagementCompany,
  getMasterSubscriberManagementSubscriber,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type { MasterSubscriberManagementCompanySection } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { getBranchDisplayLabel, stripHeadOfficeLabel } from "@/app/src/data/shared/branch/BranchDisplayData";
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
} from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import {
  filterMainNavigationSections,
  flattenSections,
  getAccessibleBranches,
} from "@/app/src/data/shared/main-layout/sidebar/SidebarUtils";
import {
  MainMasterNavigationSections,
  MainWorkspaceNavigationSections,
  MainAccountNavigationSections,
} from "@/app/src/data/shared/main-layout/sidebar/SidebarNavigationData";
import { MainLayoutDefaultSubscription, MainLayoutInitialNotifications } from "@/app/src/data/shared/main-layout/MainLayoutDefaults";
import { MainModuleCatalogHelperText } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { mapProfileCompanyUnitsToMainBranches } from "@/app/src/data/workspace/companies/WorkspaceCompanyMainLayoutBranchData";
import { ModuleHelpArticles } from "@/app/src/data/shared/help/ModuleHelpData";
import { getHelpArticleForPath } from "@/app/src/data/shared/help/ModuleHelpUtils";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useWorkspaceCompanyMainLayoutBranches } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyMainLayoutBranches";
import { GetAuthProfileAccess, GetAuthProfileCompanyId, ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { CreateFrontendAuthSession, SwitchCompanyContext } from "@/app/src/services/auth/AuthApi";
import { AuthenticatedSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import { NotifyAuthSessionExpired } from "@/app/src/services/auth/AuthSessionExpired";
import { BuildAuthProfileFromSwitchResponse, PrepareQueryCacheForContextSwitch } from "@/app/src/services/auth/AuthContextCache";
import { OnboardingRoutePath, RequiresOnboarding } from "@/app/src/services/auth/AuthRouteState";
import { AuthQueryKeys, CreateAuthAccessTokenQueryScope } from "@/app/src/services/auth/AuthQueryKeys";
import { IsUnauthorizedApiError } from "@/app/src/services/shared/api/ApiClient";
import { AuthEffectiveRoleCodes, AuthMembershipRoleCodes, AuthSystemRoleCodes, type AuthProfile } from "@/app/src/types/auth/AuthTypes";
import { MapUserModulesToNavigation } from "@/app/src/data/shared/main-layout/sidebar/UserModuleNavigationAdapter";
import type { MainBreadcrumb, MainBreadcrumbDropdownItem, MainNotificationTab } from "@/app/src/types/shared/main-layout/MainLayoutTypes";

const DefaultExpandedKeys = [
  "workspace-dashboard-section",
  "workspace-company-management-section",
  "workspace-user-management-section",
  "workspace-billing-and-subscription-section",
  "workspace-vouchers-and-coupons-section",
  "workspace-audit-logs-section",
  "workspace-system-settings-section",
  "master-dashboard-section",
  "master-announcement-section",
  "master-subscriber-management-section",
  "master-plan-and-packages-section",
  "master-subscription-section",
  "master-invoices-section",
  "master-promotions-section",
  "master-subscriber-promotions-section",
  "master-audit-logs-section",
  "master-support-tickets-section",
  "master-system-settings-section",
  "dashboard",
  "maintenance",
  "cash-receipt",
  "cash-disbursement",
  "sales",
  "inventory",
  "system-administration",
];

const WorkspaceRoutePrefix = "/workspace";
const MasterRoutePrefix = "/master";
const AccountRoutePrefix = "/account";
const WorkspaceHomeHref = "/workspace/dashboard";
const MasterHomeHref = "/master/dashboard";
const CompanyFallbackHomeHref = "/dashboard";
const MainNavigationScopes = {
  Account: "account",
  Master: "master",
  Workspace: "workspace",
  Company: "company",
} as const satisfies Record<string, MainNavigationScope>;
const ShellContextSwitchFallbackMs = 8000;
const BranchContextSwitchMinimumMs = 650;
const TopbarContextSkeletonMs = 700;
const ActiveBranchStorageKey = "gr8booksneo:main-layout:active-branch";
const BranchUsersContextParam = "workspaceBranchId";
const CompanyUsersContextParam = "workspaceCompanyId";
const BranchUsersNameParam = "branchName";
const EmptyCompany: MainCompany = {
  id: "",
  name: "Company",
  status: WorkspaceCompanyActiveStatus,
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

type AdministrationNavigationScope = typeof MainNavigationScopes.Master | typeof MainNavigationScopes.Workspace;

export function useMainLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedAccessToken = useAppStore((state) => state.accessToken);
  const setStoredAccessToken = useAppStore((state) => state.setAccessToken);
  const setStoredActiveBranchContext = useAppStore((state) => state.setActiveBranchContext);
  const setStoredActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
  const setStoredActiveCompanyName = useAppStore((state) => state.setActiveCompanyName);
  const shellContextSwitchMessage = useAppStore((state) => state.shellContextSwitchMessage);
  const isShellContextSettling = useAppStore((state) => state.isShellContextSettling);
  const beginShellContextSwitch = useAppStore((state) => state.beginShellContextSwitch);
  const endShellContextSwitch = useAppStore((state) => state.endShellContextSwitch);
  const finishShellContextSettling = useAppStore((state) => state.finishShellContextSettling);
  const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
  const queryClient = useQueryClient();
  const sidebarTransitionFrameRef = useRef<number | null>(null);
  const shellContextSwitchFallbackRef = useRef<number | null>(null);
  const shellContextSettlingRef = useRef<number | null>(null);
  const latestCompanySwitchRequestRef = useRef(0);
  const hasHandledAuthProfileErrorRef = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarTransitionEnabled, setIsSidebarTransitionEnabled] = useState(false);
  const [searchOpenPath, setSearchOpenPath] = useState<string | null>(null);
  const [notificationsOpenPath, setNotificationsOpenPath] = useState<string | null>(null);
  const [helpOpenPath, setHelpOpenPath] = useState<string | null>(null);
  const [selectedHelpArticleState, setSelectedHelpArticleState] = useState({
    pathname: "",
    key: "",
  });
  const [notificationTab, setNotificationTab] = useState<MainNotificationTab>("all");
  const [manualExpandedKeys, setManualExpandedKeys] = useState<string[]>(DefaultExpandedKeys);
  const [sidebarNavigationPath, setSidebarNavigationPath] = useState<string | null>(null);
  const [queryState, setQueryState] = useState({
    pathname,
    value: "",
  });
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [switchingCompanyName, setSwitchingCompanyName] = useState<string | null>(null);
  const [switchingCompanyId, setSwitchingCompanyId] = useState<string | null>(null);
  const [switchingAdministrationScope, setSwitchingAdministrationScope] = useState<AdministrationNavigationScope | null>(null);
  const missingRecordActionRedirectHref = getMissingRecordActionRedirectHref(pathname);
  const routedCompanyId = searchParams.get(CompanyUsersContextParam);
  const routedBranchId = searchParams.get(BranchUsersContextParam);
  const routedBranchName = searchParams.get(BranchUsersNameParam);
  const subscriberManagementCompanyId = pathname.startsWith(MasterSubscriberManagementHref)
    ? (searchParams.get("companyId") ?? undefined)
    : undefined;
  const accessToken = storedAccessToken;
  const setApprovalTransactions = useApprovalAlertStore(
    (state) => state.setApprovalTransactions,
  );
  const approvalTransactionsQuery = useQuery({
    queryKey: ApprovalManagementQueryKeys.transactions(),
    queryFn: GetApprovalTransactions,
    enabled: Boolean(accessToken) && isAuthSessionReady,
    placeholderData: [],
    refetchInterval: 60_000,
    retry: false,
  });
  const {
    data: authProfile,
    error: authProfileError,
    isError: isAuthProfileError,
    isFetching: isAuthProfileFetching,
  } = useAuthProfileQuery({
    accessToken,
    enabled: isAuthSessionReady,
  });
  const effectiveRole = authProfile ? ResolveAuthProfileEffectiveRole(authProfile) : null;
  const isSuperAdmin = effectiveRole === AuthEffectiveRoleCodes.SuperAdmin;
  const isMasterRoute = isMasterPath(pathname);
  const isWorkspaceRoute = isWorkspacePath(pathname);
  const isAccountRoute = isAccountPath(pathname);
  const hasMasterAccess = effectiveRole === AuthEffectiveRoleCodes.SuperAdmin;
  const hasWorkspaceAccess =
    authProfile && effectiveRole !== AuthEffectiveRoleCodes.SuperAdmin ? ProfileHasWorkspaceAccess(authProfile) : false;
  const isProfileLoading = Boolean(accessToken) && !authProfile && isAuthProfileFetching;
  const shouldRedirectToOnboarding = RequiresOnboarding(authProfile);

  useEffect(() => {
    if (!shouldRedirectToOnboarding) {
      return;
    }

    router.replace(OnboardingRoutePath);
  }, [router, shouldRedirectToOnboarding]);

  useEffect(() => {
    if (!isAuthProfileError || hasHandledAuthProfileErrorRef.current || !IsUnauthorizedApiError(authProfileError)) {
      return;
    }

    hasHandledAuthProfileErrorRef.current = true;
    NotifyAuthSessionExpired();
  }, [authProfileError, isAuthProfileError]);
  const activeNavigationScope: MainNavigationScope = isAccountRoute
    ? MainNavigationScopes.Account
    : hasMasterAccess
      ? MainNavigationScopes.Master
      : authProfile && isWorkspaceRoute
        ? MainNavigationScopes.Workspace
        : MainNavigationScopes.Company;
  const workspaceCompanies = useMemo(
    () => (authProfile && !isSuperAdmin ? MapProfileCompaniesToMainCompanies(authProfile) : []),
    [authProfile, isSuperAdmin],
  );
  const profileActiveCompanyId = authProfile ? GetAuthProfileCompanyId(authProfile) : null;
  const [activeCompanyId, setActiveCompanyId] = useState("");
  const [notifications, setNotifications] = useState<MainNotification[]>(MainLayoutInitialNotifications);

  useEffect(() => {
    const transactions = approvalTransactionsQuery.data ?? [];
    const pendingTransactions = transactions.filter((transaction) => {
      const status = transaction.status.trim().toUpperCase();

      return status !== "APPROVED" && status !== "DISAPPROVED";
    });

    setApprovalTransactions(transactions);
    setNotifications((current) => {
      const notificationId = "pending-approval-transactions";
      const existing = current.find(
        (notification) => notification.id === notificationId,
      );
      const withoutApprovalNotification = current.filter(
        (notification) => notification.id !== notificationId,
      );

      if (pendingTransactions.length === 0) {
        return withoutApprovalNotification;
      }

      const body = `${pendingTransactions.length} approval ${pendingTransactions.length === 1 ? "transaction needs" : "transactions need"} your attention.`;

      return [
        {
          id: notificationId,
          title: "Pending approvals",
          body,
          href: "/system-administration/approval-management/approval-transactions",
          time: "Now",
          isRead: existing?.body === body ? existing.isRead : false,
        },
        ...withoutApprovalNotification,
      ];
    });
  }, [approvalTransactionsQuery.data, setApprovalTransactions]);
  const query = queryState.pathname === pathname ? queryState.value : "";
  const isSearchOpen = searchOpenPath === pathname;
  const isNotificationsOpen = notificationsOpenPath === pathname;
  const isHelpOpen = helpOpenPath === pathname;

  const availableCompanies = workspaceCompanies;
  const currentCompany = availableCompanies.find((company) => company.id === activeCompanyId) ?? availableCompanies[0] ?? EmptyCompany;
  const subscription = currentCompany.subscriptionPackage ?? MainLayoutDefaultSubscription;
  const { branches, isLoading: isBranchLoading } = useWorkspaceCompanyMainLayoutBranches({
    company: activeNavigationScope === MainNavigationScopes.Company ? currentCompany : undefined,
  });
  const switchCompanyMutation = useMutation({
    mutationFn: async ({ companyId, requestId }: { companyId: string; requestId: number }) => {
      const numericCompanyId = Number(companyId);

      if (!Number.isInteger(numericCompanyId) || numericCompanyId <= 0) {
        throw new Error("Invalid company selection.");
      }

      await PrepareQueryCacheForContextSwitch(queryClient);
      const result = await SwitchCompanyContext(accessToken, numericCompanyId);

      if (requestId !== latestCompanySwitchRequestRef.current) {
        return { result, profile: null, requestId };
      }

      await CreateFrontendAuthSession(result.accessToken);
      const profile = BuildAuthProfileFromSwitchResponse(result);

      return { result, profile, requestId };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: AuthQueryKeys.profiles(),
      });
    },
    onSuccess: ({ result, profile, requestId }) => {
      if (requestId !== latestCompanySwitchRequestRef.current || !profile) {
        return;
      }

      if (result.companyId != null) {
        setActiveCompanyId(String(result.companyId));
        setStoredActiveCompanyId(result.companyId);
      }

      setStoredAccessToken(AuthenticatedSessionMarker);
      setStoredActiveBranchContext(null, null);
      queryClient.setQueryData(AuthQueryKeys.profile(CreateAuthAccessTokenQueryScope(AuthenticatedSessionMarker)), profile);
      router.push("/dashboard");
      releaseShellContextSwitchAfterFrame();
    },
    onError: (_error, variables) => {
      if (variables?.requestId !== latestCompanySwitchRequestRef.current) {
        return;
      }

      setSwitchingCompanyName(null);
      setSwitchingCompanyId(null);
      clearShellContextSwitch(false);
    },
  });

  const accessibleBranches = useMemo(() => sortBranchesByPriority(getAccessibleBranches(branches)), [branches]);
  const routedBranch = useMemo(() => {
    if (!routedBranchId && !routedBranchName) {
      return null;
    }

    const normalizedRoutedBranchName = normalizeBranchRouteToken(routedBranchName ?? "");

    return (
      accessibleBranches.find((branch) => {
        if (branch.id === routedBranchId) {
          return true;
        }

        if (!normalizedRoutedBranchName) {
          return false;
        }

        return (
          normalizeBranchRouteToken(branch.name) === normalizedRoutedBranchName ||
          normalizeBranchRouteToken(getBranchSwitcherLabel(branch)) === normalizedRoutedBranchName ||
          normalizeBranchRouteToken(branch.code) === normalizedRoutedBranchName
        );
      }) ?? null
    );
  }, [accessibleBranches, routedBranchId, routedBranchName]);
  const storedActiveBranchId = useMemo(() => {
    if (
      !authProfile?.user.id ||
      !currentCompany.id ||
      activeNavigationScope !== MainNavigationScopes.Company ||
      routedBranchId ||
      routedBranchName ||
      accessibleBranches.length === 0
    ) {
      return "";
    }

    const storedBranchId = readStoredActiveBranchId({
      userId: authProfile.user.id,
      companyId: currentCompany.id,
    });

    return storedBranchId && accessibleBranches.some((branch) => branch.id === storedBranchId) ? storedBranchId : "";
  }, [accessibleBranches, activeNavigationScope, authProfile, currentCompany.id, routedBranchId, routedBranchName]);
  const selectedActiveBranchId =
    selectedBranchId && accessibleBranches.some((branch) => branch.id === selectedBranchId) ? selectedBranchId : "";
  const activeBranchId = routedBranch?.id ?? (selectedActiveBranchId || storedActiveBranchId || accessibleBranches[0]?.id || "");
  const displayUser = authProfile ? CreateWorkspaceCurrentUserFromProfile(authProfile, activeBranchId) : EmptyCurrentUser;
  const companyUserModuleItems = useMemo(() => {
    const userModules = GetAuthProfileAccess(authProfile)?.userModules;
    const branchModules = userModules?.byBranch?.find((branch) => String(branch.branchUnitId) === activeBranchId);
    const fallbackBranchModules = userModules?.byBranch?.find((branch) => branch.items.length > 0);

    return branchModules?.items.length ? branchModules.items : (fallbackBranchModules?.items ?? userModules?.items ?? []);
  }, [activeBranchId, authProfile]);
  useEffect(() => {
    if (activeNavigationScope !== MainNavigationScopes.Company || !authProfile) return;

    const activeAccess = GetAuthProfileAccess(authProfile);
    const enabledModulesCount = activeAccess?.enabledModules?.length ?? 0;

    if (enabledModulesCount > 0 && companyUserModuleItems.length === 0) {
      console.warn("[Sidebar] Empty user module tree from auth profile.", {
        companyId: activeAccess?.companyId ?? currentCompany.id,
        branchUnitId: activeBranchId || null,
        enabledModulesCount,
      });
    }
  }, [activeBranchId, activeNavigationScope, authProfile, companyUserModuleItems.length, currentCompany.id]);
  const companyNavigationSections = useMemo(() => {
    return MapUserModulesToNavigation(companyUserModuleItems);
  }, [companyUserModuleItems]);
  const hasCompanyAdministrationAccess = hasCurrentCompanyAdministrationAccess(authProfile, currentCompany.id);
  const hasProfileBranchAccess = hasCurrentCompanyBranchAccess(authProfile, currentCompany.id);
  const hasBranchAccess = hasCompanyAdministrationAccess || hasProfileBranchAccess || accessibleBranches.length > 0;
  const shouldShowBranchSwitcher = shouldShowBranchControls(accessibleBranches);
  const currentBranch = accessibleBranches.find((branch) => branch.id === activeBranchId) ?? accessibleBranches[0] ?? null;
  const canManageBranches = displayUser.userRole === "Admin";

  /* eslint-disable react-hooks/preserve-manual-memoization */
  const navigationSections = useMemo(() => {
    const sourceSections =
      activeNavigationScope === MainNavigationScopes.Account
        ? MainAccountNavigationSections
        : activeNavigationScope === MainNavigationScopes.Master
          ? MainMasterNavigationSections
          : activeNavigationScope === MainNavigationScopes.Workspace
            ? MainWorkspaceNavigationSections
            : companyNavigationSections;

    if (activeNavigationScope === MainNavigationScopes.Company) return sourceSections;
    return filterMainNavigationSections(sourceSections, displayUser, subscription);
  }, [activeNavigationScope, companyNavigationSections, displayUser, subscription]);
  const activeExpandedKeys = useMemo(() => getActiveExpandedKeys(navigationSections, pathname), [navigationSections, pathname]);
  const shouldAutoRevealActiveRoute = sidebarNavigationPath !== pathname;
  const expandedKeys = useMemo(
    () => Array.from(new Set([...manualExpandedKeys, ...activeExpandedKeys])),
    [activeExpandedKeys, manualExpandedKeys],
  );

  const availableSearchItems = useMemo(() => flattenSections(navigationSections), [navigationSections]);
  const activeSearchContext = useMemo(() => getActiveSearchContext(availableSearchItems, pathname), [availableSearchItems, pathname]);
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rankedItems = rankSearchItemsByActiveContext(availableSearchItems, activeSearchContext, normalizedQuery, pathname);

    if (!normalizedQuery) {
      return rankedItems.slice(0, 8);
    }

    return rankedItems.filter((item) => matchesSearchQuery(item, normalizedQuery)).slice(0, 12);
  }, [activeSearchContext, availableSearchItems, pathname, query]);
  const companySearchItems = useMemo(() => flattenSections(companyNavigationSections), [companyNavigationSections]);
  const companyHomeHref = getCompanyHomeHref(companySearchItems);
  const homeHref =
    activeNavigationScope === MainNavigationScopes.Account && hasMasterAccess
      ? MasterHomeHref
      : activeNavigationScope === MainNavigationScopes.Account && hasWorkspaceAccess
        ? WorkspaceHomeHref
        : activeNavigationScope === MainNavigationScopes.Master
          ? MasterHomeHref
          : activeNavigationScope === MainNavigationScopes.Workspace
            ? WorkspaceHomeHref
            : companyHomeHref;
  const clearShellContextSwitch = useCallback(
    (keepTopbarSkeleton = true) => {
      if (shellContextSettlingRef.current !== null) {
        window.clearTimeout(shellContextSettlingRef.current);
        shellContextSettlingRef.current = null;
      }

      if (shellContextSwitchFallbackRef.current !== null) {
        window.clearTimeout(shellContextSwitchFallbackRef.current);
        shellContextSwitchFallbackRef.current = null;
      }

      endShellContextSwitch();

      if (!keepTopbarSkeleton) {
        finishShellContextSettling();
        return;
      }

      shellContextSettlingRef.current = window.setTimeout(() => {
        shellContextSettlingRef.current = null;
        finishShellContextSettling();
      }, TopbarContextSkeletonMs);
    },
    [endShellContextSwitch, finishShellContextSettling],
  );
  const releaseShellContextSwitchAfterFrame = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        clearShellContextSwitch();
      });
    });
  }, [clearShellContextSwitch]);
  const releaseShellContextSwitchAfterMinimumDelay = useCallback(() => {
    window.setTimeout(() => {
      releaseShellContextSwitchAfterFrame();
    }, BranchContextSwitchMinimumMs);
  }, [releaseShellContextSwitchAfterFrame]);
  const beginShellContextSwitchWithFallback = useCallback(
    (message: string) => {
      beginShellContextSwitch(message);

      if (shellContextSwitchFallbackRef.current !== null) {
        window.clearTimeout(shellContextSwitchFallbackRef.current);
      }

      shellContextSwitchFallbackRef.current = window.setTimeout(() => {
        setSwitchingCompanyName(null);
        setSwitchingCompanyId(null);
        setSwitchingAdministrationScope(null);
        clearShellContextSwitch(false);
      }, ShellContextSwitchFallbackMs);
    },
    [beginShellContextSwitch, clearShellContextSwitch],
  );
  /* eslint-enable react-hooks/preserve-manual-memoization */

  useEffect(() => {
    if (!switchingCompanyId) {
      return;
    }

    if (activeNavigationScope !== MainNavigationScopes.Company) {
      return;
    }

    if (activeCompanyId !== switchingCompanyId) {
      return;
    }

    if (isBranchLoading) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- company switching should stay on the main loader until the target branch context is ready.
    setSwitchingCompanyName(null);
    setSwitchingCompanyId(null);
    clearShellContextSwitch();
  }, [activeCompanyId, activeNavigationScope, clearShellContextSwitch, isBranchLoading, switchingCompanyId]);

  useEffect(() => {
    if (!switchingAdministrationScope) {
      return;
    }

    if (switchingAdministrationScope === MainNavigationScopes.Workspace && isWorkspaceRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the transition only after the workspace route is active.
      setSwitchingAdministrationScope(null);
      clearShellContextSwitch();
      return;
    }

    if (switchingAdministrationScope === MainNavigationScopes.Master && isMasterRoute) {
      setSwitchingAdministrationScope(null);
      clearShellContextSwitch();
    }
  }, [clearShellContextSwitch, isMasterRoute, isWorkspaceRoute, switchingAdministrationScope]);

  useEffect(() => {
    if (profileActiveCompanyId == null || switchingCompanyId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the layout company switcher synced with the loaded profile.
    setActiveCompanyId(String(profileActiveCompanyId));
  }, [profileActiveCompanyId, switchingCompanyId]);

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
    const numericCompanyId = Number(currentCompany.id);

    setStoredActiveCompanyId(Number.isInteger(numericCompanyId) && numericCompanyId > 0 ? numericCompanyId : null);
    setStoredActiveCompanyName(currentCompany.name || null);
  }, [currentCompany.id, currentCompany.name, setStoredActiveCompanyId, setStoredActiveCompanyName]);

  useEffect(() => {
    const numericBranchId = Number(currentBranch?.id);

    setStoredActiveBranchContext(
      Number.isInteger(numericBranchId) && numericBranchId > 0 ? numericBranchId : null,
      currentBranch ? getBranchSwitcherLabel(currentBranch) : null,
    );
  }, [currentBranch, setStoredActiveBranchContext]);

  useEffect(() => {
    if (!authProfile?.user.id || !currentCompany.id || !activeBranchId || activeNavigationScope !== MainNavigationScopes.Company) {
      return;
    }

    if (!accessibleBranches.some((branch) => branch.id === activeBranchId)) {
      return;
    }

    writeStoredActiveBranchId({
      userId: authProfile.user.id,
      companyId: currentCompany.id,
      branchId: activeBranchId,
    });
  }, [accessibleBranches, activeBranchId, activeNavigationScope, authProfile?.user.id, currentCompany.id]);

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
  }, [accessibleBranches, canManageBranches, companyHomeHref, currentCompany.id, shouldShowBranchSwitcher]);

  const breadcrumbs = useMemo(
    () =>
      buildBreadcrumbs({
        pathname,
        navigationSections,
        activeNavigationScope,
        subscriberManagementCompanyId,
      }),
    [activeNavigationScope, navigationSections, pathname, subscriberManagementCompanyId],
  );
  const moduleTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? "Module";

  const currentHelpArticle = useMemo(() => getHelpArticleForPath(pathname, ModuleHelpArticles) ?? ModuleHelpArticles[0], [pathname]);
  const selectedHelpArticleKey = selectedHelpArticleState.pathname === pathname ? selectedHelpArticleState.key : currentHelpArticle.key;

  const unreadNotificationCount = notifications.filter((notification) => !notification.isRead).length;
  const visibleNotifications = notifications.filter((notification) => {
    if (notificationTab === "all") {
      return true;
    }

    return notificationTab === "unread" ? !notification.isRead : notification.isRead;
  });

  useEffect(
    () => () => {
      if (sidebarTransitionFrameRef.current !== null) {
        cancelAnimationFrame(sidebarTransitionFrameRef.current);
      }
      if (shellContextSwitchFallbackRef.current !== null) {
        window.clearTimeout(shellContextSwitchFallbackRef.current);
      }
      if (shellContextSettlingRef.current !== null) {
        window.clearTimeout(shellContextSettlingRef.current);
      }

      endShellContextSwitch();
      finishShellContextSettling();
    },
    [endShellContextSwitch, finishShellContextSettling],
  );

  useEffect(() => {
    if (!missingRecordActionRedirectHref) {
      return;
    }

    router.replace(missingRecordActionRedirectHref);
  }, [missingRecordActionRedirectHref, router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function syncSidebarToViewport(event: MediaQueryList | MediaQueryListEvent) {
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
    setNotificationsOpenPath((current) => (current === pathname ? null : pathname));
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
    setManualExpandedKeys((current) => (current.includes(key) ? current.filter((expandedKey) => expandedKey !== key) : [...current, key]));
  }

  function markSidebarNavigation(href: string) {
    setSidebarNavigationPath(href);
  }

  function loadBranchOptions() {
    // Branches are loaded from the active workspace company unit API.
    return undefined;
  }

  function selectBranch(branchId: string) {
    if (branchId === activeBranchId) {
      return;
    }

    const selectedBranch = accessibleBranches.find((branch) => branch.id === branchId);

    beginShellContextSwitchWithFallback(
      selectedBranch ? `Switching to ${getBranchSwitcherLabel(selectedBranch)}...` : "Switching branch...",
    );
    void PrepareQueryCacheForContextSwitch(queryClient);
    setSelectedBranchId(branchId);
    setStoredActiveBranchContext(
      Number.isInteger(Number(branchId)) && Number(branchId) > 0 ? Number(branchId) : null,
      selectedBranch ? getBranchSwitcherLabel(selectedBranch) : null,
    );

    if (authProfile?.user.id && currentCompany.id) {
      writeStoredActiveBranchId({
        userId: authProfile.user.id,
        companyId: currentCompany.id,
        branchId,
      });
    }

    releaseShellContextSwitchAfterMinimumDelay();
  }

  function selectCompany(companyId: string) {
    if (isSuperAdmin) {
      return;
    }

    if (activeNavigationScope === MainNavigationScopes.Company && companyId === activeCompanyId) {
      router.push(companyHomeHref);
      return;
    }

    const selectedCompany = availableCompanies.find((company) => company.id === companyId);

    if (selectedCompany?.isSwitchable === false) {
      return;
    }

    const requestId = latestCompanySwitchRequestRef.current + 1;


    latestCompanySwitchRequestRef.current = requestId;
    beginShellContextSwitchWithFallback(selectedCompany ? `Switching to ${selectedCompany.name}...` : "Switching company...");
    setSwitchingCompanyName(selectedCompany?.name ?? "selected company");
    setSwitchingCompanyId(companyId);
    setSwitchingAdministrationScope(null);
    setSelectedBranchId("");
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    switchCompanyMutation.mutate({ companyId, requestId });
  }

  function switchToWorkspace() {
    if (isSuperAdmin || !hasWorkspaceAccess) {
      return;
    }

    setSwitchingCompanyName(null);
    setSwitchingCompanyId(null);
    setSwitchingAdministrationScope(MainNavigationScopes.Workspace);
    beginShellContextSwitchWithFallback("Switching to workspace...");
    setSelectedBranchId("");
    setStoredActiveBranchContext(null, null);
    setStoredActiveCompanyId(null);
    setStoredActiveCompanyName(null);
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    void PrepareQueryCacheForContextSwitch(queryClient);
    router.push(WorkspaceHomeHref);
  }

  function switchToMaster() {
    if (!hasMasterAccess) {
      return;
    }

    setSwitchingCompanyName(null);
    setSwitchingCompanyId(null);
    setSwitchingAdministrationScope(MainNavigationScopes.Master);
    beginShellContextSwitchWithFallback("Switching to master control...");
    setSelectedBranchId("");
    setStoredActiveBranchContext(null, null);
    setStoredActiveCompanyId(null);
    setStoredActiveCompanyName(null);
    setSearchOpenPath(null);
    setNotificationsOpenPath(null);
    void PrepareQueryCacheForContextSwitch(queryClient);
    router.push(MasterHomeHref);
  }

  function markNotificationAsRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) => (notification.id === notificationId ? { ...notification, isRead: true } : notification)),
    );
  }

  function markAllNotificationsAsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  }

  return {
    activeHref: pathname,
    activeNavigationScope,
    availableCompanies,
    branchDropdownItems,
    breadcrumbs,
    canAccessMaster: hasMasterAccess,
    canAccessWorkspace: hasWorkspaceAccess,
    canSwitchCompany: !isSuperAdmin && availableCompanies.length > 1,
    currentBranch,
    currentCompany,
    currentHelpArticle,
    currentUser: displayUser,
    expandedKeys,
    hasAuthSession: Boolean(accessToken),
    hasBranchAccess,
    helpArticles: ModuleHelpArticles,
    homeHref,
    isCompanySwitching: Boolean(shellContextSwitchMessage || switchingCompanyId || switchingAdministrationScope),
    isLoggingOut: shellContextSwitchMessage === "Logging out...",
    companySwitchMessage:
      shellContextSwitchMessage ??
      (switchingAdministrationScope === MainNavigationScopes.Workspace
        ? "Switching to workspace..."
        : switchingAdministrationScope === MainNavigationScopes.Master
          ? "Switching to master control..."
          : switchingCompanyName
            ? `Switching to ${switchingCompanyName}...`
            : "Switching company..."),
    isTopbarContextLoading: isShellContextSettling,
    isShellLoading: !isAuthSessionReady || isProfileLoading || shouldRedirectToOnboarding,
    isRedirectingToOnboarding: shouldRedirectToOnboarding,
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
    companyUserModuleItems,
    notificationTab,
    query,
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

function ProfileHasWorkspaceAccess(profile: AuthProfile) {
  const effectiveRole = ResolveAuthProfileEffectiveRole(profile);

  if (effectiveRole === AuthEffectiveRoleCodes.SuperAdmin) {
    return false;
  }

  if (effectiveRole === AuthEffectiveRoleCodes.Admin) {
    return true;
  }

  return (
    profile.companies?.some(
      (company) => company.role === AuthMembershipRoleCodes.Admin && isOptionalActiveStatus(company.membershipStatus),
    ) ?? false
  );
}

function hasCurrentCompanyAdministrationAccess(profile: AuthProfile | undefined, companyId: string) {
  if (!profile) {
    return false;
  }

  if (profile.user.systemRole === AuthSystemRoleCodes.SuperAdmin) {
    return true;
  }

  const numericCompanyId = parsePositiveInteger(companyId);
  const activeProfileCompanyId = GetAuthProfileCompanyId(profile);
  const activeAccess = GetAuthProfileAccess(profile);
  const activeAccessRole = activeAccess?.membershipRole ?? activeAccess?.role;

  if (
    isOptionalActiveStatus(activeAccess?.membershipStatus) &&
    activeAccessRole === AuthMembershipRoleCodes.Admin &&
    (!numericCompanyId || activeProfileCompanyId === numericCompanyId || activeAccess?.companyId === numericCompanyId)
  ) {
    return true;
  }

  if (
    isOptionalActiveStatus(activeAccess?.membershipStatus) &&
    ResolveAuthProfileEffectiveRole(profile) === AuthEffectiveRoleCodes.Admin &&
    (!numericCompanyId || activeProfileCompanyId === numericCompanyId)
  ) {
    return true;
  }

  if (!numericCompanyId) {
    return false;
  }

  return (
    profile.companies?.some(
      (company) =>
        company.companyId === numericCompanyId &&
        company.role === AuthMembershipRoleCodes.Admin &&
        isOptionalActiveStatus(company.membershipStatus) &&
        company.isCompanyActive !== false &&
        isOptionalActiveStatus(company.companyStatus),
    ) ?? false
  );
}

function hasCurrentCompanyBranchAccess(profile: AuthProfile | undefined, companyId: string) {
  if (!profile || !companyId) {
    return false;
  }

  const numericCompanyId = parsePositiveInteger(companyId);

  if (!numericCompanyId) {
    return false;
  }

  const activeProfileCompanyId = GetAuthProfileCompanyId(profile);
  const activeAccess = GetAuthProfileAccess(profile);
  const activeAccessRole = activeAccess?.membershipRole ?? activeAccess?.role;

  if (
    activeProfileCompanyId === numericCompanyId &&
    isOptionalActiveStatus(activeAccess?.membershipStatus) &&
    activeAccessRole === AuthMembershipRoleCodes.User &&
    activeAccess?.accessScope != null
  ) {
    return true;
  }

  const companyMembership = profile.companies?.find((company) => company.companyId === numericCompanyId);

  if (!isOptionalActiveStatus(companyMembership?.membershipStatus) || companyMembership?.role !== AuthMembershipRoleCodes.User) {
    return false;
  }

  return (
    companyMembership.accessScope != null ||
    Boolean(companyMembership.accessibleUnitIds?.length) ||
    Boolean(companyMembership.units?.some((unit) => unit.isActive))
  );
}

function CreateWorkspaceCurrentUserFromProfile(profile: AuthProfile, activeBranchId?: string): MainCurrentUser {
  const [firstName, ...lastNameParts] = profile.user.name.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");
  const activeAccess = GetAuthProfileAccess(profile);
  const activeBranchAccess = activeAccess?.userModules?.byBranch?.find((branch) => String(branch.branchUnitId) === activeBranchId);
  const activeCompanyId = GetAuthProfileCompanyId(profile);
  const activeCompanyMembership = profile.companies?.find((company) => company.companyId === activeCompanyId) ?? profile.companies?.[0];
  const companyRoleName =
    activeBranchAccess?.companyRoleName ??
    activeAccess?.companyRoleName ??
    FormatCompanyRoleName(activeBranchAccess?.companyRoleCode ?? activeAccess?.companyRoleCode ?? activeCompanyMembership?.companyRoleCode);
  const companyRoleCode = activeBranchAccess?.companyRoleCode ?? activeAccess?.companyRoleCode ?? activeCompanyMembership?.companyRoleCode;
  const effectiveRole = ResolveAuthProfileEffectiveRole(profile);
  const userRole =
    effectiveRole === AuthEffectiveRoleCodes.SuperAdmin ? "Super Admin" : effectiveRole === AuthEffectiveRoleCodes.Admin ? "Admin" : "User";
  const profilePermissionMap = CreateProfilePermissionMap(activeAccess?.permissions);
  const adminPermissionMap = HasPermissionEntries(profilePermissionMap) ? profilePermissionMap : CreateNavigationPermissionMap();
  const userRoleDetails = companyRoleName
    ? {
        id: companyRoleCode ?? "user-role-workspace",
        name: companyRoleName,
        permissions:
          effectiveRole === AuthEffectiveRoleCodes.Admin || effectiveRole === AuthEffectiveRoleCodes.SuperAdmin
            ? adminPermissionMap
            : profilePermissionMap,
      }
    : effectiveRole === AuthEffectiveRoleCodes.Admin
      ? {
          id: "user-role-admin",
          name: "Admin",
          permissions: adminPermissionMap,
        }
      : HasPermissionEntries(profilePermissionMap)
        ? {
            id: activeAccess?.companyRoleCode ?? "user-role-assigned",
            name: "Assigned Role",
            permissions: profilePermissionMap,
          }
        : undefined;

  return {
    id: String(profile.user.id),
    activeCompanyId: activeCompanyId == null ? undefined : String(activeCompanyId),
    companyIds: (profile.companies ?? []).map((company) => String(company.companyId)),
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

function MapProfileCompaniesToMainCompanies(profile: AuthProfile) {
  return (profile.companies ?? [])
    .filter(
      (company) =>
        isOptionalActiveStatus(company.membershipStatus),
    )
    .map((company) => {
      const branches = mapProfileCompanyUnitsToMainBranches({ company });
      const rawSubStatus =
        company.subscriptionStatus ??
        (company.isCompanyActive !== false && isOptionalActiveStatus(company.companyStatus)
          ? "ACTIVE"
          : "INCOMPLETE");

      const normalized = String(rawSubStatus).toUpperCase().replace(/[^A-Z_]/g, "");
      let status = "Incomplete";
      if (normalized === "ACTIVE") status = WorkspaceCompanyActiveStatus;
      else if (normalized === "TRIALING" || normalized === "TRIAL") status = "Trialing";
      else if (normalized === "PAST_DUE" || normalized === "PASTDUE") status = "Past Due";
      else if (normalized === "INCOMPLETE") status = "Incomplete";
      else if (normalized === "UNPAID") status = "Unpaid";
      else if (normalized === "INCOMPLETE_CANCEL" || normalized === "INCOMPLETE_CANCELED") status = "Incomplete Canceled";
      else if (normalized === "EXPIRED") status = "Expired";
      else if (normalized === "CANCELED" || normalized === "CANCELLED") status = "Canceled";

      const isSwitchable =
        company.isCompanyActive !== false &&
        isOptionalActiveStatus(company.companyStatus) &&
        (status === WorkspaceCompanyActiveStatus || status === "Trialing");

      return {
        id: String(company.companyId),
        name: company.companyName,
        logoUrl: company.logoPublicUrl ?? undefined,
        status,
        isSwitchable,
        businessKind: undefined,
        subscriptionPackage: undefined,
        branches,
        totalBranches: branches.length,
        branchCode: branches[0]?.code,
        branchName: branches[0]?.name,
        helperText: company.role === AuthMembershipRoleCodes.Admin ? "Admin access" : "User access",
      };
    });
}


function parsePositiveInteger(value: string | number | null | undefined) {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

function isOptionalActiveStatus(status: string | null | undefined) {
  return !status || normalizeStatus(status) === "ACTIVE";
}

function normalizeStatus(status: string | null | undefined) {
  return status?.trim().toUpperCase() ?? "";
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

    const currentAccess = permissionMap[accessKey] ?? {};
    permissionMap[accessKey] = {
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
  const sections = [...MainMasterNavigationSections, ...MainWorkspaceNavigationSections];

  for (const section of sections) {
    GrantNavigationAccess(permissionMap, section.accessKey);

    for (const item of section.items) {
      AddNavigationItemPermissions(permissionMap, item);
    }
  }

  return permissionMap;
}

function AddNavigationItemPermissions(permissionMap: MainPermissionMap, item: MainNavigationItem) {
  GrantNavigationAccess(permissionMap, item.accessKey);
  if (item.permissionCode) {
    GrantNavigationAccess(permissionMap, item.permissionCode);
  }

  for (const child of item.children ?? []) {
    AddNavigationItemPermissions(permissionMap, child);
  }
}

function GrantNavigationAccess(permissionMap: MainPermissionMap, accessKey: string) {
  permissionMap[accessKey] = {
    add: true,
    cancel: true,
    delete: true,
    edit: true,
    uncancel: true,
    view: true,
  };
}

function MapBackendPermissionAction(action: string | undefined): MainAccessAction | undefined {
  if (action === "view") {
    return "view";
  }

  if (action === "create") {
    return "add";
  }

  if (action === "update") {
    return "edit";
  }

  if (action === "cancel" || action === "uncancel") {
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
  activeNavigationScope,
  navigationSections,
  pathname,
  subscriberManagementCompanyId,
}: {
  activeNavigationScope: MainNavigationScope;
  navigationSections: MainNavigationSection[];
  pathname: string;
  subscriberManagementCompanyId?: string;
}): MainBreadcrumb[] {
  const trail = findNavigationTrail(navigationSections, pathname);
  const fallbackLabel = activeNavigationScope === MainNavigationScopes.Workspace ? "Dashboard" : getPathFallbackTitle(pathname);
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
    activeNavigationScope === MainNavigationScopes.Workspace && fallbackTrail[0]?.label === "Workspace"
      ? fallbackTrail.slice(1)
      : fallbackTrail;
  const masterSubscriberTrail = buildMasterSubscriberManagementBreadcrumbs({
    companyId: subscriberManagementCompanyId,
    pathname,
    trail: normalizedTrail,
  });
  const completeTrail = removeAdjacentDuplicateBreadcrumbs(
    masterSubscriberTrail ?? appendPathSegmentBreadcrumbs(normalizedTrail, pathname),
  );

  return completeTrail.map((item) => ({
    key: item.key,
    label: item.label,
    href: item.href,
    canOpenDropdown: Boolean(item.dropdownItems?.length),
    dropdownItems: item.dropdownItems,
  }));
}

function findNavigationTrail(sections: MainNavigationSection[], pathname: string): NavigationTrailNode[] {
  const sectionDropdownItems = sections.map(toSectionDropdownItem);

  for (const section of sections) {
    const itemTrail = findItemTrail(section.items, pathname);
    const sectionHref = getSectionTargetHref(section);

    if (itemTrail.length > 0) {
      if (isParentlessModuleSection(section)) {
        return itemTrail.map((item, index) =>
          index === 0
            ? {
                ...item,
                dropdownItems: sectionDropdownItems,
              }
            : item,
        );
      }

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

function isParentlessModuleSection(section: MainNavigationSection) {
  const onlyItem = section.items[0];

  return section.key === `${onlyItem?.key}-root` && section.items.length === 1 && section.title === onlyItem.label;
}

function buildMasterSubscriberManagementBreadcrumbs({
  companyId,
  pathname,
  trail,
}: {
  companyId?: string;
  pathname: string;
  trail: NavigationTrailNode[];
}): NavigationTrailNode[] | null {
  const viewPrefix = `${MasterSubscriberManagementHref}/view/`;

  if (!pathname.startsWith(viewPrefix)) {
    return null;
  }

  const [recordId, sectionSegment, companyIdSegment, editSegment] = pathname.slice(viewPrefix.length).split("/").filter(Boolean);

  if (!recordId) {
    return null;
  }

  const subscriber = getMasterSubscriberManagementSubscriber(recordId);
  const baseTrail =
    trail.length > 0
      ? trail
      : [
          {
            key: "master-subscriber-management",
            label: "Subscriber Management",
            href: MasterSubscriberManagementHref,
          },
        ];
  const subscriberTrail: NavigationTrailNode[] = [
    ...baseTrail,
    {
      key: `subscriber-${recordId}`,
      label: subscriber.name,
      href: getMasterSubscriberManagementViewHref(recordId),
    },
  ];

  if (!sectionSegment) {
    return [
      ...subscriberTrail,
      {
        key: `subscriber-${recordId}-account-information`,
        label: "Account Information",
        href: pathname,
      },
    ];
  }

  if (!isMasterSubscriberManagementCompanySection(sectionSegment)) {
    return null;
  }

  const selectedCompanyId = companyIdSegment ? decodeURIComponent(companyIdSegment) : companyId;
  const company = getMasterSubscriberManagementCompany(recordId, selectedCompanyId);
  const sectionTitle = getMasterSubscriberManagementSectionPageTitle(sectionSegment);

  if (editSegment === "edit") {
    return [
      ...subscriberTrail,
      {
        key: `subscriber-${recordId}-company`,
        label: company.name,
        href: getMasterSubscriberManagementSectionHref(recordId, "company-information", company.id),
      },
      {
        key: `subscriber-${recordId}-${sectionSegment}`,
        label: sectionTitle,
        href: getMasterSubscriberManagementSectionHref(recordId, sectionSegment, company.id),
      },
      {
        key: `subscriber-${recordId}-${sectionSegment}-edit`,
        label: "Edit Company Information",
        href: pathname,
      },
    ];
  }

  return [
    ...subscriberTrail,
    {
      key: `subscriber-${recordId}-company`,
      label: company.name,
      href: getMasterSubscriberManagementSectionHref(recordId, "company-information", company.id),
    },
    {
      key: `subscriber-${recordId}-${sectionSegment}`,
      label: sectionTitle,
      href: pathname,
    },
  ];
}

function isMasterSubscriberManagementCompanySection(section: string): section is MasterSubscriberManagementCompanySection {
  return (
    section === "company-information" ||
    section === "subscription-and-plan" ||
    section === "branches" ||
    section === "users" ||
    section === "storage" ||
    section === "billing-and-invoices"
  );
}

function appendPathSegmentBreadcrumbs(trail: NavigationTrailNode[], pathname: string): NavigationTrailNode[] {
  const lastHref = trail[trail.length - 1]?.href;

  if (!lastHref || lastHref === pathname || !pathMatches(lastHref, pathname)) {
    return trail;
  }

  const extraSegments = pathname.slice(lastHref.length).split("/").filter(Boolean);

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

function removeAdjacentDuplicateBreadcrumbs(trail: NavigationTrailNode[]): NavigationTrailNode[] {
  return trail.filter((item, index) => {
    const previous = trail[index - 1];

    if (!previous) {
      return true;
    }

    return previous.label !== item.label || previous.href !== item.href;
  });
}

function getActionBreadcrumbs({ extraSegments, pathname }: { extraSegments: string[]; pathname: string }): NavigationTrailNode[] {
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

  if (isMasterSubscriberManagementCompanyInformationEditPath(segments)) {
    return null;
  }

  const parentSegments = segments.slice(0, -1);

  return parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "/";
}

function isMasterSubscriberManagementCompanyInformationEditPath(segments: string[]) {
  return (
    segments[0] === MainNavigationScopes.Master &&
    segments[1] === "subscriber-management" &&
    segments[2] === "view" &&
    Boolean(segments[3]) &&
    segments[4] === "company-information" &&
    Boolean(segments[5]) &&
    segments[6] === "edit" &&
    segments.length === 7
  );
}

function findItemTrail(items: MainNavigationItem[], pathname: string): NavigationTrailNode[] {
  const siblingDropdownItems = items.map(toDropdownItem);
  let bestTrail: NavigationTrailNode[] = [];
  let bestTrailHrefLength = -1;

  for (const item of items) {
    const childTrail = item.children ? findItemTrail(item.children, pathname) : [];

    if (childTrail.length > 0) {
      const candidateTrail = [
        {
          key: item.key,
          label: item.label,
          href: getItemTargetHref(item),
          dropdownItems: siblingDropdownItems,
        },
        ...childTrail,
      ];

      const candidateHrefLength = getTrailHrefLength(candidateTrail);

      if (candidateHrefLength > bestTrailHrefLength) {
        bestTrail = candidateTrail;
        bestTrailHrefLength = candidateHrefLength;
      }

      continue;
    }

    const isCurrentItem = pathMatches(item.href, pathname);

    if (isCurrentItem) {
      const candidateTrail = [
        {
          key: item.key,
          label: item.label,
          href: getItemTargetHref(item),
          dropdownItems: siblingDropdownItems,
        },
      ];
      const candidateHrefLength = getTrailHrefLength(candidateTrail);

      if (candidateHrefLength > bestTrailHrefLength) {
        bestTrail = candidateTrail;
        bestTrailHrefLength = candidateHrefLength;
      }
    }
  }

  return bestTrail;
}

function getTrailHrefLength(trail: NavigationTrailNode[]) {
  return trail.at(-1)?.href?.length ?? -1;
}

function getActiveExpandedKeys(sections: MainNavigationSection[], pathname: string): string[] {
  const activeKeys: string[] = [];

  for (const section of sections) {
    const itemKeys = findActiveItemAncestorKeys(section.items, pathname);

    if (itemKeys !== null || (section.href && pathMatches(section.href, pathname))) {
      activeKeys.push(section.key, ...(itemKeys ?? []));
    }
  }

  return activeKeys;
}

function findActiveItemAncestorKeys(items: MainNavigationItem[], pathname: string): string[] | null {
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
  return pathname === WorkspaceRoutePrefix || pathname.startsWith(`${WorkspaceRoutePrefix}/`);
}

function isMasterPath(pathname: string) {
  return pathname === MasterRoutePrefix || pathname.startsWith(`${MasterRoutePrefix}/`);
}

function isAccountPath(pathname: string) {
  return pathname === AccountRoutePrefix || pathname.startsWith(`${AccountRoutePrefix}/`);
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

function toSectionDropdownItem(section: MainNavigationSection): MainBreadcrumbDropdownItem {
  const firstItem = section.items[0];

  return {
    key: section.key,
    label: section.title,
    href: getSectionTargetHref(section),
    helperText: getNavigationDropdownHelperText(section.key) ?? (firstItem ? `Starts at ${firstItem.label}` : undefined),
  };
}

function toDropdownItem(item: MainNavigationItem): MainBreadcrumbDropdownItem {
  const firstChild = item.children?.[0];

  return {
    key: item.key,
    label: item.label,
    href: getItemTargetHref(item),
    helperText: getNavigationDropdownHelperText(item.key) ?? (firstChild ? `Starts at ${firstChild.label}` : undefined),
  };
}

function getNavigationDropdownHelperText(key: string) {
  if (key.startsWith(MainNavigationScopes.Workspace)) {
    return undefined;
  }

  return MainModuleCatalogHelperText[key];
}

function getSectionTargetHref(section: MainNavigationSection) {
  return section.items[0] ? getItemTargetHref(section.items[0]) : (section.href ?? "/");
}

function getItemTargetHref(item: MainNavigationItem): string {
  if (!item.children?.length || item.module) {
    return item.href;
  }

  return getItemTargetHref(item.children[0]);
}

function getCompanyHomeHref(items: MainSearchItem[]) {
  const dashboard = items.find((item) => item.key === "dashboard-overview");

  if (dashboard) {
    return dashboard.href;
  }

  return items[0]?.href ?? CompanyFallbackHomeHref;
}

function getActiveBranchStorageKey({ userId, companyId }: { userId: number; companyId: string }) {
  return `${ActiveBranchStorageKey}:user:${userId}:company:${companyId}`;
}

function readStoredActiveBranchId({ userId, companyId }: { userId: number; companyId: string }) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(getActiveBranchStorageKey({ userId, companyId }));
  } catch {
    return null;
  }
}

function writeStoredActiveBranchId({ userId, companyId, branchId }: { userId: number; companyId: string; branchId: string }) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getActiveBranchStorageKey({ userId, companyId }), branchId);
  } catch {}
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
  return [item.label, item.section, ...item.trail].join(" ").toLowerCase().includes(query);
}

type ActiveSearchContext = {
  href: string;
  section: string;
  trail: string[];
} | null;

function getActiveSearchContext(items: MainSearchItem[], pathname: string): ActiveSearchContext {
  const activeItem = items
    .filter((item) => pathMatches(item.href, pathname))
    .sort((first, second) => second.href.length - first.href.length)[0];

  if (!activeItem) {
    return null;
  }

  return {
    href: activeItem.href,
    section: activeItem.section,
    trail: activeItem.trail,
  };
}

function rankSearchItemsByActiveContext(items: MainSearchItem[], context: ActiveSearchContext, query: string, pathname: string) {
  return [...items].sort((first, second) => {
    const scoreDelta = getSearchItemScore(second, context, query, pathname) - getSearchItemScore(first, context, query, pathname);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return first.label.localeCompare(second.label);
  });
}

function getSearchItemScore(item: MainSearchItem, context: ActiveSearchContext, query: string, pathname: string) {
  let score = 0;
  const label = item.label.toLowerCase();
  const trail = item.trail.join(" ").toLowerCase();

  if (pathMatches(item.href, pathname)) {
    score += 1000;
  }

  if (context) {
    if (item.section === context.section) {
      score += 220;
    }

    if (item.trail[1] && item.trail[1] === context.trail[1]) {
      score += 120;
    }

    if (item.trail.join("/") === context.trail.join("/")) {
      score += 80;
    }
  }

  if (query) {
    if (label === query) {
      score += 80;
    } else if (label.startsWith(query)) {
      score += 50;
    } else if (label.includes(query)) {
      score += 25;
    }

    if (trail.includes(query)) {
      score += 10;
    }
  }

  return score;
}
