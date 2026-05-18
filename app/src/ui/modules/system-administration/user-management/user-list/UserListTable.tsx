import { Users } from "lucide-react";
import type {
  UserGroupRecord,
  UserManagementRecord,
  UserTypeRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserListRecordActions } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListRecordActions";

export function UserListTable({
  userGroups,
  users,
  userTypes,
  onDelete,
}: {
  userGroups: UserGroupRecord[];
  users: UserManagementRecord[];
  userTypes: UserTypeRecord[];
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.75fr_8rem] gap-4 border-b border-darknavy/10 bg-darknavy/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/50 max-lg:hidden">
        <span>User</span>
        <span>Contact</span>
        <span>User Type</span>
        <span>Group</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="divide-y divide-darknavy/10">
        {users.map((user) => (
          <UserListRow
            key={user.id}
            user={user}
            userGroup={userGroups.find((group) => group.id === user.userGroupId)}
            userType={userTypes.find((type) => type.id === user.userTypeId)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function UserListRow({
  user,
  userGroup,
  userType,
  onDelete,
}: {
  user: UserManagementRecord;
  userGroup?: UserGroupRecord;
  userType?: UserTypeRecord;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <article className="grid gap-3 px-4 py-4 lg:grid-cols-[1.1fr_1fr_0.8fr_0.75fr_8rem] lg:items-center lg:gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
          <Users className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-darknavy">
            {user.name}
          </h3>
          <p className="mt-1 truncate text-xs text-darknavy/50">
            {user.email}
          </p>
        </div>
      </div>
      <Detail label="Contact" value={user.contactNumber} />
      <Detail label="User Type" value={userType?.name} />
      <Detail label="Group" value={userGroup?.name} />
      <UserListRecordActions
        baseHref={UserListHref}
        id={user.id}
        name={user.name}
        onDelete={onDelete}
      />
    </article>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-darknavy/40 lg:hidden">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-darknavy lg:mt-0">
        {value || "-"}
      </p>
    </div>
  );
}
