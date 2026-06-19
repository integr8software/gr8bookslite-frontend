import {
	BookOpenCheck,
	ChartNoAxesCombined,
	ShieldCheck,
	Workflow,
} from "lucide-react";
import { LandingActionLink } from "@/app/src/ui/landing-page/LandingActionLink";

const ProductAssurances = [
	{ icon: ShieldCheck, label: "Role-based access" },
	{ icon: BookOpenCheck, label: "Audit-ready history" },
	{ icon: Workflow, label: "Connected workflows" },
	{ icon: ChartNoAxesCombined, label: "Practical reporting" },
] as const;

export function CallToActionSection() {
	return (
		<section
			id="get-started"
			className="landing-section relative overflow-hidden bg-darknavy text-white"
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] bg-size-[24px_24px]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(87,196,229,0.20),transparent_34%),radial-gradient(circle_at_15%_90%,rgba(209,214,70,0.08),transparent_24%)]"
				aria-hidden="true"
			/>

			<div className="landing-section-content relative z-10 text-center">
				<h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.06] tracking-tighter text-white sm:text-5xl lg:text-6xl">
					Your books are ready{" "}
					<span className="text-skyblue">when you are.</span>
				</h2>
				<p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
					Create your workspace, choose the package that fits your
					company, and bring accounting and inventory into one clear
					operating view.
				</p>

				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<LandingActionLink href="/signup" surface="dark" showArrow>
						Start for free
					</LandingActionLink>
					<LandingActionLink href="/pricing" variant="secondary">
						See pricing
					</LandingActionLink>
				</div>

				<div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-7 lg:grid-cols-4">
					{ProductAssurances.map((item) => (
						<div
							key={item.label}
							className="flex items-center justify-center gap-2 text-xs font-medium text-white/45"
						>
							<item.icon className="h-3.5 w-3.5 text-skyblue/75" />
							{item.label}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
