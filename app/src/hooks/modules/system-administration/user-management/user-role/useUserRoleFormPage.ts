"use client";

import { useState, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	UserManagementEditFromParam,
	UserManagementEditFromViewQuery,
	UserManagementEditFromViewValue,
	UserRoleHref,
} from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	InitialUserRoleFormValues,
	getNextUserStatus,
	type UserRoleFormValues,
	type UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useBranchUserRoleContext } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useBranchUserRoleContext";
import {
	CreateBranchRole,
	GetBranchRole,
	UpdateBranchRole,
	UpdateBranchRoleStatus,
} from "@/app/src/services/modules/system-administration/user-management/user-role/BranchUserRoleApi";
import { UserRoleQueryKeys } from "@/app/src/services/modules/system-administration/user-management/user-role/UserRoleQueryKeys";
import { UserListQueryKeys } from "@/app/src/services/modules/system-administration/user-management/users/UserListQueryKeys";
import type {
	UserManagementActionMode,
	UserRoleFormErrors,
} from "@/app/src/types/modules/user-management/UserManagementTypes";
import { validateUserRoleForm } from "@/app/src/validations/modules/system-administration/user-management/user-role/UserRoleValidation";

export function useUserRoleFormPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const searchParams = useSearchParams();
	const { accessToken, branchId } = useBranchUserRoleContext();
	const mode = getActionMode(pathname);
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(UserManagementEditFromParam) ===
			UserManagementEditFromViewValue;
	const existingUserRoleQuery = useQuery({
		enabled: Boolean(accessToken && branchId && params.recordId && mode !== "add"),
		queryKey:
			branchId && params.recordId
				? UserRoleQueryKeys.branchRole(branchId, params.recordId)
				: UserRoleQueryKeys.branchRole("", ""),
		queryFn: async () =>
			GetBranchRole(branchId ?? "", params.recordId ?? ""),
	});
	const existingUserRole = existingUserRoleQuery.data;
	const isReadonly = mode === "view";
	const existingFormValues: UserRoleFormValues = existingUserRole
		? {
				name: existingUserRole.name,
				description: existingUserRole.description,
				accessRoles: existingUserRole.accessRoles,
				status: existingUserRole.status,
			}
		: InitialUserRoleFormValues;
	const [draftValues, setDraftValues] = useState<UserRoleFormValues | null>(null);
	const values = draftValues ?? existingFormValues;
	const [errors, setErrors] = useState<UserRoleFormErrors>({});
	const [isRedirectingAfterSave, setIsRedirectingAfterSave] = useState(false);
	const viewHref = existingUserRole
		? `${UserRoleHref}/view/${existingUserRole.id}`
		: UserRoleHref;
	const submitHref =
		mode === "edit" && wasOpenedFromView ? viewHref : UserRoleHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : UserRoleHref;
	const editHref = existingUserRole
		? `${UserRoleHref}/edit/${existingUserRole.id}?${UserManagementEditFromViewQuery}`
		: undefined;
	const createMutation = useMutation({
		mutationFn: async (nextValues: UserRoleFormValues) => {
			if (!branchId) {
				throw new Error("Select a branch before creating a user role.");
			}

			return CreateBranchRole(branchId, nextValues);
		},
		onSuccess: (createdRole) => {
			if (branchId) {
				queryClient.setQueryData<UserRoleRecord[]>(
					UserRoleQueryKeys.branchRoles(branchId),
					(current = []) => [...current, createdRole],
				);
				queryClient.invalidateQueries({
					queryKey: UserListQueryKeys.branchRoles(branchId),
				});
			}

			setIsRedirectingAfterSave(true);
			toast.success("User role created.");
			router.push(submitHref);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Could not save user role.",
			);
		},
	});
	const updateMutation = useMutation({
		mutationFn: async (nextValues: UserRoleFormValues) => {
			if (!branchId || !existingUserRole) {
				throw new Error("Select a branch before updating a user role.");
			}

			return UpdateBranchRole(branchId, existingUserRole.id, nextValues);
		},
		onSuccess: (updatedRole) => {
			if (branchId) {
				queryClient.setQueryData<UserRoleRecord[]>(
					UserRoleQueryKeys.branchRoles(branchId),
					(current = []) =>
						current.map((role) =>
							role.id === updatedRole.id ? updatedRole : role,
						),
				);
				queryClient.setQueryData<UserRoleRecord>(
					UserRoleQueryKeys.branchRole(branchId, updatedRole.id),
					updatedRole,
				);
				queryClient.invalidateQueries({
					queryKey: UserListQueryKeys.branchRoles(branchId),
				});
			}

			setIsRedirectingAfterSave(true);
			toast.success("User role updated.");
			router.push(submitHref);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Could not save user role.",
			);
		},
	});
	const statusMutation = useMutation({
		mutationFn: async ({
			role,
			nextStatus,
		}: {
			role: UserRoleRecord;
			nextStatus: UserRoleRecord["status"];
		}) => {
			if (!branchId) {
				throw new Error("Select a branch before updating a user role.");
			}

			return UpdateBranchRoleStatus(branchId, role.id, nextStatus === "Active");
		},
		onSuccess: (updatedRole) => {
			if (branchId) {
				queryClient.setQueryData<UserRoleRecord>(
					UserRoleQueryKeys.branchRole(branchId, updatedRole.id),
					updatedRole,
				);
				queryClient.setQueryData<UserRoleRecord[]>(
					UserRoleQueryKeys.branchRoles(branchId),
					(current = []) =>
						current.map((role) =>
							role.id === updatedRole.id ? updatedRole : role,
						),
				);
				queryClient.invalidateQueries({
					queryKey: UserListQueryKeys.branchRoles(branchId),
				});
			}

			toast.success("User role status updated.");
			router.push(UserRoleHref);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update user role status.",
			);
		},
	});
	const isMutating =
		createMutation.isPending ||
		updateMutation.isPending ||
		statusMutation.isPending ||
		isRedirectingAfterSave;

	function updateField(
		field: keyof UserRoleFormValues,
		value: string | string[],
	) {
		if (isReadonly) return;
		setDraftValues((current) => ({
			...(current ?? values),
			[field]: value,
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function updateAccessRoles(accessRoles: string[]) {
		updateField("accessRoles", accessRoles);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void submitForm();
	}

	async function submitForm() {
		const nextErrors = validateUserRoleForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return "invalid";
		}

		try {
			if (mode === "edit" && existingUserRole) {
				await updateMutation.mutateAsync(values);
			} else {
				await createMutation.mutateAsync(values);
			}

			return "saved";
		} catch {
			return "failed";
		}
	}

	function handleStatusChange() {
		if (!existingUserRole) {
			return;
		}

		statusMutation.mutate({
			role: existingUserRole,
			nextStatus: getNextUserStatus(existingUserRole.status),
		});
	}

	return {
		cancelHref,
		editHref,
		errors,
		existingUserRole,
		handleStatusChange,
		handleSubmit,
		isRedirectingAfterSave,
		isMutating,
		isReadonly,
		mode,
		needsRecord:
			(mode === "edit" || mode === "view") && !existingUserRoleQuery.isLoading,
		submitForm,
		updateAccessRoles,
		updateField,
		values,
	};
}

function getActionMode(pathname: string): UserManagementActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";
	return "add";
}
