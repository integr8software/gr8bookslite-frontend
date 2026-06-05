"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
	WorkspaceCompanyNotFoundDescription,
	WorkspaceUsersManagementHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useWorkspaceUserActionForm } from "@/app/src/hooks/workspace/users-management/useWorkspaceUserActionForm";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { WorkspaceUserDrawer } from "@/app/src/ui/workspace/users-management/WorkspaceUserDrawer";
import { WorkspaceUsersManagementMain } from "@/app/src/ui/workspace/users-management/WorkspaceUsersManagementMain";

export function WorkspaceUserAction() {
	return (
		<Suspense fallback={null}>
			<WorkspaceUserActionInner />
		</Suspense>
	);
}

function WorkspaceUserActionInner() {
	const router = useRouter();
	const form = useWorkspaceUserActionForm();
	const closeDrawer = () => router.push(WorkspaceUsersManagementHref);

	if (form.mode !== "add" && form.isLoading) {
		return <WorkspaceUsersManagementMain />;
	}

	if (form.mode !== "add" && !form.existingUser) {
		return (
			<>
				<WorkspaceUsersManagementMain />
				<ModuleNotFound
					actionHref={WorkspaceUsersManagementHref}
					actionLabel="Back"
					align="center"
					description={WorkspaceCompanyNotFoundDescription}
					title="User Not Found"
				/>
			</>
		);
	}

	return (
		<>
			<WorkspaceUsersManagementMain />
			<WorkspaceUserDrawer
				isOpen
				mode={form.mode}
				onClose={closeDrawer}
				user={form.existingUser}
			/>
		</>
	);
}
