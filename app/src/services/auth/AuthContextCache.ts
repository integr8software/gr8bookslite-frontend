import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  AuthProfileResponse,
  SwitchCompanyContextResponse,
} from "@/app/src/services/auth/AuthApiTypes";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";

const TenantScopedQueryPrefixes = [
  "approval-management",
  "audit-trail",
  "bank-masterfile",
  "branch-management",
  "cash-disbursement",
  "default-account",
  "discounts",
  "discount-management",
  "inventory",
  "item-management",
  "material-request",
  "maintenance",
  "multi-currency-setup",
  "party-management",
  "payment-type",
  "paymentType",
  "petty-cash",
  "purchase-request",
  "purchasing",
  "responsibility-center",
  "sales-journal",
  "system-administration",
  "term-management",
  "termManagement",
  "transaction-number-setup",
  "transaction-type",
  "transactionType",
  "user-management",
  "warehouse-management",
  "workspace-users",
] as readonly string[];

export function BuildAuthProfileFromSwitchResponse(
  response: SwitchCompanyContextResponse,
): AuthProfileResponse {
  return {
    user: response.user,
    companyId: response.companyId,
    role:
      response.access?.role === "ADMIN" || response.access?.role === "USER"
        ? response.access.role
        : null,
    activeCompanyId: response.companyId,
    activeAccess: response.access,
    access: response.access,
    onboarding: response.onboarding,
    companies: response.companies,
  };
}

export async function PrepareQueryCacheForContextSwitch(
  queryClient: QueryClient,
) {
  await queryClient.cancelQueries({
    predicate: (query) => IsContextSwitchCancelledQuery(query.queryKey),
  });

  queryClient.removeQueries({
    predicate: (query) => IsTenantScopedQuery(query.queryKey),
  });
}

function IsContextSwitchCancelledQuery(queryKey: QueryKey) {
  return !StartsWithQueryPrefix(queryKey, AuthQueryKeys.all);
}

function IsTenantScopedQuery(queryKey: QueryKey) {
  const [scope, area] = queryKey;

  if (typeof scope !== "string") {
    return false;
  }

  if (TenantScopedQueryPrefixes.includes(scope)) {
    return true;
  }

  return scope === "workspace-companies" && area === "company";
}

function StartsWithQueryPrefix(queryKey: QueryKey, prefix: QueryKey) {
  return prefix.every((part, index) => queryKey[index] === part);
}
