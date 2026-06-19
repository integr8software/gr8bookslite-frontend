import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingWhyGr8BooksPage } from "@/app/src/ui/landing-page/LandingWhyGr8BooksPage";

export const metadata: Metadata = {
	title: `Why ${AppName}`,
	description: `See how ${AppName} keeps books, inventory, controls, and team operations connected.`,
};

export default function WhyGr8BooksRoute() {
	return <LandingWhyGr8BooksPage />;
}
