"use client";

import { create } from "zustand";
import {
	InitialMasterBranchFormValues,
	InitialMasterCompanyFormValues,
	InitialMasterSubscriberFormValues,
	InitialMasterUserFormValues,
	MasterTenantAccessBranches,
	MasterTenantAccessCompanies,
	MasterTenantAccessSubscribers,
	MasterTenantAccessUsers,
	createMasterTenantAccessRecordId,
} from "@/app/src/data/master/tenant-access/MasterTenantAccessData";
import type {
	MasterBranchFormValues,
	MasterBranchRecord,
	MasterCompanyFormValues,
	MasterCompanyRecord,
	MasterSubscriberFormValues,
	MasterSubscriberRecord,
	MasterUserFormValues,
	MasterUserRecord,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";

type MasterTenantAccessStoreState = {
	branches: MasterBranchRecord[];
	companies: MasterCompanyRecord[];
	subscribers: MasterSubscriberRecord[];
	users: MasterUserRecord[];
	createBranch: (values: MasterBranchFormValues) => string;
	createCompany: (values: MasterCompanyFormValues) => string;
	createSubscriber: (values: MasterSubscriberFormValues) => string;
	createUser: (values: MasterUserFormValues) => string;
	updateBranch: (recordId: string, values: MasterBranchFormValues) => void;
	updateCompany: (recordId: string, values: MasterCompanyFormValues) => void;
	updateSubscriber: (
		recordId: string,
		values: MasterSubscriberFormValues,
	) => void;
	updateUser: (recordId: string, values: MasterUserFormValues) => void;
};

export const useMasterTenantAccessStore =
	create<MasterTenantAccessStoreState>((set, get) => ({
		branches: MasterTenantAccessBranches,
		companies: MasterTenantAccessCompanies,
		subscribers: MasterTenantAccessSubscribers,
		users: MasterTenantAccessUsers,
		createBranch: (values) => {
			const state = get();
			const branchId = createMasterTenantAccessRecordId("br", values.name);
			const branch: MasterBranchRecord = {
				...createBranchRecord({
					branchId,
					code: createNextCode("BR", state.branches.length + 1),
					values,
				}),
			};

			set({ branches: [branch, ...state.branches] });

			return branchId;
		},
		createCompany: (values) => {
			const state = get();
			const companyId = createMasterTenantAccessRecordId(
				"cmp",
				values.legalName,
			);
			const company: MasterCompanyRecord = {
				address: values.address.trim(),
				code: createNextCode("CMP", state.companies.length + 1),
				contactNumber: values.contactNumber.trim(),
				createdAt: getToday(),
				defaultBranchName: values.defaultBranchName.trim() || "Head Office",
				email: values.email.trim(),
				id: companyId,
				legalName: values.legalName.trim(),
				planName: values.planName,
				status: values.status,
				subscriberId: values.subscriberId,
				taxId: values.taxId.trim(),
				tradeName: values.tradeName.trim() || values.legalName.trim(),
			};
			const branchId = createMasterTenantAccessRecordId(
				"br",
				company.defaultBranchName,
			);
			const branch = createBranchRecord({
				branchId,
				code: createNextCode("BR", state.branches.length + 1),
				values: {
					...InitialMasterBranchFormValues,
					address: values.address,
					branchType: "Head Office",
					companyId,
					contactNumber: values.contactNumber,
					email: values.email,
					isMain: true,
					name: company.defaultBranchName,
					status: values.status,
					tin: values.taxId,
				},
			});

			set({
				branches: [branch, ...state.branches],
				companies: [company, ...state.companies],
			});

			return companyId;
		},
		createSubscriber: (values) => {
			const state = get();
			const subscriberId = createMasterTenantAccessRecordId("sub", values.name);
			const subscriber: MasterSubscriberRecord = {
				code: createNextCode("SUB", state.subscribers.length + 1),
				contactNumber: values.contactNumber.trim(),
				createdAt: getToday(),
				id: subscriberId,
				name: values.name.trim(),
				notes: values.notes.trim(),
				ownerEmail: values.ownerEmail.trim(),
				ownerName: values.ownerName.trim(),
				status: values.status,
			};

			set({
				subscribers: [subscriber, ...state.subscribers],
			});

			return subscriberId;
		},
		createUser: (values) => {
			const state = get();
			const userId = createMasterTenantAccessRecordId("usr", values.name);
			const user: MasterUserRecord = {
				assignments: values.assignments.map((assignment) => ({
					...assignment,
					branchIds: [...assignment.branchIds],
				})),
				contactNumber: values.contactNumber.trim(),
				email: values.email.trim(),
				id: userId,
				lastLogin: "",
				name: values.name.trim(),
				status: values.status,
				subscriberId: values.subscriberId,
			};

			set({ users: [user, ...state.users] });

			return userId;
		},
		updateBranch: (recordId, values) => {
			set((state) => ({
				branches: state.branches.map((branch) =>
					branch.id === recordId
						? createBranchRecord({
								branchId: branch.id,
								code: branch.code,
								values,
							})
						: branch,
				),
			}));
		},
		updateCompany: (recordId, values) => {
			set((state) => ({
				companies: state.companies.map((company) =>
					company.id === recordId
						? {
								...company,
								address: values.address.trim(),
								contactNumber: values.contactNumber.trim(),
								defaultBranchName:
									values.defaultBranchName.trim() || "Head Office",
								email: values.email.trim(),
								legalName: values.legalName.trim(),
								planName: values.planName,
								status: values.status,
								subscriberId: values.subscriberId,
								taxId: values.taxId.trim(),
								tradeName:
									values.tradeName.trim() || values.legalName.trim(),
							}
						: company,
				),
			}));
		},
		updateSubscriber: (recordId, values) => {
			set((state) => ({
				subscribers: state.subscribers.map((current) =>
					current.id === recordId
						? {
								...current,
								contactNumber: values.contactNumber.trim(),
								name: values.name.trim(),
								notes: values.notes.trim(),
								ownerEmail: values.ownerEmail.trim(),
								ownerName: values.ownerName.trim(),
								status: values.status,
							}
						: current,
				),
			}));
		},
		updateUser: (recordId, values) => {
			set((state) => ({
				users: state.users.map((user) =>
					user.id === recordId
						? {
								...user,
								assignments: values.assignments.map((assignment) => ({
									...assignment,
									branchIds: [...assignment.branchIds],
								})),
								contactNumber: values.contactNumber.trim(),
								email: values.email.trim(),
								name: values.name.trim(),
								status: values.status,
								subscriberId: values.subscriberId,
							}
						: user,
				),
			}));
		},
	}));

export function createMasterTenantInitialFormValues() {
	return {
		branch: InitialMasterBranchFormValues,
		company: InitialMasterCompanyFormValues,
		subscriber: InitialMasterSubscriberFormValues,
		user: InitialMasterUserFormValues,
	};
}

function createBranchRecord({
	branchId,
	code,
	values,
}: {
	branchId: string;
	code: string;
	values: MasterBranchFormValues;
}): MasterBranchRecord {
	return {
		address: values.address.trim(),
		branchType: values.branchType,
		code,
		companyId: values.companyId,
		contactNumber: values.contactNumber.trim(),
		email: values.email.trim(),
		id: branchId,
		isMain: values.isMain,
		linkedMainBranchId: values.linkedMainBranchId,
		name: values.name.trim(),
		status: values.status,
		tin: values.tin.trim(),
	};
}

function createNextCode(prefix: string, nextNumber: number) {
	return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

function getToday() {
	return new Date().toISOString().slice(0, 10);
}
