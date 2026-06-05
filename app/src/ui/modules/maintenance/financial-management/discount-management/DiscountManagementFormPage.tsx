"use client";

import { Percent } from "lucide-react";
import { DiscountManagementActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import { useDiscountManagementFormPage } from "@/app/src/hooks/modules/maintenance/financial-management/discount-management/useDiscountManagementFormPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { DiscountManagementActionButtons } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementActionButtons";
import { DiscountManagementFields } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementFields";
import { DiscountManagementNotFound } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementNotFound";

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
            />
          }
        />

        <DiscountManagementFields
          accountOptions={page.accountOptions}
          errors={page.errors}
          isReadonly={page.isReadonly}
          moduleOptions={page.moduleOptions}
          values={page.values}
          onAccountChange={page.handleAccountChange}
          onInputChange={page.handleInputChange}
          onModuleChange={page.handleModuleChange}
        />
      </form>

    </>
  );
}
