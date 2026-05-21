"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Discount = {
  id: string;
  description: string;
  percentage: number;
  accountId?: string;
  accountCode?: string;
  accountTitle?: string;
};

const MockDiscounts: Discount[] = [
  {
    id: "d_001",
    description: "Early payment discount",
    percentage: 5,
    accountCode: "1110",
    accountTitle: "Cash in Bank - BDO",
  },
  {
    id: "d_002",
    description: "Volume purchase discount",
    percentage: 10,
    accountCode: "1210",
    accountTitle: "Accounts Receivable",
  },
  {
    id: "d_003",
    description: "Seasonal promo discount",
    percentage: 15,
    accountCode: "2210",
    accountTitle: "Sales Discounts Allowed",
  },
];

const DiscountQueryKeys = {
  discounts: () => ["discounts"],
};

type DiscountStoreState = {
  discounts: Discount[];
  addDiscount: (d: Discount) => void;
  deleteDiscount: (id: string) => void;
  isLoading: boolean;
  isMutating: boolean;
};

export function useDiscountManagementStore<TSelected = DiscountStoreState>(selector?: (s: DiscountStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const discountsQuery = useQuery({
    queryKey: DiscountQueryKeys.discounts(),
    queryFn: async () => MockDiscounts,
    initialData: MockDiscounts,
  });

  function updateCachedDiscounts(updater: (d: Discount[]) => Discount[]) {
    queryClient.setQueryData<Discount[]>(DiscountQueryKeys.discounts(), (current = MockDiscounts) => updater(current));
  }

  const addMutation = useMutation({
    mutationFn: async (d: Discount) => d,
    onSuccess: (d) => updateCachedDiscounts((current) => [...current, d]),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => id,
    onSuccess: (id) => updateCachedDiscounts((current) => current.filter((x) => x.id !== id)),
  });

  const state = useMemo<DiscountStoreState>(() => ({
    discounts: discountsQuery.data,
    addDiscount: (d) => addMutation.mutate(d),
    deleteDiscount: (id) => deleteMutation.mutate(id),
    isLoading: discountsQuery.isLoading,
    isMutating: addMutation.isPending || deleteMutation.isPending,
  }), [discountsQuery.data, discountsQuery.isLoading, addMutation, deleteMutation]);

  return selector ? selector(state) : (state as TSelected);
}

export type { Discount };
