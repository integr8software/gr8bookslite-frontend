export type LandingPageIconName =
  | "accounting"
  | "inventory"
  | "sales"
  | "purchasing"
  | "approvals"
  | "reports"
  | "teams";

export type LandingPageLink = {
  label: string;
  href: string;
};

export type LandingPageModule = {
  icon: LandingPageIconName;
  label: string;
  text: string;
};

export type LandingPageHighlight = {
  icon: LandingPageIconName;
  title: string;
  text: string;
};

export type LandingPageFeature = LandingPageHighlight & {
  bullets: readonly string[];
};

export type LandingPageFooterGroup = {
  title: string;
  links: readonly LandingPageLink[];
};
