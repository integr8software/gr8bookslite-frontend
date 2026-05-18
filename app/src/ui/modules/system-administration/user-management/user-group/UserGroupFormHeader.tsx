import { Save, Trash2 } from "lucide-react";

export function UserGroupFormHeader({
  canDelete,
  isReadonly,
  onDelete,
  title,
}: {
  canDelete: boolean;
  isReadonly: boolean;
  onDelete: () => void;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-darknavy">{title}</h2>
        <p className="mt-1 text-sm text-darknavy/55">
          Maintain team access roles.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canDelete ? (
          <button type="button" onClick={onDelete} className={deleteClassName}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        ) : null}
        {!isReadonly ? (
          <button type="submit" form="user-group-form" className={saveClassName}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save
          </button>
        ) : null}
      </div>
    </div>
  );
}

const deleteClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink";
const saveClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white";
