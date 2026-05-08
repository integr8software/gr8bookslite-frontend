"use client";

import type { RefObject } from "react";

type ForgotPasswordOtpStepProps = {
	formAction: (formData: FormData) => void;
	pending: boolean;
	isOtpErrorActive: boolean;
	email: string;
	otp: string;
	otpInputRef: RefObject<HTMLInputElement | null>;
	formattedTime: string;
	canResend: boolean;
	isResending: boolean;
	isOtpFocused: boolean;
	otpLength: number;
	handleOtpChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleOtpFocus: () => void;
	handleOtpBlur: () => void;
	handleResend: () => void;
};

export function ForgotPasswordOtpStep({
	formAction,
	pending,
	isOtpErrorActive,
	email,
	otp,
	otpInputRef,
	formattedTime,
	canResend,
	isResending,
	isOtpFocused,
	otpLength,
	handleOtpChange,
	handleOtpFocus,
	handleOtpBlur,
	handleResend,
}: ForgotPasswordOtpStepProps) {
	function getOtpBoxClass(index: number) {
		if (isOtpErrorActive && otp.length === otpLength) {
			return "border-coralpink ring-2 ring-coralpink/20";
		}

		const isActiveIndex = index === Math.min(otp.length, otpLength - 1);
		const isFilled = index < otp.length;

		if (isOtpFocused && (isFilled || isActiveIndex)) {
			return "border-gray-400 ring-2 ring-gray-400/25";
		}

		return "border-darknavy/20";
	}

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="intent" value="verify-otp" />
			<input type="hidden" name="email" value={email} />
			<input
				ref={otpInputRef}
				type="text"
				name="otp"
				inputMode="numeric"
				autoComplete="one-time-code"
				value={otp}
				onChange={handleOtpChange}
				onFocus={handleOtpFocus}
				onBlur={handleOtpBlur}
				maxLength={otpLength}
				className="sr-only"
			/>

			<button
				type="button"
				onClick={() => otpInputRef.current?.focus()}
				className="flex w-full justify-center gap-2 sm:gap-3"
			>
				{Array.from({ length: otpLength }).map((_, index) => (
					<span
						key={index}
						className={`flex h-14 w-12 items-center justify-center rounded-2xl border text-3xl font-medium text-black shadow-sm transition sm:h-16 sm:w-14 ${getOtpBoxClass(index)}`}
					>
						{otp[index] ?? ""}
					</span>
				))}
			</button>

			<div className="flex items-center justify-between gap-3 text-xs text-darknavy/75">
				{!canResend ? (
					<p className="whitespace-nowrap">
						Remaining Time:{" "}
						<span className="font-semibold text-[#3d76ea]">
							{formattedTime}
						</span>
					</p>
				) : (
					<span aria-hidden="true" />
				)}

				<p className="flex items-center gap-1.5 whitespace-nowrap">
					Didn&apos;t get the code?{" "}
					<button
						type="button"
						onClick={handleResend}
						disabled={!canResend || isResending}
						aria-disabled={!canResend || isResending}
						className={`inline-flex items-center justify-center gap-1.5 leading-none font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${canResend ? "text-[#3d76ea]" : "text-darknavy/45"}`}
					>
						{isResending ? (
							<span
								className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
								aria-hidden="true"
							/>
						) : null}
						<span>Resend</span>
					</button>
				</p>
			</div>

			<button
				type="submit"
				disabled={pending || otp.length !== otpLength}
				className="h-12 w-full rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{pending ? "Verifying..." : "Verify"}
			</button>
		</form>
	);
}
