"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LandingPageNavigationLinks } from "@/app/src/constants/landing-page/LandingPageConstants";
import { useLandingNavigation } from "@/app/src/hooks/landing-page/useLandingNavigation";
import { LandingActionLink } from "@/app/src/ui/landing-page/LandingActionLink";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export function LandingNavigation() {
	const { isMenuOpen, toggleMenu, closeMenu } = useLandingNavigation();

	return (
		<header className="relative z-30 border-b border-darknavy/10 bg-white/90 backdrop-blur-xl">
			<div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-2 px-4  lg:px-0 ">
				<Link
					href="/"
					className="shrink-0 text-lg font-semibold sm:text-xl"
				>
					<LogoText brandSuffixClassName="text-sm" />
				</Link>

				<nav className="hidden items-center gap-8 text-xs font-semibold text-darknavy/55 md:flex">
					{LandingPageNavigationLinks.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className="relative py-2 transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-skyblue after:transition-transform hover:text-darknavy hover:after:scale-x-100"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="flex shrink-0 items-center gap-2">
					<div>
						<LandingActionLink
							href="/login"
							variant="navigation"
							transitionType="auth-forward"
						>
							Log in
						</LandingActionLink>
					</div>
					<div className="[&_a]:min-h-10 [&_a]:px-3 [&_a]:text-xs [&_svg]:hidden sm:[&_a]:min-h-12 sm:[&_a]:px-6 sm:[&_a]:text-sm sm:[&_svg]:block">
						<LandingActionLink
							href="/signup"
							showArrow
							transitionType="auth-forward"
						>
							Start free
						</LandingActionLink>
					</div>
					<button
						type="button"
						className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-darknavy transition hover:bg-offwhite md:hidden"
						aria-label={
							isMenuOpen ? "Close navigation" : "Open navigation"
						}
						aria-expanded={isMenuOpen}
						aria-controls="landing-mobile-navigation"
						onClick={toggleMenu}
					>
						{isMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>

			{isMenuOpen ? (
				<nav
					id="landing-mobile-navigation"
					className="absolute inset-x-0 top-full border-y border-darknavy/10 bg-white p-5 shadow-lg md:hidden"
				>
					<div className="mx-auto flex max-w-7xl flex-col gap-1">
						{LandingPageNavigationLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								onClick={closeMenu}
								className="rounded-lg px-3 py-3 text-sm font-semibold text-darknavy/70 hover:bg-skyblue/10 hover:text-sky-700"
							>
								{link.label}
							</Link>
						))}
					</div>
				</nav>
			) : null}
		</header>
	);
}
