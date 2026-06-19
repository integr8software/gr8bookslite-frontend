"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useBackToTop } from "@/app/src/hooks/landing-page/useBackToTop";

export function BackToTopButton() {
	const { isVisible, scrollToTop } = useBackToTop();

	return (
		<AnimatePresence>
			{isVisible ? (
				<motion.button
					type="button"
					initial={{ opacity: 0, scale: 0.8, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 12 }}
					whileHover={{ y: -3 }}
					whileTap={{ scale: 0.94 }}
					transition={{ duration: 0.2 }}
					onClick={scrollToTop}
					className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-darknavy text-white shadow-[0_12px_32px_rgba(33,39,56,0.28)] transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/30 sm:bottom-8 sm:right-8"
					aria-label="Scroll back to top"
				>
					<ArrowUp className="h-5 w-5" strokeWidth={2.5} />
				</motion.button>
			) : null}
		</AnimatePresence>
	);
}
