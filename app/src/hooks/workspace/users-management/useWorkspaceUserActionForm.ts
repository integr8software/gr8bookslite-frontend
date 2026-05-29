"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { InitialWorkspaceCompanyUserFormValues } from "@/app/src/data/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { validateWorkspaceCompanyUserForm } from "@/app/src/validations/workspace/companies/WorkspaceCompanyValidation";

export function useWorkspaceUserActionForm() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ userId?: string }>();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const isLoading = useWorkspaceCompanyManagementStore((state) => state.isLoading);
	const isSaving = useWorkspaceCompanyManagementStore((state) => state.isMutating);
	const addCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.addCompanyUser,
	);
	const updateCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.updateCompanyUser,
	);
	const mode = pathname.includes("/view/")
		? "view"
		: pathname.includes("/edit/")
			? "edit"
			: "add";
	const isReadonly = mode === "view";
	const existingUser = users.find((user) => user.id === params.userId);
	const existingUserValues = useMemo<WorkspaceCompanyUserFormValues | null>(
		() =>
			existingUser
				? {
						companyAssignments: existingUser.companyAssignments,
						contactNumber: existingUser.contactNumber,
						email: existingUser.email,
						name: existingUser.name,
					}
				: null,
		[existingUser],
	);
	const [draftValues, setDraftValues] =
		useState<WorkspaceCompanyUserFormValues | null>(null);
	const values =
		draftValues ?? existingUserValues ?? InitialWorkspaceCompanyUserFormValues;
	const [errors, setErrors] = useState<WorkspaceCompanyUserFormErrors>({});
	const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);
	const availableCompanies = useMemo(
		() =>
			companies.filter(
				(company) =>
					!values.companyAssignments.some(
						(assignment) => assignment.companyId === company.id,
					),
			),
		[companies, values.companyAssignments],
	);
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const effectiveSelectedCompanyId =
		selectedCompanyId || availableCompanies[0]?.id || "";

	function updateField(field: keyof WorkspaceCompanyUserFormValues, value: string) {
		if (isReadonly) {
			return;
		}

		setDraftValues((current) => ({ ...(current ?? values), [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function addCompanyAssignment() {
		if (isReadonly || !pendingCompanyId) {
			return;
		}

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: [
				...(current ?? values).companyAssignments,
				{ companyId: pendingCompanyId, branchIds: [] },
			],
		}));
		setErrors((current) => ({ ...current, companyAssignments: undefined }));
		setSelectedCompanyId(
			availableCompanies.find((company) => company.id !== pendingCompanyId)
				?.id ?? "",
		);
		setPendingCompanyId(null);
	}

	function removeCompanyAssignment(companyId: string) {
		if (isReadonly) {
			return;
		}

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: (current ?? values).companyAssignments.filter(
				(assignment) => assignment.companyId !== companyId,
			),
		}));
	}

	function toggleBranchAssignment(companyId: string, branchId: string) {
		if (isReadonly) {
			return;
		}

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: (current ?? values).companyAssignments.map((assignment) => {
				if (assignment.companyId !== companyId) {
					return assignment;
				}

				const hasBranch = assignment.branchIds.includes(branchId);
				return {
					...assignment,
					branchIds: hasBranch
						? assignment.branchIds.filter((id) => id !== branchId)
						: [...assignment.branchIds, branchId],
				};
			}),
		}));
	}

	function openCompanyAssignmentConfirm() {
		if (!effectiveSelectedCompanyId) {
			return;
		}

		setPendingCompanyId(effectiveSelectedCompanyId);
	}

	function closeCompanyAssignmentConfirm() {
		setPendingCompanyId(null);
	}

	async function submit() {
		if (!validate()) {
			return;
		}

		const primaryCompanyId = values.companyAssignments[0]?.companyId;

		if (!primaryCompanyId) {
			return;
		}

		if (mode === "edit" && existingUser) {
			await updateCompanyUser(existingUser.id, {
				companyAssignments: values.companyAssignments,
				contactNumber: values.contactNumber.trim(),
				email: existingUser.email,
				name: values.name.trim(),
			});
			router.push(WorkspaceUsersManagementHref);
			return;
		}

		await addCompanyUser({
			companyAssignments: values.companyAssignments,
			contactNumber: values.contactNumber.trim(),
			email: values.email.trim(),
			name: values.name.trim(),
		});
		router.push(WorkspaceUsersManagementHref);
	}

	function validate() {
		const nextErrors = validateWorkspaceCompanyUserForm(values);

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	}

	return {
		availableCompanies,
		branches,
		closeCompanyAssignmentConfirm,
		companies,
		errors,
		existingUser,
		isLoading,
		isReadonly,
		isSaving,
		mode,
		openCompanyAssignmentConfirm,
		pendingCompanyId,
		removeCompanyAssignment,
		selectedCompanyId: effectiveSelectedCompanyId,
		setSelectedCompanyId,
		submit,
		validate,
		toggleBranchAssignment,
		updateField,
		values,
		confirmCompanyAssignment: addCompanyAssignment,
	};
}
