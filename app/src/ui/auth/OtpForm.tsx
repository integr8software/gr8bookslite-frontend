"use client";

import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { useOtpForm } from "@/app/src/hooks/auth/useOtpForm";

type OtpFormProps = {
	initialEmail?: string;
};

export function OtpForm({ initialEmail = "" }: OtpFormProps) {
	const {
		state,
		formAction,
		pending,
		step,
		email,
		emailInput,
		setEmailInput,
		otp,
		otpInputRef,
		formattedTime,
		maskedEmail,
		canResend,
		isOtpFocused,
		otpLength,
		handleEmailSubmit,
		handleOtpChange,
		handleOtpFocus,
		handleOtpBlur,
		handleResend,
		handleChangeEmail,
	} = useOtpForm({ initialEmail });

	function getOtpBoxClass(index: number) {
		if (state.status === "error" && otp.length === otpLength) {
			return "border-coralpink ring-2 ring-coralpink/20";
		}

		if (state.status === "success" && otp.length === otpLength) {
			return "border-green-500 ring-2 ring-green-500/30";
		}

		const isActiveIndex = index === Math.min(otp.length, otpLength - 1);
		const isFilled = index < otp.length;

		if (isOtpFocused && (isFilled || isActiveIndex)) {
			return "border-gray-400 ring-2 ring-gray-400/25";
		}

		return "border-darknavy/20";
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-transparent px-4 py-8 sm:px-6">
			<section className="w-full max-w-140 rounded-md bg-white px-6 py-6 shadow-[0_18px_60px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/8 sm:px-8">
				<div className="hidden mb-4 d-flex justify-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-darknavy text-offwhite">
						<KeyRound size={27} strokeWidth={2.5} aria-hidden="true" />
					</div>
				</div>

				<div className="flex items-start gap-4">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight text-darknavy">
							OTP Verification
						</h1>
						<p className="mt-3 max-w-md text-sm leading-6 text-darknavy/80">
							{step === "email"
								? "Enter your email address to receive a verification code."
								: `Enter the passcode you just received on your email address ending with ${maskedEmail}`}
						</p>
					</div>
				</div>

				{step === "email" ? (
					<form
						onSubmit={handleEmailSubmit}
						className="mt-6 space-y-5"
					>
						<div>
							<label
								htmlFor="otp-email"
								className="mb-2 block text-sm font-medium text-darknavy"
							>
								Email Address
							</label>
							<input
								id="otp-email"
								name="email"
								type="email"
								autoComplete="email"
								value={emailInput}
								onChange={(event) =>
									setEmailInput(event.target.value)
								}
								placeholder="johndoe@example.com"
								required
								className="h-12 w-full rounded-md border border-darknavy/20 bg-white px-4 text-sm text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/20"
							/>
						</div>

						<button
							type="submit"
							className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3d76ea] px-5 text-sm font-semibold text-white transition hover:bg-[#2f67d8]"
						>
							<span>Continue</span>
							<ArrowRight className="h-4 w-4" />
						</button>
					</form>
				) : (
					<form action={formAction} className="mt-6 space-y-5">
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
							{Array.from({ length: otpLength }).map(
								(_, index) => (
									<span
										key={index}
										className={`flex h-14 w-12 items-center justify-center rounded-2xl border text-3xl font-medium text-black shadow-sm transition sm:h-16 sm:w-14 ${getOtpBoxClass(index)}`}
									>
										{otp[index] ?? ""}
									</span>
								),
							)}
						</button>

						<div className="flex flex-col gap-2 text-xs text-darknavy/75 sm:flex-row sm:items-center sm:justify-between">
							<p>
								Remaining Time:{" "}
								<span className="font-semibold text-[#3d76ea]">
									{formattedTime}
								</span>
							</p>

							<p>
								Didn&apos;t got the code?{" "}
								<button
									type="button"
									onClick={handleResend}
									aria-disabled={!canResend}
									className={`font-semibold ${canResend ? "text-[#3d76ea]" : "text-darknavy/45"}`}
								>
									Resend
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

						<button
							type="button"
							onClick={handleChangeEmail}
							className="block w-full text-center text-sm font-semibold text-darknavy/65 transition hover:text-darknavy"
						>
							Change Email
						</button>
					</form>
				)}

				<p className="mt-8 text-center text-sm text-darknavy/70">
					Need to return?{" "}
					<Link href="/login" className="font-medium text-coralpink">
						Login
					</Link>
				</p>
			</section>
		</main>
	);
}
