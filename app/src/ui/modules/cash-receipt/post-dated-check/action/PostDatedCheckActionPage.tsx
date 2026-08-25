"use client";

import { usePostDatedCheckActionPage } from "@/app/src/hooks/modules/cash-receipt/post-dated-check/usePostDatedCheckActionPage";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { PostDatedCheckActionHeader } from "@/app/src/ui/modules/cash-receipt/post-dated-check/action/PostDatedCheckActionHeader";
import { PostDatedCheckDetailsFields } from "@/app/src/ui/modules/cash-receipt/post-dated-check/action/PostDatedCheckDetailsFields";
import { PostDatedCheckEntrySection } from "@/app/src/ui/modules/cash-receipt/post-dated-check/entries/PostDatedCheckEntrySection";

export function PostDatedCheckActionPage() {
  const page = usePostDatedCheckActionPage();

  if (page.isLoading) {
    return (
      <div className="rounded-lg border border-darknavy/10 bg-white p-8 text-sm font-semibold text-darknavy/65">
        Loading Post Dated Check...
      </div>
    );
  }
  if (page.loadError) {
    return (
      <ModuleNotFound
        title="Post Dated Check not found"
        description={page.loadError instanceof Error ? page.loadError.message : "The requested registry could not be loaded."}
      />
    );
  }

  return (
    <section className="grid gap-5">
      <PostDatedCheckActionHeader
        title={page.title}
        isReadonly={page.isReadonly}
        copyFromRecords={page.copyFromRecords}
        copyFromSources={page.copyFromSources}
        isSaving={page.isSaving}
        onCopyFrom={page.copyFrom}
        onSave={page.submit}
      />
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          page.submit();
        }}
      >
        <PostDatedCheckDetailsFields
          values={page.values}
          errors={page.errors}
          isReadonly={page.isReadonly}
          numberInputMode={page.numberInputMode}
          partyOptions={page.partyOptions}
          onSelectParty={page.selectParty}
          onUpdateField={page.updateField}
        />
        <PostDatedCheckEntrySection
          rows={page.values.details}
          isReadonly={page.isReadonly}
          error={page.errors.details}
          detailErrors={page.errors.detailErrors}
          onCheckNumberBlur={page.checkDuplicateCheckNumber}
          onAddRows={page.addRows}
          onRemoveRow={page.removeRow}
          onDuplicateRow={page.duplicateRow}
          onInsertRow={page.insertRow}
          onMoveRow={page.moveRow}
          onUpdateRow={page.updateRow}
        />
      </form>
    </section>
  );
}
