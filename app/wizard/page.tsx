import type { Metadata } from "next";
import { ModulesWizardPage } from "@/app/src/ui/modules/wizard/ModulesWizardPage";

export const metadata: Metadata = {
  title: "Wizard | Gr8Books Lite",
  description: "Standalone multi-step setup wizard for Gr8Books Lite.",
};

export default function WizardPage() {
  return <ModulesWizardPage />;
}
