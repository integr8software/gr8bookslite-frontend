import type { LucideIcon } from "lucide-react";
import type { UserTypeRecord } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserTypeRecordActions } from "@/app/src/ui/modules/system-administration/user-management/user-type/UserTypeRecordActions";

export function UserTypeList({
  baseHref,
  icon: Icon,
  items,
  onDelete,
}: {
  baseHref: string;
  icon: LucideIcon;
  items: UserTypeRecord[];
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="grid gap-3" data-spotlight-id="user-type-list">
      {items.map((item) => (
        <article
          key={item.id}
          className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_7rem] lg:items-center"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-darknavy">
                {item.name}
              </h3>
              <p className="mt-1 text-xs text-darknavy/55">
                {item.description || "No description set"}
              </p>
            </div>
          </div>
          <p className="text-sm text-darknavy/65">
            {item.accessRoles.length} access roles
          </p>
          <div data-spotlight-id="user-type-actions">
            <UserTypeRecordActions
              baseHref={baseHref}
              id={item.id}
              name={item.name}
              onDelete={onDelete}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
