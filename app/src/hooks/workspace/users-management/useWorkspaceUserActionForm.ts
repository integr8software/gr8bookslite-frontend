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
	const [values, setValues] = useState<WorkspaceCompanyUserFormValues>(() =>
		existingUser
			? {
					companyAssignments: existingUser.companyAssignments,
					contactNumber: existingUser.contactNumber,
					email: existingUser.email,
					name: existingUser.name,
				}
			: InitialWorkspaceCompanyUserFormValues,
	);
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
	const [selectedCompanyId, setSelectedCompanyId] = useState(
		availableCompanies[0]?.id ?? "",
	);

	function updateField(field: keyof WorkspaceCompanyUserFormValues, value: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function addCompanyAssignment() {
		if (isReadonly || !pendingCompanyId) {
			return;
		}

		setValues((current) => ({
			...current,
			companyAssignments: [
				...current.companyAssignments,
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

		setValues((current) => ({
			...current,
			companyAssignments: current.companyAssignments.filter(
				(assignment) => assignment.companyId !== companyId,
			),
		}));
	}

	function toggleBranchAssignment(companyId: string, branchId: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({
			...current,
			companyAssignments: current.companyAssignments.map((assignment) => {
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
		if (!selectedCompanyId) {
			return;
		}

		setPendingCompanyId(selectedCompanyId);
	}

	function closeCompanyAssignmentConfirm() {
		setPendingCompanyId(null);
	}

	function submit() {
		const nextErrors = validateWorkspaceCompanyUserForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const primaryCompanyId = values.companyAssignments[0]?.companyId;

		if (!primaryCompanyId) {
			return;
		}

		if (mode === "edit" && existingUser) {
			updateCompanyUser({
				...existingUser,
				companyAssignments: values.companyAssignments,
				contactNumber: values.contactNumber.trim(),
				email: existingUser.email,
				name: values.name.trim(),
			});
			router.push(WorkspaceUsersManagementHref);
			return;
		}

		addCompanyUser({
			companyAssignments: values.companyAssignments,
			companyId: primaryCompanyId,
			contactNumber: values.contactNumber.trim(),
			email: values.email.trim(),
			id: `cu-${Date.now()}`,
			lastLogin: "Invitation sent",
			name: values.name.trim(),
			status: "Pending",
		});
		router.push(WorkspaceUsersManagementHref);
	}

	return {
		availableCompanies,
		branches,
		closeCompanyAssignmentConfirm,
		companies,
		errors,
		existingUser,
		isReadonly,
		mode,
		openCompanyAssignmentConfirm,
		pendingCompanyId,
		removeCompanyAssignment,
		selectedCompanyId,
		setSelectedCompanyId,
		submit,
		toggleBranchAssignment,
		updateField,
		values,
		confirmCompanyAssignment: addCompanyAssignment,
	};
}
