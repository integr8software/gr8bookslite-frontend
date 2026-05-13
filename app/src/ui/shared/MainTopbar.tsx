"use client";

import {
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Star,
  UserCircle,
} from "lucide-react";
import type {
  MainBranch,
  MainCompany,
  MainNavigationScope,
  MainNotification,
  MainSearchItem,
} from "@/app/src/data/shared/MainLayoutData";
import type {
  MainBreadcrumbDropdownItem,
  MainNotificationTab,
} from "@/app/src/hooks/shared/useMainLayout";
import { useLogout } from "@/app/src/hooks/auth/useLogout";
import { MainNotificationsPanel } from "./MainNotificationsPanel";
import { MainSearchPanel } from "./MainSearchPanel";

type MainTopbarProps = {
  activeHref: string;
  activeNavigationScope: MainNavigationScope;
  availableCompanies: MainCompany[];
  branchDropdownItems: MainBreadcrumbDropdownItem[];
  canAccessWorkspace: boolean;
  canSwitchCompany: boolean;
  currentBranch: MainBranch | null;
  currentCompany: MainCompany;
  currentUser: {
    initials: string;
    name: string;
    userRole: string;
    userType?: {
      name: string;
    };
  };
  isBranchLoading: boolean;
  isCurrentPageFavorite: boolean;
  isNotificationsOpen: boolean;
  isSearchOpen: boolean;
  isSidebarOpen: boolean;
  notificationTab: MainNotificationTab;
  notifications: MainNotification[];
  query: string;
  searchResults: MainSearchItem[];
  unreadNotificationCount: number;
  onCloseNotifications: () => void;
  onCloseSearch: () => void;
  onCloseSidebar: () => void;
  onLoadBranchOptions: () => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onNotificationTabChange: (tab: MainNotificationTab) => void;
  onOpenHelp: () => void;
  onQueryChange: (value: string) => void;
  onSelectBranch: (branchId: string) => void;
  onSelectCompany: (companyId: string) => void;
  onSwitchToWorkspace: () => void;
  onToggleFavorite: () => void;
  onToggleNotifications: () => void;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
};

type OpenSwitcherKey = "company" | "branch";
type SwitcherVariant = "desktop" | "mobile";

export function MainTopbar({
  activeHref,
  activeNavigationScope,
  availableCompanies,
  branchDropdownItems,
  canAccessWorkspace,
  canSwitchCompany,
  currentBranch,
  currentCompany,
  currentUser,
  isBranchLoading,
  isCurrentPageFavorite,
  isNotificationsOpen,
  isSearchOpen,
  isSidebarOpen,
  notificationTab,
  notifications,
  query,
  searchResults,
  unreadNotificationCount,
  onCloseNotifications,
  onCloseSearch,
  onCloseSidebar,
  onLoadBranchOptions,
  onMarkNotificationAsRead,
  onNotificationTabChange,
  onOpenHelp,
  onQueryChange,
  onSelectBranch,
  onSelectCompany,
  onSwitchToWorkspace,
  onToggleFavorite,
  onToggleNotifications,
  onToggleSearch,
  onToggleSidebar,
}: MainTopbarProps) {
  const logout = useLogout();
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const [openSwitcherState, setOpenSwitcherState] = useState<{
    href: string;
    key: OpenSwitcherKey | null;
  }>({
    href: activeHref,
    key: null,
  });
  const [profileMenuOpenPath, setProfileMenuOpenPath] = useState<string | null>(
    null,
  );
  const openSwitcherKey =
    openSwitcherState.href === activeHref ? openSwitcherState.key : null;
  const isProfileMenuOpen = profileMenuOpenPath === activeHref;
  const userDescriptor = getTopbarUserDescriptor(currentUser);
  const homeHref =
    activeNavigationScope === "workspace" ? "/workspace" : "/dashboard";
  const hasMobileWorkspaceControls =
    canSwitchCompany || activeNavigationScope === "company";
  const mobileFloatingPanelTopClass = hasMobileWorkspaceControls
    ? "top-[7.75rem]"
    : "top-18";

  useEffect(() => {
    if (
      !isSearchOpen &&
      !isNotificationsOpen &&
      !isProfileMenuOpen &&
      !openSwitcherKey
    ) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (isSearchOpen && !target.closest("[data-main-search-root]")) {
        onCloseSearch();
      }

      if (
        isNotificationsOpen &&
        !target.closest("[data-main-notifications-root]")
      ) {
        onCloseNotifications();
      }

      if (isProfileMenuOpen && !target.closest("[data-main-profile-root]")) {
        setProfileMenuOpenPath(null);
      }

      if (openSwitcherKey && !target.closest("[data-main-switcher-root]")) {
        setOpenSwitcherState({ href: activeHref, key: null });
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    activeHref,
    isNotificationsOpen,
    isProfileMenuOpen,
    isSearchOpen,
    onCloseNotifications,
    onCloseSearch,
    openSwitcherKey,
  ]);

  function closeMobileSidebar() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onCloseSidebar();
    }
  }

  function closeSwitcher() {
    setOpenSwitcherState({ href: activeHref, key: null });
  }

  function handleTopbarPointerDownCapture(
    event: ReactPointerEvent<HTMLElement>,
  ) {
    if (!isSidebarOpen || typeof window === "undefined") {
      return;
    }

    const target = event.target;

    if (
      window.innerWidth >= 1024 ||
      !(target instanceof Element) ||
      target.closest("[data-main-sidebar-toggle]")
    ) {
      return;
    }

    onCloseSidebar();
  }

  function handleToggleSearch() {
    closeSwitcher();
    closeMobileSidebar();
    onToggleSearch();
  }

  function handleToggleNotifications() {
    closeSwitcher();
    closeMobileSidebar();
    onToggleNotifications();
  }

  function toggleSwitcher(key: OpenSwitcherKey) {
    const next = openSwitcherKey === key ? null : key;

    if (next === "branch") {
      onLoadBranchOptions();
    }

    closeMobileSidebar();
    onCloseSearch();
    onCloseNotifications();
    setProfileMenuOpenPath(null);
    setOpenSwitcherState({ href: activeHref, key: next });
  }

  function handleLogoutClick(onAfterLogout?: () => void) {
    onAfterLogout?.();
    void logout();
  }

  return (
    <header
      data-main-topbar-root
      onPointerDownCapture={handleTopbarPointerDownCapture}
      className="sticky top-0 z-50 border-b border-darknavy/10 bg-white/95 backdrop-blur"
    >
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          data-main-sidebar-toggle
          onClick={() => {
            closeSwitcher();
            onToggleSidebar();
          }}
          aria-label="Toggle sidebar"
          aria-pressed={isSidebarOpen}
          className="flex h-10 w-10 items-center justify-center rounded-md text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        >
          <Menu className="h-5 w-5 lg:hidden" aria-hidden="true" />
          <SidebarIcon className="hidden h-5 w-5 lg:block" aria-hidden="true" />
        </button>

        <Link
          href={homeHref}
          className="mr-1 hidden min-w-fit items-baseline rounded-md px-2 py-1.5 text-xl font-semibold tracking-tight text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 sm:inline-flex"
        >
          <span>Gr8books</span>
          <span className="ml-1 text-sm font-medium italic text-skyblue">
            Lite
          </span>
        </Link>

        <button
          type="button"
          onClick={() => {
            closeSwitcher();
            closeMobileSidebar();
            onToggleFavorite();
          }}
          aria-label={
            isCurrentPageFavorite ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={isCurrentPageFavorite}
          className={joinClasses(
            "flex h-10 w-10 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
            isCurrentPageFavorite
              ? "text-yellow-400 hover:text-yellow-400"
              : "text-darknavy/60 hover:bg-darknavy/5 hover:text-darknavy",
          )}
        >
          <Star
            className="h-5 w-5"
            fill={isCurrentPageFavorite ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>

        <nav
          aria-label="Workspace controls"
          className="hidden min-w-0 flex-1 items-center gap-2 md:flex md:max-w-[34rem] lg:max-w-[38rem] xl:max-w-[42rem]"
        >
          {canSwitchCompany ? (
            <CompanySwitcher
              activeNavigationScope={activeNavigationScope}
              availableCompanies={availableCompanies}
              canAccessWorkspace={canAccessWorkspace}
              currentCompany={currentCompany}
              isOpen={openSwitcherKey === "company"}
              onClose={closeSwitcher}
              onSelectCompany={onSelectCompany}
              onSwitchToWorkspace={onSwitchToWorkspace}
              onToggle={() => toggleSwitcher("company")}
            />
          ) : null}

          {activeNavigationScope === "company" ? (
            <BranchSwitcher
              branchDropdownItems={branchDropdownItems}
              currentBranch={currentBranch}
              isLoading={isBranchLoading}
              isOpen={openSwitcherKey === "branch"}
              onClose={closeSwitcher}
              onSelectBranch={onSelectBranch}
              onToggle={() => toggleSwitcher("branch")}
            />
          ) : null}
        </nav>

        <div className="ml-auto flex items-center justify-end gap-1 sm:gap-2">
          <div
            className="relative hidden w-52 shrink-0 xl:block 2xl:w-72"
            data-main-search-root
          >
            <button
              type="button"
              onClick={handleToggleSearch}
              aria-expanded={isSearchOpen}
              className="flex h-10 w-full items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 text-left text-sm text-darknavy/45 shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">Search anything...</span>
            </button>
            {isSearchOpen ? (
              <MainSearchPanel
                query={query}
                results={searchResults}
                onClose={onCloseSearch}
                onQueryChange={onQueryChange}
                className="absolute right-0 top-12 w-[24rem]"
              />
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleToggleSearch}
            aria-label="Search"
            aria-expanded={isSearchOpen}
            data-main-search-root
            className="flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md xl:hidden"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative" data-main-notifications-root>
            <button
              type="button"
              onClick={handleToggleNotifications}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-coralpink ring-2 ring-white" />
              ) : null}
            </button>

            <div
              className={joinClasses(
                "fixed right-2 z-50 w-[calc(100vw-1rem)] max-w-88 origin-top-right transition-[opacity,transform] duration-150 ease-out will-change-[opacity,transform] motion-reduce:transition-none sm:right-4 sm:w-80 sm:max-w-none md:top-18 md:w-96 xl:hidden",
                mobileFloatingPanelTopClass,
                isNotificationsOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-1 scale-[0.98] opacity-0",
              )}
            >
              <MainNotificationsPanel
                notifications={notifications}
                tab={notificationTab}
                unreadCount={unreadNotificationCount}
                onClose={onCloseNotifications}
                onMarkAsRead={onMarkNotificationAsRead}
                onTabChange={onNotificationTabChange}
                className="max-h-[calc(100vh-5.5rem)] rounded-lg"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              closeSwitcher();
              closeMobileSidebar();
              onOpenHelp();
            }}
            aria-label="Help"
            className="flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md"
          >
            <CircleHelp className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative" data-main-profile-root>
            <button
              type="button"
              onClick={() => {
                closeSwitcher();
                closeMobileSidebar();
                onCloseSearch();
                onCloseNotifications();
                setProfileMenuOpenPath((current) =>
                  current === activeHref ? null : activeHref,
                );
              }}
              aria-expanded={isProfileMenuOpen}
              className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-darknavy/20 bg-white p-0.5 text-left shadow-sm transition-all duration-200 ease-out hover:border-skyblue/55 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md xl:justify-start xl:pr-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-skyblue/25 text-xs font-bold leading-none text-darknavy md:rounded-md">
                {currentUser.initials}
              </span>
              <span className="hidden min-w-0 max-w-44 xl:block 2xl:max-w-56">
                <span className="block truncate text-sm font-semibold leading-4 text-darknavy">
                  {currentUser.name}
                </span>
                {userDescriptor ? (
                  <span className="block truncate text-xs text-darknavy/55">
                    {userDescriptor}
                  </span>
                ) : null}
              </span>
              <ChevronDown
                className="hidden h-4 w-4 shrink-0 text-darknavy/50 xl:block"
                aria-hidden="true"
              />
            </button>

            {isProfileMenuOpen ? (
              <div
                className={joinClasses(
                  "fixed right-3 z-50 w-[calc(100vw-1.5rem)] max-w-72 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_24px_70px_rgba(33,39,56,0.18)] md:absolute md:right-0 md:top-12 md:w-72",
                  mobileFloatingPanelTopClass,
                )}
              >
                <AccountDetails
                  companyName={currentCompany.name}
                  currentUser={currentUser}
                />
                <MenuSeparator />
                <ProfileMenuLink
                  href="/profile"
                  icon={UserCircle}
                  label="Profile"
                  onClick={() => setProfileMenuOpenPath(null)}
                />
                <ProfileMenuLink
                  href="/settings"
                  icon={Settings}
                  label="Settings"
                  onClick={() => setProfileMenuOpenPath(null)}
                />
                <ProfileMenuButton
                  icon={LogOut}
                  label="Logout"
                  onClick={() => handleLogoutClick(() => setProfileMenuOpenPath(null))}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {hasMobileWorkspaceControls ? (
        <nav
          aria-label="Mobile workspace controls"
          className={joinClasses(
            "grid gap-2 border-t border-darknavy/10 px-3 py-2 md:hidden",
            canSwitchCompany && activeNavigationScope === "company"
              ? "grid-cols-2"
              : "grid-cols-1",
          )}
        >
          {canSwitchCompany ? (
            <CompanySwitcher
              activeNavigationScope={activeNavigationScope}
              availableCompanies={availableCompanies}
              canAccessWorkspace={canAccessWorkspace}
              currentCompany={currentCompany}
              isOpen={openSwitcherKey === "company"}
              variant="mobile"
              onClose={closeSwitcher}
              onSelectCompany={onSelectCompany}
              onSwitchToWorkspace={onSwitchToWorkspace}
              onToggle={() => toggleSwitcher("company")}
            />
          ) : null}

          {activeNavigationScope === "company" ? (
            <BranchSwitcher
              branchDropdownItems={branchDropdownItems}
              currentBranch={currentBranch}
              isLoading={isBranchLoading}
              isOpen={openSwitcherKey === "branch"}
              variant="mobile"
              onClose={closeSwitcher}
              onSelectBranch={onSelectBranch}
              onToggle={() => toggleSwitcher("branch")}
            />
          ) : null}
        </nav>
      ) : null}

      {isSearchOpen ? (
        <div data-main-search-root>
          <MainSearchPanel
            query={query}
            results={searchResults}
            onClose={onCloseSearch}
            onQueryChange={onQueryChange}
            className={joinClasses(
              "fixed left-3 right-3 md:top-18 lg:hidden",
              mobileFloatingPanelTopClass,
            )}
          />
        </div>
      ) : null}
    </header>
  );
}

type CompanySwitcherProps = {
  activeNavigationScope: MainNavigationScope;
  availableCompanies: MainCompany[];
  canAccessWorkspace: boolean;
  currentCompany: MainCompany;
  isOpen: boolean;
  variant?: SwitcherVariant;
  onClose: () => void;
  onSelectCompany: (companyId: string) => void;
  onSwitchToWorkspace: () => void;
  onToggle: () => void;
};

function CompanySwitcher({
  activeNavigationScope,
  availableCompanies,
  canAccessWorkspace,
  currentCompany,
  isOpen,
  variant = "desktop",
  onClose,
  onSelectCompany,
  onSwitchToWorkspace,
  onToggle,
}: CompanySwitcherProps) {
  const isWorkspaceActive = activeNavigationScope === "workspace";
  const label = isWorkspaceActive ? "Work Space" : currentCompany.name;

  return (
    <div
      className={joinClasses(
        "relative min-w-0",
        variant === "desktop" ? "w-56 flex-none xl:w-64" : "w-full",
      )}
      data-main-switcher-root
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Switch company"
        aria-expanded={isOpen}
        className={joinClasses(
          "flex h-10 w-full min-w-0 items-center gap-2 border border-darknavy/10 bg-white px-3 text-left text-sm shadow-sm transition-all duration-200 ease-out hover:border-skyblue/45 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100",
          variant === "mobile" ? "rounded-full" : "rounded-md",
        )}
      >
        {isWorkspaceActive ? (
          <LayoutDashboard className="h-4 w-4 shrink-0 text-darknavy/55" aria-hidden="true" />
        ) : (
          <Building2 className="h-4 w-4 shrink-0 text-darknavy/55" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1 truncate font-semibold text-darknavy">
          {label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-darknavy/45" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={getSwitcherMenuClassName(variant)}>
          {canAccessWorkspace ? (
            <>
              <SwitcherButton
                description="Global administration"
                icon={LayoutDashboard}
                isActive={isWorkspaceActive}
                label="Work Space"
                onClick={() => {
                  onSwitchToWorkspace();
                  onClose();
                }}
              />
              <MenuSeparator />
            </>
          ) : null}

          {availableCompanies.map((company) => (
            <SwitcherButton
              key={company.id}
              description={company.helperText}
              icon={Building2}
              isActive={!isWorkspaceActive && company.id === currentCompany.id}
              label={company.name}
              onClick={() => {
                onSelectCompany(company.id);
                onClose();
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type BranchSwitcherProps = {
  branchDropdownItems: MainBreadcrumbDropdownItem[];
  currentBranch: MainBranch | null;
  isLoading: boolean;
  isOpen: boolean;
  variant?: SwitcherVariant;
  onClose: () => void;
  onSelectBranch: (branchId: string) => void;
  onToggle: () => void;
};

function BranchSwitcher({
  branchDropdownItems,
  currentBranch,
  isLoading,
  isOpen,
  variant = "desktop",
  onClose,
  onSelectBranch,
  onToggle,
}: BranchSwitcherProps) {
  return (
    <div
      className={joinClasses(
        "relative min-w-0",
        variant === "desktop" ? "w-52 flex-none xl:w-56" : "w-full",
      )}
      data-main-switcher-root
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Switch branch or satellite"
        aria-expanded={isOpen}
        className={joinClasses(
          "flex h-10 w-full min-w-0 items-center gap-2 border border-darknavy/10 bg-white px-3 text-left text-sm shadow-sm transition-all duration-200 ease-out hover:border-skyblue/45 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100",
          variant === "mobile" ? "rounded-full" : "rounded-md",
        )}
      >
        <GitBranch className="h-4 w-4 shrink-0 text-darknavy/55" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate font-semibold text-darknavy">
          {currentBranch?.name ?? "No Branch Access"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-darknavy/45" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className={getSwitcherMenuClassName(variant)}>
          {isLoading ? (
            <div className="space-y-2 p-3" aria-label="Loading branches">
              <span className="block h-3 w-32 rounded bg-darknavy/10" />
              <span className="block h-3 w-44 rounded bg-darknavy/10" />
              <span className="block h-3 w-24 rounded bg-darknavy/10" />
            </div>
          ) : branchDropdownItems.length ? (
            branchDropdownItems.map((item) => {
              const isManagementAction = Boolean(item.isManagementAction);
              const isCurrentBranch = item.branchId === currentBranch?.id;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => {
                    if (item.branchId) {
                      onSelectBranch(item.branchId);
                    }
                    onClose();
                  }}
                  className={joinClasses(
                    "flex items-start gap-3 rounded-md px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
                    isManagementAction
                      ? "mt-1 border-t border-darknavy/10 bg-darknavy/3 hover:bg-citron/20"
                      : "hover:bg-skyblue/10",
                  )}
                >
                  <span
                    className={joinClasses(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      isManagementAction
                        ? "bg-citron/30 text-darknavy"
                        : "bg-skyblue/15 text-darknavy",
                    )}
                  >
                    {isManagementAction ? (
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <GitBranch className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-darknavy">
                      {item.label}
                    </span>
                    {item.helperText ? (
                      <span className="mt-1 block truncate text-xs text-darknavy/50">
                        {item.helperText}
                      </span>
                    ) : null}
                  </span>
                  {isCurrentBranch ? (
                    <Check className="mt-2 h-4 w-4 shrink-0 text-skyblue" aria-hidden="true" />
                  ) : null}
                </Link>
              );
            })
          ) : (
            <div className="px-3 py-4 text-sm text-darknavy/55">
              No branches available.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function getSwitcherMenuClassName(variant: SwitcherVariant) {
  const baseClassName =
    "z-50 max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto overscroll-contain rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_24px_70px_rgba(33,39,56,0.18)]";

  return joinClasses(
    baseClassName,
    variant === "mobile"
      ? "fixed left-3 right-3 top-[7.75rem]"
      : "absolute left-0 top-12 w-[min(20rem,calc(100vw-1.5rem))]",
  );
}

type SwitcherButtonProps = {
  description?: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function SwitcherButton({
  description,
  icon: Icon,
  isActive,
  label,
  onClick,
}: SwitcherButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-darknavy">
          {label}
        </span>
        {description ? (
          <span className="mt-1 block truncate text-xs text-darknavy/50">
            {description}
          </span>
        ) : null}
      </span>
      {isActive ? (
        <Check className="mt-2 h-4 w-4 shrink-0 text-skyblue" aria-hidden="true" />
      ) : null}
    </button>
  );
}

type AccountDetailsProps = {
  companyName: string;
  currentUser: MainTopbarProps["currentUser"];
};

function AccountDetails({ companyName, currentUser }: AccountDetailsProps) {
  const userTypeName = currentUser.userType?.name;
  const shouldShowRole = currentUser.userRole !== "User";

  return (
    <div className="px-3 py-3">
      <p className="text-xs font-semibold uppercase text-darknavy/45">
        Account Details
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-skyblue/25 text-xs font-bold text-darknavy">
          {currentUser.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-darknavy">
            {currentUser.name}
          </p>
          {userTypeName ? (
            <p className="mt-1 truncate text-xs text-darknavy/55">
              {userTypeName}
            </p>
          ) : null}
          {shouldShowRole ? (
            <p className="mt-1 truncate text-xs text-darknavy/55">
              {currentUser.userRole}
            </p>
          ) : null}
          <p className="mt-1 truncate text-xs text-darknavy/45">
            {companyName}
          </p>
        </div>
      </div>
    </div>
  );
}

function getTopbarUserDescriptor(currentUser: MainTopbarProps["currentUser"]) {
  return currentUser.userType?.name ?? getVisibleUserRole(currentUser);
}

function getVisibleUserRole(currentUser: MainTopbarProps["currentUser"]) {
  return currentUser.userRole === "User" ? undefined : currentUser.userRole;
}

function MenuSeparator() {
  return <div className="my-1 border-t border-darknavy/10" />;
}

type ProfileMenuLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

type ProfileMenuButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

function ProfileMenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: ProfileMenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      <Icon className="h-4 w-4 shrink-0 text-darknavy/50" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function ProfileMenuButton({
  icon: Icon,
  label,
  onClick,
}: ProfileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
    >
      <Icon className="h-4 w-4 shrink-0 text-darknavy/50" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
