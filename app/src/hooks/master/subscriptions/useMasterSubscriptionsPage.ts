"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import { MasterSubscriptionTableColumns } from "@/app/src/constants/master/subscriptions/MasterSubscriptionConstants";
import {
	InitialMasterSubscriptionPreviewValues,
	MasterSubscriptionCompanies,
	MasterSubscriptionPlans,
	MasterSubscriptionVolumeRules,
	calculateMasterSubscriptionAmountLeft,
	calculateMasterSubscriptionQuote,
	createMasterSubscriptionPlanDraft,
	createMasterSubscriptionPlanRecord,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import type {
	MasterSubscriptionCompanyRecord,
	MasterSubscriptionPlanFormErrors,
	MasterSubscriptionPlanFormValues,
	MasterSubscriptionPlanRecord,
	MasterSubscriptionPreviewValues,
	MasterSubscriptionQuote,
	MasterSubscriptionTableColumnKey,
	MasterSubscriptionUnit,
	MasterSubscriptionVolumeRuleRecord,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";
import { validateMasterSubscriptionPlanForm } from "@/app/src/validations/master/subscriptions/MasterSubscriptionValidation";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

const DefaultMasterSubscriptionPlan = MasterSubscriptionPlans[0] as
	| MasterSubscriptionPlanRecord
	| undefined;

export function useMasterSubscriptionsPage() {
	const [plans, setPlans] = useState(MasterSubscriptionPlans);
	const [rules, setRules] = useState(MasterSubscriptionVolumeRules);
	const [selectedPlanId, setSelectedPlanId] = useState(
		MasterSubscriptionPlans[0]?.id ?? "",
	);
	const initialPlan =
		plans.find((plan) => plan.id === selectedPlanId) ??
		DefaultMasterSubscriptionPlan;
	const [planDraft, setPlanDraft] = useState<MasterSubscriptionPlanFormValues>(
		() => createMasterSubscriptionPlanDraft(getRequiredPlan(initialPlan)),
	);
	const [planErrors, setPlanErrors] =
		useState<MasterSubscriptionPlanFormErrors>({});
	const [previewValues, setPreviewValues] =
		useState<MasterSubscriptionPreviewValues>(
			InitialMasterSubscriptionPreviewValues,
		);
	const [query, setQuery] = useState("");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const selectedPlan =
		plans.find((plan) => plan.id === selectedPlanId) ??
		getRequiredPlan(DefaultMasterSubscriptionPlan);
	const selectedPlanRules = useMemo(
		() => rules.filter((rule) => rule.planId === selectedPlan.id),
		[rules, selectedPlan.id],
	);
	const previewPlan = useMemo(
		() =>
			createMasterSubscriptionPlanRecord({
				id: selectedPlan.id,
				values: planDraft,
			}),
		[planDraft, selectedPlan.id],
	);
	const billingPreview = useMemo(
		() =>
			calculateMasterSubscriptionQuote({
				plan: previewPlan,
				rules: selectedPlanRules,
				values: previewValues,
			}),
		[previewPlan, previewValues, selectedPlanRules],
	);
	const plansById = useMemo(
		() => new Map(plans.map((plan) => [plan.id, plan] as const)),
		[plans],
	);
	const subscriptionQuotes = useMemo(() => {
		return MasterSubscriptionCompanies.reduce<
			Record<string, MasterSubscriptionQuote>
		>((quotes, subscription) => {
			const plan = plansById.get(subscription.planId);

			if (!plan) {
				return quotes;
			}

			quotes[subscription.id] = calculateMasterSubscriptionQuote({
				plan,
				rules: rules.filter((rule) => rule.planId === plan.id),
				values: {
					branches: subscription.branchCount,
					companies: subscription.companyCount,
					users: subscription.userCount,
				},
			});

			return quotes;
		}, {});
	}, [plansById, rules]);
	const tableRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return MasterSubscriptionCompanies;
		}

		return MasterSubscriptionCompanies.filter((subscription) => {
			const plan = plansById.get(subscription.planId);

			return [
				subscription.name,
				subscription.ownerName,
				subscription.status,
				subscription.billingCycle,
				`${subscription.durationMonths} months`,
				plan?.name,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [plansById, query]);
	const columns = useMemo<ColumnDef<MasterSubscriptionCompanyRecord>[]>(
		() =>
			MasterSubscriptionTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: column.label.toLowerCase().replaceAll(" ", "-"),
						header: column.label,
						enableGrouping: false,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: tableRecords,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});
	const summary = useMemo(() => {
		const activePlans = plans.filter((plan) => plan.status === "Active");
		const draftPlans = plans.filter((plan) => plan.status === "Draft");
		const inactivePlans = plans.filter((plan) => plan.status === "Inactive");
		const enabledModuleIds = new Set(
			activePlans.flatMap((plan) => plan.moduleIds),
		);
		const monthlyRevenue = Object.values(subscriptionQuotes).reduce(
			(total, quote) => total + quote.total,
			0,
		);
		const totalAmountLeft = MasterSubscriptionCompanies.reduce(
			(total, subscription) =>
				total +
				calculateMasterSubscriptionAmountLeft({
					billingCycle: subscription.billingCycle,
					monthlyTotal: subscriptionQuotes[subscription.id]?.total ?? 0,
				}),
			0,
		);
		const activeSubscriptions = MasterSubscriptionCompanies.filter(
			(subscription) => subscription.status === "Active",
		).length;
		const atRiskSubscriptions = MasterSubscriptionCompanies.filter(
			(subscription) => subscription.status === "Past Due",
		).length;
		const averageDurationMonths = Math.round(
			MasterSubscriptionCompanies.reduce(
				(total, subscription) => total + subscription.durationMonths,
				0,
			) / Math.max(1, MasterSubscriptionCompanies.length),
		);

		return {
			activePlans: activePlans.length,
			activeSubscriptions,
			atRiskSubscriptions,
			averageDurationMonths,
			draftPlans: draftPlans.length,
			enabledModules: enabledModuleIds.size,
			inactivePlans: inactivePlans.length,
			monthlyRevenue,
			subscribedCompanies: MasterSubscriptionCompanies.length,
			totalAmountLeft,
		};
	}, [plans, subscriptionQuotes]);

	function selectPlan(planId: string) {
		const nextPlan = plans.find((plan) => plan.id === planId);

		if (!nextPlan) {
			return;
		}

		setSelectedPlanId(planId);
		setPlanDraft(createMasterSubscriptionPlanDraft(nextPlan));
		setPlanErrors({});
	}

	function updatePlanDraft(values: Partial<MasterSubscriptionPlanFormValues>) {
		setPlanDraft((current) => ({ ...current, ...values }));
	}

	function updateIncludedCount(
		key: "includedBranches" | "includedCompanies" | "includedUsers",
		value: number,
	) {
		setPlanDraft((current) => ({
			...current,
			[key]: Math.max(0, Math.floor(value)),
		}));
	}

	function updatePricing(unit: MasterSubscriptionUnit, value: number) {
		setPlanDraft((current) => ({
			...current,
			pricing: {
				...current.pricing,
				[unit]: Math.max(0, value),
			},
		}));
	}

	function toggleModule(moduleId: string) {
		setPlanDraft((current) => {
			const nextModuleIds = current.moduleIds.includes(moduleId)
				? current.moduleIds.filter((id) => id !== moduleId)
				: [...current.moduleIds, moduleId];

			return { ...current, moduleIds: nextModuleIds };
		});
	}

	function savePlan() {
		const errors = validateMasterSubscriptionPlanForm(planDraft);

		setPlanErrors(errors);

		if (Object.keys(errors).length > 0) {
			return false;
		}

		setPlans((currentPlans) =>
			currentPlans.map((plan) =>
				plan.id === selectedPlan.id
					? createMasterSubscriptionPlanRecord({
							id: selectedPlan.id,
							values: planDraft,
						})
					: plan,
			),
		);

		return true;
	}

	function createPlan() {
		const nextNumber = plans.length + 1;
		const nextPlan: MasterSubscriptionPlanRecord = {
			billingCycle: "Monthly",
			code: `CUSTOM-${nextNumber}`,
			description:
				"Custom subscription plan for a specific company segment or sales package.",
			id: `custom-plan-${nextNumber}`,
			includedBranches: 1,
			includedCompanies: 1,
			includedUsers: 5,
			moduleIds: ["accounting-core", "admin-security"],
			monthlyBasePrice: 4900,
			name: `Custom Plan ${nextNumber}`,
			pricing: {
				branch: 350,
				company: 650,
				user: 200,
			},
			status: "Draft",
		};

		setPlans((currentPlans) => [...currentPlans, nextPlan]);
		setSelectedPlanId(nextPlan.id);
		setPlanDraft(createMasterSubscriptionPlanDraft(nextPlan));
		setPlanErrors({});
	}

	function togglePlanStatus(planId: string) {
		const currentPlan = plans.find((plan) => plan.id === planId);

		if (!currentPlan) {
			return;
		}

		const nextStatus =
			currentPlan.status === "Active" ? "Inactive" : "Active";

		setPlans((currentPlans) =>
			currentPlans.map((plan) =>
				plan.id === planId ? { ...plan, status: nextStatus } : plan,
			),
		);

		if (selectedPlan.id === planId) {
			setPlanDraft((current) => ({ ...current, status: nextStatus }));
		}
	}

	function updatePreviewValues(values: Partial<MasterSubscriptionPreviewValues>) {
		setPreviewValues((current) => ({
			...current,
			...values,
		}));
	}

	function addVolumeRule() {
		const nextRuleId = `rule-${selectedPlan.id}-${rules.length + 1}`;
		const startsAt = Math.max(1, planDraft.includedCompanies + 1);

		setRules((currentRules) => [
			...currentRules,
			{
				discountPercent: 5,
				endsAt: null,
				id: nextRuleId,
				label: `Company scale ${startsAt}+`,
				planId: selectedPlan.id,
				startsAt,
				unit: "company",
			},
		]);
	}

	function updateVolumeRule(
		ruleId: string,
		values: Partial<MasterSubscriptionVolumeRuleRecord>,
	) {
		setRules((currentRules) =>
			currentRules.map((rule) =>
				rule.id === ruleId
					? {
							...rule,
							...values,
							discountPercent:
								values.discountPercent === undefined
									? rule.discountPercent
									: Math.min(100, Math.max(0, values.discountPercent)),
							endsAt:
								values.endsAt === undefined
									? rule.endsAt
									: values.endsAt === null
										? null
										: Math.max(0, Math.floor(values.endsAt)),
							startsAt:
								values.startsAt === undefined
									? rule.startsAt
									: Math.max(1, Math.floor(values.startsAt)),
						}
					: rule,
			),
		);
	}

	function removeVolumeRule(ruleId: string) {
		setRules((currentRules) =>
			currentRules.filter((rule) => rule.id !== ruleId),
		);
	}

	function resetSubscriptionFilters() {
		setQuery("");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		addVolumeRule,
		billingPreview,
		createPlan,
		planDraft,
		planErrors,
		plans,
		plansById,
		previewValues,
		query,
		removeVolumeRule,
		resetSubscriptionFilters,
		savePlan,
		selectPlan,
		selectedPlan,
		selectedPlanRules,
		setQuery,
		subscriptionQuotes,
		summary,
		table,
		toggleModule,
		togglePlanStatus,
		updateIncludedCount,
		updatePlanDraft,
		updatePreviewValues,
		updatePricing,
		updateVolumeRule,
	};
}

function createColumn(
	key: MasterSubscriptionTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterSubscriptionCompanyRecord> {
	return {
		accessorKey: key,
		enableSorting: false,
		header: label,
		meta: { className },
	};
}

function getRequiredPlan(plan: MasterSubscriptionPlanRecord | undefined) {
	if (!plan) {
		throw new Error("Master subscription plans must include at least one plan.");
	}

	return plan;
}
