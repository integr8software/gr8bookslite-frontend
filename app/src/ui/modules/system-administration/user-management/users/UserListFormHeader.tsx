import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Save,
  UserCog,
  X,
} from "lucide-react";
import type { UserManagementActionMode } from "@/app/src/types/modules/user-management/UserManagementTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserListFormHeader({
  cancelHref,
  editHref,
  isReadonly,
  mode,
  title,
}: {
  cancelHref: string;
  editHref?: string;
  isReadonly: boolean;
  mode: UserManagementActionMode;
  title: string;
}) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={title}
      description="Maintain user account assignments and access."
      eyebrow={
        <>
          <UserCog className="h-3.5 w-3.5" aria-hidden="true" />
          User management
        </>
      }
      actions={
        <>
          {mode === "view" ? (
            <Link href={cancelHref} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          ) : null}
          {mode === "view" && editHref ? (
            <Link href={editHref} className={moduleHeaderActionClassNames.secondary}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}
          {mode !== "view" ? (
            <Link href={cancelHref} className={moduleHeaderActionClassNames.secondary}>
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </Link>
          ) : null}
          {!isReadonly ? (
            <button type="submit" form="users-form" className={saveClassName}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save User
            </button>
          ) : null}
        </>
      }
    />
  );
}

const saveClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white";
