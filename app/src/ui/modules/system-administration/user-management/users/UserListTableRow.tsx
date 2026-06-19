import { UserCircle } from "lucide-react";
import type { UserRoleRecord } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserListTableRecord } from "@/app/src/types/modules/user-management/UserListTypes";
import type { UserManagementRecord } from "@/app/src/types/modules/user-management/UserManagementTypes";

type UserListTableRowProps = {
	isRoleUpdating?: boolean;
	user: UserListTableRecord;
	userRoles: UserRoleRecord[];
	onRoleChange: (user: UserManagementRecord, userRoleId: string) => void;
};

export function UserListTableRow({
	isRoleUpdating = false,
	user,
	userRoles,
	onRoleChange,
}: UserListTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-3">
				<div className="flex min-w-0 items-center gap-3">
					{user.profileImageUrl ? (
						<span
							aria-hidden="true"
							className="block h-8 w-8 shrink-0 rounded-full bg-cover bg-center ring-1 ring-darknavy/10"
							style={{
								backgroundImage: `url("${user.profileImageUrl}")`,
							}}
						/>
					) : (
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-skyblue/18 text-darknavy ring-1 ring-darknavy/10">
							<UserCircle
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</span>
					)}
					<span className="truncate text-xs font-semibold text-darknavy">
						{user.name}
					</span>
				</div>
			</td>
			<UserListTableCell>{user.email}</UserListTableCell>
			<UserListTableCell>
				<select
					aria-label={`Change role for ${user.name}`}
					disabled={isRoleUpdating}
					value={user.userRoleId}
					onChange={(event) => onRoleChange(user, event.target.value)}
					className="app-select-control app-theme-field h-8 w-full min-w-[9rem] rounded px-2.5 text-xs font-semibold outline-none transition hover:border-skyblue/45 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<option value="">Unassigned</option>
					{userRoles.map((role) => (
						<option key={role.id} value={role.id}>
							{role.name}
						</option>
					))}
				</select>
			</UserListTableCell>
		</tr>
	);
}

function UserListTableCell({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<td className="px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5">
			{children}
		</td>
	);
}
