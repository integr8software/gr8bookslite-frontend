"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/src/data/auth/AuthTypes";
import { AuthField } from "@/app/src/ui/auth/AuthField";
import { AuthPasswordRequirements } from "@/app/src/ui/auth/AuthPasswordRequirements";

type ForgotPasswordResetStepProps = {
	state: AuthActionState;
	formAction: (formData: FormData) => void;
	pending: boolean;
	isResetComplete: boolean;
	resetToken: string;
};

export function ForgotPasswordResetStep({
	state,
	formAction,
	pending,
	isResetComplete,
	resetToken,
}: ForgotPasswordResetStepProps) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const wasPendingRef = useRef(false);

	useEffect(() => {
		const justFinishedSubmitting = wasPendingRef.current && !pending;
		wasPendingRef.current = pending;

		if (justFinishedSubmitting && state.status === "error") {
			setConfirmPassword("");
		}
	}, [pending, state.status]);

	if (isResetComplete) {
		return (
			<div className="space-y-5">
				<div className="rounded-md border border-skyblue/25 bg-skyblue/10 px-4 py-3 text-sm leading-6 text-darknavy">
					<p className="font-medium">Password reset complete.</p>
					<p className="mt-1 text-darknavy/75">
						Use your new password the next time you log in.
					</p>
				</div>

				<Link
					href="/login"
					className="flex h-12 w-full items-center justify-center rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8]"
				>
					Continue to Login
				</Link>
			</div>
		);
	}

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="intent" value="reset-password" />
			<input type="hidden" name="resetToken" value={resetToken} />

			<div>
				<AuthField
					label="New Password"
					id="new-password"
					name="password"
					type="password"
					autoComplete="off"
					placeholder="Enter your new password..."
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					errors={state.errors?.password}
					required
				/>
			</div>

			<AuthPasswordRequirements password={password} />

			<AuthField
				label="Confirm Password"
				id="confirm-new-password"
				name="confirmPassword"
				type="password"
				autoComplete="off"
				placeholder="Please re-enter your new password for confirmation..."
				value={confirmPassword}
				onChange={(event) => setConfirmPassword(event.target.value)}
				errors={state.errors?.confirmPassword}
				required
			/>

			<button
				type="submit"
				disabled={pending}
				className="h-12 w-full rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{pending ? "Saving..." : "Reset Password"}
			</button>
		</form>
	);
}
