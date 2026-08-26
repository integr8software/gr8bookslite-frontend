import React from "react";
import Link from "next/link";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingDocumentHeader } from "@/app/src/ui/shared/layout/DocumentHeader";

const ReturnAndRefundPolicyForm = () => {
	return (
		<main className="bg-white min-h-screen">
			<LandingDocumentHeader
				title="Return & Refund Policy"
				lastUpdated="June 30, 2026"
				tone="indigo"
			/>

			<section className="bg-white">
				<div className="mx-auto max-w-360 px-6 py-10 space-y-8 text-black">
					<div>
						<p>
							Thank you for choosing {AppName}, developed and
							operated by Integr8 Software Solutions, Inc. We
							strive to provide reliable, high-quality cloud-based
							accounting and inventory software. This Return and
							Refund Policy outlines the terms and conditions
							governing subscription cancellations, returns, and
							refunds.
						</p>
					</div>

					{/* 1 */}
					<div>
						<h2 className="font-bold text-lg">
							1. Digital & Software-as-a-Service (SaaS) Nature
						</h2>
						<p className="mt-1">
							{AppName} is a web-based, cloud-hosted software
							application. Because our services are delivered
							digitally via online access rather than tangible
							goods, there are no physical items to return. In the
							context of our service, &quot;returns&quot; or
							cancellations refer to the deactivation, downgrade,
							or termination of paid subscription plans and
							feature add-ons.
						</p>
					</div>

					{/* 2 */}
					<div>
						<h2 className="font-bold text-lg">
							2. Subscription Cancellation
						</h2>
						<p className="mt-1">
							You may cancel your paid subscription at any time:
						</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								Directly through your workspace billing and
								subscription settings, or
							</li>
							<li>
								By contacting our support team at{" "}
								<a
									href="mailto:support@gr8booklite.com"
									className="text-blue-600 hover:underline"
								>
									support@gr8booklite.com
								</a>
								.
							</li>
						</ul>
						<p className="mt-2">
							Upon cancellation, your subscription will remain
							active with full access until the end of your
							current paid billing cycle. You will not be charged
							for subsequent billing periods following the
							effective cancellation date.
						</p>
					</div>

					{/* 3 */}
					<div>
						<h2 className="font-bold text-lg">
							3. Refund Eligibility & Conditions
						</h2>
						<p className="mt-1">
							Refunds are evaluated and granted under the
							following circumstances:
						</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								<strong>
									Billing Errors & Duplicate Charges:
								</strong>{" "}
								If you were erroneously charged due to a system
								defect, charged after a verified prior
								cancellation, or charged duplicate amounts for
								the same billing cycle, we will issue a full
								refund for the incorrect amount upon
								verification.
							</li>
							<li>
								<strong>Initial Purchase Evaluation:</strong> If
								you experience critical, unresolved technical
								defects that prevent you from using the software
								within seven (7) calendar days of your initial
								paid subscription activation, you may request a
								review for a full or partial refund.
							</li>
							<li>
								<strong>Statutory Rights:</strong> Any refunds
								mandated under applicable consumer protection
								laws of the Republic of the Philippines will be
								strictly honored.
							</li>
						</ul>
						<p className="mt-2">
							Except as described above, subscription fees for
							ongoing, active billing periods are generally
							non-refundable, and we do not provide prorated
							refunds for unused portions of an active billing
							cycle.
						</p>
					</div>

					{/* 4 */}
					<div>
						<h2 className="font-bold text-lg">
							4. Non-Refundable Items
						</h2>
						<p className="mt-1">
							The following services and fees are non-refundable:
						</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								Custom onboarding, training sessions, and data
								migration services once performed.
							</li>
							<li>
								Fully elapsed or consumed billing cycles.
							</li>
							<li>
								Accounts suspended or terminated due to a
								violation of our{" "}
								<Link
									href="/terms-of-service"
									className="text-blue-600 hover:underline"
								>
									Terms of Service
								</Link>
								.
							</li>
						</ul>
					</div>

					{/* 5 */}
					<div>
						<h2 className="font-bold text-lg">
							5. Recurring Payments & Payment Processing
						</h2>
						<p className="mt-1">
							Payments for {AppName} subscriptions are processed
							securely through our authorized payment gateway
							partner, PayMongo, and other supported payment
							methods.
						</p>
						<p className="mt-2">
							By agreeing to recurring payments, the cardholder
							authorizes PayMongo to automatically deduct payment
							from the given credit/debit card account until
							he/she revokes such authorization. The payments
							shall be charged at the start of each billing cycle,
							which shall be dependent on the agreed
							products/plans. After the processing of payment, the
							Merchant shall reach out to the cardholder if
							his/her payment is successful or not. PayMongo shall
							not be held liable for the Merchant&apos;s failure
							to notify the cardholder regarding the payment
							status. The cardholder further acknowledges and
							agrees that the billing cycle and amount to be
							deducted are dependent on the instructions made by the
							Merchant to PayMongo.
						</p>
					</div>

					{/* 6 */}
					<div>
						<h2 className="font-bold text-lg">
							6. How to Request a Refund
						</h2>
						<p className="mt-1">
							To initiate a refund request, please contact our
							billing team:
						</p>
						<ol className="list-decimal pl-6 mt-2 space-y-1">
							<li>
								Send an email to{" "}
								<a
									href="mailto:billing@gr8booklite.com"
									className="text-blue-600 hover:underline"
								>
									billing@gr8booklite.com
								</a>{" "}
								or{" "}
								<a
									href="mailto:support@gr8booklite.com"
									className="text-blue-600 hover:underline"
								>
									support@gr8booklite.com
								</a>
								.
							</li>
							<li>
								Provide your registered account email, company /
								workspace name, transaction date, invoice or
								payment reference number, and a detailed reason
								for the refund request.
							</li>
							<li>
								Our team will review your request and provide a
								written response within three to five (3–5)
								business days.
							</li>
						</ol>
					</div>

					{/* 7 */}
					<div>
						<h2 className="font-bold text-lg">
							7. Refund Processing & Timelines
						</h2>
						<p className="mt-1">
							Once a refund is approved by our billing team:
						</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								The refund will be credited back directly to the
								original payment method (e.g., credit card,
								debit card, or e-wallet) used during the initial
								transaction via PayMongo.
							</li>
							<li>
								While we initiate refunds promptly upon
								approval, the funds may take five to ten (5–10)
								business days to appear in your account or card
								statement, depending on your card issuer or
								financial institution.
							</li>
						</ul>
					</div>

					{/* 8 */}
					<div>
						<h2 className="font-bold text-lg">8. Contact Us</h2>
						<p className="mt-1">
							If you have questions or require assistance
							concerning this Return and Refund Policy, please
							reach out to us:
						</p>
						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								Billing inquiries:{" "}
								<a
									href="mailto:billing@gr8booklite.com"
									className="text-blue-600 hover:underline"
								>
									billing@gr8booklite.com
								</a>
							</li>
							<li>
								Support inquiries:{" "}
								<a
									href="mailto:support@gr8booklite.com"
									className="text-blue-600 hover:underline"
								>
									support@gr8booklite.com
								</a>
							</li>
							<li>
								Legal inquiries:{" "}
								<a
									href="mailto:legal@gr8booklite.com"
									className="text-blue-600 hover:underline"
								>
									legal@gr8booklite.com
								</a>
							</li>
						</ul>
					</div>
				</div>
			</section>
		</main>
	);
};

export default ReturnAndRefundPolicyForm;
