"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import toast from "react-hot-toast";

type ModuleListUpdater<TItem> = (currentItems: TItem[]) => TItem[];

type UseOptimisticModuleListMutationOptions<TItem> = {
	errorMessage?: string;
	getFallbackItems: () => TItem[];
	persistItems: (items: TItem[]) => Promise<void> | void;
	queryKey: QueryKey;
	successMessage?: string;
};

export function useOptimisticModuleListMutation<TItem>({
	errorMessage = "Could not complete the action. Changes were restored.",
	getFallbackItems,
	persistItems,
	queryKey,
	successMessage,
}: UseOptimisticModuleListMutationOptions<TItem>) {
	const queryClient = useQueryClient();

	return useMutation<
		TItem[],
		unknown,
		ModuleListUpdater<TItem>,
		{ previousItems: TItem[] }
	>({
		mutationFn: async () => {
			const nextItems =
				queryClient.getQueryData<TItem[]>(queryKey) ?? getFallbackItems();

			await persistItems(nextItems);

			return nextItems;
		},
		onMutate: async (updater) => {
			await queryClient.cancelQueries({ queryKey });

			const previousItems =
				queryClient.getQueryData<TItem[]>(queryKey) ?? getFallbackItems();
			const nextItems = updater(previousItems);

			queryClient.setQueryData(queryKey, nextItems);

			return { previousItems };
		},
		onError: (_error, _updater, context) => {
			if (context?.previousItems) {
				queryClient.setQueryData(queryKey, context.previousItems);
			}

			toast.error(errorMessage);
		},
		onSuccess: (nextItems) => {
			queryClient.setQueryData(queryKey, nextItems);

			if (successMessage) {
				toast.success(successMessage);
			}
		},
	});
}
