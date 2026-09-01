"use client";

import { useId, useMemo, useState } from "react";
import {
	AlertTriangle,
	ArrowDownNarrowWide,
	ArrowUpNarrowWide,
	Building2,
	Calendar,
	CalendarClock,
	CheckCircle2,
	ChevronDown,
	Clock,
	Eye,
	ReceiptText,
	TrendingUp,
	X,
} from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	getMasterInvoiceAnalyticsData,
	type MasterInvoiceAnalyticsDataPoint,
	type MasterInvoiceAnalyticsMetric,
	type MasterInvoiceAnalyticsPeriod,
	type MasterInvoiceAnalyticsSort,
} from "@/app/src/data/master/invoices/MasterInvoiceAnalyticsData";
import { formatMasterInvoiceCurrency } from "@/app/src/data/master/invoices/MasterInvoiceData";
import { MasterSubscriptionCompanies } from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterInvoiceAnalyticsChartProps = {
	activeMetric: MasterInvoiceAnalyticsMetric;
	onClose: () => void;
	onSelectMetric: (metric: MasterInvoiceAnalyticsMetric) => void;
};

const CurrencyUnit = "PHP";

const MetricMeta: Record<
	MasterInvoiceAnalyticsMetric,
	{
		badgeClass: string;
		color: string;
		description: string;
		gradientEnd: string;
		gradientStart: string;
		icon: typeof ReceiptText;
		label: string;
		tone: "emerald" | "blue" | "amber" | "red";
		unit: string;
	}
> = {
	collected: {
		badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
		color: "#10b981",
		description: "Total invoice payments successfully collected and processed.",
		gradientEnd: "#059669",
		gradientStart: "#10b981",
		icon: ReceiptText,
		label: "Total Collected",
		tone: "emerald",
		unit: CurrencyUnit,
	},
	subscribers: {
		badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
		color: "#0ea5e9",
		description: "Active, trial, and scheduled subscriber company accounts.",
		gradientEnd: "#0284c7",
		gradientStart: "#0ea5e9",
		icon: Building2,
		label: "Subscribers",
		tone: "blue",
		unit: "Accounts",
	},
	pending: {
		badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
		color: "#f59e0b",
		description: "Outstanding invoice amounts awaiting payment confirmation or processing.",
		gradientEnd: "#d97706",
		gradientStart: "#f59e0b",
		icon: CalendarClock,
		label: "Pending Revenue",
		tone: "amber",
		unit: CurrencyUnit,
	},
	attention: {
		badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
		color: "#f43f5e",
		description: "Invoices requiring review, including past due renewals and failed payments.",
		gradientEnd: "#e11d48",
		gradientStart: "#f43f5e",
		icon: AlertTriangle,
		label: "Needs Attention",
		tone: "red",
		unit: CurrencyUnit,
	},
};


export function MasterInvoiceAnalyticsChart({
	activeMetric,
	onClose,
	onSelectMetric,
}: MasterInvoiceAnalyticsChartProps) {
	const gradientId = useId();
	const [period, setPeriod] =
		useState<MasterInvoiceAnalyticsPeriod>("monthly");
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
	const [sort, setSort] = useState<MasterInvoiceAnalyticsSort>("default");

	const meta = MetricMeta[activeMetric];
	const Icon = meta.icon;

	const { dataPoints, summary } = useMemo(() => {
		return getMasterInvoiceAnalyticsData({
			companyId: selectedCompanyId,
			metric: activeMetric,
			period,
			sort,
		});
	}, [activeMetric, period, selectedCompanyId, sort]);

	const formatAxisValue = (value: number) => {
		if (activeMetric === "subscribers") {
			return `${value}`;
		}
		if (value >= 1000000) {
			return `₱${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `₱${(value / 1000).toFixed(0)}k`;
		}
		return `₱${value}`;
	};

	return (
		<section className="relative overflow-hidden rounded-2xl border border-darknavy/10 bg-white shadow-md shadow-darknavy/5 transition-all">
			{/* Top Accent Line matching tone */}
			<div
				className="h-1.5 w-full"
				style={{
					background: `linear-gradient(90deg, ${meta.gradientStart}, ${meta.gradientEnd})`,
				}}
			/>

			<div className="p-5 sm:p-6">
				{/* Header Section */}
				<div className="flex flex-col gap-4 border-b border-darknavy/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center gap-4 sm:gap-5">
						<div
							className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-4 ring-black/5"
							style={{ backgroundColor: meta.color }}
						>
							<Icon className="h-6 w-6" aria-hidden="true" />
						</div>
						<div className="min-w-0 pl-1">
							<div className="flex flex-wrap items-center gap-2.5">
								<h2 className="text-lg font-bold text-darknavy">
									{meta.label} Analytics
								</h2>
								<span
									className={joinClasses(
										"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
										meta.badgeClass,
									)}
								>
									{period === "monthly" ? "Monthly Trend" : "Yearly Trend"}
								</span>
							</div>
							<p className="mt-1 text-xs text-darknavy/60 sm:text-sm">
								{meta.description}
							</p>
						</div>
					</div>


					{/* Metric Switcher & Close button */}
					<div className="flex flex-wrap items-center gap-2">
						<div className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/60 p-1">
							{(
								[
									"subscribers",
									"collected",
									"pending",
									"attention",
								] as MasterInvoiceAnalyticsMetric[]
							).map((mKey) => {
								const isSelected = activeMetric === mKey;
								const mMeta = MetricMeta[mKey];
								const MIcon = mMeta.icon;
								return (
									<button
										key={mKey}
										type="button"
										onClick={() => onSelectMetric(mKey)}
										className={joinClasses(
											"flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
											isSelected
												? "bg-white text-darknavy shadow-sm ring-1 ring-darknavy/10"
												: "text-darknavy/60 hover:text-darknavy hover:bg-white/50",
										)}
									>
										<MIcon
											className="h-3.5 w-3.5"
											style={{
												color: isSelected ? mMeta.color : undefined,
											}}
										/>
										<span className="hidden sm:inline">{mMeta.label}</span>
									</button>
								);
							})}
						</div>

						<button
							type="button"
							onClick={onClose}
							aria-label="Close analytics chart"
							className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-darknavy/10 bg-white text-darknavy/60 transition hover:bg-offwhite hover:text-darknavy"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* Controls Bar: Timeframe, Company Filter, Sort Order */}
				<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-offwhite/50 p-3">
					{/* Period Switcher (Monthly / Yearly) */}
					<div className="flex items-center gap-2">
						<span className="text-xs font-bold uppercase tracking-wider text-darknavy/50">
							Interval:
						</span>
						<div className="inline-flex overflow-hidden rounded-lg border border-darknavy/10 bg-white p-0.5 shadow-xs">
							<button
								type="button"
								onClick={() => setPeriod("monthly")}
								className={joinClasses(
									"flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold transition",
									period === "monthly"
										? "bg-darknavy text-white shadow-xs"
										: "text-darknavy/65 hover:text-darknavy",
								)}
							>
								<Calendar className="h-3.5 w-3.5" />
								Monthly
							</button>
							<button
								type="button"
								onClick={() => setPeriod("yearly")}
								className={joinClasses(
									"flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold transition",
									period === "yearly"
										? "bg-darknavy text-white shadow-xs"
										: "text-darknavy/65 hover:text-darknavy",
								)}
							>
								<Clock className="h-3.5 w-3.5" />
								Yearly
							</button>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2.5">
						{/* Company Filter Dropdown */}
						<div className="flex items-center gap-1.5">
							<label
								htmlFor="analytics-company-filter"
								className="text-xs font-bold uppercase tracking-wider text-darknavy/50"
							>
								Company:
							</label>
							<div className="relative">
								<select
									id="analytics-company-filter"
									value={selectedCompanyId}
									onChange={(e) => setSelectedCompanyId(e.target.value)}
									className="h-8.5 rounded-lg border border-darknavy/10 bg-white pl-2.5 pr-8 text-xs font-semibold text-darknavy shadow-xs transition focus:border-skyblue focus:outline-hidden focus:ring-2 focus:ring-skyblue/20"
								>
									<option value="all">All Companies (Overall)</option>
									{MasterSubscriptionCompanies.map((comp) => (
										<option key={comp.id} value={comp.id}>
											{comp.name}
										</option>
									))}
								</select>
								<ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-darknavy/40" />
							</div>
						</div>

						{/* Sort Order Dropdown */}
						<div className="flex items-center gap-1.5">
							<label
								htmlFor="analytics-sort-filter"
								className="text-xs font-bold uppercase tracking-wider text-darknavy/50"
							>
								Sort:
							</label>
							<div className="relative">
								<select
									id="analytics-sort-filter"
									value={sort}
									onChange={(e) =>
										setSort(e.target.value as MasterInvoiceAnalyticsSort)
									}
									className="h-8.5 rounded-lg border border-darknavy/10 bg-white pl-2.5 pr-8 text-xs font-semibold text-darknavy shadow-xs transition focus:border-skyblue focus:outline-hidden focus:ring-2 focus:ring-skyblue/20"
								>
									<option value="default">Chronological</option>
									<option value="desc">Highest to Lowest</option>
									<option value="asc">Lowest to Highest</option>
								</select>
								{sort === "desc" ? (
									<ArrowDownNarrowWide className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-darknavy/40" />
								) : sort === "asc" ? (
									<ArrowUpNarrowWide className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-darknavy/40" />
								) : (
									<ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-darknavy/40" />
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Quick Stats Summary Grid */}
				<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
					<div className="rounded-xl border border-darknavy/10 bg-white p-3 shadow-xs">
						<p className="text-[11px] font-bold uppercase tracking-wider text-darknavy/45">
							Selected Total
						</p>
						<p className="mt-1 text-base font-bold text-darknavy">
							{summary.formattedTotal}
						</p>
						<p className="mt-0.5 text-xs text-darknavy/55">
							Across {summary.count} {period === "monthly" ? "months" : "years"}
						</p>
					</div>

					<div className="rounded-xl border border-darknavy/10 bg-white p-3 shadow-xs">
						<p className="text-[11px] font-bold uppercase tracking-wider text-darknavy/45">
							Peak Period
						</p>
						<p className="mt-1 text-base font-bold text-darknavy">
							{summary.formattedPeak}
						</p>
						<p className="mt-0.5 text-xs font-semibold text-emerald-600 truncate">
							{summary.peakLabel}
						</p>
					</div>

					<div className="rounded-xl border border-darknavy/10 bg-white p-3 shadow-xs">
						<p className="text-[11px] font-bold uppercase tracking-wider text-darknavy/45">
							Average / {period === "monthly" ? "Month" : "Year"}
						</p>
						<p className="mt-1 text-base font-bold text-darknavy">
							{summary.formattedAverage}
						</p>
						<p className="mt-0.5 text-xs text-darknavy/55">Normalized avg</p>
					</div>

					<div className="rounded-xl border border-darknavy/10 bg-white p-3 shadow-xs">
						<p className="text-[11px] font-bold uppercase tracking-wider text-darknavy/45">
							Growth Rate
						</p>
						<div className="mt-1 flex items-center gap-1.5">
							<TrendingUp className="h-4 w-4 text-emerald-600" />
							<span className="text-base font-bold text-emerald-600">
								{summary.growthRate}
							</span>
						</div>
						<p className="mt-0.5 text-xs text-darknavy/55">Overall trajectory</p>
					</div>
				</div>

				{/* Area Chart Container */}
				<div className="mt-5 rounded-2xl border border-darknavy/10 bg-offwhite/40 p-4 pt-6">
					<div className="h-72 sm:h-80 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={dataPoints}
								margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
							>
								<defs>
									<linearGradient
										id={gradientId}
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor={meta.color}
											stopOpacity={0.48}
										/>
										<stop
											offset="60%"
											stopColor={meta.color}
											stopOpacity={0.15}
										/>
										<stop
											offset="95%"
											stopColor={meta.color}
											stopOpacity={0.01}
										/>
									</linearGradient>
								</defs>

								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(33, 39, 56, 0.08)"
									vertical={false}
								/>

								<XAxis
									dataKey="label"
									axisLine={{ stroke: "rgba(33, 39, 56, 0.15)" }}
									tickLine={false}
									tick={{
										fill: "rgba(33, 39, 56, 0.65)",
										fontSize: 11,
										fontWeight: 600,
									}}
									dy={6}
								/>

								<YAxis
									axisLine={false}
									tickLine={false}
									tickFormatter={formatAxisValue}
									tick={{
										fill: "rgba(33, 39, 56, 0.55)",
										fontSize: 11,
										fontWeight: 600,
									}}
									dx={-4}
								/>

								<Tooltip
									content={
										<CustomAnalyticsTooltip
											activeMetric={activeMetric}
											period={period}
										/>
									}
								/>

								<Area
									type="monotone"
									dataKey="value"
									name={meta.label}
									stroke={meta.color}
									strokeWidth={3}
									fillOpacity={1}
									fill={`url(#${gradientId})`}
									dot={{
										fill: meta.color,
										r: 3.5,
										stroke: "#ffffff",
										strokeWidth: 2,
									}}
									activeDot={{
										fill: meta.color,
										r: 6.5,
										stroke: "#ffffff",
										strokeWidth: 2.5,
									}}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</section>
	);
}

function CustomAnalyticsTooltip({
	active,
	activeMetric,
	payload,
	period,
}: {
	active?: boolean;
	activeMetric: MasterInvoiceAnalyticsMetric;
	payload?: Array<{ payload: MasterInvoiceAnalyticsDataPoint; value: number }>;
	period: MasterInvoiceAnalyticsPeriod;
}) {

	if (!active || !payload || payload.length === 0) {
		return null;
	}

	const dataPoint = payload[0].payload;
	const isCurrency = activeMetric !== "subscribers";
	const meta = MetricMeta[activeMetric];

	return (
		<div className="min-w-48 rounded-xl border border-darknavy/15 bg-darknavy p-3 text-white shadow-xl">
			<p className="text-xs font-semibold text-white/70">
				{dataPoint.label} ({period === "monthly" ? "Month" : "Year"})
			</p>
			<p className="mt-0.5 text-xs text-white/40 truncate">
				{dataPoint.companyName}
			</p>

			<div className="my-2 border-t border-white/10" />

			<div className="flex items-center justify-between gap-4">
				<span className="text-xs font-medium text-white/80">{meta.label}:</span>
				<span
					className="text-sm font-bold"
					style={{ color: meta.color }}
				>
					{isCurrency
						? formatMasterInvoiceCurrency(dataPoint.value)
						: `${dataPoint.value} accounts`}
				</span>
			</div>

			{dataPoint.helper ? (
				<p className="mt-1 text-[11px] text-white/50">{dataPoint.helper}</p>
			) : null}
		</div>
	);
}
