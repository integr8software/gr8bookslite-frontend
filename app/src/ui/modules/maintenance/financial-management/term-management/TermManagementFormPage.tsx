"use client";

import { CalendarDays } from "lucide-react";
import { TermManagementActionCopy } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementFormPage } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagementFormPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermManagementActionButtons } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementActionButtons";
import { TermManagementFields } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementFields";
import { TermManagementNotFound } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementNotFound";

export function TermManagementFormPage() {
  const page = useTermManagementFormPage();
  const copy = TermManagementActionCopy[page.mode];

  if (page.needsRecord && !page.existingTerm) {
    return <TermManagementNotFound />;
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
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Accounting master data
            </>
          }
          actions={
            <TermManagementActionButtons
              isReadonly={page.isReadonly}
              mode={page.mode}
              nextStatus={page.existingTerm ? page.nextStatus : undefined}
              term={page.existingTerm}
              onStatusChange={() => page.setIsStatusDialogOpen(true)}
            />
          }
        />

        <TermManagementFields
          errors={page.errors}
          isReadonly={page.isReadonly}
          values={page.values}
          onInputChange={page.handleInputChange}
        />
      </form>

      <AppDialog
        isOpen={page.isStatusDialogOpen}
        isPending={page.isMutating}
        title={`Set term as ${page.nextStatus.toLowerCase()}?`}
        description={`This will mark ${page.existingTerm?.name ?? "the selected term"} as ${page.nextStatus.toLowerCase()} while keeping its record available for reference.`}
        confirmLabel={
          page.nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
        }
        tone={page.nextStatus === "Inactive" ? "danger" : "success"}
        onCancel={() => page.setIsStatusDialogOpen(false)}
        onConfirm={page.handleConfirmStatusChange}
      />
    </>
  );
}
