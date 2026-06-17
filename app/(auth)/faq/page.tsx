import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { FAQPage } from "@/app/src/ui/auth/FAQPage";

export const metadata: Metadata = {
	title: `FAQ | ${AppName}`,
};

export default function Page() {
	return <FAQPage />;
}
