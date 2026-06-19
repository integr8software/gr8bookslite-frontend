"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SectionRevealProps = Readonly<{
	children: ReactNode;
	delay?: number;
}>;

export function SectionReveal({
	children,
	delay = 0,
}: SectionRevealProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.div
			initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
			whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.12 }}
			transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
		>
			{children}
		</motion.div>
	);
}
