"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { AiAssistantTermManagementActionEvent } from "@/app/src/constants/shared/ai-assistant/AiAssistantConstants";
import {
	ClearAiAssistantTermManagementPendingAction,
	LoadAiAssistantTermManagementPendingAction,
} from "@/app/src/data/shared/ai-assistant/AiAssistantData";
import type { useTermManagementListPage } from "@/app/src/hooks/modules/financial-maintenance/term-management/useTermManagementListPage";
import type { AiAssistantTermManagementAction } from "@/app/src/types/shared/ai-assistant/AiAssistantTypes";
import type {
	TermManagement,
	TermManagementDrawerState,
	TermManagementFormValues,
} from "@/app/src/types/modules/financial-maintenance/term-management/TermManagementTypes";

type UseTermManagementAssistantActionsParams = {
	closeDrawer: () => void;
	openDrawer: (state: TermManagementDrawerState) => void;
	page: ReturnType<typeof useTermManagementListPage>;
};

export function useTermManagementAssistantActions({
	closeDrawer,
	openDrawer,
	page,
}: UseTermManagementAssistantActionsParams) {
	useEffect(() => {
		function handleAssistantAction(action: AiAssistantTermManagementAction) {
			return ApplyTermManagementAssistantAction({
				action,
				closeDrawer,
				openDrawer,
				page,
			});
		}

		const pendingAction = LoadAiAssistantTermManagementPendingAction();

		if (pendingAction && handleAssistantAction(pendingAction)) {
			ClearAiAssistantTermManagementPendingAction();
		}

		function handleEvent(event: Event) {
			const action = (event as CustomEvent<AiAssistantTermManagementAction>)
				.detail;

			if (action?.type !== "term_management") {
				return;
			}

			if (handleAssistantAction(action)) {
				ClearAiAssistantTermManagementPendingAction();
			}
		}

		window.addEventListener(AiAssistantTermManagementActionEvent, handleEvent);

		return () => {
			window.removeEventListener(
				AiAssistantTermManagementActionEvent,
				handleEvent,
			);
		};
	}, [closeDrawer, openDrawer, page]);
}

function ApplyTermManagementAssistantAction({
	action,
	closeDrawer,
	openDrawer,
	page,
}: UseTermManagementAssistantActionsParams & {
	action: AiAssistantTermManagementAction;
}) {
	if (page.isLoading) {
		return false;
	}

	if (!page.permissions.canView) {
		toast.error("You do not have access to view terms.");
		return true;
	}

	if (action.command === "open") {
		closeDrawer();
		return true;
	}

	if (action.command === "search") {
		page.setQuery(action.query ?? "");
		page.setDatemodeFilter("All");
		return true;
	}

	if (action.command === "filter_status") {
		page.setStatusFilter(action.status ?? "Active");
		page.setDatemodeFilter("All");
		return true;
	}

	if (action.command === "prepare_add") {
		if (!page.permissions.canCreate) {
			toast.error("You do not have access to create terms.");
			return true;
		}

		openDrawer({
			initialValues: CreateAssistantTermInitialValues(action),
			mode: "add",
		});
		return true;
	}

	if (action.command === "preview_edit") {
		if (!page.permissions.canUpdate) {
			toast.error("You do not have access to edit terms.");
			return true;
		}

		const matchingTerms = FindAssistantTargetTerms(
			page.terms,
			action.targetTermName,
		);

		if (matchingTerms.length === 1) {
			openDrawer({ mode: "edit", term: matchingTerms[0] });
			return true;
		}

		if (matchingTerms.length > 1) {
			toast("Please choose a more specific term to edit.");
			return true;
		}

		toast("Please choose which term you want to edit.");
	}

	return true;
}

function CreateAssistantTermInitialValues(
	action: AiAssistantTermManagementAction,
): TermManagementFormValues {
	return {
		name: action.prefill?.name ?? "",
		description: action.prefill?.description ?? "",
		datemode: action.prefill?.datemode ?? "Month",
		period: action.prefill?.period ?? "",
		status: action.prefill?.status ?? "Active",
	};
}

function FindAssistantTargetTerms(
	terms: TermManagement[],
	targetTermName?: string,
) {
	const normalizedTargetTermName = targetTermName?.trim().toLowerCase();

	if (!normalizedTargetTermName) {
		return [];
	}

	const exactMatches = terms.filter(
		(term) => term.name.trim().toLowerCase() === normalizedTargetTermName,
	);

	return exactMatches.length > 0
		? exactMatches
		: terms.filter((term) =>
				term.name.trim().toLowerCase().includes(normalizedTargetTermName),
			);
}
