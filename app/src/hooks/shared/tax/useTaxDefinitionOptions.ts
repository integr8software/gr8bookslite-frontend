"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTaxDefinitionPercentage } from "@/app/src/data/shared/tax/TaxDefinitionData";
import {
  TaxDefinitionQueryKeys,
  fetchTaxDefinitions,
} from "@/app/src/services/shared/tax/TaxDefinitionApi";
import type {
  TaxDefinition,
  TaxDefinitionTransactionScope,
} from "@/app/src/types/shared/tax/TaxDefinitionTypes";
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
    queryKey: TaxDefinitionQueryKeys.lookup(activeCompanyId),
    queryFn: fetchTaxDefinitions,
    enabled: activeCompanyId !== null,
    retry: false,
  });

  return useMemo(() => {
    const taxDefinitions = (query.data?.taxDefinitions ?? []).map(normalizeTaxDefinition);

    return {
      isLoading: query.isLoading,
      accountOptions: query.data?.accountOptions ?? [],
      defaultAccountIds: query.data?.defaultAccountIds ?? EmptyDefaultAccountIds,
      options: taxDefinitions
        .filter(
          (tax) =>
            tax.status === "Active" &&
            (!transactionScope ||
              tax.transactionScope === "BOTH" ||
              tax.transactionScope === transactionScope),
        )
        .sort(
          (left, right) =>
            (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
            compareText(left.name, right.name) ||
            compareText(left.id, right.id),
        )
        .map((tax) => ({
          description: formatTaxDefinitionPercentage(tax.percentage, tax.treatment),
          name: tax.name,
          value: tax.id,
        })),
      refetch: query.refetch,
      taxes: taxDefinitions,
    };
  }, [query.data, query.isLoading, query.refetch, transactionScope]);
}

function compareText(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").localeCompare(right ?? "");
}

function normalizeTaxDefinition(tax: TaxDefinition): TaxDefinition {
  return {
    ...tax,
    id: String(tax.id),
    name: tax.name?.trim() || "Unnamed tax",
    percentage: String(Number(tax.percentage || 0)),
    sortOrder: tax.sortOrder ?? 0,
  };
}
