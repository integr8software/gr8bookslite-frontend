"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
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
  MainNotification,
  MainSearchItem,
} from "@/app/src/data/shared/MainLayoutData";
import type {
  MainBreadcrumb,
  MainNotificationTab,
} from "@/app/src/hooks/shared/useMainLayout";
import { MainNotificationsPanel } from "./MainNotificationsPanel";
import { MainSearchPanel } from "./MainSearchPanel";

type MainTopbarProps = {
  activeHref: string;
  breadcrumbs: MainBreadcrumb[];
  canSwitchCompany: boolean;
  currentCompany: {
    name: string;
  };
  currentUser: {
    initials: string;
    name: string;
    shortName: string;
    userRole: string;
    userType?: {
      name: string;
    };
  };
  isCurrentPageFavorite: boolean;
  isNotificationsOpen: boolean;
  isSearchOpen: boolean;
  isSidebarOpen: boolean;
  notificationTab: MainNotificationTab;
  notifications: MainNotification[];
  query: string;
  searchResults: MainSearchItem[];
  unreadNotificationCount: number;
  onBreadcrumbOpen: (breadcrumbKey: string) => void;
  onCloseNotifications: () => void;
  onCloseSearch: () => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onNotificationTabChange: (tab: MainNotificationTab) => void;
  onOpenHelp: () => void;
  onQueryChange: (value: string) => void;
  onSelectBranch: (branchId: string) => void;
  onToggleFavorite: () => void;
  onToggleNotifications: () => void;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
};

export function MainTopbar({
  activeHref,
  breadcrumbs,
  canSwitchCompany,
  currentCompany,
  currentUser,
  isCurrentPageFavorite,
  isNotificationsOpen,
  isSearchOpen,
  isSidebarOpen,
  notificationTab,
  notifications,
  query,
  searchResults,
  unreadNotificationCount,
  onBreadcrumbOpen,
  onCloseNotifications,
  onCloseSearch,
  onMarkNotificationAsRead,
  onNotificationTabChange,
  onOpenHelp,
  onQueryChange,
  onSelectBranch,
  onToggleFavorite,
  onToggleNotifications,
  onToggleSearch,
  onToggleSidebar,
}: MainTopbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const [openBreadcrumbState, setOpenBreadcrumbState] = useState<{
    href: string;
    key: string | null;
  }>({
    href: activeHref,
    key: null,
  });
  const [profileMenuOpenPath, setProfileMenuOpenPath] = useState<string | null>(
    null,
  );
  const openBreadcrumbKey =
    openBreadcrumbState.href === activeHref ? openBreadcrumbState.key : null;
  const isProfileMenuOpen = profileMenuOpenPath === activeHref;
  const userDescriptor = getTopbarUserDescriptor(currentUser);

  useEffect(() => {
    if (
      !isSearchOpen &&
      !isNotificationsOpen &&
      !isProfileMenuOpen &&
      !openBreadcrumbKey
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

      if (
        openBreadcrumbKey &&
        !target.closest("[data-main-topbar-root]") &&
        !target.closest("[data-main-sidebar-root]")
      ) {
        setOpenBreadcrumbState({ href: activeHref, key: null });
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
    openBreadcrumbKey,
    onCloseNotifications,
    onCloseSearch,
  ]);

  function closeBreadcrumb() {
    setOpenBreadcrumbState({ href: activeHref, key: null });
  }

  function handleToggleSearch() {
    closeBreadcrumb();
    onToggleSearch();
  }

  function handleToggleNotifications() {
    closeBreadcrumb();
    onToggleNotifications();
  }

  function toggleBreadcrumb(key: string) {
    const next = openBreadcrumbKey === key ? null : key;

    if (next) {
      onBreadcrumbOpen(key);
    }

    setOpenBreadcrumbState({ href: activeHref, key: next });
  }

  return (
    <header
      data-main-topbar-root
      className="sticky top-0 z-50 border-b border-darknavy/10 bg-white/95 backdrop-blur"
    >
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={() => {
            closeBreadcrumb();
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
          href="/dashboard"
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
            closeBreadcrumb();
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
          aria-label="Breadcrumb"
          data-main-breadcrumb-root
          className="hidden min-w-0 flex-1 items-center gap-1 text-sm md:flex"
        >
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const labelWidthClass = isLast
              ? "max-w-[9rem] lg:max-w-[11rem] xl:max-w-[16rem]"
              : "max-w-[6.5rem] lg:max-w-[8rem] xl:max-w-[10rem]";

            return (
              <span
                key={breadcrumb.key}
                className="relative flex min-w-0 shrink items-center gap-1"
              >
                {index > 0 ? (
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-darknavy/30"
                    aria-hidden="true"
                  />
                ) : null}

                {breadcrumb.canOpenDropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleBreadcrumb(breadcrumb.key)}
                      aria-expanded={openBreadcrumbKey === breadcrumb.key}
                      aria-current={isLast ? "page" : undefined}
                      className={joinClasses(
                        "flex min-w-0 items-center gap-1 rounded-md px-2 py-1 transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
                        labelWidthClass,
                        isLast
                          ? "font-semibold text-darknavy"
                          : "font-medium text-darknavy/55",
                      )}
                    >
                      <span className="truncate">{breadcrumb.label}</span>
                      <ChevronDown
                        className="h-3.5 w-3.5 shrink-0 text-darknavy/45"
                        aria-hidden="true"
                      />
                    </button>

                    {openBreadcrumbKey === breadcrumb.key ? (
                      <BreadcrumbDropdown
                        breadcrumb={breadcrumb}
                        onSelectBranch={onSelectBranch}
                        onClose={() =>
                          setOpenBreadcrumbState({
                            href: activeHref,
                            key: null,
                          })
                        }
                      />
                    ) : null}
                  </>
                ) : breadcrumb.href ? (
                  <Link
                    href={breadcrumb.href}
                    aria-current={isLast ? "page" : undefined}
                    className={joinClasses(
                      "truncate rounded-md px-2 py-1 transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
                      labelWidthClass,
                      isLast
                        ? "font-semibold text-darknavy"
                        : "font-medium text-darknavy/55",
                    )}
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={joinClasses(
                      "truncate rounded-md px-2 py-1",
                      labelWidthClass,
                      isLast
                        ? "font-semibold text-darknavy"
                        : "font-medium text-darknavy/55",
                    )}
                  >
                    {breadcrumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        <div
          className="relative hidden w-60 shrink-0 lg:block xl:w-72 2xl:w-80"
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

        <div className="ml-auto flex items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleToggleSearch}
            aria-label="Search"
            aria-expanded={isSearchOpen}
            data-main-search-root
            className="flex h-10 w-10 items-center justify-center rounded-md text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 lg:hidden"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative" data-main-notifications-root>
            <button
              type="button"
              onClick={handleToggleNotifications}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadNotificationCount > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-coralpink ring-2 ring-white" />
              ) : null}
            </button>

            <div
              className={joinClasses(
                "fixed right-2 top-18 z-50 w-[calc(100vw-1rem)] max-w-88 origin-top-right transition-[opacity,transform] duration-150 ease-out will-change-[opacity,transform] motion-reduce:transition-none sm:absolute sm:right-0 sm:top-12 sm:w-80 sm:max-w-none md:w-96 xl:hidden",
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
              closeBreadcrumb();
              onOpenHelp();
            }}
            aria-label="Help"
            className="flex h-10 w-10 items-center justify-center rounded-md text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <CircleHelp className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="relative" data-main-profile-root>
            <button
              type="button"
              onClick={() => {
                closeBreadcrumb();
                setProfileMenuOpenPath((current) =>
                  current === activeHref ? null : activeHref,
                );
              }}
              aria-expanded={isProfileMenuOpen}
              className="flex h-10 min-w-10 items-center gap-2 rounded-md border border-darknavy/10 bg-white px-1.5 text-left shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 sm:px-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-skyblue/25 text-xs font-bold text-darknavy">
                {currentUser.initials}
              </span>
              <span className="hidden min-w-0 max-w-20 min-[360px]:block sm:max-w-32 xl:max-w-40">
                <span className="block truncate text-sm font-semibold leading-4 text-darknavy">
                  {currentUser.shortName}
                </span>
                {userDescriptor ? (
                  <span className="block truncate text-xs text-darknavy/55">
                    {userDescriptor}
                  </span>
                ) : null}
              </span>
              <ChevronDown
                className="hidden h-4 w-4 shrink-0 text-darknavy/50 sm:block"
                aria-hidden="true"
              />
            </button>

            {isProfileMenuOpen ? (
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_24px_70px_rgba(33,39,56,0.18)]">
                <AccountDetails
                  companyName={currentCompany.name}
                  currentUser={currentUser}
                  onSwitchAccount={() => setProfileMenuOpenPath(null)}
                />
                <MenuSeparator />
                {canSwitchCompany ? (
                  <>
                    <ProfileMenuLink
                      href="/onboarding"
                      icon={Building2}
                      label="Switch Company"
                      onClick={() => setProfileMenuOpenPath(null)}
                    />
                    <MenuSeparator />
                  </>
                ) : null}
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
                <ProfileMenuLink
                  href="/logout"
                  icon={LogOut}
                  label="Logout"
                  onClick={() => setProfileMenuOpenPath(null)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isSearchOpen ? (
        <div data-main-search-root>
          <MainSearchPanel
            query={query}
            results={searchResults}
            onClose={onCloseSearch}
            onQueryChange={onQueryChange}
            className="fixed left-3 right-3 top-18 lg:hidden"
          />
        </div>
      ) : null}
    </header>
  );
}

type BreadcrumbDropdownProps = {
  breadcrumb: MainBreadcrumb;
  onClose: () => void;
  onSelectBranch: (branchId: string) => void;
};

function BreadcrumbDropdown({
  breadcrumb,
  onClose,
  onSelectBranch,
}: BreadcrumbDropdownProps) {
  return (
    <div className="absolute left-0 top-9 z-50 w-72 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_24px_70px_rgba(33,39,56,0.18)]">
      {breadcrumb.isLoading ? (
        <div className="space-y-2 p-3" aria-label="Loading branches">
          <span className="block h-3 w-32 rounded bg-darknavy/10" />
          <span className="block h-3 w-44 rounded bg-darknavy/10" />
          <span className="block h-3 w-24 rounded bg-darknavy/10" />
        </div>
      ) : breadcrumb.dropdownItems?.length ? (
        breadcrumb.dropdownItems.map((item) => {
          const isManagementAction = Boolean(item.isManagementAction);

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
              {isManagementAction ? (
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-citron/30 text-darknavy">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </span>
              ) : null}
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
            </Link>
          );
        })
      ) : (
        <div className="px-3 py-4 text-sm text-darknavy/55">
          No navigation available.
        </div>
      )}
    </div>
  );
}

type AccountDetailsProps = {
  companyName: string;
  currentUser: MainTopbarProps["currentUser"];
  onSwitchAccount: () => void;
};

function AccountDetails({
  companyName,
  currentUser,
  onSwitchAccount,
}: AccountDetailsProps) {
  const userTypeName = currentUser.userType?.name;
  const shouldShowRole = currentUser.userRole !== "User";

  return (
    <div className="px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-darknavy/45">
          Account Details
        </p>
        <Link
          href="/logout"
          onClick={onSwitchAccount}
          aria-label="Switch Account"
          title="Switch Account"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
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

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
