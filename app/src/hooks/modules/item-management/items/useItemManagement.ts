"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MockItemVariations,
  MockItemBundles,
  MockItemSuppliers,
  MockItems,
  MockItemSetupRecords,
  MockPriceLists,
} from "@/app/src/data/modules/item-management/items/ItemManagementData";
import { ItemManagementQueryKeys } from "@/app/src/services/modules/item-management/items/ItemManagementQueryKeys";
import type {
  ItemBundleRecord,
  ItemVariationRecord,
  ItemRecord,
  ItemPriceListRecord,
  ItemSetupKind,
  ItemSetupRecord,
  ItemSupplierRecord,
} from "@/app/src/types/modules/item-management/items/ItemManagementTypes";

type ItemManagementStoreState = {
  itemVariations: ItemVariationRecord[];
  itemBundles: ItemBundleRecord[];
  itemSuppliers: ItemSupplierRecord[];
  items: ItemRecord[];
  priceLists: ItemPriceListRecord[];
  addItemVariation: (variation: ItemVariationRecord) => void;
  addItemBundle: (bundle: ItemBundleRecord) => void;
  addItemSupplier: (supplier: ItemSupplierRecord) => void;
  addItem: (item: ItemRecord) => void;
  addPriceList: (priceList: ItemPriceListRecord) => void;
  updateItemVariation: (variation: ItemVariationRecord) => void;
  updateItemBundle: (bundle: ItemBundleRecord) => void;
  updateItemSupplier: (supplier: ItemSupplierRecord) => void;
  updateItem: (item: ItemRecord) => void;
  updatePriceList: (priceList: ItemPriceListRecord) => void;
  deleteItem: (itemId: string) => void;
  getSetupRecords: (kind: ItemSetupKind) => ItemSetupRecord[];
  addSetupRecord: (kind: ItemSetupKind, record: ItemSetupRecord) => void;
  updateSetupRecord: (kind: ItemSetupKind, record: ItemSetupRecord) => void;
  updateSetupRecords: (updates: Array<{ kind: ItemSetupKind; record: ItemSetupRecord }>) => void;
  deleteSetupRecord: (kind: ItemSetupKind, recordId: string) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
  refreshSetupRecords: () => void;
};

export function useItemManagementStore<TSelected = ItemManagementStoreState>(
  selector?: (state: ItemManagementStoreState) => TSelected,
) {
  const queryClient = useQueryClient();
  const itemsQuery = useQuery({
    queryKey: ItemManagementQueryKeys.items(),
    queryFn: async () => MockItems,
    initialData: MockItems,
    retry: false,
  });
  const itemVariationsQuery = useQuery({
    queryKey: ItemManagementQueryKeys.itemVariations(),
    queryFn: async () => MockItemVariations,
    initialData: MockItemVariations,
    retry: false,
  });
  const itemBundlesQuery = useQuery({
    queryKey: ItemManagementQueryKeys.itemBundles(),
    queryFn: async () => MockItemBundles,
    initialData: MockItemBundles,
    retry: false,
  });
  const itemSuppliersQuery = useQuery({
    queryKey: ItemManagementQueryKeys.itemSuppliers(),
    queryFn: async () => MockItemSuppliers,
    initialData: MockItemSuppliers,
    retry: false,
  });
  const priceListsQuery = useQuery({
    queryKey: ItemManagementQueryKeys.priceLists(),
    queryFn: async () => MockPriceLists,
    initialData: MockPriceLists,
    retry: false,
  });
  const setupQueries = {
    category: useQuery({
      queryKey: ItemManagementQueryKeys.setupRecords("category"),
      queryFn: async () => MockItemSetupRecords.category,
      initialData: MockItemSetupRecords.category,
      retry: false,
    }),
    subcategory: useQuery({
      queryKey: ItemManagementQueryKeys.setupRecords("subcategory"),
      queryFn: async () => MockItemSetupRecords.subcategory,
      initialData: MockItemSetupRecords.subcategory,
      retry: false,
    }),
    type: useQuery({
      queryKey: ItemManagementQueryKeys.setupRecords("type"),
      queryFn: async () => MockItemSetupRecords.type,
      initialData: MockItemSetupRecords.type,
      retry: false,
    }),
    subtype: useQuery({
      queryKey: ItemManagementQueryKeys.setupRecords("subtype"),
      queryFn: async () => MockItemSetupRecords.subtype,
      initialData: MockItemSetupRecords.subtype,
      retry: false,
    }),
  };

  function updateCachedItems(updater: (items: ItemRecord[]) => ItemRecord[]) {
    queryClient.setQueryData<ItemRecord[]>(
      ItemManagementQueryKeys.items(),
      (currentItems = MockItems) => updater(currentItems),
    );
  }

  function updateCachedItemBundles(updater: (bundles: ItemBundleRecord[]) => ItemBundleRecord[]) {
    queryClient.setQueryData<ItemBundleRecord[]>(
      ItemManagementQueryKeys.itemBundles(),
      (currentBundles = MockItemBundles) => updater(currentBundles),
    );
  }

  function updateCachedItemSuppliers(
    updater: (suppliers: ItemSupplierRecord[]) => ItemSupplierRecord[],
  ) {
    queryClient.setQueryData<ItemSupplierRecord[]>(
      ItemManagementQueryKeys.itemSuppliers(),
      (currentSuppliers = MockItemSuppliers) => updater(currentSuppliers),
    );
  }

  function updateCachedItemVariations(
    updater: (variations: ItemVariationRecord[]) => ItemVariationRecord[],
  ) {
    queryClient.setQueryData<ItemVariationRecord[]>(
      ItemManagementQueryKeys.itemVariations(),
      (currentVariations = MockItemVariations) => updater(currentVariations),
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
        items.map((currentItem) => (currentItem.id === item.id ? item : currentItem)),
      );
      toast.success("Item updated.");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => itemId,
    onSuccess: (itemId) => {
      updateCachedItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, status: "Inactive" } : item)),
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

  const addItemSupplierMutation = useMutation({
    mutationFn: async (supplier: ItemSupplierRecord) => supplier,
    onSuccess: (supplier) => {
      updateCachedItemSuppliers((suppliers) => [...suppliers, supplier]);
      toast.success("Supplier created.");
    },
  });

  const updateItemSupplierMutation = useMutation({
    mutationFn: async (supplier: ItemSupplierRecord) => supplier,
    onSuccess: (supplier) => {
      updateCachedItemSuppliers((suppliers) =>
        suppliers.map((currentSupplier) =>
          currentSupplier.id === supplier.id ? supplier : currentSupplier,
        ),
      );
      toast.success("Supplier updated.");
    },
  });

  const addItemVariationMutation = useMutation({
    mutationFn: async (variation: ItemVariationRecord) => variation,
    onSuccess: (variation) => {
      updateCachedItemVariations((variations) => [...variations, variation]);
      toast.success("Item variation created.");
    },
  });

  const updateItemVariationMutation = useMutation({
    mutationFn: async (variation: ItemVariationRecord) => variation,
    onSuccess: (variation) => {
      updateCachedItemVariations((variations) =>
        variations.map((currentVariation) =>
          currentVariation.id === variation.id ? variation : currentVariation,
        ),
      );
      toast.success("Item variation updated.");
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
        bundles.map((currentBundle) => (currentBundle.id === bundle.id ? bundle : currentBundle)),
      );
      toast.success("Item bundle updated.");
    },
  });

  const addSetupMutation = useMutation({
    mutationFn: async ({ kind, record }: { kind: ItemSetupKind; record: ItemSetupRecord }) => ({
      kind,
      record,
    }),
    onSuccess: ({ kind, record }) => {
      updateCachedSetupRecords(kind, (records) => [...records, record]);
      toast.success("Setup record created.");
    },
  });

  const updateSetupMutation = useMutation({
    mutationFn: async ({ kind, record }: { kind: ItemSetupKind; record: ItemSetupRecord }) => ({
      kind,
      record,
    }),
    onSuccess: ({ kind, record }) => {
      updateCachedSetupRecords(kind, (records) =>
        records.map((currentRecord) => (currentRecord.id === record.id ? record : currentRecord)),
      );
      toast.success("Setup record updated.");
    },
  });

  const updateSetupRecordsMutation = useMutation({
    mutationFn: async (updates: Array<{ kind: ItemSetupKind; record: ItemSetupRecord }>) => updates,
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

      (Object.entries(updatesByKind) as Array<[ItemSetupKind, ItemSetupRecord[]]>).forEach(
        ([kind, kindUpdates]) => {
          const updateById = new Map(kindUpdates.map((record) => [record.id, record]));

          updateCachedSetupRecords(kind, (records) =>
            records.map((currentRecord) => updateById.get(currentRecord.id) ?? currentRecord),
          );
        },
      );
      toast.success(updates.length === 1 ? "Setup record updated." : "Setup records updated.");
    },
  });

  const deleteSetupMutation = useMutation({
    mutationFn: async ({ kind, recordId }: { kind: ItemSetupKind; recordId: string }) => ({
      kind,
      recordId,
    }),
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
    itemVariations: itemVariationsQuery.data,
    itemBundles: itemBundlesQuery.data,
    itemSuppliers: itemSuppliersQuery.data,
    items: itemsQuery.data,
    priceLists: priceListsQuery.data,
    addItemVariation: (variation) => addItemVariationMutation.mutate(variation),
    addItemBundle: (bundle) => addItemBundleMutation.mutate(bundle),
    addItemSupplier: (supplier) => addItemSupplierMutation.mutate(supplier),
    addItem: (item) => addItemMutation.mutate(item),
    addPriceList: (priceList) => addPriceListMutation.mutate(priceList),
    updateItemVariation: (variation) => updateItemVariationMutation.mutate(variation),
    updateItemBundle: (bundle) => updateItemBundleMutation.mutate(bundle),
    updateItemSupplier: (supplier) => updateItemSupplierMutation.mutate(supplier),
    updateItem: (item) => updateItemMutation.mutate(item),
    updatePriceList: (priceList) => updatePriceListMutation.mutate(priceList),
    deleteItem: (itemId) => deleteItemMutation.mutate(itemId),
    getSetupRecords: (kind) => setupQueries[kind].data,
    addSetupRecord: (kind, record) => addSetupMutation.mutate({ kind, record }),
    updateSetupRecord: (kind, record) => updateSetupMutation.mutate({ kind, record }),
    updateSetupRecords: (updates) => updateSetupRecordsMutation.mutate(updates),
    deleteSetupRecord: (kind, recordId) => deleteSetupMutation.mutate({ kind, recordId }),
    isLoading:
      itemsQuery.isLoading ||
      itemVariationsQuery.isLoading ||
      itemBundlesQuery.isLoading ||
      itemSuppliersQuery.isLoading ||
      priceListsQuery.isLoading ||
      setupQueries.category.isLoading ||
      setupQueries.subcategory.isLoading ||
      setupQueries.type.isLoading ||
      setupQueries.subtype.isLoading,
    isRefreshing:
      itemsQuery.isFetching ||
      setupQueries.category.isFetching ||
      setupQueries.subcategory.isFetching ||
      setupQueries.type.isFetching ||
      setupQueries.subtype.isFetching,
    lastSyncedAt: Math.max(
      itemsQuery.dataUpdatedAt,
      itemVariationsQuery.dataUpdatedAt,
      itemBundlesQuery.dataUpdatedAt,
      itemSuppliersQuery.dataUpdatedAt,
      priceListsQuery.dataUpdatedAt,
      setupQueries.category.dataUpdatedAt,
      setupQueries.subcategory.dataUpdatedAt,
      setupQueries.type.dataUpdatedAt,
      setupQueries.subtype.dataUpdatedAt,
    ),
    isMutating:
      addItemMutation.isPending ||
      addItemVariationMutation.isPending ||
      addItemBundleMutation.isPending ||
      addItemSupplierMutation.isPending ||
      addPriceListMutation.isPending ||
      updateItemVariationMutation.isPending ||
      updateItemBundleMutation.isPending ||
      updateItemSupplierMutation.isPending ||
      updateItemMutation.isPending ||
      updatePriceListMutation.isPending ||
      deleteItemMutation.isPending ||
      addSetupMutation.isPending ||
      updateSetupMutation.isPending ||
      updateSetupRecordsMutation.isPending ||
      deleteSetupMutation.isPending,
    refreshSetupRecords: () => {
      void queryClient.invalidateQueries({
        queryKey: ItemManagementQueryKeys.items(),
      });
      (["category", "subcategory", "type", "subtype"] as ItemSetupKind[]).forEach((kind) => {
        void queryClient.invalidateQueries({
          queryKey: ItemManagementQueryKeys.setupRecords(kind),
        });
      });
    },
  };

  return selector ? selector(state) : (state as TSelected);
}
