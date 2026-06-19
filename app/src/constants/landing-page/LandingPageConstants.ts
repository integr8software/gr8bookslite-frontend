import type {
  LandingPageFooterGroup,
  LandingPageLink,
} from "@/app/src/types/landing-page/LandingPageTypes";

export const LandingPageNavigationLinks = [
	{ label: "Product", href: "/#product" },
	{ label: "Features", href: "/#features" },
	{ label: "Testimonials", href: "/#testimonials" },
	{ label: "Pricing", href: "/#pricing" },
] as const satisfies readonly LandingPageLink[];

export const LandingPageFooterGroups = [
  {
    title: "Product",
    links: LandingPageNavigationLinks,
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create workspace", href: "/signup" },
      { label: "Forgot password", href: "/forgot-password" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact Support", href: "mailto:support@gr8booklite.com" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
] as const satisfies readonly LandingPageFooterGroup[];
