"use client";

import { motion } from "framer-motion";
import { LandingPageModules } from "@/app/src/data/landing-page/LandingPageData";
import { useLandingModuleCarousel } from "@/app/src/hooks/landing-page/useLandingModuleCarousel";
import type { LandingPageModule } from "@/app/src/types/landing-page/LandingPageTypes";
import { FeatureIcon } from "@/app/src/ui/landing-page/FeatureIcon";

export function ModulesSection() {
	const { trackRef, x, handleDragStart, handleDragEnd } =
		useLandingModuleCarousel();

	return (
		<section className="landing-section landing-modules-section bg-white">
			<div className="landing-section-content">
				<div className="landing-module-marquee-wrap">
					<div className="landing-module-marquee">
						<motion.div
							ref={trackRef}
							className="landing-module-marquee-track"
							style={{ x }}
							drag="x"
							dragConstraints={{ left: -100000, right: 100000 }}
							dragElastic={0}
							dragMomentum={false}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
							whileTap={{ cursor: "grabbing" }}
							aria-label="Draggable product modules"
						>
							{[...LandingPageModules, ...LandingPageModules].map(
								(module, index) => (
									<LandingModuleCard
										key={`${module.label}-${index}`}
										module={module}
									/>
								),
							)}
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}

function LandingModuleCard({
	module,
}: Readonly<{ module: LandingPageModule }>) {
	return (
		<article className="landing-module-card group">
			<div className="flex items-start justify-between gap-4">
				<div className="landing-module-icon flex h-12 w-12 items-center justify-center rounded-md bg-sky-50 text-sky-700 transition group-hover:bg-white">
					<FeatureIcon name={module.icon} className="h-5 w-5" />
				</div>
			</div>
			<h3 className="mt-5 text-lg font-semibold text-slate-950">
				{module.label}
			</h3>
			<p className="mt-3 text-sm leading-6 text-slate-600">
				{module.text}
			</p>
		</article>
	);
}
