"use client";

import { useMemo } from "react";
import { CreditCard, Landmark, ReceiptText, WalletCards } from "lucide-react";
import type { PaymentTypeStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { ModuleStatisticCards, type ModuleStatisticCardItem } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function PaymentTypeStatisticCards({ isLoading, statistics }: PaymentTypeStatisticCardsProps) {
  const statisticCards = useMemo<ModuleStatisticCardItem[]>(
    () => [
      {
        helper: "All payment types",
        icon: CreditCard,
        label: "Total",
        value: statistics.totalPaymentTypes,
      },
      {
        helper: "Bank transfer types",
        icon: Landmark,
        label: "Bank Transfer",
        tone: "violet",
        value: statistics.bankTransferPaymentTypes,
      },
      {
        helper: "Check payment types",
        icon: ReceiptText,
        label: "Check",
        tone: "slate",
        value: statistics.checkPaymentTypes,
      },
      {
        helper: "Digital wallet types",
        icon: WalletCards,
        label: "Digital Wallet",
        tone: "cyan",
        value: statistics.digitalWalletPaymentTypes,
      },
    ],
    [statistics],
  );

  return <ModuleStatisticCards items={statisticCards} isLoading={isLoading} className="xl:grid-cols-4" />;
}
