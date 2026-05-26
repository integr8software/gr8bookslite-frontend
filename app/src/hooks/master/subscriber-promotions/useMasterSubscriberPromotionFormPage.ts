"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MasterSubscriberPromotionsHref } from "@/app/src/constants/master/subscriber-promotions/MasterSubscriberPromotionConstants";
import {
	InitialMasterSubscriberPromotionFormValues,
	MasterSubscriberPromotionPromotionOptions,
	getMasterSubscriberPromotionAudience,
	getMasterSubscriberPromotionSummaryLabel,
} from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import type {
	MasterSubscriberPromotionAssignmentMode,
	MasterSubscriberPromotionFormErrors,
	MasterSubscriberPromotionFormValues,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import { validateMasterSubscriberPromotionForm } from "@/app/src/validations/master/subscriber-promotions/MasterSubscriberPromotionValidation";

export function useMasterSubscriberPromotionFormPage() {
	const router = useRouter();
	const [values, setValues] =
		useState<MasterSubscriberPromotionFormValues>(
			InitialMasterSubscriberPromotionFormValues,
		);
	const [errors, setErrors] =
		useState<MasterSubscriberPromotionFormErrors>({});
	const audience = useMemo(
		() => getMasterSubscriberPromotionAudience(values),
		[values],
	);
	const selectedPromotions = useMemo(() => {
		const selectedPromotionIds = new Set(values.promotionIds);

		return MasterSubscriberPromotionPromotionOptions.filter((promotion) =>
			selectedPromotionIds.has(promotion.id),
		);
	}, [values.promotionIds]);
	const summaryLabel = useMemo(
		() => getMasterSubscriberPromotionSummaryLabel(values),
		[values],
	);

	function updateValues(
		nextValues: Partial<MasterSubscriberPromotionFormValues>,
	) {
		setValues((current) => ({ ...current, ...nextValues }));
	}

	function updateAssignmentMode(
		assignmentMode: MasterSubscriberPromotionAssignmentMode,
	) {
		setValues((current) => ({
			...current,
			assignmentMode,
			subscriberIds:
				assignmentMode === "Chosen subscriber"
					? current.subscriberIds.slice(0, 1)
					: current.subscriberIds,
		}));
		setErrors({});
	}

	function togglePromotion(promotionId: string) {
		setValues((current) => ({
			...current,
			promotionIds: toggleValue(current.promotionIds, promotionId),
		}));
	}

	function toggleSubscriber(subscriberId: string) {
		setValues((current) => {
			if (current.assignmentMode === "Chosen subscriber") {
				return {
					...current,
					subscriberIds: [subscriberId],
				};
			}

			return {
				...current,
				subscriberIds: toggleValue(current.subscriberIds, subscriberId),
			};
		});
	}

	function toggleConditionValue<
		TKey extends
			| "conditionBillingCycles"
			| "conditionPlanIds"
			| "conditionStatuses",
	>(key: TKey, value: MasterSubscriberPromotionFormValues[TKey][number]) {
		setValues((current) => ({
			...current,
			[key]: toggleValue(current[key] as string[], value),
		}));
	}

	function assignPromotions() {
		const nextErrors = validateMasterSubscriberPromotionForm(values);
		const nextAudience = getMasterSubscriberPromotionAudience(values);

		if (nextAudience.length === 0) {
			nextErrors.subscriberIds = "No subscribers match this audience.";
		}

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		toast.success(`${getMasterSubscriberPromotionSummaryLabel(values)} assigned.`);
		router.push(MasterSubscriberPromotionsHref);
	}

	return {
		assignPromotions,
		audience,
		errors,
		selectedPromotions,
		summaryLabel,
		toggleConditionValue,
		togglePromotion,
		toggleSubscriber,
		updateAssignmentMode,
		updateValues,
		values,
	};
}

function toggleValue<TValue extends string>(values: TValue[], value: TValue) {
	return values.includes(value)
		? values.filter((current) => current !== value)
		: [...values, value];
}
