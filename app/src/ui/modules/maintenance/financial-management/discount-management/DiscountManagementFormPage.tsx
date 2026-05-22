"use client";

import { Percent } from "lucide-react";
import { DiscountManagementActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementFormPage } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagementFormPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { DiscountManagementActionButtons } from "./DiscountManagementActionButtons";
import { DiscountManagementFields } from "./DiscountManagementFields";
import { DiscountManagementNotFound } from "./DiscountManagementNotFound";

export function DiscountManagementFormPage() {
  const page = useDiscountManagementFormPage();
  const copy = DiscountManagementActionCopy[page.mode];

  if (page.needsRecord && !page.existingDiscount) {
    return <DiscountManagementNotFound />;
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <ModuleHeader
          variant="panel"
          titleAs="h1"
          title={copy.title}
          description={copy.description}
          eyebrow={
            <>
              <Percent className="h-3.5 w-3.5" aria-hidden="true" />
              Accounting master data
            </>
          }
          actions={
            <DiscountManagementActionButtons
              discount={page.existingDiscount}
              isReadonly={page.isReadonly}
              mode={page.mode}
              onDeleteDiscount={() => page.setIsDeleteDialogOpen(true)}
            />
          }
        />

        <DiscountManagementFields
          accountQuery={page.accountQuery}
          errors={page.errors}
          isReadonly={page.isReadonly}
          matchedAccounts={page.matchedAccounts}
          selectedAccount={page.selectedAccount}
          values={page.values}
          onAccountQueryChange={page.handleAccountQueryChange}
          onInputChange={page.handleInputChange}
          onSelectAccount={page.handleSelectAccount}
        />
      </form>

      <AppDialog
        isOpen={page.isDeleteDialogOpen}
        isPending={page.isMutating}
        title="Delete discount?"
        description={`This will remove ${page.existingDiscount?.description ?? "the selected discount"}.`}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => page.setIsDeleteDialogOpen(false)}
        onConfirm={page.handleConfirmDelete}
      />
    </>
  );
}
