"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForgotPasswordForm } from "@/app/src/hooks/auth/useForgotPasswordForm";
import { AuthStatusMessage } from "./AuthStatusMessage";

export function ForgotPasswordForm() {
	const { state, formAction, pending } = useForgotPasswordForm();
	const emailErrors = state.errors?.email;

	return (
		<form action={formAction} className="space-y-5">
			<AuthStatusMessage state={state} />

			<div>
				<label
					htmlFor="email"
					className="mb-2 block text-sm font-medium text-darknavy"
				>
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					placeholder="Enter your email"
					aria-describedby={emailErrors?.length ? "email-error" : undefined}
					aria-invalid={emailErrors?.length ? true : undefined}
					className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition placeholder:text-darknavy/45 focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
				/>
				{emailErrors?.length ? (
					<p id="email-error" className="mt-2 text-sm text-coralpink">
						{emailErrors[0]}
					</p>
				) : null}
			</div>

			<button
				type="submit"
				disabled={pending}
				className="h-12 w-full rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{pending ? "Please wait..." : "Reset Password"}
			</button>

			<div className="pt-1 text-center">
				<Link
					href="/login"
					className="inline-flex items-center gap-1 text-sm font-semibold text-darknavy/65 transition hover:text-darknavy"
				>
					<ArrowLeft size={15} aria-hidden="true" />
					Back to log in
				</Link>
			</div>
		</form>
	);
}
