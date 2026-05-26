"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	MockItems,
	MockItemSetupRecords,
} from "@/app/src/data/modules/maintenance/item-management/ItemManagementData";
import { ItemManagementQueryKeys } from "@/app/src/services/modules/maintenance/item-management/ItemManagementQueryKeys";
import type {
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemManagementStoreState = {
	items: ItemRecord[];
	addItem: (item: ItemRecord) => void;
	updateItem: (item: ItemRecord) => void;
	deleteItem: (itemId: string) => void;
	getSetupRecords: (kind: ItemSetupKind) => ItemSetupRecord[];
	addSetupRecord: (kind: ItemSetupKind, record: ItemSetupRecord) => void;
	updateSetupRecord: (kind: ItemSetupKind, record: ItemSetupRecord) => void;
	deleteSetupRecord: (kind: ItemSetupKind, recordId: string) => void;
	isLoading: boolean;
	isMutating: boolean;
};

export function useItemManagementStore<TSelected = ItemManagementStoreState>(
	selector?: (state: ItemManagementStoreState) => TSelected,
) {
	const queryClient = useQueryClient();
	const itemsQuery = useQuery({
		queryKey: ItemManagementQueryKeys.items(),
		queryFn: async () => MockItems,
		initialData: MockItems,
	});
	const setupQueries = {
		category: useQuery({
			queryKey: ItemManagementQueryKeys.setupRecords("category"),
			queryFn: async () => MockItemSetupRecords.category,
			initialData: MockItemSetupRecords.category,
		}),
		subcategory: useQuery({
			queryKey: ItemManagementQueryKeys.setupRecords("subcategory"),
			queryFn: async () => MockItemSetupRecords.subcategory,
			initialData: MockItemSetupRecords.subcategory,
		}),
		type: useQuery({
			queryKey: ItemManagementQueryKeys.setupRecords("type"),
			queryFn: async () => MockItemSetupRecords.type,
			initialData: MockItemSetupRecords.type,
		}),
		subtype: useQuery({
			queryKey: ItemManagementQueryKeys.setupRecords("subtype"),
			queryFn: async () => MockItemSetupRecords.subtype,
			initialData: MockItemSetupRecords.subtype,
		}),
	};

	function updateCachedItems(updater: (items: ItemRecord[]) => ItemRecord[]) {
		queryClient.setQueryData<ItemRecord[]>(
			ItemManagementQueryKeys.items(),
			(currentItems = MockItems) => updater(currentItems),
		);
	}

	function updateCachedSetupRecords(
		kind: ItemSetupKind,
		updater: (records: ItemSetupRecord[]) => ItemSetupRecord[],
	) {
		queryClient.setQueryData<ItemSetupRecord[]>(
			ItemManagementQueryKeys.setupRecords(kind),
			(currentRecords = MockItemSetupRecords[kind]) => updater(currentRecords),
		);
	}

	const addItemMutation = useMutation({
		mutationFn: async (item: ItemRecord) => item,
		onSuccess: (item) => {
			updateCachedItems((items) => [...items, item]);
			toast.success("Item created.");
		},
	});

	const updateItemMutation = useMutation({
		mutationFn: async (item: ItemRecord) => item,
		onSuccess: (item) => {
			updateCachedItems((items) =>
				items.map((currentItem) =>
					currentItem.id === item.id ? item : currentItem,
				),
			);
			toast.success("Item updated.");
		},
	});

	const deleteItemMutation = useMutation({
		mutationFn: async (itemId: string) => itemId,
		onSuccess: (itemId) => {
			updateCachedItems((items) => items.filter((item) => item.id !== itemId));
			toast.success("Item deleted.");
		},
	});

	const addSetupMutation = useMutation({
		mutationFn: async ({
			kind,
			record,
		}: {
			kind: ItemSetupKind;
			record: ItemSetupRecord;
		}) => ({ kind, record }),
		onSuccess: ({ kind, record }) => {
			updateCachedSetupRecords(kind, (records) => [...records, record]);
			toast.success("Setup record created.");
		},
	});

	const updateSetupMutation = useMutation({
		mutationFn: async ({
			kind,
			record,
		}: {
			kind: ItemSetupKind;
			record: ItemSetupRecord;
		}) => ({ kind, record }),
		onSuccess: ({ kind, record }) => {
			updateCachedSetupRecords(kind, (records) =>
				records.map((currentRecord) =>
					currentRecord.id === record.id ? record : currentRecord,
				),
			);
			toast.success("Setup record updated.");
		},
	});

	const deleteSetupMutation = useMutation({
		mutationFn: async ({
			kind,
			recordId,
		}: {
			kind: ItemSetupKind;
			recordId: string;
		}) => ({ kind, recordId }),
		onSuccess: ({ kind, recordId }) => {
			updateCachedSetupRecords(kind, (records) =>
				records.filter((record) => record.id !== recordId),
			);
			toast.success("Setup record deleted.");
		},
	});

	const state: ItemManagementStoreState = {
		items: itemsQuery.data,
		addItem: (item) => addItemMutation.mutate(item),
		updateItem: (item) => updateItemMutation.mutate(item),
		deleteItem: (itemId) => deleteItemMutation.mutate(itemId),
		getSetupRecords: (kind) => setupQueries[kind].data,
		addSetupRecord: (kind, record) =>
			addSetupMutation.mutate({ kind, record }),
		updateSetupRecord: (kind, record) =>
			updateSetupMutation.mutate({ kind, record }),
		deleteSetupRecord: (kind, recordId) =>
			deleteSetupMutation.mutate({ kind, recordId }),
		isLoading:
			itemsQuery.isLoading ||
			setupQueries.category.isLoading ||
			setupQueries.subcategory.isLoading ||
			setupQueries.type.isLoading ||
			setupQueries.subtype.isLoading,
		isMutating:
			addItemMutation.isPending ||
			updateItemMutation.isPending ||
			deleteItemMutation.isPending ||
			addSetupMutation.isPending ||
			updateSetupMutation.isPending ||
			deleteSetupMutation.isPending,
	};

	return selector ? selector(state) : (state as TSelected);
}
