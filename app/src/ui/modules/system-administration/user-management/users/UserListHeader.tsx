import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserListHeader({
  addHref,
  description,
  title,
}: {
  addHref?: string;
  description: string;
  title: string;
}) {
  return (
    <ModuleHeader
      variant="panel"
      data-spotlight-id="users-header"
      titleAs="h1"
      title={title}
      description={description}
      eyebrow={
        <>
          <UserCog className="h-3.5 w-3.5" aria-hidden="true" />
          User management
        </>
      }
      actions={
        addHref ? (
            <Link
              href={addHref}
              data-spotlight-id="users-add-user"
              className={`${moduleHeaderActionClassNames.primary} max-sm:w-full`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add User
            </Link>
        ) : null
      }
    />
  );
}
