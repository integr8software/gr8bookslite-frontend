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
		<article className="workspace-chart-card rounded-[1.75rem] border p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-darknavy">{title}</p>
					<p className="mt-1 text-sm text-darknavy/50">{description}</p>
				</div>
			</div>

			<div className="workspace-chart-plot mt-5 h-72 min-h-72 min-w-0 rounded-3xl p-4">
				<ResponsiveContainer
					width="100%"
					height="100%"
					minWidth={ChartMinWidth}
					minHeight={ChartMinHeight}
				>
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
		</article>
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
			<CartesianGrid stroke="var(--workspace-chart-grid)" vertical={false} />
			<XAxis
				dataKey={indexKey}
				axisLine={false}
				tickLine={false}
				tick={{
					fill: "var(--workspace-chart-axis-strong)",
					fontSize: 12,
					fontWeight: 700,
				}}
			/>
			<YAxis
				axisLine={false}
				tickLine={false}
				tickFormatter={(value) => valueFormatter(Number(value))}
				tick={{
					fill: "var(--workspace-chart-axis)",
					fontSize: 12,
					fontWeight: 600,
				}}
			/>
			<Tooltip
				content={<ChartTooltip valueFormatter={valueFormatter} />}
				{...TooltipProps}
			/>
			<Legend
				iconType="circle"
				wrapperStyle={{
					color: "var(--workspace-chart-legend)",
					fontSize: 12,
					fontWeight: 600,
					paddingTop: 12,
				}}
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
		<div className="workspace-chart-tooltip rounded-xl border px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur">
			<p className="text-xs font-bold text-[var(--workspace-chart-tooltip-title)]">
				{label}
			</p>
			<dl className="mt-1 space-y-1">
				{payload.map((item) => (
					<div
						key={item.name}
						className="flex items-center justify-between gap-4"
					>
						<dt className="flex items-center gap-1.5 text-xs text-[var(--workspace-chart-tooltip-muted)]">
							<span
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							{item.name}
						</dt>
						<dd className="text-xs font-bold text-[var(--workspace-chart-tooltip-title)]">
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

function ChartHoverCursor({
	height,
	width,
	x,
	y,
}: {
	height?: number;
	width?: number;
	x?: number;
	y?: number;
}) {
	if (
		typeof height !== "number" ||
		typeof width !== "number" ||
		typeof x !== "number" ||
		typeof y !== "number"
	) {
		return null;
	}

	return (
		<rect
			className="workspace-chart-hover-cursor"
			height={height}
			rx="10"
			ry="10"
			width={width}
			x={x}
			y={y}
		/>
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

const ChartMinHeight = 240;
const ChartMinWidth = 240;

const TooltipProps = {
	animationDuration: 0,
	cursor: <ChartHoverCursor />,
	isAnimationActive: false,
} as const;
