import type { Metadata } from "next";
import { GradientBlurBackground } from "@/app/src/ui/shared/layout/GradientBlurBackground";
import { ForgotPasswordForm } from "@/app/src/ui/auth/ForgotPasswordForm";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Forgot password | ${AppName}`,
};

export default function ForgotPasswordPage() {
	return (
		<div className="relative isolate min-h-screen">
			<GradientBlurBackground />
			<ForgotPasswordForm />
		</div>
	);
}
