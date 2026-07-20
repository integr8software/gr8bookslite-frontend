"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

type OptimisticMutationOptions<TItem, TVariables, TResult> = {
	applyOptimistic: (items: TItem[], variables: TVariables) => TItem[];
	errorMessage?: string;
	getKey?: (variables: TVariables) => string;
	mutation: (variables: TVariables) => Promise<TResult>;
	setItems: Dispatch<SetStateAction<TItem[]>>;
	successMessage?: string;
};

export function useOptimisticModuleMutation<TItem, TVariables, TResult = void>({
	applyOptimistic,
	errorMessage = "Could not complete the action. Changes were restored.",
	getKey,
	mutation,
	setItems,
	successMessage,
}: OptimisticMutationOptions<TItem, TVariables, TResult>) {
	const pendingKeysRef = useRef(new Set<string>());
	const [isPending, setIsPending] = useState(false);

	async function run(variables: TVariables) {
		const key = getKey?.(variables);

		if (key && pendingKeysRef.current.has(key)) {
			return undefined;
		}

		if (key) {
			pendingKeysRef.current.add(key);
		}

		setIsPending(true);
		let snapshot: TItem[] = [];

		setItems((current) => {
			snapshot = current;
			return applyOptimistic(current, variables);
		});

		try {
			const result = await mutation(variables);

			if (successMessage) {
				toast.success(successMessage);
			}

			return result;
		} catch (error) {
			setItems(snapshot);
			toast.error(errorMessage);
			throw error;
		} finally {
			if (key) {
				pendingKeysRef.current.delete(key);
			}

			setIsPending(pendingKeysRef.current.size > 0);
		}
	}

	return {
		isPending,
		run,
	};
}
