"use client";

import {
  CollectionTypeActionCopy,
  CollectionTypeDrawerFormId,
} from "@/app/src/constants/modules/financial-maintenance/collection-type/CollectionTypeConstants";
import { useCollectionTypeFormPage } from "@/app/src/hooks/modules/financial-maintenance/collection-type/useCollectionTypeFormPage";
import type { CollectionTypeDrawerProps } from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { CollectionTypeFields } from "@/app/src/ui/modules/financial-maintenance/collection-type/CollectionTypeFields";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";

export function CollectionTypeDrawer({ collectionType, isOpen, kind = "collection", mode, permissions, onClose }: CollectionTypeDrawerProps) {
  return (
    <CollectionTypeDrawerPanel
      key={`${mode}-${collectionType?.id ?? "new"}`}
      collectionType={collectionType}
      isOpen={isOpen}
      kind={kind}
      mode={mode}
      permissions={permissions}
      onClose={onClose}
    />
  );
}

function CollectionTypeDrawerPanel({ collectionType, isOpen, kind = "collection", mode, permissions, onClose }: CollectionTypeDrawerProps) {
  const page = useCollectionTypeFormPage({
    existingCollectionType: collectionType,
    isOpen,
    kind,
    mode,
    onSaved: onClose,
  });
  const copy = CollectionTypeActionCopy[mode];
  const singularTitle = "Collection Type";
  const moduleTitle = "Collection Type Maintenance";

  function handleClose() {
    page.saveDraft();
    onClose();
  }

  function handleCancel() {
    page.discardDraft();
    onClose();
  }

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow={moduleTitle}
      formId={CollectionTypeDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isSubmitting}
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onCancel={handleCancel}
      onClose={handleClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? `Update ${singularTitle}` : `Save ${singularTitle}`}
      title={copy.title.replace("Collection Type", singularTitle)}
    >
      <form id={CollectionTypeDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <CollectionTypeFields
          canAddExpenseTypeSubAccount={false}
          canCancelStatus={permissions.canCancel}
          errors={page.errors}
          expenseParentOptions={[]}
          generatedAccounts={collectionType?.generatedAccounts}
          hideTypeField
          isLoadingExpenseParentOptions={false}
          isReadonly={page.isReadonly}
          mode={mode}
          nameLabel={`${singularTitle} Name`}
          nextExpenseSubAccountLevel={null}
          onExpenseParentChange={page.handleExpenseParentChange}
          onInputChange={page.handleInputChange}
          onStatusChange={page.handleStatusChange}
          values={page.values}
        />
      </form>
    </ModuleDrawer>
  );
}
