"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type {
  MainBreadcrumb,
  MainBreadcrumbDropdownItem,
} from "@/app/src/types/shared/main-layout/MainLayoutTypes";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";

type MainPageHeaderProps = {
  breadcrumbs: MainBreadcrumb[];
};

export function MainPageHeader({ breadcrumbs }: MainPageHeaderProps) {
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
    <div className="mb-4 flex w-full flex-col gap-2">
      <nav
        ref={navRef}
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-medium text-darknavy/50"
      >
        {breadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem
            key={breadcrumb.key}
            breadcrumb={breadcrumb}
            index={index}
            isLast={index === breadcrumbs.length - 1}
            isOpen={openBreadcrumbKey === breadcrumb.key}
            onClose={() => setOpenBreadcrumbKey(null)}
            onToggle={() =>
              setOpenBreadcrumbKey((current) =>
                current === breadcrumb.key ? null : breadcrumb.key,
              )
            }
          />
        ))}
      </nav>
    </div>
  );
}

type BreadcrumbItemProps = {
  breadcrumb: MainBreadcrumb;
  index: number;
  isLast: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

function BreadcrumbItem({
  breadcrumb,
  index,
  isLast,
  isOpen,
  onClose,
  onToggle,
}: BreadcrumbItemProps) {
  const dropdownItems = breadcrumb.dropdownItems ?? [];
  const hasDropdown = breadcrumb.canOpenDropdown && dropdownItems.length > 0;
  const content = (
    <span
      className={joinClasses(
        "block max-w-56 truncate sm:max-w-[18rem]",
        isLast ? "text-darknavy" : "text-darknavy/55 group-hover:text-darknavy",
      )}
    >
      {breadcrumb.label}
    </span>
  );

  return (
    <span className="flex min-w-0 items-center gap-1">
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
            onClick={onToggle}
            className={joinClasses(
              "group flex min-h-7 max-w-62 items-center gap-1 rounded px-1 text-left transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25 sm:max-w-78",
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
              onNavigate={onClose}
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
        <span aria-current={isLast ? "page" : undefined} className="rounded px-1 py-1">
          {content}
        </span>
      )}
    </span>
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
