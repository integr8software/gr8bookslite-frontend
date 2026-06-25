"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	MockItemAttributes,
	MockItemBundles,
	MockItems,
	MockItemSetupRecords,
	MockPriceLists,
} from "@/app/src/data/modules/maintenance/item-management/ItemManagementData";
import { ItemManagementQueryKeys } from "@/app/src/services/modules/maintenance/item-management/ItemManagementQueryKeys";
import type {
	ItemBundleRecord,
	ItemAttributeRecord,
	ItemRecord,
	ItemPriceListRecord,
	ItemSetupKind,
	ItemSetupRecord,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

type ItemManagementStoreState = {
	itemAttributes: ItemAttributeRecord[];
	itemBundles: ItemBundleRecord[];
	items: ItemRecord[];
	priceLists: ItemPriceListRecord[];
	addItemAttribute: (attribute: ItemAttributeRecord) => void;
	addItemBundle: (bundle: ItemBundleRecord) => void;
	addItem: (item: ItemRecord) => void;
	addPriceList: (priceList: ItemPriceListRecord) => void;
	updateItemAttribute: (attribute: ItemAttributeRecord) => void;
	updateItemBundle: (bundle: ItemBundleRecord) => void;
	updateItem: (item: ItemRecord) => void;
	updatePriceList: (priceList: ItemPriceListRecord) => void;
	deleteItem: (itemId: string) => void;
	getSetupRecords: (kind: ItemSetupKind) => ItemSetupRecord[];
	addSetupRecord: (kind: ItemSetupKind, record: ItemSetupRecord) => void;
	updateSetupRecord: (kind: ItemSetupKind, record: ItemSetupRecord) => void;
	updateSetupRecords: (
		updates: Array<{ kind: ItemSetupKind; record: ItemSetupRecord }>,
	) => void;
	deleteSetupRecord: (kind: ItemSetupKind, recordId: string) => void;
	isLoading: boolean;
	lastSyncedAt: number;
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
	const itemAttributesQuery = useQuery({
		queryKey: ItemManagementQueryKeys.itemAttributes(),
		queryFn: async () => MockItemAttributes,
		initialData: MockItemAttributes,
	});
	const itemBundlesQuery = useQuery({
		queryKey: ItemManagementQueryKeys.itemBundles(),
		queryFn: async () => MockItemBundles,
		initialData: MockItemBundles,
	});
	const priceListsQuery = useQuery({
		queryKey: ItemManagementQueryKeys.priceLists(),
		queryFn: async () => MockPriceLists,
		initialData: MockPriceLists,
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

	function updateCachedItemBundles(
		updater: (bundles: ItemBundleRecord[]) => ItemBundleRecord[],
	) {
		queryClient.setQueryData<ItemBundleRecord[]>(
			ItemManagementQueryKeys.itemBundles(),
			(currentBundles = MockItemBundles) => updater(currentBundles),
		);
	}

	function updateCachedItemAttributes(
		updater: (attributes: ItemAttributeRecord[]) => ItemAttributeRecord[],
	) {
		queryClient.setQueryData<ItemAttributeRecord[]>(
			ItemManagementQueryKeys.itemAttributes(),
			(currentAttributes = MockItemAttributes) => updater(currentAttributes),
		);
	}

	function updateCachedPriceLists(
		updater: (priceLists: ItemPriceListRecord[]) => ItemPriceListRecord[],
	) {
		queryClient.setQueryData<ItemPriceListRecord[]>(
			ItemManagementQueryKeys.priceLists(),
			(currentPriceLists = MockPriceLists) => updater(currentPriceLists),
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
			updateCachedItems((items) =>
				items.map((item) =>
					item.id === itemId ? { ...item, status: "Inactive" } : item,
				),
			);
			toast.success("Item set inactive.");
		},
	});

	const addItemBundleMutation = useMutation({
		mutationFn: async (bundle: ItemBundleRecord) => bundle,
		onSuccess: (bundle) => {
			updateCachedItemBundles((bundles) => [...bundles, bundle]);
			toast.success("Item bundle created.");
		},
	});

	const addItemAttributeMutation = useMutation({
		mutationFn: async (attribute: ItemAttributeRecord) => attribute,
		onSuccess: (attribute) => {
			updateCachedItemAttributes((attributes) => [...attributes, attribute]);
			toast.success("Item attribute created.");
		},
	});

	const updateItemAttributeMutation = useMutation({
		mutationFn: async (attribute: ItemAttributeRecord) => attribute,
		onSuccess: (attribute) => {
			updateCachedItemAttributes((attributes) =>
				attributes.map((currentAttribute) =>
					currentAttribute.id === attribute.id ? attribute : currentAttribute,
				),
			);
			toast.success("Item attribute updated.");
		},
	});

	const addPriceListMutation = useMutation({
		mutationFn: async (priceList: ItemPriceListRecord) => priceList,
		onSuccess: (priceList) => {
			updateCachedPriceLists((priceLists) => [...priceLists, priceList]);
			toast.success("Price list created.");
		},
	});

	const updatePriceListMutation = useMutation({
		mutationFn: async (priceList: ItemPriceListRecord) => priceList,
		onSuccess: (priceList) => {
			updateCachedPriceLists((priceLists) =>
				priceLists.map((currentPriceList) =>
					currentPriceList.id === priceList.id ? priceList : currentPriceList,
				),
			);
			toast.success("Price list updated.");
		},
	});

	const updateItemBundleMutation = useMutation({
		mutationFn: async (bundle: ItemBundleRecord) => bundle,
		onSuccess: (bundle) => {
			updateCachedItemBundles((bundles) =>
				bundles.map((currentBundle) =>
					currentBundle.id === bundle.id ? bundle : currentBundle,
				),
			);
			toast.success("Item bundle updated.");
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

	const updateSetupRecordsMutation = useMutation({
		mutationFn: async (
			updates: Array<{ kind: ItemSetupKind; record: ItemSetupRecord }>,
		) => updates,
		onSuccess: (updates) => {
			const updatesByKind = updates.reduce(
				(groupedUpdates, update) => {
					const kindUpdates = groupedUpdates[update.kind] ?? [];

					kindUpdates.push(update.record);
					groupedUpdates[update.kind] = kindUpdates;
					return groupedUpdates;
				},
				{} as Partial<Record<ItemSetupKind, ItemSetupRecord[]>>,
			);

			(Object.entries(updatesByKind) as Array<
				[ItemSetupKind, ItemSetupRecord[]]
			>).forEach(([kind, kindUpdates]) => {
				const updateById = new Map(
					kindUpdates.map((record) => [record.id, record]),
				);

				updateCachedSetupRecords(kind, (records) =>
					records.map((currentRecord) =>
						updateById.get(currentRecord.id) ?? currentRecord,
					),
				);
			});
			toast.success(
				updates.length === 1 ? "Setup record updated." : "Setup records updated.",
			);
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
				records.map((record) =>
					record.id === recordId ? { ...record, status: "Inactive" } : record,
				),
			);
			toast.success("Setup record set inactive.");
		},
	});

	const state: ItemManagementStoreState = {
		itemAttributes: itemAttributesQuery.data,
		itemBundles: itemBundlesQuery.data,
		items: itemsQuery.data,
		priceLists: priceListsQuery.data,
		addItemAttribute: (attribute) => addItemAttributeMutation.mutate(attribute),
		addItemBundle: (bundle) => addItemBundleMutation.mutate(bundle),
		addItem: (item) => addItemMutation.mutate(item),
		addPriceList: (priceList) => addPriceListMutation.mutate(priceList),
		updateItemAttribute: (attribute) => updateItemAttributeMutation.mutate(attribute),
		updateItemBundle: (bundle) => updateItemBundleMutation.mutate(bundle),
		updateItem: (item) => updateItemMutation.mutate(item),
		updatePriceList: (priceList) => updatePriceListMutation.mutate(priceList),
		deleteItem: (itemId) => deleteItemMutation.mutate(itemId),
		getSetupRecords: (kind) => setupQueries[kind].data,
		addSetupRecord: (kind, record) =>
			addSetupMutation.mutate({ kind, record }),
		updateSetupRecord: (kind, record) =>
			updateSetupMutation.mutate({ kind, record }),
		updateSetupRecords: (updates) =>
			updateSetupRecordsMutation.mutate(updates),
		deleteSetupRecord: (kind, recordId) =>
			deleteSetupMutation.mutate({ kind, recordId }),
		isLoading:
			itemsQuery.isLoading ||
			itemAttributesQuery.isLoading ||
			itemBundlesQuery.isLoading ||
			priceListsQuery.isLoading ||
			setupQueries.category.isLoading ||
			setupQueries.subcategory.isLoading ||
			setupQueries.type.isLoading ||
			setupQueries.subtype.isLoading,
		lastSyncedAt: Math.max(
			itemsQuery.dataUpdatedAt,
			itemAttributesQuery.dataUpdatedAt,
			itemBundlesQuery.dataUpdatedAt,
			priceListsQuery.dataUpdatedAt,
			setupQueries.category.dataUpdatedAt,
			setupQueries.subcategory.dataUpdatedAt,
			setupQueries.type.dataUpdatedAt,
			setupQueries.subtype.dataUpdatedAt,
		),
		isMutating:
			addItemMutation.isPending ||
			addItemAttributeMutation.isPending ||
			addItemBundleMutation.isPending ||
			addPriceListMutation.isPending ||
			updateItemAttributeMutation.isPending ||
			updateItemBundleMutation.isPending ||
			updateItemMutation.isPending ||
			updatePriceListMutation.isPending ||
			deleteItemMutation.isPending ||
			addSetupMutation.isPending ||
			updateSetupMutation.isPending ||
			updateSetupRecordsMutation.isPending ||
			deleteSetupMutation.isPending,
	};

	return selector ? selector(state) : (state as TSelected);
}
