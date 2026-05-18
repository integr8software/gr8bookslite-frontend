import type {
  MainAccessAction,
  MainBranch,
  MainNavigationItem,
  MainNavigationSection,
  MainProductKey,
  MainSearchItem,
  MainSubscriptionOption,
  MainUserAccessContext,
} from "@/app/src/data/shared/MainLayout/ModuleShellTypes";

export function hasAccess(
  accessContext: MainUserAccessContext,
  accessKey: Parameters<typeof readAccess>[1],
  requiredActions?: MainAccessAction[],
) {
  if (accessContext.userRole === "Super Admin") {
    return true;
  }

  const access = readAccess(accessContext, accessKey);

  if (!access) {
    return false;
  }

  if (requiredActions?.length) {
    return requiredActions.every((action) => Boolean(access[action]));
  }

  return Object.values(access).some(Boolean);
}

export function isProductEnabled(
  productKey: MainProductKey | undefined,
  subscription: MainSubscriptionOption,
  productKeys?: MainProductKey[],
) {
  if (productKeys?.length) {
    return productKeys.some((key) =>
      subscription.enabledProductKeys.includes(key),
    );
  }

  return subscription.enabledProductKeys.includes(productKey ?? "core");
}

export function filterMainNavigationSections(
  sections: MainNavigationSection[],
  accessContext: MainUserAccessContext,
  subscription: MainSubscriptionOption,
) {
  return sections
    .map((section) => ({
      ...section,
      items: filterMainNavigationItems(
        section.items,
        accessContext,
        subscription,
      ),
    }))
    .filter(
      (section) =>
        (hasAccess(accessContext, section.accessKey) &&
          isProductEnabled(
            section.productKey,
            subscription,
            section.productKeys,
          )) ||
        section.items.length > 0,
    )
    .filter((section) => section.items.length > 0);
}

export function filterMainSearchItems(
  items: MainSearchItem[],
  accessContext: MainUserAccessContext,
  subscription: MainSubscriptionOption,
) {
  return items.filter(
    (item) =>
      hasAccess(accessContext, item.accessKey) &&
      isProductEnabled(item.productKey, subscription, item.productKeys),
  );
}

export function getAccessibleBranches(branches: MainBranch[]) {
  return branches.filter((branch) =>
    Object.values(branch.access).some(Boolean),
  );
}

export function flattenSections(sections: MainNavigationSection[]) {
  return sections.flatMap((section) =>
    flattenItems(section.items, section.title, [section.title]),
  );
}

function filterMainNavigationItems(
  items: MainNavigationItem[],
  accessContext: MainUserAccessContext,
  subscription: MainSubscriptionOption,
): MainNavigationItem[] {
  return items
    .map((navigationItem) => ({
      ...navigationItem,
      children: navigationItem.children
        ? filterMainNavigationItems(
            navigationItem.children,
            accessContext,
            subscription,
          )
        : undefined,
    }))
    .filter(
      (navigationItem) =>
        (hasAccess(
          accessContext,
          navigationItem.accessKey,
          navigationItem.requiredActions,
        ) &&
          isProductEnabled(
            navigationItem.productKey,
            subscription,
            navigationItem.productKeys,
          )) ||
        Boolean(navigationItem.children?.length),
    );
}

function flattenItems(
  items: MainNavigationItem[],
  section: string,
  trail: string[],
): MainSearchItem[] {
  return items.flatMap((navigationItem) => {
    const currentTrail = [...trail, navigationItem.label];
    const current: MainSearchItem = {
      key: navigationItem.key,
      label: navigationItem.label,
      href: navigationItem.href,
      accessKey: navigationItem.accessKey,
      productKey: navigationItem.productKey ?? "core",
      productKeys: navigationItem.productKeys,
      section,
      trail,
    };

    return [
      current,
      ...(navigationItem.children
        ? flattenItems(navigationItem.children, section, currentTrail)
        : []),
    ];
  });
}

function readAccess(
  accessContext: MainUserAccessContext,
  accessKey: keyof NonNullable<
    MainUserAccessContext["userType"]
  >["permissions"],
) {
  return accessContext.userType?.permissions[accessKey];
}
