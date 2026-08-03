"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTaxDefinitionPercentage } from "@/app/src/data/shared/tax/TaxDefinitionData";
import { fetchTaxDefinitions } from "@/app/src/services/shared/tax/TaxDefinitionApi";
import type { TaxDefinitionTransactionScope } from "@/app/src/types/shared/tax/TaxDefinitionTypes";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";

const EmptyDefaultAccountIds = {
  inputTaxAccountId: "",
  outputTaxAccountId: "",
  deferredTaxAccountId: "",
  expandedWithholdingTaxAccountId: "",
  creditableWithholdingTaxAccountId: "",
  withholdingVatableTaxAccountId: "",
  finalWithholdingTaxAccountId: "",
};

export function useTaxDefinitionOptions({
  transactionScope,
}: {
  transactionScope?: Exclude<TaxDefinitionTransactionScope, "BOTH">;
} = {}) {
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const query = useQuery({
    queryKey: ["taxDefinitions", activeCompanyId ?? "no-company", "lookup"],
    queryFn: fetchTaxDefinitions,
    enabled: activeCompanyId !== null,
    retry: false,
  });

  return useMemo(
    () => ({
      isLoading: query.isLoading,
      accountOptions: query.data?.accountOptions ?? [],
      defaultAccountIds: query.data?.defaultAccountIds ?? EmptyDefaultAccountIds,
      options: (query.data?.taxDefinitions ?? [])
        .filter(
          (tax) =>
            tax.status === "Active" &&
            (!transactionScope ||
              tax.transactionScope === "BOTH" ||
              tax.transactionScope === transactionScope),
        )
        .sort(
          (left, right) =>
            left.sortOrder - right.sortOrder ||
            left.name.localeCompare(right.name) ||
            left.id.localeCompare(right.id),
        )
        .map((tax) => ({
          description: formatTaxDefinitionPercentage(tax.percentage, tax.treatment),
          name: tax.name,
          value: tax.id,
        })),
      refetch: query.refetch,
      taxes: query.data?.taxDefinitions ?? [],
    }),
    [query.data, query.isLoading, query.refetch, transactionScope],
  );
}
