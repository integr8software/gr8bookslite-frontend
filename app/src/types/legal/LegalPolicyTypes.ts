export type LegalPolicyLink = Readonly<{ label: string; href: string }>;
export type LegalPolicySection = Readonly<{
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  links?: readonly LegalPolicyLink[];
}>;
export type LegalPolicy = Readonly<{
  title: string;
  href: string;
  updated: string;
  intro: readonly string[];
  sections: readonly LegalPolicySection[];
}>;
