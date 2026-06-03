"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
	getMasterTenantAccessHref,
	getMasterTenantAccessViewHref,
} from "@/app/src/constants/master/tenant-access/MasterTenantAccessConstants";
import {
	InitialMasterBranchFormValues,
	InitialMasterCompanyFormValues,
	InitialMasterSubscriberFormValues,
	InitialMasterUserFormValues,
	createMasterBranchFormValues,
	createMasterCompanyFormValues,
	createMasterSubscriberFormValues,
	createMasterUserFormValues,
} from "@/app/src/data/master/tenant-access/MasterTenantAccessData";
import { useMasterTenantAccessStore } from "@/app/src/hooks/master/tenant-access/useMasterTenantAccessStore";
import type {
	MasterBranchFormValues,
	MasterBranchRecord,
	MasterCompanyFormValues,
	MasterCompanyRecord,
	MasterSubscriberFormValues,
	MasterSubscriberRecord,
	MasterTenantAccessActionMode,
	MasterTenantAccessEntity,
	MasterTenantAccessFormErrors,
	MasterTenantAccessFormValues,
	MasterTenantAccessUserRole,
	MasterUserFormValues,
	MasterUserRecord,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";
import {
	validateMasterBranchForm,
	validateMasterCompanyForm,
	validateMasterSubscriberForm,
	validateMasterUserForm,
} from "@/app/src/validations/master/tenant-access/MasterTenantAccessValidation";

type MasterTenantAccessFormUpdate = Partial<
	MasterSubscriberFormValues
> | Partial<MasterCompanyFormValues> | Partial<MasterBranchFormValues> | Partial<MasterUserFormValues>;

type UseMasterTenantAccessFormPageOptions = {
	entity: MasterTenantAccessEntity;
	mode: MasterTenantAccessActionMode;
	recordId?: string;
	returnSource?: "list" | "view";
};

export function useMasterTenantAccessFormPage({
	entity,
	mode,
	recordId,
	returnSource = "list",
}: UseMasterTenantAccessFormPageOptions) {
	const router = useRouter();
	const store = useMasterTenantAccessStore();
	const existingRecord = useMemo(
		() =>
			recordId
				? findMasterTenantAccessRecord({
						branches: store.branches,
						companies: store.companies,
						entity,
						recordId,
						subscribers: store.subscribers,
						users: store.users,
					})
				: undefined,
		[
			entity,
			recordId,
			store.branches,
			store.companies,
			store.subscribers,
			store.users,
		],
	);
	const [values, setValues] = useState<MasterTenantAccessFormValues>(() =>
		createInitialFormValues({
			companies: store.companies,
			entity,
			existingRecord,
			subscribers: store.subscribers,
		}),
	);
	const [errors, setErrors] = useState<MasterTenantAccessFormErrors>({});
	const isReadonly = mode === "view";
	const listHref = getMasterTenantAccessHref(entity);
	const backHref =
		returnSource === "view" && mode === "edit" && recordId
			? getMasterTenantAccessViewHref(entity, recordId)
			: listHref;
	const companiesForSelectedSubscriber = useMemo(() => {
		if (entity !== "user") {
			return store.companies;
		}

		const userValues = values as MasterUserFormValues;

		return store.companies.filter(
			(company) => company.subscriberId === userValues.subscriberId,
		);
	}, [entity, store.companies, values]);
	const activeSubscriberId =
		entity === "subscriber"
			? (existingRecord as MasterSubscriberRecord | undefined)?.id ?? ""
			: "";
	const subscriberCompanies = useMemo(
		() =>
			activeSubscriberId
				? store.companies.filter(
						(company) => company.subscriberId === activeSubscriberId,
					)
				: [],
		[activeSubscriberId, store.companies],
	);
	const subscriberCompanyIds = useMemo(
		() => new Set(subscriberCompanies.map((company) => company.id)),
		[subscriberCompanies],
	);
	const subscriberBranches = useMemo(
		() =>
			store.branches.filter((branch) =>
				subscriberCompanyIds.has(branch.companyId),
			),
		[store.branches, subscriberCompanyIds],
	);
	const subscriberUsers = useMemo(
		() =>
			activeSubscriberId
				? store.users.filter((user) => user.subscriberId === activeSubscriberId)
				: [],
		[activeSubscriberId, store.users],
	);
	const [subscriberCompanyDraft, setSubscriberCompanyDraft] =
		useState<MasterCompanyFormValues>(() => ({
			...InitialMasterCompanyFormValues,
			subscriberId: activeSubscriberId,
		}));
	const [subscriberCompanyErrors, setSubscriberCompanyErrors] =
		useState<MasterTenantAccessFormErrors>({});
	const [subscriberBranchDrafts, setSubscriberBranchDrafts] = useState<
		Record<string, MasterBranchFormValues>
	>({});
	const [subscriberBranchErrors, setSubscriberBranchErrors] = useState<
		Record<string, MasterTenantAccessFormErrors>
	>({});
	const [subscriberUserDraft, setSubscriberUserDraft] =
		useState<MasterUserFormValues>(() => ({
			...InitialMasterUserFormValues,
			subscriberId: activeSubscriberId,
		}));
	const [subscriberUserErrors, setSubscriberUserErrors] =
		useState<MasterTenantAccessFormErrors>({});
	const subscriberUserCompanyId =
		subscriberUserDraft.assignments[0]?.companyId ??
		subscriberCompanies[0]?.id ??
		"";
	const subscriberUserBranches = useMemo(
		() =>
			store.branches.filter(
				(branch) => branch.companyId === subscriberUserCompanyId,
			),
		[store.branches, subscriberUserCompanyId],
	);

	function updateValues(updates: MasterTenantAccessFormUpdate) {
		if (isReadonly) {
			return;
		}

		setValues(
			(current) =>
				({
					...current,
					...updates,
				}) as MasterTenantAccessFormValues,
		);
		setErrors((current) =>
			Object.keys(updates).reduce<MasterTenantAccessFormErrors>(
				(nextErrors, field) => {
					delete nextErrors[field];

					return nextErrors;
				},
				{ ...current },
			),
		);
	}

	function validate() {
		const nextErrors = validateMasterTenantForm(entity, values);

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	}

	function saveRecord() {
		if (isReadonly || !validate()) {
			return;
		}

		const savedRecordId =
			mode === "add"
				? createRecord(entity, values, store)
				: updateRecord(entity, recordId, values, store);

		if (!savedRecordId) {
			return;
		}

		toast.success(
			mode === "add" ? "Master record created." : "Master record updated.",
		);
		router.push(
			mode === "add"
				? getMasterTenantAccessViewHref(entity, savedRecordId)
				: backHref,
		);
	}

	function setUserSubscriber(subscriberId: string) {
		if (entity !== "user") {
			return;
		}

		const allowedCompanyIds = new Set(
			store.companies
				.filter((company) => company.subscriberId === subscriberId)
				.map((company) => company.id),
		);
		const userValues = values as MasterUserFormValues;

		updateValues({
			assignments: userValues.assignments.filter((assignment) =>
				allowedCompanyIds.has(assignment.companyId),
			),
			subscriberId,
		});
	}

	function addUserAssignment(companyId: string) {
		if (entity !== "user") {
			return;
		}

		const userValues = values as MasterUserFormValues;

		if (userValues.assignments.some((assignment) => assignment.companyId === companyId)) {
			return;
		}

		const firstBranch = store.branches.find(
			(branch) => branch.companyId === companyId,
		);

		updateValues({
			assignments: [
				...userValues.assignments,
				{
					branchIds: firstBranch ? [firstBranch.id] : [],
					companyId,
					role: "Company Admin",
				},
			],
		});
	}

	function removeUserAssignment(companyId: string) {
		if (entity !== "user") {
			return;
		}

		const userValues = values as MasterUserFormValues;

		updateValues({
			assignments: userValues.assignments.filter(
				(assignment) => assignment.companyId !== companyId,
			),
		});
	}

	function toggleUserAssignmentBranch(companyId: string, branchId: string) {
		if (entity !== "user") {
			return;
		}

		const userValues = values as MasterUserFormValues;

		updateValues({
			assignments: userValues.assignments.map((assignment) => {
				if (assignment.companyId !== companyId) {
					return assignment;
				}

				const hasBranch = assignment.branchIds.includes(branchId);

				return {
					...assignment,
					branchIds: hasBranch
						? assignment.branchIds.filter((currentBranchId) => currentBranchId !== branchId)
						: [...assignment.branchIds, branchId],
				};
			}),
		});
	}

	function updateUserAssignmentRole(
		companyId: string,
		role: MasterTenantAccessUserRole,
	) {
		if (entity !== "user") {
			return;
		}

		const userValues = values as MasterUserFormValues;

		updateValues({
			assignments: userValues.assignments.map((assignment) =>
				assignment.companyId === companyId
					? { ...assignment, role }
					: assignment,
			),
		});
	}

	function updateSubscriberCompanyDraft(
		updates: Partial<MasterCompanyFormValues>,
	) {
		if (entity !== "subscriber" || isReadonly) {
			return;
		}

		setSubscriberCompanyDraft((current) => ({
			...current,
			...updates,
			subscriberId: activeSubscriberId,
		}));
		setSubscriberCompanyErrors((current) =>
			removeErrorKeys(current, Object.keys(updates)),
		);
	}

	function addSubscriberCompany() {
		if (entity !== "subscriber" || isReadonly || !activeSubscriberId) {
			return;
		}

		const nextValues = {
			...subscriberCompanyDraft,
			subscriberId: activeSubscriberId,
		};
		const nextErrors = validateMasterCompanyForm(nextValues);

		setSubscriberCompanyErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		store.createCompany(nextValues);
		setSubscriberCompanyDraft({
			...InitialMasterCompanyFormValues,
			subscriberId: activeSubscriberId,
		});
		setSubscriberCompanyErrors({});
		toast.success("Company added.");
	}

	function getSubscriberBranchDraft(companyId: string) {
		return (
			subscriberBranchDrafts[companyId] ?? {
				...InitialMasterBranchFormValues,
				companyId,
				status: getCompanyStatus(companyId, store.companies),
			}
		);
	}

	function updateSubscriberBranchDraft(
		companyId: string,
		updates: Partial<MasterBranchFormValues>,
	) {
		if (entity !== "subscriber" || isReadonly) {
			return;
		}

		setSubscriberBranchDrafts((current) => ({
			...current,
			[companyId]: {
				...getSubscriberBranchDraft(companyId),
				...updates,
				companyId,
			},
		}));
		setSubscriberBranchErrors((current) => ({
			...current,
			[companyId]: removeErrorKeys(
				current[companyId] ?? {},
				Object.keys(updates),
			),
		}));
	}

	function addSubscriberBranch(companyId: string) {
		if (entity !== "subscriber" || isReadonly) {
			return;
		}

		const nextValues = {
			...getSubscriberBranchDraft(companyId),
			companyId,
		};
		const nextErrors = validateMasterBranchForm(nextValues);

		setSubscriberBranchErrors((current) => ({
			...current,
			[companyId]: nextErrors,
		}));

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		store.createBranch(nextValues);
		setSubscriberBranchDrafts((current) => ({
			...current,
			[companyId]: {
				...InitialMasterBranchFormValues,
				companyId,
				status: getCompanyStatus(companyId, store.companies),
			},
		}));
		toast.success("Branch added.");
	}

	function updateSubscriberUserDraft(updates: Partial<MasterUserFormValues>) {
		if (entity !== "subscriber" || isReadonly) {
			return;
		}

		setSubscriberUserDraft((current) => ({
			...current,
			...updates,
			subscriberId: activeSubscriberId,
		}));
		setSubscriberUserErrors((current) =>
			removeErrorKeys(current, Object.keys(updates)),
		);
	}

	function updateSubscriberUserCompany(companyId: string) {
		const firstBranch = store.branches.find(
			(branch) => branch.companyId === companyId,
		);

		updateSubscriberUserDraft({
			assignments: companyId
				? [
						{
							branchIds: firstBranch ? [firstBranch.id] : [],
							companyId,
							role: "Company Admin",
						},
					]
				: [],
		});
	}

	function updateSubscriberUserRole(role: MasterTenantAccessUserRole) {
		const assignment = createSubscriberUserAssignment();

		updateSubscriberUserDraft({
			assignments: assignment
				? [
						{
							...assignment,
							role,
						},
					]
				: [],
		});
	}

	function toggleSubscriberUserBranch(branchId: string) {
		if (entity !== "subscriber" || isReadonly) {
			return;
		}

		const assignment = createSubscriberUserAssignment();

		if (!assignment) {
			return;
		}

		const hasBranch = assignment.branchIds.includes(branchId);

		setSubscriberUserDraft((current) => ({
			...current,
			assignments: [
				{
					...assignment,
					branchIds: hasBranch
						? assignment.branchIds.filter(
								(currentBranchId) => currentBranchId !== branchId,
							)
						: [...assignment.branchIds, branchId],
				},
			],
			subscriberId: activeSubscriberId,
		}));
		setSubscriberUserErrors((current) =>
			removeErrorKeys(current, ["assignments"]),
		);
	}

	function addSubscriberUser() {
		if (entity !== "subscriber" || isReadonly || !activeSubscriberId) {
			return;
		}

		const assignment = createSubscriberUserAssignment();
		const nextValues = {
			...subscriberUserDraft,
			assignments: assignment ? [assignment] : [],
			subscriberId: activeSubscriberId,
		};
		const nextErrors = validateMasterUserForm(nextValues);

		setSubscriberUserErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		store.createUser(nextValues);
		setSubscriberUserDraft({
			...InitialMasterUserFormValues,
			subscriberId: activeSubscriberId,
		});
		setSubscriberUserErrors({});
		toast.success("User added.");
	}

	function createSubscriberUserAssignment() {
		const existingAssignment = subscriberUserDraft.assignments[0];

		if (existingAssignment) {
			return existingAssignment;
		}

		if (!subscriberUserCompanyId) {
			return null;
		}

		const firstBranch = store.branches.find(
			(branch) => branch.companyId === subscriberUserCompanyId,
		);

		return {
			branchIds: firstBranch ? [firstBranch.id] : [],
			companyId: subscriberUserCompanyId,
			role: "Company Admin" as const,
		};
	}

	return {
		addSubscriberBranch,
		addSubscriberCompany,
		addSubscriberUser,
		addUserAssignment,
		backHref,
		branches: store.branches,
		companies: store.companies,
		companiesForSelectedSubscriber,
		entity,
		errors,
		existingRecord,
		getSubscriberBranchDraft,
		isMissingRecord: mode !== "add" && !existingRecord,
		isReadonly,
		listHref,
		mode,
		removeUserAssignment,
		saveRecord,
		setUserSubscriber,
		subscriberBranchErrors,
		subscriberBranches,
		subscriberCompanies,
		subscriberCompanyDraft,
		subscriberCompanyErrors,
		subscriberUserBranches,
		subscriberUserCompanyId,
		subscriberUserDraft,
		subscriberUserErrors,
		subscriberUsers,
		subscribers: store.subscribers,
		toggleSubscriberUserBranch,
		toggleUserAssignmentBranch,
		updateSubscriberBranchDraft,
		updateSubscriberCompanyDraft,
		updateSubscriberUserCompany,
		updateSubscriberUserDraft,
		updateSubscriberUserRole,
		updateUserAssignmentRole,
		updateValues,
		values,
	};
}

function validateMasterTenantForm(
	entity: MasterTenantAccessEntity,
	values: MasterTenantAccessFormValues,
) {
	switch (entity) {
		case "subscriber":
			return validateMasterSubscriberForm(
				values as MasterSubscriberFormValues,
			);
		case "company":
			return validateMasterCompanyForm(values as MasterCompanyFormValues);
		case "branch":
			return validateMasterBranchForm(values as MasterBranchFormValues);
		case "user":
			return validateMasterUserForm(values as MasterUserFormValues);
	}
}

function createRecord(
	entity: MasterTenantAccessEntity,
	values: MasterTenantAccessFormValues,
	store: ReturnType<typeof useMasterTenantAccessStore.getState>,
) {
	switch (entity) {
		case "subscriber":
			return store.createSubscriber(values as MasterSubscriberFormValues);
		case "company":
			return store.createCompany(values as MasterCompanyFormValues);
		case "branch":
			return store.createBranch(values as MasterBranchFormValues);
		case "user":
			return store.createUser(values as MasterUserFormValues);
	}
}

function updateRecord(
	entity: MasterTenantAccessEntity,
	recordId: string | undefined,
	values: MasterTenantAccessFormValues,
	store: ReturnType<typeof useMasterTenantAccessStore.getState>,
) {
	if (!recordId) {
		return "";
	}

	switch (entity) {
		case "subscriber":
			store.updateSubscriber(recordId, values as MasterSubscriberFormValues);
			break;
		case "company":
			store.updateCompany(recordId, values as MasterCompanyFormValues);
			break;
		case "branch":
			store.updateBranch(recordId, values as MasterBranchFormValues);
			break;
		case "user":
			store.updateUser(recordId, values as MasterUserFormValues);
			break;
	}

	return recordId;
}

function createInitialFormValues({
	companies,
	entity,
	existingRecord,
	subscribers,
}: {
	companies: MasterCompanyRecord[];
	entity: MasterTenantAccessEntity;
	existingRecord:
		| MasterBranchRecord
		| MasterCompanyRecord
		| MasterSubscriberRecord
		| MasterUserRecord
		| undefined;
	subscribers: MasterSubscriberRecord[];
}): MasterTenantAccessFormValues {
	switch (entity) {
		case "subscriber":
			return existingRecord
				? createMasterSubscriberFormValues(
						existingRecord as MasterSubscriberRecord,
					)
				: InitialMasterSubscriberFormValues;
		case "company":
			return existingRecord
				? createMasterCompanyFormValues(existingRecord as MasterCompanyRecord)
				: {
						...InitialMasterCompanyFormValues,
						subscriberId: subscribers[0]?.id ?? "",
					};
		case "branch":
			return existingRecord
				? createMasterBranchFormValues(existingRecord as MasterBranchRecord)
				: {
						...InitialMasterBranchFormValues,
						companyId: companies[0]?.id ?? "",
					};
		case "user":
			return existingRecord
				? createMasterUserFormValues(existingRecord as MasterUserRecord)
				: {
						...InitialMasterUserFormValues,
						subscriberId: subscribers[0]?.id ?? "",
					};
	}
}

function findMasterTenantAccessRecord({
	branches,
	companies,
	entity,
	recordId,
	subscribers,
	users,
}: {
	branches: MasterBranchRecord[];
	companies: MasterCompanyRecord[];
	entity: MasterTenantAccessEntity;
	recordId: string;
	subscribers: MasterSubscriberRecord[];
	users: MasterUserRecord[];
}) {
	switch (entity) {
		case "subscriber":
			return subscribers.find((subscriber) => subscriber.id === recordId);
		case "company":
			return companies.find((company) => company.id === recordId);
		case "branch":
			return branches.find((branch) => branch.id === recordId);
		case "user":
			return users.find((user) => user.id === recordId);
	}
}

function removeErrorKeys(
	errors: MasterTenantAccessFormErrors,
	fields: string[],
) {
	const nextErrors = { ...errors };

	for (const field of fields) {
		delete nextErrors[field];
	}

	return nextErrors;
}

function getCompanyStatus(
	companyId: string,
	companies: MasterCompanyRecord[],
) {
	return (
		companies.find((company) => company.id === companyId)?.status ??
		InitialMasterBranchFormValues.status
	);
}
