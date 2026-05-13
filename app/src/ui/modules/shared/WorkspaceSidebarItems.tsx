"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import type {
  ErpNavItem,
  ErpNavSection,
} from "@/app/src/data/modules/workspace/ErpWorkspaceTypes";
import {
  joinClasses,
  workspaceSidebarIconMap,
} from "./WorkspaceSidebar.shared";

export function SidebarSection({
  section,
  isActiveHref,
  onNavigate,
}: {
  section: ErpNavSection;
  isActiveHref: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const Icon =
    workspaceSidebarIconMap[section.key as keyof typeof workspaceSidebarIconMap] ??
    LayoutDashboard;
  const isActive = section.href ? isActiveHref(section.href) : false;
  const hasChildren = Boolean(section.children?.length);
  const hasActiveChild = hasActiveItems(section.children ?? [], isActiveHref);
  const [isOpen, setIsOpen] = useState<boolean>(hasActiveChild);

  if (!hasChildren) {
    return (
      <Link
        href={section.href ?? "#"}
        onClick={onNavigate}
        className={joinClasses(
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
          isActive
            ? "bg-blue-50 text-blue-700 shadow-sm"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
        <span>{section.label}</span>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={joinClasses(
          "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
          isActive || hasActiveChild
            ? "text-blue-700"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Icon className="h-4.5 w-4.5" />
        <span className="flex-1">{section.label}</span>
        <ChevronDown
          className={joinClasses(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? (
        <div className="mt-1 space-y-1 border-l border-slate-200 pl-4">
          {section.children?.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              depth={0}
              isActiveHref={isActiveHref}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarItem({
  item,
  depth,
  isActiveHref,
  onNavigate,
}: {
  item: ErpNavItem;
  depth: number;
  isActiveHref: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const isActive = isActiveHref(item.href);
  const hasChildren = Boolean(item.children?.length);
  const hasActiveChild = hasActiveItems(item.children ?? [], isActiveHref);
  const [isOpen, setIsOpen] = useState<boolean>(hasActiveChild);

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={joinClasses(
          "flex items-center rounded-xl px-3 py-2 text-sm transition",
          depth > 0 && "ml-2",
          isActive
            ? "bg-blue-50 font-semibold text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={joinClasses(
          "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition",
          depth > 0 && "ml-2",
          isActive || hasActiveChild
            ? "bg-blue-50 font-semibold text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <span className="flex-1">{item.label}</span>
        <ChevronDown
          className={joinClasses(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? (
        <div className="mt-1 space-y-1 border-l border-slate-200 pl-3">
          {item.children?.map((child) => (
            <SidebarItem
              key={child.key}
              item={child}
              depth={depth + 1}
              isActiveHref={isActiveHref}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function hasActiveItems(
  items: readonly ErpNavItem[],
  isActiveHref: (href: string) => boolean,
): boolean {
  return items.some(
    (item) =>
      isActiveHref(item.href) || hasActiveItems(item.children ?? [], isActiveHref),
  );
}
