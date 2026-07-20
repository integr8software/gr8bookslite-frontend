# Shared Module Interaction Patterns

Use these patterns when adding or refactoring modules with user-triggered actions.

## Request deduplication

Shared API calls are deduped globally through:

- `app/src/services/shared/api/ApiRequestDeduper.ts`
- `app/src/services/shared/api/ApiClient.ts`
- `app/src/services/shared/api/OrvalApiClient.ts`

Identical in-flight requests share the same promise instead of creating another network request. The dedupe key uses method, base URL, URL, params, and body. For `FormData`, the key includes field names and file metadata.

This protects API calls from duplicate fetches caused by fast clicks, rerenders, and repeated query triggers. It does not replace UI-level action guards.

## Submit lock

Use `acquireModuleActionLock` for Save, Submit, Approve, Delete, Close, Post, and other user-triggered actions that must not run twice.

```ts
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";

function handleSubmit() {
	if (isReadonly || isSubmittingRef.current) return;

	const releaseSubmitLock = acquireModuleActionLock(
		`module-group:module-name:submit:${mode}:${params.recordId ?? values.transNo}`,
	);

	if (!releaseSubmitLock) return;

	isSubmittingRef.current = true;
	setIsSubmitting(true);

	const nextErrors = validateForm(values);

	if (Object.keys(nextErrors).length > 0) {
		setErrors(nextErrors);
		toast.error("Please complete the required fields.");
		isSubmittingRef.current = false;
		setIsSubmitting(false);
		releaseSubmitLock();
		return;
	}

	try {
		saveRecord(values);
		draft.clearDraft();
		router.push(`${ModuleHref}/view/${recordId}`);
	} catch {
		toast.error("Could not save. Please try again.");
		isSubmittingRef.current = false;
		setIsSubmitting(false);
		releaseSubmitLock();
	}
}
```

Important behavior:

- Acquire the lock before validation or saving.
- Release the lock when validation fails.
- Release the lock when the save throws.
- Do not release the lock after successful navigation. Let the TTL expire so rapid clicks cannot keep pushing the same route.
- Also disable the button with `isSubmitting` and show `Saving...`.

Example key format:

```ts
`purchasing:canvass-form:submit:${mode}:${params.recordId ?? values.transNo}`
```

## Dirty checking

Submit locks stop repeated actions. They do not stop a single no-change save.

For edit forms, add dirty checking when no-change saves should be blocked:

```ts
const initialValues = useRef(createFormValues(existingRecord));
const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues.current);

function handleSubmit() {
	if (mode === "edit" && !isDirty) {
		toast.error("No changes to save.");
		return;
	}

	// continue with submit lock and validation
}
```

Prefer a stable serializer or explicit comparison if values contain functions, dates, transient UI-only fields, or unordered arrays.

## Optimistic updates

Use optimistic updates selectively.

Good candidates:

- Local form line entry add, remove, duplicate, and edit.
- Safe list row delete/removal after `AppDialog` confirmation.
- Metadata-only status changes.

Avoid optimistic updates for:

- Posting accounting transactions.
- Inventory stock movement.
- Payment/disbursement actions.
- Approval actions that create ledger or stock side effects.
- Anything that depends on backend-generated numbers.

For safe list stores, use:

- `app/src/hooks/shared/module/useOptimisticModuleListMutation.ts`

For local component state, use:

- `app/src/hooks/shared/module/useOptimisticModuleMutation.ts`

Rollback on error and show toast messages for both success and failure.

## Draft autosave

Use `useModuleDraft` for unsaved form values:

```ts
const draft = useModuleDraft({
	enabled: !isReadonly,
	key: createModuleDraftKey({
		mode,
		moduleId: "purchasing:purchase-order",
		recordId: params.recordId,
	}),
	setValues,
	values,
});
```

Call `draft.clearDraft()` only after a successful save.

## Testing checklist

- Rapid-click Save: only the first submit should run.
- Failed validation: lock should release and Save should work after corrections.
- Save failure: lock should release and show an error toast.
- Save success: button should show `Saving...`, then navigate once.
- Network tab: repeated route fetches should not continue after a successful save.
- Optimistic delete: row disappears immediately, then restores if persistence fails.
