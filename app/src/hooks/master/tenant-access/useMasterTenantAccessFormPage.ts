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
	MasterSubscriberFormValues &
		MasterCompanyFormValues &
		MasterBranchFormValues &
		MasterUserFormValues
>;

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

	return {
		addUserAssignment,
		backHref,
		branches: store.branches,
		companies: store.companies,
		companiesForSelectedSubscriber,
		entity,
		errors,
		existingRecord,
		isMissingRecord: mode !== "add" && !existingRecord,
		isReadonly,
		listHref,
		mode,
		removeUserAssignment,
		saveRecord,
		setUserSubscriber,
		subscribers: store.subscribers,
		toggleUserAssignmentBranch,
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
						companies,
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
