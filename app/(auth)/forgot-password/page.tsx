import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/app/src/ui/auth/ForgotPasswordForm";
import { ForgotPasswordShell } from "@/app/src/ui/auth/ForgotPasswordShell";

export const metadata: Metadata = {
	title: "Forgot password | GR8BooksLite",
};

export default function ForgotPasswordPage() {
	return (
		<ForgotPasswordShell>
			<ForgotPasswordForm />
		</ForgotPasswordShell>
	);
}
