"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

type AuthSubmitButtonProps = Readonly<{
	idleLabel: string;
	pendingLabel: string;
	pending: boolean;
}>;

export function AuthSubmitButton({
	idleLabel,
	pendingLabel,
	pending,
}: AuthSubmitButtonProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.button
			type="submit"
			disabled={pending}
			whileTap={prefersReducedMotion || pending ? undefined : { scale: 0.98, y: 1 }}
			transition={{ type: "spring", stiffness: 500, damping: 30 }}
			className="flex h-12 w-full items-center justify-center rounded-lg bg-darknavy px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(33,39,56,0.20)] transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/30 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{pending ? (
				<>
					<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
					{pendingLabel}
				</>
			) : (
				idleLabel
			)}
		</motion.button>
	);
}
