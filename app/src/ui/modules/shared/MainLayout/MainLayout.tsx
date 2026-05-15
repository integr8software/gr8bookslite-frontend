"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BookOpenText, ChevronDown, ChevronRight } from "lucide-react";
import {
  useMainLayout,
  type MainBreadcrumb,
  type MainBreadcrumbDropdownItem,
} from "@/app/src/hooks/modules/shared/useMainLayout";
import { MainNavigationProgress } from "./MainNavigationProgress";
import { MainNotificationsPanel } from "./MainNotificationsPanel";
import { MainSidebar } from "./MainSidebar";
import { MainTopbar } from "./MainTopbar";
import { NoBranchAccess } from "./NoBranchAccess";

const MainHelpModal = dynamic(
  () =>
    import("./MainHelpModal").then(
      (mod) => mod.MainHelpModal,
    ),
  {
    loading: () => <HelpModalLoading />,
  },
);

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const {
    activeHref,
    activeNavigationScope,
    availableCompanies,
    branchDropdownItems,
    breadcrumbs,
    canAccessWorkspace,
    canSwitchCompany,
    currentBranch,
    currentCompany,
    currentHelpArticle,
    currentUser,
    enabledQuickListTabs,
    expandedKeys,
    hasBranchAccess,
    helpArticles,
    homeHref,
    isBranchLoading,
    isHelpOpen,
    isNotificationsOpen,
    isSearchOpen,
    isSidebarOpen,
    moduleTitle,
    navigationSections,
    notificationTab,
    query,
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
    markSidebarNavigation,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    openHelp,
    selectBranch,
    selectCompany,
    setNotificationTab,
    setQuery,
    setSelectedHelpArticleKey,
    toggleExpandedKey,
    toggleNotifications,
    toggleSearch,
    toggleSidebar,
    switchToWorkspace,
  } = useMainLayout();
  const shouldShowBranchContent =
    activeNavigationScope !== "company" || hasBranchAccess;

  return (
    <div className="flex h-[100dvh] max-w-full flex-col overflow-hidden bg-white text-darknavy">
      <MainNavigationProgress />

      <MainTopbar
        activeHref={activeHref}
        activeNavigationScope={activeNavigationScope}
        availableCompanies={availableCompanies}
        branchDropdownItems={branchDropdownItems}
        canAccessWorkspace={canAccessWorkspace}
        canSwitchCompany={canSwitchCompany}
        currentBranch={currentBranch}
        currentCompany={currentCompany}
        currentUser={currentUser}
        homeHref={homeHref}
        isBranchLoading={isBranchLoading}
        isNotificationsOpen={isNotificationsOpen}
        isSearchOpen={isSearchOpen}
        isSidebarOpen={isSidebarOpen}
        notificationTab={notificationTab}
        notifications={visibleNotifications}
        query={query}
        searchResults={searchResults}
        unreadNotificationCount={unreadNotificationCount}
        onCloseNotifications={closeNotifications}
        onCloseSearch={closeSearch}
        onCloseSidebar={closeSidebar}
        onLoadBranchOptions={loadBranchOptions}
        onMarkNotificationAsRead={markNotificationAsRead}
        onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        onNotificationTabChange={setNotificationTab}
        onOpenHelp={openHelp}
        onQueryChange={setQuery}
        onSelectBranch={selectBranch}
        onSelectCompany={selectCompany}
        onSwitchToWorkspace={switchToWorkspace}
        onToggleNotifications={toggleNotifications}
        onToggleSearch={toggleSearch}
        onToggleSidebar={toggleSidebar}
      />

      <div className="relative flex min-h-0 flex-1 max-w-full overflow-hidden">
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
          className={joinClasses(
            "fixed inset-0 z-40 bg-darknavy/35 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:hidden",
            isSidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        />

        <MainSidebar
          activeHref={activeHref}
          companyName={
            activeNavigationScope === "workspace"
              ? "Workspace"
              : currentCompany.name
          }
          companyLogoUrl={
            activeNavigationScope === "workspace"
              ? undefined
              : currentCompany.logoUrl
          }
          typeOfCompany={
            activeNavigationScope === "workspace"
              ? "Administration"
              : currentCompany.businessKind ?? "Company"
          }
          enabledQuickListTabs={enabledQuickListTabs}
          expandedKeys={expandedKeys}
          homeHref={homeHref}
          isOpen={isSidebarOpen}
          navigationSections={navigationSections}
          recentlyVisitedModules={recentlyVisitedModules}
          shouldAutoScrollActiveItem={shouldAutoRevealActiveRoute}
          onClose={closeSidebar}
          onNavigateFromSidebar={markSidebarNavigation}
          onToggleExpandedKey={toggleExpandedKey}
        />

        <main
          className={joinClasses(
            "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 transition-[margin] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:px-5 lg:px-6",
            isSidebarOpen && "lg:ml-78",
            isNotificationsOpen && "xl:mr-88",
          )}
        >
          <MainPageHeader breadcrumbs={breadcrumbs} title={moduleTitle} />
          {shouldShowBranchContent ? children : (
            <NoBranchAccess companyName={currentCompany.name} />
          )}
        </main>

        <aside
          data-main-notifications-root
          className={joinClasses(
            "fixed bottom-0 right-0 top-16 z-20 hidden overflow-hidden border-l border-darknavy/10 bg-white transition-[width,opacity,transform,border-color] duration-200 ease-out will-change-[width,opacity,transform] motion-reduce:transition-none xl:block",
            isNotificationsOpen
              ? "w-88 translate-x-0 opacity-100"
              : "pointer-events-none w-0 translate-x-3 border-transparent opacity-0",
          )}
        >
          <div
            className={joinClasses(
              "h-full w-88 transition-opacity duration-150 ease-out motion-reduce:transition-none",
              isNotificationsOpen ? "opacity-100" : "opacity-0",
            )}
          >
            <MainNotificationsPanel
              notifications={visibleNotifications}
              tab={notificationTab}
              unreadCount={unreadNotificationCount}
              onClose={closeNotifications}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onTabChange={setNotificationTab}
              className="h-full border-0 shadow-none"
            />
          </div>
        </aside>
      </div>

      {isHelpOpen ? (
        <MainHelpModal
          articles={helpArticles}
          currentArticle={currentHelpArticle}
          selectedArticleKey={selectedHelpArticleKey}
          onClose={closeHelp}
          onSelectArticle={setSelectedHelpArticleKey}
        />
      ) : null}
    </div>
  );
}

type MainPageHeaderProps = {
  breadcrumbs: MainBreadcrumb[];
  title: string;
};

function MainPageHeader({ breadcrumbs, title }: MainPageHeaderProps) {
  const [openBreadcrumbKey, setOpenBreadcrumbKey] = useState<string | null>(
    null,
  );
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!openBreadcrumbKey) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (navRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpenBreadcrumbKey(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenBreadcrumbKey(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openBreadcrumbKey]);

  return (
    <div className="mx-auto mb-4 flex w-full max-w-[94rem] flex-col gap-2">
      <nav
        ref={navRef}
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-medium text-darknavy/50"
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const dropdownItems = breadcrumb.dropdownItems ?? [];
          const hasDropdown =
            breadcrumb.canOpenDropdown && dropdownItems.length > 0;
          const isOpen = openBreadcrumbKey === breadcrumb.key;
          const content = (
            <span
              className={joinClasses(
                "block max-w-[14rem] truncate sm:max-w-[18rem]",
                isLast ? "text-darknavy" : "text-darknavy/55 group-hover:text-darknavy",
              )}
            >
              {breadcrumb.label}
            </span>
          );

          return (
            <span
              key={breadcrumb.key}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-darknavy/30"
                  aria-hidden="true"
                />
              ) : null}
              {hasDropdown ? (
                <span className="relative min-w-0">
                  <button
                    type="button"
                    aria-current={isLast ? "page" : undefined}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    aria-controls={`breadcrumb-menu-${breadcrumb.key}`}
                    onClick={() =>
                      setOpenBreadcrumbKey((current) =>
                        current === breadcrumb.key ? null : breadcrumb.key,
                      )
                    }
                    className={joinClasses(
                      "group flex min-h-7 max-w-[15.5rem] items-center gap-1 rounded px-1 text-left transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25 sm:max-w-[19.5rem]",
                      isOpen && "text-darknavy",
                    )}
                  >
                    {content}
                    <ChevronDown
                      className={joinClasses(
                        "h-3.5 w-3.5 shrink-0 text-darknavy/35 transition group-hover:text-darknavy",
                        isOpen && "rotate-180 text-darknavy/65",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <BreadcrumbDropdown
                      id={`breadcrumb-menu-${breadcrumb.key}`}
                      items={dropdownItems}
                      onNavigate={() => setOpenBreadcrumbKey(null)}
                    />
                  ) : null}
                </span>
              ) : !isLast && breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className="group rounded px-1 py-1 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="rounded px-1 py-1"
                >
                  {content}
                </span>
              )}
            </span>
          );
        })}
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-darknavy sm:text-3xl">
        {title}
      </h1>
    </div>
  );
}

type BreadcrumbDropdownProps = {
  id: string;
  items: MainBreadcrumbDropdownItem[];
  onNavigate: () => void;
};

function BreadcrumbDropdown({
  id,
  items,
  onNavigate,
}: BreadcrumbDropdownProps) {
  return (
    <div
      id={id}
      role="menu"
      className="absolute left-0 top-full z-30 mt-1 max-h-80 w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_18px_50px_rgba(33,39,56,0.14)]"
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          role="menuitem"
          onClick={onNavigate}
          className="group block rounded-md px-3 py-2 text-left text-sm transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
        >
          <span className="block truncate font-semibold text-darknavy/75 transition group-hover:text-darknavy">
            {item.label}
          </span>
          {item.helperText ? (
            <span className="mt-0.5 block truncate text-xs text-darknavy/48">
              {item.helperText}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function HelpModalLoading() {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-darknavy/40 px-3 py-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-[0_30px_90px_rgba(33,39,56,0.25)]">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
          <BookOpenText className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-darknavy">
          Loading manual...
        </p>
      </div>
    </div>
  );
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
