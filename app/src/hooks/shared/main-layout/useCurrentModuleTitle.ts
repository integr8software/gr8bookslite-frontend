"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { MODULE_ROUTE_FALLBACK, getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { GetAuthProfileAccess } from "@/app/src/services/auth/AuthProfileAccess";
import type { AuthUserModuleItem } from "@/app/src/services/auth/AuthApiTypes";

export function useCurrentModuleTitle(fallbackTitle: string) {
  const pathname = usePathname();
  const accessToken = useAppStore((state) => state.accessToken);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const isAuthSessionReady = useAppStore((state) => state.isAuthSessionReady);
  const { data: authProfile } = useAuthProfileQuery({
    accessToken,
    enabled: isAuthSessionReady,
  });

  return useMemo(() => {
    const userModules = GetAuthProfileAccess(authProfile)?.userModules;

    if (!userModules) {
      return fallbackTitle;
    }

    const branchItems = activeBranchId
      ? userModules.byBranch?.find(
          (branch) => branch.branchUnitId === activeBranchId,
        )?.items
      : undefined;
    const fallbackBranchItems = userModules.byBranch?.find(
      (branch) => branch.items.length > 0,
    )?.items;
    const items = branchItems?.length
      ? branchItems
      : fallbackBranchItems?.length
        ? fallbackBranchItems
        : userModules.items;

    return findModuleTitleByPath(items, pathname) ?? fallbackTitle;
  }, [activeBranchId, authProfile, fallbackTitle, pathname]);
}

function findModuleTitleByPath(
  items: AuthUserModuleItem[],
  pathname: string,
): string | null {
  return findModuleTitleMatchByPath(items, pathname)?.title ?? null;
}

function findModuleTitleMatchByPath(
  items: AuthUserModuleItem[],
  pathname: string,
): { routeLength: number; title: string } | null {
  let bestMatch: { routeLength: number; title: string } | null = null;
  for (const item of items) {
    if (item.itemType === "LINK") {
      const routeLength = getItemMatchRouteLength(item, pathname);

      if (routeLength > (bestMatch?.routeLength ?? -1)) {
        bestMatch = { routeLength, title: item.label };
      }
    }

    const childMatch = findModuleTitleMatchByPath(
      item.children,
      pathname,
    );

    if (childMatch && childMatch.routeLength > (bestMatch?.routeLength ?? -1)) {
      bestMatch = childMatch;
    }
  }

  return bestMatch;
}

function getItemMatchRouteLength(
  item: AuthUserModuleItem,
  pathname: string,
): number {
  return Math.max(...getMatchingRouteLengths(item, pathname), -1);
}

function getMatchingRouteLengths(
  item: AuthUserModuleItem,
  pathname: string,
): number[] {
  return [
    ...getItemRoutes(item)
      .filter((route) => pathMatches(route, pathname))
      .map((route) => route.length),
    ...item.children.flatMap((child) => getMatchingRouteLengths(child, pathname)),
  ];
}

function getItemRoutes(item: AuthUserModuleItem) {
  return [
    item.href,
    item.route,
    item.legacyRoute,
    getModuleRoute(item.moduleCode),
  ].filter(
    (route): route is string =>
      Boolean(route) && route !== MODULE_ROUTE_FALLBACK,
  );
}

function pathMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
