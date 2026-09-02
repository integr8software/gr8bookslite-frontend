import {
	MasterSubscriptionCompanies,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";

export type MasterInvoiceAnalyticsMetric =
	| "subscribers"
	| "collected"
	| "pending"
	| "attention";

export type MasterInvoiceAnalyticsPeriod = "monthly" | "yearly";

export type MasterInvoiceAnalyticsSort = "default" | "desc" | "asc";

export type MasterInvoiceAnalyticsDataPoint = {
	companyId?: string;
	companyName?: string;
	helper?: string;
	key: string;
	label: string;
	period: string;
	secondaryValue?: number;
	value: number;
};

export type MasterInvoiceAnalyticsSummary = {
	average: number;
	count: number;
	formattedAverage: string;
	formattedPeak: string;
	formattedTotal: string;
	growthRate: string;
	lowest: number;
	lowestLabel: string;
	peak: number;
	peakLabel: string;
	total: number;
};

// Base Monthly Data for 2026
const BaseMonthlyData: Record<
	string,
	Record<MasterInvoiceAnalyticsMetric, { helper?: string; value: number }>
> = {
	"2026-01": {
		subscribers: { value: 3, helper: "3 active accounts" },
		collected: { value: 45200, helper: "6 invoices paid" },
		pending: { value: 0, helper: "0 pending collections" },
		attention: { value: 0, helper: "0 overdue" },
	},
	"2026-02": {
		subscribers: { value: 3, helper: "3 active accounts" },
		collected: { value: 48900, helper: "7 invoices paid" },
		pending: { value: 1200, helper: "1 pending invoice" },
		attention: { value: 0, helper: "0 overdue" },
	},
	"2026-03": {
		subscribers: { value: 4, helper: "4 active accounts" },
		collected: { value: 52400, helper: "8 invoices paid" },
		pending: { value: 2400, helper: "1 pending invoice" },
		attention: { value: 0, helper: "0 overdue" },
	},
	"2026-04": {
		subscribers: { value: 4, helper: "4 active accounts" },
		collected: { value: 58900, helper: "9 invoices paid" },
		pending: { value: 1500, helper: "1 pending invoice" },
		attention: { value: 1200, helper: "1 past due renewal" },
	},
	"2026-05": {
		subscribers: { value: 4, helper: "4 active accounts" },
		collected: { value: 64150, helper: "10 invoices paid" },
		pending: { value: 3100, helper: "2 pending invoices" },
		attention: { value: 2400, helper: "1 past due renewal" },
	},
	"2026-06": {
		subscribers: { value: 5, helper: "5 active accounts" },
		collected: { value: 71200, helper: "11 invoices paid" },
		pending: { value: 2100, helper: "2 pending invoices" },
		attention: { value: 1800, helper: "1 failed charge" },
	},
	"2026-07": {
		subscribers: { value: 5, helper: "5 active accounts" },
		collected: { value: 76800, helper: "12 invoices paid" },
		pending: { value: 1400, helper: "1 pending invoice" },
		attention: { value: 2969, helper: "1 past due invoice" },
	},
	"2026-08": {
		subscribers: { value: 5, helper: "5 active & scheduled" },
		collected: { value: 82798, helper: "12 total transactions" },
		pending: { value: 1098, helper: "2 pending collections" },
		attention: { value: 3450, helper: "1 past due, 2 failed" },
	},
	"2026-09": {
		subscribers: { value: 6, helper: "6 projected accounts" },
		collected: { value: 89400, helper: "Projected monthly" },
		pending: { value: 850, helper: "Estimated pending" },
		attention: { value: 0, helper: "0 overdue" },
	},
	"2026-10": {
		subscribers: { value: 6, helper: "6 projected accounts" },
		collected: { value: 94800, helper: "Projected monthly" },
		pending: { value: 1100, helper: "Estimated pending" },
		attention: { value: 0, helper: "0 overdue" },
	},
	"2026-11": {
		subscribers: { value: 7, helper: "7 projected accounts" },
		collected: { value: 102500, helper: "Projected monthly" },
		pending: { value: 1500, helper: "Estimated pending" },
		attention: { value: 0, helper: "0 overdue" },
	},
	"2026-12": {
		subscribers: { value: 8, helper: "8 projected accounts" },
		collected: { value: 115000, helper: "Projected monthly" },
		pending: { value: 950, helper: "Estimated pending" },
		attention: { value: 0, helper: "0 overdue" },
	},
};

// Base Yearly Data
const BaseYearlyData: Record<
	string,
	Record<MasterInvoiceAnalyticsMetric, { helper?: string; value: number }>
> = {
	"2023": {
		subscribers: { value: 2, helper: "Early adopter stage" },
		collected: { value: 215000, helper: "Annual collections" },
		pending: { value: 4500, helper: "End of year pending" },
		attention: { value: 2100, helper: "1 resolved overdue" },
	},
	"2024": {
		subscribers: { value: 3, helper: "3 active companies" },
		collected: { value: 485000, helper: "Annual collections" },
		pending: { value: 8200, helper: "End of year pending" },
		attention: { value: 4300, helper: "2 resolved issues" },
	},
	"2025": {
		subscribers: { value: 4, helper: "4 active companies" },
		collected: { value: 742000, helper: "Annual collections" },
		pending: { value: 12500, helper: "End of year pending" },
		attention: { value: 6800, helper: "3 resolved issues" },
	},
	"2026": {
		subscribers: { value: 5, helper: "5 active & scheduled" },
		collected: { value: 993448, helper: "Current year to date" },
		pending: { value: 1098, helper: "Active pending" },
		attention: { value: 3450, helper: "1 past due, 2 failed" },
	},
};

// Per Company Distribution Weights for Simulation
const CompanyMetricShares: Record<
	string,
	{
		attentionShare: number;
		collectedShare: number;
		pendingShare: number;
		subscribersShare: number;
	}
> = {
	"sub-gr8books": {
		collectedShare: 0.18,
		pendingShare: 0.05,
		subscribersShare: 1,
		attentionShare: 0.0,
	},
	"sub-demo-trading": {
		collectedShare: 0.08,
		pendingShare: 0.65,
		subscribersShare: 1,
		attentionShare: 0.1,
	},
	"sub-laguna-manufacturing": {
		collectedShare: 0.64,
		pendingShare: 0.05,
		subscribersShare: 1,
		attentionShare: 0.0,
	},
	"sub-visayas-retail": {
		collectedShare: 0.08,
		pendingShare: 0.25,
		subscribersShare: 1,
		attentionShare: 0.9,
	},
	"sub-cebu-service-studio": {
		collectedShare: 0.02,
		pendingShare: 0.0,
		subscribersShare: 1,
		attentionShare: 0.0,
	},
};

export function getMasterInvoiceAnalyticsData({
	companyId = "all",
	metric,
	period,
	sort = "default",
}: {
	companyId?: string;
	metric: MasterInvoiceAnalyticsMetric;
	period: MasterInvoiceAnalyticsPeriod;
	sort?: MasterInvoiceAnalyticsSort;
}): {
	dataPoints: MasterInvoiceAnalyticsDataPoint[];
	summary: MasterInvoiceAnalyticsSummary;
} {
	const isAllCompanies = companyId === "all" || !companyId;
	const selectedCompany = MasterSubscriptionCompanies.find(
		(c) => c.id === companyId,
	);
	const companyShare =
		!isAllCompanies && companyId && CompanyMetricShares[companyId]
			? CompanyMetricShares[companyId]
			: null;

	const source = period === "monthly" ? BaseMonthlyData : BaseYearlyData;

	let dataPoints: MasterInvoiceAnalyticsDataPoint[] = Object.entries(
		source,
	).map(([key, metrics]) => {
		const raw = metrics[metric];
		let value = raw.value;

		if (!isAllCompanies && companyShare) {
			if (metric === "collected") {
				value = Math.round(value * companyShare.collectedShare);
			} else if (metric === "pending") {
				value = Math.round(value * companyShare.pendingShare);
			} else if (metric === "attention") {
				value = Math.round(value * companyShare.attentionShare);
			} else if (metric === "subscribers") {
				value = 1;
			}
		}

		const label = formatPeriodLabel(key, period);

		return {
			companyId: isAllCompanies ? "all" : companyId,
			companyName: isAllCompanies
				? "All Companies"
				: (selectedCompany?.name ?? "Selected Company"),
			helper: raw.helper,
			key,
			label,
			period: key,
			value,
		};
	});

	// Apply Sorting
	if (sort === "desc") {
		dataPoints = [...dataPoints].sort((a, b) => b.value - a.value);
	} else if (sort === "asc") {
		dataPoints = [...dataPoints].sort((a, b) => a.value - b.value);
	}

	// Calculate Summary
	const values = dataPoints.map((d) => d.value);
	const total = values.reduce((sum, v) => sum + v, 0);
	const count = values.length;
	const average = count > 0 ? Math.round(total / count) : 0;
	const peak = values.length > 0 ? Math.max(...values) : 0;
	const lowest = values.length > 0 ? Math.min(...values) : 0;

	const peakItem = dataPoints.find((d) => d.value === peak);
	const lowestItem = dataPoints.find((d) => d.value === lowest);

	const isCurrency = metric !== "subscribers";
	const formattedTotal = isCurrency
		? formatMasterInvoiceCurrency(total)
		: `${total} total`;
	const formattedPeak = isCurrency
		? formatMasterInvoiceCurrency(peak)
		: `${peak} peak`;
	const formattedAverage = isCurrency
		? `${formatMasterInvoiceCurrency(average)} / ${period === "monthly" ? "mo" : "yr"}`
		: `${average} avg`;

	// Simple growth calculation comparing latest to initial
	const firstVal = dataPoints[0]?.value ?? 0;
	const lastVal = dataPoints[dataPoints.length - 1]?.value ?? 0;
	let growthRate = "+0.0%";
	if (firstVal > 0) {
		const rate = ((lastVal - firstVal) / firstVal) * 100;
		growthRate = `${rate >= 0 ? "+" : ""}${rate.toFixed(1)}%`;
	}

	return {
		dataPoints,
		summary: {
			average,
			count,
			formattedAverage,
			formattedPeak,
			formattedTotal,
			growthRate,
			lowest,
			lowestLabel: lowestItem?.label ?? "-",
			peak,
			peakLabel: peakItem?.label ?? "-",
			total,
		},
	};
}

export function getMasterInvoiceCompanyBreakdown({
	metric,
	sort = "desc",
}: {
	metric: MasterInvoiceAnalyticsMetric;
	sort?: MasterInvoiceAnalyticsSort;
}): MasterInvoiceAnalyticsDataPoint[] {
	let list: MasterInvoiceAnalyticsDataPoint[] = MasterSubscriptionCompanies.map(
		(company) => {
			const share = CompanyMetricShares[company.id] ?? {
				attentionShare: 0.1,
				collectedShare: 0.1,
				pendingShare: 0.1,
				subscribersShare: 1,
			};

			let value = 0;
			let helper = "";

			if (metric === "collected") {
				value = Math.round(82798 * share.collectedShare);
				helper = `${company.branchCount} branches • ${company.userCount} users`;
			} else if (metric === "pending") {
				value = Math.round(1098 * share.pendingShare);
				helper = `${company.billingCycle} billing`;
			} else if (metric === "attention") {
				value = Math.round(3450 * share.attentionShare);
				helper = company.status;
			} else {
				value = 1;
				helper = company.status;
			}

			return {
				companyId: company.id,
				companyName: company.name,
				helper,
				key: company.id,
				label: company.name,
				period: "2026",
				value,
			};
		},
	);

	if (sort === "desc") {
		list = [...list].sort((a, b) => b.value - a.value);
	} else if (sort === "asc") {
		list = [...list].sort((a, b) => a.value - b.value);
	}

	return list;
}

function formatPeriodLabel(
	key: string,
	period: MasterInvoiceAnalyticsPeriod,
): string {
	if (period === "yearly") {
		return key;
	}

	const [year, month] = key.split("-");
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const index = parseInt(month, 10) - 1;
	const monthName = monthNames[index] ?? month;

	return `${monthName} ${year}`;
}
