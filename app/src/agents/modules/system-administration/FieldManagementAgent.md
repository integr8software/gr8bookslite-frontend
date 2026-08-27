# Field Management Module Guide

Use this guide when working on, maintaining, or consuming configurations from the **Field Management** feature in the frontend.

---

## 1. Overview & Purpose

**Field Management** is a System Administration module that enables system administrators to configure the visibility (`isVisible`) and requirement rules (`isRequired`) of data fields across all modules in the ERP system.

- **Route**: `/system-administration/field-management`
- **Module Code**: `FM`
- **Navigation Category**: `System Administration`
- **Primary Function**:
  - Browse modules in an interactive sidebar.
  - View all registered fields for each module in a table.
  - Toggle field visibility (Show / Hide).
  - Toggle field requirement (Required / Optional).
  - Persist module field settings to the backend.

---

## 2. Directory & File Structure

```txt
gr8bookslite-frontend/
  app/
    (modules)/
      system-administration/
        field-management/
          page.tsx                                # Next.js route entry point
    src/
      ui/
        modules/
          system-administration/
            field-management/
              FieldManagementPage.tsx             # Main page, sidebar, table, and actions
      services/
        modules/
          system-administration/
            field-management/
              FieldManagementApi.ts               # API client, TypeScript contracts, query endpoints
      agents/
        modules/
          system-administration/
            FieldManagementAgent.md               # This module documentation guide
```

---

## 3. UI Component Breakdown

### [`page.tsx`](file:///c:/Users/Bay/Integr8/gr8bookslite-frontend/app/(modules)/system-administration/field-management/page.tsx)
- Sets page metadata (`title`, `description`).
- Mounts and renders `<FieldManagementPage />`.

### [`FieldManagementPage.tsx`](file:///c:/Users/Bay/Integr8/gr8bookslite-frontend/app/src/ui/modules/system-administration/field-management/FieldManagementPage.tsx)
- **State & Query Management**:
  - Uses `@tanstack/react-query` to fetch the bootstrap dataset via `GetFieldManagementBootstrap()`.
  - Maintains `selectedModuleId` to switch active module views.
  - Maintains `fields` state for local edits and dirty tracking (`dirty: boolean`).
  - Supports TanStack Table sorting and pagination.
- **Module Sidebar**:
  - Filterable/searchable module list on the left pane (`filteredModules`).
  - Shows module name, code badge, and total count of registered fields.
- **Field Configuration Table**:
  - Utilizes shared `ModuleTable` and `ModuleHeader` components.
  - Columns:
    1. **Field**: Shows label and underlying `fieldKey`.
    2. **Type**: Inferred field data type (`text`, `number`, `date`, `select`, etc.).
    3. **Visible**: Action button toggling `isVisible`.
    4. **Required**: Action button toggling `isRequired` (automatically disabled if `isVisible` is false).
- **Save & Reset Flow**:
  - **Save**: Triggers `SaveFieldManagementModuleFields` mutation, updates TanStack Query cache optimistically, displays a success toast.
  - **Reset**: Reverts local table state to the currently active module snapshot.

---

## 4. Frontend Service & API Client

### [`FieldManagementApi.ts`](file:///c:/Users/Bay/Integr8/gr8bookslite-frontend/app/src/services/modules/system-administration/field-management/FieldManagementApi.ts)

#### TypeScript Types
```typescript
export type FieldManagementField = {
  id: number;
  moduleId: number;
  fieldKey: string;
  label: string;
  sourcePath?: string | null;
  fieldType?: string | null;
  sortOrder: number;
  isVisible: boolean;
  isRequired: boolean;
  defaultVisible: boolean;
  defaultRequired: boolean;
};

export type FieldManagementModule = {
  id: number;
  code: string;
  name: string;
  description: string;
  iconName?: string | null;
  isActive: boolean;
  fields: FieldManagementField[];
};

export type FieldManagementBootstrap = {
  modules: FieldManagementModule[];
};
```

#### API Endpoints
- **`GetFieldManagementBootstrap()`**:
  - `GET /api/v1/system-administration/field-management`
  - Retrieves all active modules along with their configured fields.
- **`SaveFieldManagementModuleFields(moduleId, fields)`**:
  - `PATCH /api/v1/system-administration/field-management/modules/:moduleId/fields`
  - Submits modified visibility and requirement rules for the module fields.

---

## 5. How to Consume / Implement Field Management in Other Modules

To dynamically adapt forms, modals, and tables based on Field Management configuration, follow this pattern:

### Step 1: Create a Shared Field Config Hook
Create a hook (e.g. `app/src/hooks/shared/modules/useModuleFieldConfig.ts`):

```typescript
import { useQuery } from "@tanstack/react-query";
import { GetFieldManagementBootstrap, type FieldManagementField } from "@/app/src/services/modules/system-administration/field-management/FieldManagementApi";

export function useModuleFieldConfig(moduleCode: string) {
  const query = useQuery({
    queryKey: ["system-administration", "field-management"],
    queryFn: GetFieldManagementBootstrap,
    staleTime: 5 * 60 * 1000,
  });

  const module = query.data?.modules.find((m) => m.code === moduleCode);
  const fieldsMap = new Map<string, FieldManagementField>(
    (module?.fields ?? []).map((f) => [f.fieldKey, f])
  );

  return {
    isLoading: query.isLoading,
    isFieldVisible: (fieldKey: string, defaultVal = true) =>
      fieldsMap.has(fieldKey) ? fieldsMap.get(fieldKey)!.isVisible : defaultVal,
    isFieldRequired: (fieldKey: string, defaultVal = false) =>
      fieldsMap.has(fieldKey) ? fieldsMap.get(fieldKey)!.isRequired : defaultVal,
    getFieldLabel: (fieldKey: string, fallback: string) =>
      fieldsMap.get(fieldKey)?.label ?? fallback,
    fields: module?.fields ?? [],
  };
}
```

### Step 2: Use in Module Forms & Drawers
In target module form components (e.g., `ChartsOfAccountsAccountFields.tsx` or `AccountsPayableVoucherForm.tsx`):

```tsx
import { useModuleFieldConfig } from "@/app/src/hooks/shared/modules/useModuleFieldConfig";

export function TransactionForm() {
  const { isFieldVisible, isFieldRequired, getFieldLabel } = useModuleFieldConfig("APV");

  return (
    <form>
      {isFieldVisible("reference_number") && (
        <InputField
          label={getFieldLabel("reference_number", "Reference Number")}
          required={isFieldRequired("reference_number", true)}
        />
      )}
      {isFieldVisible("memo") && (
        <InputField
          label={getFieldLabel("memo", "Memo / Remarks")}
          required={isFieldRequired("memo", false)}
        />
      )}
    </form>
  );
}
```

### Step 3: Dynamic Validation Integration
When validating forms with Zod, pass the field rules to build conditional schemas:

```typescript
export function createDynamicSchema(isFieldRequired: (key: string) => boolean) {
  return z.object({
    referenceNumber: isFieldRequired("reference_number")
      ? z.string().min(1, "Reference number is required")
      : z.string().optional(),
    memo: isFieldRequired("memo")
      ? z.string().min(1, "Memo is required")
      : z.string().optional(),
  });
}
```

---

## 6. Coding & Styling Standards

- **UI Shell**: Module table wraps inside `ModuleTable` with `ModuleHeader` at the top.
- **Theme Palette**: Use standard Tailwind color tokens (`darknavy`, `skyblue`, `coralpink`, `offwhite`).
- **Dependencies**: React Query (`@tanstack/react-query`), TanStack Table (`@tanstack/react-table`), Lucide React icons.
- **Validation**: When toggling `isVisible` to `false`, `isRequired` must automatically reset to `false`.
