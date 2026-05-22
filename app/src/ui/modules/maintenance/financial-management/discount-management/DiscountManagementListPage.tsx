"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Percent, Plus, Upload } from "lucide-react";
import { DiscountManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagement";
import type { DiscountManagementTableRecord } from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DiscountManagementTable } from "./DiscountManagementTable";

export function DiscountManagementListPage() {
  const discounts = useDiscountManagementStore((state) => state.discounts);
  const deleteDiscount = useDiscountManagementStore(
    (state) => state.deleteDiscount,
  );
  const isLoading = useDiscountManagementStore((state) => state.isLoading);
  const isMutating = useDiscountManagementStore((state) => state.isMutating);
  const [pendingDelete, setPendingDelete] =
    useState<DiscountManagementTableRecord | null>(null);

  function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    deleteDiscount(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Discount Management"
        description="Maintain discount definitions and map them to chart of accounts."
        eyebrow={
          <>
            <Percent className="h-3.5 w-3.5" aria-hidden="true" />
            Accounting master data
          </>
        }
        actions={<DiscountManagementHeaderActions />}
      />

      <DiscountManagementTable
        discounts={discounts}
        isLoading={isLoading}
        onDeleteDiscount={setPendingDelete}
      />

      <AppDialog
        isOpen={Boolean(pendingDelete)}
        isPending={isMutating}
        title="Delete discount?"
        description={`This will remove ${pendingDelete?.description ?? "the selected discount"}.`}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}

function DiscountManagementHeaderActions() {
  return (
    <>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Upload className="h-4 w-4" aria-hidden="true" />
        Import
      </button>
      <button type="button" className={moduleHeaderActionClassNames.secondary}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Export
      </button>
      <Link
        href={`${DiscountManagementHref}/add`}
        className={moduleHeaderActionClassNames.primary}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Discount
      </Link>
    </>
  );
}
