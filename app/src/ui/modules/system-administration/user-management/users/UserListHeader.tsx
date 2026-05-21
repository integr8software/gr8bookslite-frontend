import Link from "next/link";
import { Plus, Sparkles, UserCog } from "lucide-react";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function UserListHeader({
  addHref,
  description,
  title,
  onStartSpotlightTutorial,
}: {
  addHref?: string;
  description: string;
  title: string;
  onStartSpotlightTutorial: () => void;
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
        <>
          <button
            type="button"
            onClick={onStartSpotlightTutorial}
            className={moduleHeaderActionClassNames.secondary}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Quick Tour
          </button>
          {addHref ? (
            <Link
              href={addHref}
              data-spotlight-id="users-add-user"
              className={moduleHeaderActionClassNames.primary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add User
            </Link>
          ) : null}
        </>
      }
    />
  );
}
