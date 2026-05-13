"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Menu,
  Search,
} from "lucide-react";
import {
  flattenWorkspaceNavigation,
  useWorkspaceShell,
} from "@/app/src/hooks/modules/workspace/useWorkspaceShell";

type HeaderPanel =
  | "workspace"
  | "company"
  | "notifications"
  | "profile"
  | "help"
  | "search"
  | null;

export function WorkspaceHeader() {
  const {
    branches,
    closeBranchMenu,
    companies,
    currentBranch,
    currentCompany,
    headerMode,
    isBranchMenuOpen,
    navigation,
    notifications,
    profile,
    toggleBranchMenu,
    toggleSidebar,
    unreadCount,
    setCurrentBranch,
    setCurrentCompany,
  } = useWorkspaceShell();
  const [activePanel, setActivePanel] = useState<HeaderPanel>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const headerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchableLinks = useMemo(
    () =>
      [
        { key: "dashboard", label: "Dashboard", href: "/dashboard" },
        { key: "companies", label: "Companies", href: "/companies" },
        { key: "users-roles", label: "Users & Roles", href: "/users-roles" },
        { key: "permissions", label: "Permissions", href: "/permissions" },
        { key: "audit-logs", label: "Audit Logs", href: "/audit-logs" },
        ...flattenWorkspaceNavigation(navigation.filter((section) => !section.bottom)).map(
          (item) => ({
            key: item.key,
            label: item.label,
            href: item.href,
          }),
        ),
      ].filter(
        (item, index, array) =>
          array.findIndex((candidate) => candidate.href === item.href) === index,
      ),
    [navigation],
  );
  const filteredLinks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchableLinks.slice(0, 8);
    }

    return searchableLinks.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery, searchableLinks]);

  useEffect(() => {
    if (activePanel === "search") {
      searchInputRef.current?.focus();
    }
  }, [activePanel]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setActivePanel(null);
        closeBranchMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActivePanel("search");
      }

      if (event.key === "Escape") {
        setActivePanel(null);
        closeBranchMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeBranchMenu]);

  const togglePanel = (panel: Exclude<HeaderPanel, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <header className="sticky top-0 z-20 overflow-x-clip border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div
        ref={headerRef}
        className="flex flex-wrap items-center gap-3 overflow-x-clip px-4 py-4 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {headerMode === "workspace" ? (
          <HeaderDropdown
            icon={<Building2 className="h-4.5 w-4.5 text-slate-600" />}
            isOpen={activePanel === "workspace"}
            label="Workspace"
            onToggle={() => togglePanel("workspace")}
            value="Global Workspace"
          >
            <SimpleMenuSection
              items={[
                "Global Workspace",
                "Operations Workspace",
                "Finance Workspace",
              ]}
              selectedLabel="Global Workspace"
              title="Workspace"
            />
          </HeaderDropdown>
        ) : null}

        <HeaderDropdown
          icon={
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
              {currentCompany.code}
            </span>
          }
          isOpen={activePanel === "company"}
          label="Company"
          onToggle={() => togglePanel("company")}
          value={currentCompany.name}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Switch Company
            </p>
            {companies.map((company) => {
              const isCurrentCompany = company.id === currentCompany.id;

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    setCurrentCompany(company.id);
                    setActivePanel(null);
                  }}
                  className={joinClasses(
                    "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                    isCurrentCompany
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-semibold text-blue-700 shadow-sm">
                    {company.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {company.name}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {company.industry} • {company.branchCount} branches
                    </span>
                  </span>
                  {isCurrentCompany ? (
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-semibold text-white">
                      Current
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </HeaderDropdown>

        {headerMode === "financial" ? (
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={toggleBranchMenu}
              className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 sm:min-w-[16rem]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Building2 className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Branch / Site
                </span>
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {currentBranch.name} ({currentBranch.code})
                </span>
              </span>
              <ChevronDown className="h-4.5 w-4.5 text-slate-500" />
            </button>

            {isBranchMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Switch Branch / Site
                  </p>
                  <button
                    type="button"
                    onClick={closeBranchMenu}
                    className="text-xs font-medium text-slate-500"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {branches.map((branch) => {
                    const isCurrent = branch.id === currentBranch.id;

                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setCurrentBranch(branch.id)}
                        className={joinClasses(
                          "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                          isCurrent
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                        )}
                      >
                        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-semibold text-blue-700 shadow-sm">
                          {branch.code}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-slate-900">
                            {branch.name} ({branch.code})
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {branch.descriptor}
                          </span>
                        </span>
                        {isCurrent ? (
                          <span className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-semibold text-white">
                            Current
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Branch Information
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>Code: {currentBranch.code}</p>
                    <p>Address: {currentBranch.address}</p>
                    <p>Phone: {currentBranch.phone}</p>
                  </div>
                  <Link
                    href="/permissions"
                    className="mt-4 inline-flex text-sm font-semibold text-blue-600"
                  >
                    Manage Branch Access
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => togglePanel("search")}
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left shadow-sm sm:min-w-[15rem]"
        >
          <div className="flex items-center gap-3 text-slate-500">
            <Search className="h-4.5 w-4.5" />
            <span className="flex-1 truncate text-sm">Search anything...</span>
            <span className="hidden rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium sm:inline-flex">
              Ctrl + K
            </span>
          </div>
        </button>

        <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
          <PopoverButton
            count={unreadCount > 0 ? notifications.length : undefined}
            icon={<Bell className="h-4.5 w-4.5" />}
            isOpen={activePanel === "notifications"}
            onToggle={() => togglePanel("notifications")}
          >
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <div className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {notification.detail}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>
          </PopoverButton>

          <PopoverButton
            icon={<CircleHelp className="h-4.5 w-4.5" />}
            isOpen={activePanel === "help"}
            onToggle={() => togglePanel("help")}
          >
            <p className="text-sm font-semibold text-slate-900">Quick Help</p>
            <div className="mt-4 space-y-2 text-sm">
              <Link
                href="/permissions"
                onClick={() => setActivePanel(null)}
                className="block rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Manage branch access
              </Link>
              <Link
                href="/companies"
                onClick={() => setActivePanel(null)}
                className="block rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Browse companies
              </Link>
              <button
                type="button"
                onClick={() => setActivePanel("search")}
                className="w-full rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Open quick search
              </button>
            </div>
          </PopoverButton>

          <div className="relative">
            <button
              type="button"
              onClick={() => togglePanel("profile")}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
                {profile.initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-slate-900">
                  {profile.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {headerMode === "financial" ? profile.title : profile.role}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            {activePanel === "profile" ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[18rem] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
                    {profile.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {profile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {headerMode === "financial" ? profile.title : profile.role}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <button className="w-full rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                    View profile
                  </button>
                  <button className="w-full rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                    Preferences
                  </button>
                  <button className="w-full rounded-xl px-3 py-2 text-left text-red-500 transition hover:bg-red-50">
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {activePanel === "search" ? (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-4 pt-3 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <Search className="h-4.5 w-4.5 text-slate-500" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search pages, modules, and workspace tools..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="text-xs font-medium text-slate-500"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick Links
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {filteredLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setActivePanel(null)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/70 hover:text-slate-900"
                  >
                    <span className="block font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {item.href}
                    </span>
                  </Link>
                ))}
                {filteredLinks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    No matches found for &quot;{searchQuery}&quot;.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeaderDropdown({
  children,
  icon,
  isOpen,
  label,
  onToggle,
  value,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  isOpen: boolean;
  label: string;
  onToggle: () => void;
  value: string;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 sm:min-w-[15rem]"
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </span>
          <span className="block truncate text-sm font-semibold text-slate-900">
            {value}
          </span>
        </span>
        <ChevronDown
          className={joinClasses(
            "h-4.5 w-4.5 text-slate-500 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function PopoverButton({
  children,
  count,
  icon,
  isOpen,
  onToggle,
}: {
  children: React.ReactNode;
  count?: number;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm"
      >
        {icon}
        {count ? (
          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SimpleMenuSection({
  items,
  selectedLabel,
  title,
}: {
  items: string[];
  selectedLabel: string;
  title: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={joinClasses(
            "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition",
            item === selectedLabel
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-700 hover:bg-slate-50",
          )}
        >
          <span className="text-sm font-medium">{item}</span>
          {item === selectedLabel ? (
            <span className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-semibold text-white">
              Current
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

