import {
  getNextUserStatus,
  type UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

export function UserListRecordActions({
  baseHref,
  id,
  name,
  status,
  onStatusChange,
}: {
  baseHref: string;
  id: string;
  name: string;
  status: UserStatus;
  onStatusChange: () => void;
}) {
  const nextStatus = getNextUserStatus(status);

  return (
    <ModuleTableActions className="justify-center">
      <ModuleTableActionLink
        variant="view"
        href={`${baseHref}/view/${id}`}
        label={`View ${name}`}
      />
      <ModuleTableActionLink
        variant="edit"
        href={`${baseHref}/edit/${id}`}
        label={`Edit ${name}`}
      />
      <ModuleTableActionButton
        variant={nextStatus === "Inactive" ? "inactive" : "active"}
        onClick={onStatusChange}
        label={`Set ${name} as ${nextStatus.toLowerCase()}`}
      />
    </ModuleTableActions>
  );
}
