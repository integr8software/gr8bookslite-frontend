import React from "react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingDocumentHeader } from "@/app/src/ui/shared/layout/DocumentHeader";

const TermsOfServiceForm = () => {
	return (
		<main>
			<LandingDocumentHeader
				title="Terms of Service"
				lastUpdated="June 30, 2026"
				tone="indigo"
			/>

			<section className="bg-white">
				<div className="mx-auto max-w-360 px-6 py-10 space-y-8 text-black">
					<div>
						<h2 className="font-bold text-lg">
							1. Acceptance of terms
						</h2>
						<p className="mt-1">
							By registering, you confirm you are at least 18
							years old, have legal authority to enter this
							agreement, and accept these Terms in full. If you do
							not agree, please do not use the service.
						</p>
					</div>

					<div>
						<h2 className="font-bold text-lg">
							2. Description of service
						</h2>
						<p className="mt-1">
							{AppName} is a cloud-based accounting software for
							individuals and small businesses providing tools for
							managing income, expenses, invoices, and financial
							reporting. Features may change over time.
						</p>
					</div>

					<div>
						<h2 className="font-bold text-lg">
							3. Account responsibilities
						</h2>

						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								You are responsible for maintaining
								confidentiality of login credentials
							</li>
							<li>
								You must provide accurate and up-to-date
								information during registration
							</li>
							<li>
								You are responsible for all activity under your
								account
							</li>
							<li>
								You must notify us immediately of unauthorized
								access
							</li>
						</ul>
					</div>

					<div>
						<h2 className="font-bold text-lg">4. Acceptable use</h2>

						<p className="mt-1">You must not use {AppName} to:</p>

						<ul className="list-disc pl-6 mt-2 space-y-1">
							<li>
								Commit fraud or engage in illegal financial
								activity
							</li>
							<li>
								Attempt unauthorized access to any system or
								data
							</li>
							<li>
								Upload malicious code, viruses, or harmful
								content
							</li>
							<li>
								Resell or sublicense the service without written
								consent
							</li>
							<li>
								Interfere with or disrupt the integrity of the
								service
							</li>
						</ul>
					</div>

					{/* 5 */}
					<div>
						<h2 className="font-bold text-lg">
							5. Intellectual property
						</h2>
						<p className="mt-1">
							All software, designs, logos, and content within{" "}
							{AppName} are owned by or licensed to {AppName}. You
							retain ownership of all financial data you enter.
						</p>
					</div>

					{/* 6 */}
					<div>
						<h2 className="font-bold text-lg">
							6. Payment & subscription
						</h2>
						<p className="mt-1">
							Paid subscriptions are billed on a recurring basis.
							You may cancel at any time, but refunds are not
							provided for partial billing periods unless required
							by law.
						</p>

						{/* Warning box */}
						<div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-3 sm:w-lg w-auto ">
							<p className="text-sm font-medium text-yellow-800">
								⚠ Failure to pay may result in suspension or
								termination of your account.
							</p>
						</div>
					</div>

					{/* 7 */}
					<div>
						<h2 className="font-bold text-lg">7. Disclaimers</h2>
						<p className="mt-1">
							{AppName} is provided &quot;as is&quot; without
							warranties. We do not guarantee error-free or
							uninterrupted service. We are not a licensed
							accounting firm and do not provide legal, tax, or
							financial advice.
						</p>
					</div>

					{/* 8 */}
					<div>
						<h2 className="font-bold text-lg">
							8. Limitation of liability
						</h2>
						<p className="mt-1">
							To the maximum extent permitted by law, {AppName}{" "}
							shall not be liable for any indirect, incidental, or
							consequential damages arising from your use of the
							service.
						</p>
					</div>

					{/* 9 */}
					<div>
						<h2 className="font-bold text-lg">9. Termination</h2>
						<p className="mt-1">
							We reserve the right to suspend or terminate your
							account at any time for violations of these Terms.
							You may also delete your account at any time through
							account settings.
						</p>
					</div>

					{/* 10 */}
					<div>
						<h2 className="font-bold text-lg">
							10. Company data retention and deletion
						</h2>
						<p className="mt-1">
							If a company workspace remains inactive for six (6)
							months, or if the account is terminated, {AppName}{" "}
							may permanently delete or wipe out the inactive
							company data from active systems. Any backup that
							may exist is for operational recovery only and does
							not guarantee that inactive company data will remain
							available to you after the retention period expires.
							If your subscription expires, access to company data
							may be suspended until you subscribe again or renew
							your subscription. You are responsible for exporting
							any needed records before the retention period
							expires.
						</p>
					</div>

					{/* 11 */}
					<div>
						<h2 className="font-bold text-lg">
							11. Changes to terms
						</h2>
						<p className="mt-1">
							We will notify you at least 14 days before
							significant changes take effect. Continued use of
							the service constitutes acceptance of updated Terms.
						</p>
					</div>

					{/* 12 */}
					<div>
						<h2 className="font-bold text-lg">12. Governing law</h2>
						<p className="mt-1">
							These Terms are governed by the laws of the Republic
							of the Philippines. Disputes shall be resolved in
							the competent courts of the Philippines.
						</p>
					</div>

					{/* 13 */}
					<div>
						<h2 className="font-bold text-lg">13. Contact us</h2>
						<p className="mt-1">
							For questions, contact us at legal@gr8booklite.com
						</p>
					</div>
				</div>
			</section>
		</main>
	);
};

export default TermsOfServiceForm;
