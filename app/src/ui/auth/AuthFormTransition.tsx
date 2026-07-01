"use client";

import type { MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

type AuthTransitionDirection = "forward" | "back";

type AuthTransitionContextValue = {
	navigate: (href: string, direction: AuthTransitionDirection) => Promise<void>;
};

const AuthTransitionContext = createContext<AuthTransitionContextValue | null>(null);

export function AuthFormTransition({ children }: Readonly<{ children: ReactNode }>) {
	const controls = useAnimation();
	const pathname = usePathname();
	const router = useRouter();
	const prefersReducedMotion = useReducedMotion();
	const entryOffset = pathname === "/signup" ? 56 : -56;

	useEffect(() => {
		void controls.start({ opacity: 1, x: 0 });
	}, [controls]);

	async function navigate(href: string, direction: AuthTransitionDirection) {
		if (!prefersReducedMotion) {
			await controls.start({
				opacity: 0,
				x: direction === "forward" ? -56 : 56,
				transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
			});
		}

		router.push(href);
	}

	return (
		<AuthTransitionContext.Provider value={{ navigate }}>
			<motion.div
				initial={prefersReducedMotion ? false : { opacity: 0, x: entryOffset }}
				animate={controls}
				transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
				className="flex w-full justify-center"
			>
				{children}
			</motion.div>
		</AuthTransitionContext.Provider>
	);
}

type AuthSwitchLinkProps = Readonly<{
	children: ReactNode;
	direction: AuthTransitionDirection;
	href: "/login" | "/signup";
	className?: string;
}>;

export function AuthSwitchLink({
	children,
	direction,
	href,
	className,
}: AuthSwitchLinkProps) {
	const transition = useContext(AuthTransitionContext);

	function handleClick(event: MouseEvent<HTMLAnchorElement>) {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		void transition?.navigate(href, direction);
	}

	return (
		<motion.a
			href={href}
			onClick={handleClick}
			whileTap={{ scale: 0.96 }}
			className={className}
		>
			{children}
		</motion.a>
	);
}
