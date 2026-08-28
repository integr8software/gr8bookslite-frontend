"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { InitialWorkspaceCompanyUserFormValues } from "@/app/src/data/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagementStore";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type {
	WorkspaceCompanyRecord,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

import { validateWorkspaceCompanyUserForm } from "@/app/src/validations/workspace/companies/WorkspaceCompanyValidation";

export type WorkspaceUserActionMode = "add" | "edit" | "view";

const WorkspaceUserEmailTakenMessage = "Email is already in use.";

type WorkspaceUserActionFormOptions = {
	existingUser?: WorkspaceCompanyUserRecord;
	mode?: WorkspaceUserActionMode;
	onSaved?: () => void;
};

export function useWorkspaceUserActionForm(
	options: WorkspaceUserActionFormOptions = {},
) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ userId?: string }>();
	const {
		addCompanyUser,
		branches,
		companies,
		isLoading,
		isSaving,
		updateCompanyUser,
		users,
	} = useWorkspaceCompanyManagementStore((state) => ({
		addCompanyUser: state.addCompanyUser,
		branches: state.branches,
		companies: state.companies,
		isLoading: state.isLoading,
		isSaving: state.isMutating,
		updateCompanyUser: state.updateCompanyUser,
		users: state.users,
	}));
	const routeMode = pathname.includes("/view/")
		? "view"
		: pathname.includes("/edit/")
			? "edit"
			: "add";
	const mode = options.mode ?? routeMode;
	const isReadonly = mode === "view";
	const existingUser =
		options.existingUser ?? users.find((user) => user.id === params.userId);
	const canEditEmail = mode === "add" || existingUser?.status === "Pending";
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
	const isSubmittingRef = useRef(false);
	const values =
		draftValues ?? existingUserValues ?? InitialWorkspaceCompanyUserFormValues;
	const [errors, setErrors] = useState<WorkspaceCompanyUserFormErrors>({});
	const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);

	const availableCompanies = useMemo(
		() =>
			companies.filter(
				(company) =>
					isCompanyActiveForAssignment(company) &&
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

		const targetCompany = companies.find(
			(item) => item.id === pendingCompanyId,
		);
		const defaultRoleId =
			targetCompany?.roles?.length === 1
				? targetCompany.roles[0].id
				: null;

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: [
				...(current ?? values).companyAssignments,
				{
					companyId: pendingCompanyId,
					branchIds: [],
					role: "USER",
					companyRoleId: defaultRoleId,
				},
			],
		}));
		setErrors((current) => ({ ...current, companyAssignments: undefined }));
		setSelectedCompanyId(
			availableCompanies.find((company) => company.id !== pendingCompanyId)
				?.id ?? "",
		);
		setPendingCompanyId(null);
	}


	function updateCompanyRole(
		companyId: string,
		role: "ADMIN" | "USER",
		companyRoleId?: string | null,
	) {
		if (isReadonly) {
			return;
		}

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: (current ?? values).companyAssignments.map(
				(assignment) =>
					assignment.companyId === companyId
						? {
								...assignment,
								role,
								companyRoleId:
									role === "ADMIN" ? null : (companyRoleId ?? null),
							}
						: assignment,
			),
		}));
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

		const targetCompany = companies.find((c) => c.id === companyId);
		const branchApplicableRoles =
			targetCompany?.roles?.filter(
				(r) => String(r.unitId) === String(branchId) || !r.unitId,
			) ?? [];
		const defaultRoleId =
			branchApplicableRoles.length === 1
				? branchApplicableRoles[0].id
				: "";

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: (current ?? values).companyAssignments.map((assignment) => {
				if (assignment.companyId !== companyId) {
					return assignment;
				}

				const hasBranch = assignment.branchIds.includes(branchId);
				const nextBranchRoles = { ...(assignment.branchRoles ?? {}) };

				if (hasBranch) {
					delete nextBranchRoles[branchId];
				} else if (defaultRoleId) {
					nextBranchRoles[branchId] = defaultRoleId;
				}

				return {
					...assignment,
					branchIds: hasBranch
						? assignment.branchIds.filter((id) => id !== branchId)
						: [...assignment.branchIds, branchId],
					branchRoles: nextBranchRoles,
				};
			}),
		}));
	}

	function updateBranchRole(
		companyId: string,
		branchId: string,
		companyRoleId: string | null,
	) {
		if (isReadonly) {
			return;
		}

		setDraftValues((current) => ({
			...(current ?? values),
			companyAssignments: (current ?? values).companyAssignments.map((assignment) => {
				if (assignment.companyId !== companyId) {
					return assignment;
				}

				const nextBranchRoles = { ...(assignment.branchRoles ?? {}) };
				if (companyRoleId) {
					nextBranchRoles[branchId] = companyRoleId;
				} else {
					delete nextBranchRoles[branchId];
				}

				return {
					...assignment,
					branchRoles: nextBranchRoles,
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
		if (isReadonly || isSaving || isSubmittingRef.current) {
			return false;
		}

		if (!validate()) {
			return false;
		}

		const primaryCompanyId = values.companyAssignments[0]?.companyId;

		if (!primaryCompanyId) {
			return false;
		}

		isSubmittingRef.current = true;

		try {
			if (mode === "edit" && existingUser) {
				await updateCompanyUser(existingUser.id, {
					companyAssignments: values.companyAssignments,
					contactNumber: values.contactNumber.trim(),
					email: canEditEmail ? values.email.trim() : existingUser.email,
					name: values.name.trim(),
				});
				options.onSaved?.();

				if (!options.onSaved) {
					router.push(WorkspaceUsersManagementHref);
				}
				return true;
			}

			await addCompanyUser({
				companyAssignments: values.companyAssignments,
				contactNumber: values.contactNumber.trim(),
				email: values.email.trim(),
				name: values.name.trim(),
			});
			options.onSaved?.();

			if (!options.onSaved) {
				router.push(WorkspaceUsersManagementHref);
			}
			return true;
		} catch (error) {
			if (isWorkspaceUserEmailTakenError(error)) {
				setErrors((current) => ({
					...current,
					email: WorkspaceUserEmailTakenMessage,
				}));
			}

			return false;
		} finally {
			isSubmittingRef.current = false;
		}
	}

	function validate() {
		const nextErrors = validateWorkspaceCompanyUserForm(values);
		const submittedEmail = normalizeEmail(values.email);
		const userWithEmail = users.find(
			(user) =>
				normalizeEmail(user.email) === submittedEmail &&
				user.id !== existingUser?.id,
		);

		if (submittedEmail && userWithEmail) {
			nextErrors.email = WorkspaceUserEmailTakenMessage;
		}

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	}

	return {
		availableCompanies,
		branches,
		canEditEmail,
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
		updateBranchRole,
		updateCompanyRole,
		updateField,
		values,
		confirmCompanyAssignment: addCompanyAssignment,
	};
}



function isWorkspaceUserEmailTakenError(error: unknown) {
	return (
		error instanceof ApiClientError &&
		error.message.toLowerCase().includes("email is already in use")
	);
}

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

function isCompanyActiveForAssignment(company: WorkspaceCompanyRecord) {
	const status = company.status;

	return status === "Active" || status === "Trialing" || status === "Trial";
}

