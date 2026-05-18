import type { Metadata } from "next";
import { PricingPage } from "@/app/src/ui/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Pricing | GR8BooksLite",
  description: "Choose the GR8BooksLite plan that fits your business stage.",
};

export default function PricingRoute() {
  return <PricingPage />;
}
