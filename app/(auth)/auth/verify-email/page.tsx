import type { Metadata } from "next";
import { VerifyEmailContent } from "@/app/src/ui/auth/VerifyEmailContent";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";

export const metadata: Metadata = {
	title: "Verify email | GR8BooksLite",
};

export default function VerifyEmailPage() {
	return (
		<div className="relative isolate min-h-screen">
			<GradientBlurBackground />
			<VerifyEmailContent />
		</div>
	);
}
