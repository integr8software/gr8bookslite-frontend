"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	WorkspaceCompaniesHref,
	WorkspaceCompanyEditFromParam,
	WorkspaceCompanyEditFromViewValue,
	getWorkspaceCompanyBranchUsersHref,
	getWorkspaceCompanyBranchesHref,
	getWorkspaceCompanyHref,
	getWorkspaceCompanyUsersHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	InitialWorkspaceBranchUserFormValues,
	InitialWorkspaceCompanyBranchFormValues,
	InitialWorkspaceCompanyFormValues,
	InitialWorkspaceCompanyUserFormValues,
	createWorkspaceBranchUserFormValues,
	createWorkspaceBranchUserFromForm,
	createWorkspaceCompanyBranchFormValues,
	createWorkspaceCompanyBranchFromForm,
	createWorkspaceCompanyFormValues,
	createWorkspaceCompanyFromForm,
	createWorkspaceCompanyUserFormValues,
	createWorkspaceCompanyUserFromForm,
	getNextWorkspaceCompanyStatus,
	updateWorkspaceBranchUserFromForm,
	updateWorkspaceCompanyBranchFromForm,
	updateWorkspaceCompanyFromForm,
	updateWorkspaceCompanyUserFromForm,
	validateWorkspaceBranchUserForm,
	validateWorkspaceCompanyBranchForm,
	validateWorkspaceCompanyForm,
	validateWorkspaceCompanyUserForm,
} from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { FormatPhilippineContactNumber } from "@/app/src/data/shared/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/TaxData";
import type {
	WorkspaceBranchUserFormErrors,
	WorkspaceBranchUserFormValues,
	WorkspaceCompanyActionMode,
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";

export function useWorkspaceCompanyAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ companyId?: string }>();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const addCompany = useWorkspaceCompanyManagementStore(
		(state) => state.addCompany,
	);
	const updateCompany = useWorkspaceCompanyManagementStore(
		(state) => state.updateCompany,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const mode: WorkspaceCompanyActionMode = pathname.includes("/edit")
		? "edit"
		: "add";
	const existingCompany = companies.find(
		(company) => company.id === params.companyId,
	);
	const [values, setValues] = useState<WorkspaceCompanyFormValues>(() =>
		existingCompany
			? createWorkspaceCompanyFormValues(existingCompany)
			: InitialWorkspaceCompanyFormValues,
	);
	const [errors, setErrors] = useState<WorkspaceCompanyFormErrors>({});
	const companyHref = existingCompany
		? getWorkspaceCompanyHref(existingCompany.id)
		: WorkspaceCompaniesHref;
	const cancelHref = mode === "edit" ? companyHref : WorkspaceCompaniesHref;

	function updateField(field: keyof WorkspaceCompanyFormValues, value: string) {
		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const value =
			event.target.name === "contactNumber"
				? FormatPhilippineContactNumber(event.target.value)
				: event.target.value;

		updateField(event.target.name as keyof WorkspaceCompanyFormValues, value);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateWorkspaceCompanyForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingCompany) {
			updateCompany(updateWorkspaceCompanyFromForm(existingCompany, values));
			router.push(companyHref);
			return;
		}

		addCompany(createWorkspaceCompanyFromForm(values));
		router.push(WorkspaceCompaniesHref);
	}

	return {
		cancelHref,
		errors,
		existingCompany,
		handleInputChange,
		handleSubmit,
		isMutating,
		mode,
		needsRecord: mode === "edit",
		updateField,
		values,
	};
}

export function useWorkspaceCompanyUserAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ companyId?: string; userId?: string }>();
	const searchParams = useSearchParams();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const addCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.addCompanyUser,
	);
	const updateCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.updateCompanyUser,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const mode = getActionMode(pathname);
	const company = companies.find((record) => record.id === params.companyId);
	const existingUser = users.find(
		(user) =>
			user.companyId === params.companyId && user.id === params.userId,
	);
	const isReadonly = mode === "view";
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(WorkspaceCompanyEditFromParam) ===
			WorkspaceCompanyEditFromViewValue;
	const listHref = params.companyId
		? getWorkspaceCompanyUsersHref(params.companyId)
		: WorkspaceCompaniesHref;
	const viewHref =
		params.companyId && existingUser
			? `${listHref}/view/${existingUser.id}`
			: listHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : listHref;
	const editHref =
		params.companyId && existingUser
			? `${listHref}/edit/${existingUser.id}?${WorkspaceCompanyEditFromParam}=${WorkspaceCompanyEditFromViewValue}`
			: undefined;
	const [values, setValues] = useState<WorkspaceCompanyUserFormValues>(() =>
		existingUser
			? createWorkspaceCompanyUserFormValues(existingUser)
			: InitialWorkspaceCompanyUserFormValues,
	);
	const [errors, setErrors] = useState<WorkspaceCompanyUserFormErrors>({});

	function updateField(
		field: keyof WorkspaceCompanyUserFormValues,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const value =
			event.target.name === "contactNumber"
				? FormatPhilippineContactNumber(event.target.value)
				: event.target.value;

		updateField(
			event.target.name as keyof WorkspaceCompanyUserFormValues,
			value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateWorkspaceCompanyUserForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingUser) {
			updateCompanyUser(
				updateWorkspaceCompanyUserFromForm(existingUser, values),
			);
			router.push(wasOpenedFromView ? viewHref : listHref);
			return;
		}

		if (params.companyId) {
			addCompanyUser(
				createWorkspaceCompanyUserFromForm(params.companyId, values),
			);
		}

		router.push(listHref);
	}

	function handleStatusChange() {
		if (!existingUser) {
			return;
		}

		updateCompanyUser({
			...existingUser,
			status: getNextWorkspaceCompanyStatus(existingUser.status),
		});
	}

	return {
		cancelHref,
		company,
		editHref,
		errors,
		existingUser,
		handleInputChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		listHref,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		updateField,
		values,
	};
}

export function useWorkspaceCompanyBranchAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ branchId?: string; companyId?: string }>();
	const searchParams = useSearchParams();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const addBranch = useWorkspaceCompanyManagementStore(
		(state) => state.addBranch,
	);
	const updateBranch = useWorkspaceCompanyManagementStore(
		(state) => state.updateBranch,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const mode = getActionMode(pathname);
	const company = companies.find((record) => record.id === params.companyId);
	const existingBranch = branches.find(
		(branch) =>
			branch.companyId === params.companyId &&
			branch.id === params.branchId,
	);
	const isReadonly = mode === "view";
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(WorkspaceCompanyEditFromParam) ===
			WorkspaceCompanyEditFromViewValue;
	const listHref = params.companyId
		? getWorkspaceCompanyBranchesHref(params.companyId)
		: WorkspaceCompaniesHref;
	const viewHref =
		params.companyId && existingBranch
			? `${listHref}/view/${existingBranch.id}`
			: listHref;
	const usersHref =
		params.companyId && existingBranch
			? getWorkspaceCompanyBranchUsersHref(
					params.companyId,
					existingBranch.id,
				)
			: undefined;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : listHref;
	const editHref =
		params.companyId && existingBranch
			? `${listHref}/edit/${existingBranch.id}?${WorkspaceCompanyEditFromParam}=${WorkspaceCompanyEditFromViewValue}`
			: undefined;
	const [values, setValues] = useState<WorkspaceCompanyBranchFormValues>(() =>
		existingBranch
			? createWorkspaceCompanyBranchFormValues(existingBranch)
			: InitialWorkspaceCompanyBranchFormValues,
	);
	const [errors, setErrors] = useState<WorkspaceCompanyBranchFormErrors>({});

	function updateField(
		field: keyof WorkspaceCompanyBranchFormValues,
		value: string,
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const value =
			event.target.name === "contactNumber"
				? FormatPhilippineContactNumber(event.target.value)
				: event.target.name === "tin"
					? FormatTinNumber(event.target.value)
					: event.target.value;

		updateField(
			event.target.name as keyof WorkspaceCompanyBranchFormValues,
			value,
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateWorkspaceCompanyBranchForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingBranch) {
			updateBranch(
				updateWorkspaceCompanyBranchFromForm(existingBranch, values),
			);
			router.push(wasOpenedFromView ? viewHref : listHref);
			return;
		}

		if (params.companyId) {
			addBranch(createWorkspaceCompanyBranchFromForm(params.companyId, values));
		}

		router.push(listHref);
	}

	function handleStatusChange() {
		if (!existingBranch) {
			return;
		}

		updateBranch({
			...existingBranch,
			status: getNextWorkspaceCompanyStatus(existingBranch.status),
		});
	}

	return {
		cancelHref,
		company,
		editHref,
		errors,
		existingBranch,
		handleInputChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		listHref,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		updateField,
		usersHref,
		values,
	};
}

export function useWorkspaceBranchUserAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{
		assignmentId?: string;
		branchId?: string;
		companyId?: string;
	}>();
	const searchParams = useSearchParams();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const branchUsers = useWorkspaceCompanyManagementStore(
		(state) => state.branchUsers,
	);
	const addBranchUser = useWorkspaceCompanyManagementStore(
		(state) => state.addBranchUser,
	);
	const updateBranchUser = useWorkspaceCompanyManagementStore(
		(state) => state.updateBranchUser,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const mode = getActionMode(pathname);
	const company = companies.find((record) => record.id === params.companyId);
	const branch = branches.find(
		(record) =>
			record.companyId === params.companyId &&
			record.id === params.branchId,
	);
	const existingUser = branchUsers.find(
		(user) =>
			user.companyId === params.companyId &&
			user.branchId === params.branchId &&
			user.id === params.assignmentId,
	);
	const isReadonly = mode === "view";
	const wasOpenedFromView =
		mode === "edit" &&
		searchParams.get(WorkspaceCompanyEditFromParam) ===
			WorkspaceCompanyEditFromViewValue;
	const listHref =
		params.companyId && params.branchId
			? getWorkspaceCompanyBranchUsersHref(params.companyId, params.branchId)
			: WorkspaceCompaniesHref;
	const branchHref =
		params.companyId && params.branchId
			? `${getWorkspaceCompanyBranchesHref(params.companyId)}/view/${params.branchId}`
			: WorkspaceCompaniesHref;
	const viewHref =
		existingUser && listHref !== WorkspaceCompaniesHref
			? `${listHref}/view/${existingUser.id}`
			: listHref;
	const cancelHref =
		mode === "edit" && wasOpenedFromView ? viewHref : listHref;
	const editHref =
		existingUser && listHref !== WorkspaceCompaniesHref
			? `${listHref}/edit/${existingUser.id}?${WorkspaceCompanyEditFromParam}=${WorkspaceCompanyEditFromViewValue}`
			: undefined;
	const [values, setValues] = useState<WorkspaceBranchUserFormValues>(() =>
		existingUser
			? createWorkspaceBranchUserFormValues(existingUser)
			: InitialWorkspaceBranchUserFormValues,
	);
	const [errors, setErrors] = useState<WorkspaceBranchUserFormErrors>({});

	function updateField(field: keyof WorkspaceBranchUserFormValues, value: string) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) {
		const value =
			event.target.name === "contactNumber"
				? FormatPhilippineContactNumber(event.target.value)
				: event.target.value;

		updateField(event.target.name as keyof WorkspaceBranchUserFormValues, value);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateWorkspaceBranchUserForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		if (mode === "edit" && existingUser) {
			updateBranchUser(updateWorkspaceBranchUserFromForm(existingUser, values));
			router.push(wasOpenedFromView ? viewHref : listHref);
			return;
		}

		if (params.companyId && params.branchId) {
			addBranchUser(
				createWorkspaceBranchUserFromForm(
					params.companyId,
					params.branchId,
					values,
				),
			);
		}

		router.push(listHref);
	}

	function handleStatusChange() {
		if (!existingUser) {
			return;
		}

		updateBranchUser({
			...existingUser,
			status: getNextWorkspaceCompanyStatus(existingUser.status),
		});
	}

	return {
		branch,
		branchHref,
		cancelHref,
		company,
		editHref,
		errors,
		existingUser,
		handleInputChange,
		handleStatusChange,
		handleSubmit,
		isMutating,
		isReadonly,
		listHref,
		mode,
		needsRecord: mode === "edit" || mode === "view",
		updateField,
		values,
	};
}

function getActionMode(pathname: string): WorkspaceCompanyActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";
	return "add";
}
