"use client";

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export type SharedChartType = "area" | "bar" | "donut" | "line" | "pie";

export type SharedChartSeries = {
	color: string;
	key: string;
	label: string;
};

type ChartCardProps<TData extends Record<string, string | number>> = {
	data: TData[];
	description: string;
	indexKey: keyof TData & string;
	series: SharedChartSeries[];
	title: string;
	type: SharedChartType;
	valueFormatter?: (value: number) => string;
};

export function ChartCard<TData extends Record<string, string | number>>({
	data,
	description,
	indexKey,
	series,
	title,
	type,
	valueFormatter = (value) => String(value),
}: ChartCardProps<TData>) {
	return (
		<div className="border-b border-darknavy/8 px-6 py-5">
			<div className="rounded-3xl border border-darknavy/8 bg-offwhite p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-darknavy">{title}</p>
						<p className="mt-1 text-sm text-darknavy/50">{description}</p>
					</div>
				</div>

				<div className="mt-5 h-72">
					<ResponsiveContainer width="100%" height="100%">
						{type === "bar" ? (
							<BarChart data={data} margin={ChartMargin}>
								<ChartScaffold
									indexKey={indexKey}
									valueFormatter={valueFormatter}
								/>
								{series.map((item) => (
									<Bar
										key={item.key}
										dataKey={item.key}
										fill={item.color}
										name={item.label}
										radius={[6, 6, 0, 0]}
									/>
								))}
							</BarChart>
						) : type === "line" ? (
							<LineChart data={data} margin={ChartMargin}>
								<ChartScaffold
									indexKey={indexKey}
									valueFormatter={valueFormatter}
								/>
								{series.map((item) => (
									<Line
										key={item.key}
										type="monotone"
										dataKey={item.key}
										name={item.label}
										stroke={item.color}
										strokeWidth={3}
										dot={{ fill: item.color, r: 4, strokeWidth: 2 }}
										activeDot={{ r: 6, strokeWidth: 0 }}
									/>
								))}
							</LineChart>
						) : type === "area" ? (
							<AreaChart data={data} margin={ChartMargin}>
								<ChartScaffold
									indexKey={indexKey}
									valueFormatter={valueFormatter}
								/>
								{series.map((item) => (
									<Area
										key={item.key}
										type="monotone"
										dataKey={item.key}
										name={item.label}
										stroke={item.color}
										strokeWidth={3}
										fill={item.color}
										fillOpacity={0.16}
										dot={{ fill: item.color, r: 4, strokeWidth: 2 }}
										activeDot={{ r: 6, strokeWidth: 0 }}
									/>
								))}
							</AreaChart>
						) : (
							<PieChart margin={ChartMargin}>
								<Tooltip
									content={<ChartTooltip valueFormatter={valueFormatter} />}
									{...TooltipProps}
								/>
								<Legend
									iconType="circle"
									wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
								/>
								<Pie
									data={createDonutData(data, series)}
									dataKey="value"
									nameKey="name"
									innerRadius={type === "donut" ? "58%" : 0}
									outerRadius="82%"
									paddingAngle={3}
								>
									{series.map((item) => (
										<Cell key={item.key} fill={item.color} />
									))}
								</Pie>
							</PieChart>
						)}
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

function ChartScaffold({
	indexKey,
	valueFormatter,
}: {
	indexKey: string;
	valueFormatter: (value: number) => string;
}) {
	return (
		<>
			<CartesianGrid stroke="rgba(33,39,56,0.08)" vertical={false} />
			<XAxis
				dataKey={indexKey}
				axisLine={false}
				tickLine={false}
				tick={{ fill: "rgba(33,39,56,0.5)", fontSize: 12, fontWeight: 700 }}
			/>
			<YAxis
				axisLine={false}
				tickLine={false}
				tickFormatter={(value) => valueFormatter(Number(value))}
				tick={{ fill: "rgba(33,39,56,0.45)", fontSize: 12, fontWeight: 600 }}
			/>
			<Tooltip
				content={<ChartTooltip valueFormatter={valueFormatter} />}
				{...TooltipProps}
			/>
			<Legend
				iconType="circle"
				wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 12 }}
			/>
		</>
	);
}

function ChartTooltip({
	active,
	label,
	payload,
	valueFormatter,
}: {
	active?: boolean;
	label?: string;
	payload?: Array<{
		color?: string;
		name?: string;
		value?: number | string;
	}>;
	valueFormatter: (value: number) => string;
}) {
	if (!active || !payload?.length) {
		return null;
	}

	return (
		<div className="rounded-lg bg-darknavy px-3 py-2 text-white shadow-lg">
			<p className="text-xs font-bold">{label}</p>
			<dl className="mt-1 space-y-1">
				{payload.map((item) => (
					<div
						key={item.name}
						className="flex items-center justify-between gap-4"
					>
						<dt className="flex items-center gap-1.5 text-xs text-white/75">
							<span
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							{item.name}
						</dt>
						<dd className="text-xs font-bold">
							{typeof item.value === "number"
								? valueFormatter(item.value)
								: item.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

function createDonutData<TData extends Record<string, string | number>>(
	data: TData[],
	series: SharedChartSeries[],
) {
	return series.map((item) => ({
		name: item.label,
		value: data.reduce((sum, record) => {
			const value = record[item.key];
			return sum + (typeof value === "number" ? value : 0);
		}, 0),
	}));
}

const ChartMargin = {
	bottom: 12,
	left: 8,
	right: 16,
	top: 12,
};

const TooltipProps = {
	animationDuration: 0,
	isAnimationActive: false,
} as const;
