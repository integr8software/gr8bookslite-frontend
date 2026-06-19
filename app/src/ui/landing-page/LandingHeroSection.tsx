import Link from "next/link";
import {
	ArrowRight,
	BarChart3,
	Check,
	ClipboardCheck,
	ReceiptText,
	Warehouse,
} from "lucide-react";
import { LandingPageBenefits } from "@/app/src/data/landing-page/LandingPageData";

export function LandingHeroSection() {
	return (
		<section className="landing-hero-section relative overflow-hidden border-b border-slate-200">
			<LandingHeroBackground />
			<div className="landing-section-content relative z-10 grid gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[0.92fr_0.78fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
				<div className="max-w-3xl">
					<h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
						Clear books. Controlled stock. One workspace.
					</h1>
					<p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
						Gr8Books Neo connects accounting, inventory, sales,
						purchasing, approvals, and reporting so your team can
						work from clean records instead of separate
						spreadsheets.
					</p>
					<ul className="mt-8 space-y-3 text-sm font-medium text-slate-700">
						{LandingPageBenefits.map((benefit) => (
							<li
								key={benefit}
								className="flex items-center gap-3"
							>
								<Check
									className="h-5 w-5 text-sky-700"
									aria-hidden="true"
								/>
								{benefit}
							</li>
						))}
					</ul>
					<div className="mt-9 flex flex-col gap-3 sm:flex-row">
						<Link
							href="/signup"
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
						>
							Create workspace{" "}
							<ArrowRight
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</Link>
						<Link
							href="/pricing"
							className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
						>
							See pricing
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

function LandingHeroBackground() {
	return (
		<div
			className="pointer-events-none absolute inset-0"
			aria-hidden="true"
		>
			<div className="landing-hero-glow absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_90%_72%,rgba(34,211,238,0.12),transparent_25%)]" />
			<div className="landing-hero-grid absolute inset-0" />
			<div className="landing-3d-stage absolute right-[8%] top-[13%] hidden h-[30rem] w-[34rem] lg:block">
				<div className="landing-3d-plane landing-3d-plane-a" />
				<div className="landing-3d-plane landing-3d-plane-b" />
				<div className="landing-3d-plane landing-3d-plane-c" />
				<div className="landing-3d-cube landing-3d-cube-a" />
				<div className="landing-3d-cube landing-3d-cube-b" />
				<div className="landing-3d-cube landing-3d-cube-c" />
			</div>
			<LandingConnectedAnimation />
		</div>
	);
}

function LandingConnectedAnimation() {
	return (
		<div className="landing-connected-flow absolute right-6 top-[17%] hidden h-[27rem] w-[38rem] xl:block">
			<svg
				className="absolute inset-0 h-full w-full"
				viewBox="0 0 608 464"
				fill="none"
			>
				<path
					className="landing-flow-path"
					d="M136 116 C220 76 332 76 432 116"
				/>
				<path
					className="landing-flow-path landing-flow-path-delay"
					d="M136 116 C190 206 250 248 304 236 C360 224 410 170 432 116"
				/>
				<path
					className="landing-flow-path"
					d="M176 330 C236 272 374 272 432 330"
				/>
				<path
					className="landing-flow-path landing-flow-path-delay"
					d="M176 330 C202 236 238 188 304 236 C374 286 410 248 432 116"
				/>
				<circle className="landing-flow-dot" cx="136" cy="116" r="4" />
				<circle className="landing-flow-dot" cx="432" cy="116" r="4" />
				<circle className="landing-flow-dot" cx="304" cy="236" r="5" />
				<circle className="landing-flow-dot" cx="176" cy="330" r="4" />
				<circle className="landing-flow-dot" cx="432" cy="330" r="4" />
			</svg>
			<LandingConnectedNode
				className="left-3 top-[3.25rem]"
				icon={ReceiptText}
				label="Accounting"
				value="Posted books"
			/>
			<LandingConnectedNode
				className="right-3 top-[3.25rem]"
				icon={Warehouse}
				label="Inventory"
				value="Live stock"
			/>
			<LandingConnectedNode
				className="left-10 bottom-[3.5rem]"
				icon={ClipboardCheck}
				label="Purchasing"
				value="Approved flow"
			/>
			<LandingConnectedNode
				className="right-3 bottom-[3.5rem]"
				icon={BarChart3}
				label="Reports"
				value="Clean insights"
			/>
		</div>
	);
}

function LandingConnectedNode({
	className,
	icon: Icon,
	label,
	value,
}: Readonly<{
	className: string;
	icon: typeof ReceiptText;
	label: string;
	value: string;
}>) {
	return (
		<div
			className={`landing-connected-node absolute flex w-48 items-center gap-3.5 rounded-lg border border-sky-200/80 bg-white/90 p-3.5 shadow-xl shadow-sky-900/10 backdrop-blur ${className}`}
		>
			<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
				<Icon className="h-6 w-6" aria-hidden="true" />
			</div>
			<div className="min-w-0">
				<p className="text-base font-semibold leading-5 text-slate-950">
					{label}
				</p>
				<p className="mt-1 text-sm font-medium leading-5 text-slate-500">
					{value}
				</p>
			</div>
		</div>
	);
}
