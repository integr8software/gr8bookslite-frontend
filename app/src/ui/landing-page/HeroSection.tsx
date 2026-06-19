import {
	BarChart3,
	BookOpen,
	CirclePlay,
	PackageCheck,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import { LandingActionLink } from "@/app/src/ui/landing-page/LandingActionLink";

const ProofPoints = [
	{ icon: BookOpen, value: "One workspace", label: "Connected books" },
	{ icon: PackageCheck, value: "Live stock", label: "Inventory visibility" },
	{ icon: ShieldCheck, value: "Controlled", label: "Roles and approvals" },
	{ icon: BarChart3, value: "Clear reports", label: "Operational insight" },
] as const;

export function HeroSection() {
	return (
		<section
			id="product"
			className="landing-section relative overflow-hidden border-b border-darknavy/10 bg-white"
		>
			<HeroBackdrop />
			<div className="landing-section-content relative z-10 text-center">
				<div className="mx-auto max-w-4xl">
					<h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-darknavy sm:text-6xl lg:text-7xl">
						Modern bookkeeping for the{" "}
						<span className="text-sky-600">next generation</span> of
						business.
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-darknavy/60 sm:text-lg">
						Gr8Books Neo connects accounting, inventory, purchasing,
						sales, approvals, and reporting—so your team can focus on
						growth instead of reconciling scattered records.
					</p>
					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<LandingActionLink href="/signup" showArrow>
							Start for free
						</LandingActionLink>
						<LandingActionLink
							href="/#features"
							variant="secondary"
						>
							<CirclePlay className="h-4 w-4 text-sky-700" />
							Explore the product
						</LandingActionLink>
					</div>
				</div>

				<div className="mx-auto mt-10 hidden max-w-3xl grid-cols-2 gap-3 sm:grid lg:grid-cols-4">
					{ProofPoints.map((point) => (
						<div
							key={point.value}
							className="flex items-center gap-3 rounded-xl border border-darknavy/10 bg-white/90 p-3 text-left shadow-sm"
						>
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-skyblue/10 text-sky-700">
								<point.icon className="h-4 w-4" />
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-darknavy">
									{point.value}
								</p>
								<p className="truncate text-[11px] text-darknavy/45">
									{point.label}
								</p>
							</div>
						</div>
					))}
				</div>

				<ProductPreview />
			</div>
		</section>
	);
}

function HeroBackdrop() {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(87,196,229,0.16),transparent_30%),radial-gradient(circle_at_12%_20%,rgba(209,214,70,0.10),transparent_22%)]" />
			<div className="absolute inset-0 opacity-45 [background-image:radial-gradient(rgba(33,39,56,0.13)_1px,transparent_1px)] [background-size:24px_24px]" />
			<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-offwhite to-transparent" />
		</div>
	);
}

function ProductPreview() {
	return (
		<div
			className="relative mx-auto mt-12 hidden max-w-6xl sm:block"
			aria-label="Product dashboard preview highlighting smart categorization and live inventory sync"
		>
			<div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-skyblue/10 blur-3xl" />
			<PreviewHighlight
				className="-left-4 top-28"
				icon={Sparkles}
				title="Smart categorization"
				text="Transactions organized"
			/>
			<PreviewHighlight
				className="-right-4 bottom-14"
				icon={PackageCheck}
				title="Live inventory sync"
				text="Books and stock connected"
			/>

			<div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 text-left shadow-[0_28px_80px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/10 backdrop-blur-xl">
				<div className="flex h-11 items-center justify-between border-b border-darknavy/10 bg-offwhite/80 px-4">
					<div className="flex gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full bg-coralpink" />
						<span className="h-2.5 w-2.5 rounded-full bg-citron" />
						<span className="h-2.5 w-2.5 rounded-full bg-skyblue" />
					</div>
					<div className="rounded-md border border-darknavy/10 bg-white px-4 py-1 text-[10px] font-semibold text-darknavy/40">
						app.gr8booksneo.com/dashboard
					</div>
					<div className="w-10" />
				</div>
				<div className="grid min-h-[25rem] md:grid-cols-[13rem_1fr]">
					<SkeletonSidebar />
					<SkeletonDashboard />
				</div>
			</div>
		</div>
	);
}

function SkeletonSidebar() {
	return (
		<aside
			className="hidden border-r border-darknavy/10 bg-white/65 p-5 backdrop-blur-md md:block"
			aria-hidden="true"
		>
			<div className="flex items-center gap-3">
				<div className="h-8 w-8 rounded-lg bg-darknavy" />
				<div className="h-2.5 w-20 rounded-full bg-darknavy/15" />
			</div>
			<div className="mt-7 space-y-3">
				<div className="flex items-center gap-3 rounded-lg bg-skyblue/10 px-3 py-3">
					<div className="h-4 w-4 rounded bg-skyblue/35" />
					<div className="h-2 w-24 rounded-full bg-darknavy/20" />
				</div>
				{["w-20", "w-28", "w-16", "w-24"].map((width) => (
					<div key={width} className="flex items-center gap-3 px-3 py-2">
						<div className="h-3.5 w-3.5 rounded bg-darknavy/10" />
						<div className={`h-2 rounded-full bg-darknavy/10 ${width}`} />
					</div>
				))}
			</div>
		</aside>
	);
}

function SkeletonDashboard() {
	return (
		<div className="p-5 sm:p-7" aria-hidden="true">
			<div className="flex items-center justify-between gap-6">
				<div className="space-y-3">
					<div className="h-3 w-40 rounded-full bg-darknavy" />
					<div className="h-2.5 w-56 max-w-[55vw] rounded-full bg-darknavy/10" />
				</div>
				<div className="flex gap-2">
					<div className="hidden h-9 w-20 rounded-lg bg-offwhite ring-1 ring-darknavy/10 sm:block" />
					<div className="h-9 w-24 rounded-lg bg-darknavy/80" />
				</div>
			</div>

			<div className="mt-7 grid gap-3 sm:grid-cols-3">
				{["bg-citron/55", "bg-skyblue/55", "bg-coralpink/40"].map(
					(accent) => (
						<div
							key={accent}
							className="rounded-xl border border-darknavy/10 bg-white p-4"
						>
							<div className="h-2 w-16 rounded-full bg-darknavy/10" />
							<div className="mt-3 h-3.5 w-20 rounded-full bg-darknavy/80" />
							<div className={`mt-3 h-1.5 w-12 rounded-full ${accent}`} />
						</div>
					),
				)}
			</div>

			<div className="mt-6 overflow-hidden rounded-xl border border-darknavy/10">
				<div className="flex items-center justify-between bg-offwhite px-4 py-3">
					<div className="h-2 w-24 rounded-full bg-darknavy/15" />
					<div className="flex gap-3">
						<div className="h-2 w-12 rounded-full bg-darknavy/10" />
						<div className="h-2 w-16 rounded-full bg-darknavy/10" />
					</div>
				</div>
				{[72, 58, 82, 64].map((width, index) => (
					<div
						key={width}
						className="flex items-center gap-4 border-t border-darknavy/10 px-4 py-4"
					>
						<div className="h-7 w-7 shrink-0 rounded-full bg-darknavy/10" />
						<div className="min-w-0 flex-1">
							<div
								className="h-2.5 rounded-full bg-darknavy/15"
								style={{ width: `${width}%` }}
							/>
							<div className="mt-2 h-2 w-20 rounded-full bg-darknavy/10" />
						</div>
						<div
							className={`hidden h-6 w-14 rounded-full sm:block ${
								index === 1 ? "bg-citron/25" : "bg-skyblue/15"
							}`}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function PreviewHighlight({
	className,
	icon: Icon,
	title,
	text,
}: Readonly<{
	className: string;
	icon: typeof Sparkles;
	title: string;
	text: string;
}>) {
	return (
		<div
			className={`absolute z-20 hidden items-center gap-3 rounded-xl border border-white/80 bg-white/90 p-3 text-left shadow-[0_12px_32px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/10 backdrop-blur-md sm:flex ${className}`}
		>
			<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-skyblue/10 text-sky-700">
				<Icon className="h-4 w-4" />
			</div>
			<div>
				<p className="text-xs font-bold text-darknavy">{title}</p>
				<p className="mt-0.5 text-[10px] text-darknavy/45">{text}</p>
			</div>
		</div>
	);
}
