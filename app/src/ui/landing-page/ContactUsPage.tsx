"use client";

import type { ComponentPropsWithoutRef, FormEvent, ReactNode } from "react";
import {
	Building2,
	Mail,
	MessageSquareText,
	Phone,
	Tag,
	UserRound,
} from "lucide-react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingDocumentHeader } from "@/app/src/ui/shared/layout/DocumentHeader";

const ContactUsPage = () => {
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const contactNumber = String(
			formData.get("contactNumber") ?? "",
		).trim();
		const company = String(formData.get("company") ?? "").trim();
		const topic = String(formData.get("topic") ?? "").trim();
		const subject = String(formData.get("subject") ?? "").trim();
		const message = String(formData.get("message") ?? "").trim();
		const emailSubject = `[${topic}] ${subject}`;
		const emailBody = [
			`Name: ${name}`,
			`Email: ${email}`,
			`Contact number: ${contactNumber}`,
			`Company or workspace: ${company || "Not provided"}`,
			`Topic: ${topic}`,
			"",
			message,
		].join("\n");

		window.location.href = `mailto:support@gr8booklite.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
	}

	return (
		<main className="bg-white min-h-screen">
			<LandingDocumentHeader
				title="Contact Us"
				lastUpdated="May 6, 2025"
			/>

			{/* Content */}
			<section className="bg-white mx-auto max-w-360 px-6 py-10 text-black">
				<p className="mb-6">
					Have a question or need help with {AppName}? Send us the
					details of your concern and our team will help you find the
					right solution.
				</p>

				<div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)] lg:gap-x-10 lg:gap-y-6 xl:gap-x-14">
					<div>
						{/* Section 1 */}
						<h2 className="font-semibold text-lg mb-2">
							1. How we can help
						</h2>
						<ul className="list-disc pl-6 mb-6 space-y-1">
							<li>
								Account access, sign-in, and account recovery
							</li>
							<li>
								Workspace setup, company records, users, and
								roles
							</li>
							<li>
								Accounting, inventory, reports, and daily
								workflows
							</li>
							<li>
								Billing, subscriptions, invoices, and plan
								questions
							</li>
							<li>
								Technical issues, error messages, and feedback
							</li>
						</ul>

						{/* Section 2 */}
						<h2 className="font-semibold text-lg mb-2">
							2. What to include in your message
						</h2>
						<ul className="list-disc pl-6 mb-6 space-y-1">
							<li>Your name and account email address</li>
							<li>Your company or workspace name</li>
							<li>
								A clear description of your question or issue
							</li>
							<li>The page or feature you were using</li>
							<li>
								Relevant screenshots or exact error messages
							</li>
						</ul>

						{/* Section 3 */}
						<h2 className="font-semibold text-lg mb-2">
							3. Protect your account
						</h2>
						<p className="mb-6">
							Please do not send passwords, one-time codes,
							complete payment details, or other sensitive
							credentials. Our team will never ask you to share
							your password by email.
						</p>

						{/* Section 4 */}
						<h2 className="font-semibold text-lg mb-2">
							4. Contact us by email
						</h2>
						<p className="mb-6">
							Email the {AppName} team at{" "}
							<a
								href="mailto:support@gr8booklite.com"
								className="text-blue-600 hover:underline"
							>
								support@gr8booklite.com
							</a>
							. Use a descriptive subject line so we can direct
							your message to the right person.
						</p>

						{/* Section 5 */}
						<h2 className="font-semibold text-lg mb-2">
							5. Connect with us on Facebook
						</h2>
						<p className="mb-6">
							Follow our Facebook page for updates, announcements,
							and more information about our services.{" "}
							<a
								href="https://www.facebook.com/profile.php?id=61584350322726"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								Visit our Facebook page
							</a>
							.
						</p>

						{/* Section 6 */}
						<h2 className="font-semibold text-lg mb-2">
							6. Where to find us
						</h2>
						<p>
							Visit Integr8 Software Solutions, Inc. at the
							location shown below.
						</p>
					</div>

					{/* Map */}
					<div className="order-2 lg:order-3 lg:col-span-2">
						<div className="overflow-hidden rounded-lg border border-slate-200">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.3294558854423!2d120.91066657587082!3d14.292280584549282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d5bf1226cbad%3A0xa2df4ed19fd93fb8!2sIntegr8%20Software%20Solutions%2C%20Inc.!5e0!3m2!1sen!2sph!4v1781924470666!5m2!1sen!2sph"
								title="Integr8 Software Solutions, Inc. location"
								className="h-80 w-full sm:h-112.5"
								style={{ border: 0 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
						</div>
					</div>

					{/* Contact form */}
					<div className="order-3 h-full lg:order-2">
						<div className="h-full w-full rounded-2xl border border-darknavy/10 bg-white p-6 shadow-[0_20px_60px_rgba(33,39,56,0.09)] sm:p-9">
							<h2 className="text-3xl font-semibold tracking-[-0.035em] text-darknavy sm:text-4xl">
								Send us a message
							</h2>
							<p className="mt-3 text-sm leading-6 text-darknavy/60 sm:text-base">
								Complete the form and we’ll prepare your message
								for our support team.
							</p>

							<form
								onSubmit={handleSubmit}
								className="mt-8 grid gap-5 sm:grid-cols-2"
							>
								<ContactInput
									id="contact-name"
									name="name"
									label="Full name"
									type="text"
									autoComplete="name"
									placeholder="John Doe"
									icon={<UserRound className="h-4 w-4" />}
									required
								/>
								<ContactInput
									id="contact-email"
									name="email"
									label="Email address"
									type="email"
									autoComplete="email"
									placeholder="you@company.com"
									icon={<Mail className="h-4 w-4" />}
									required
								/>

								<ContactInput
									id="contact-number"
									name="contactNumber"
									label="Contact number"
									type="tel"
									inputMode="tel"
									autoComplete="tel"
									placeholder="+63 912 345 6789"
									icon={<Phone className="h-4 w-4" />}
									required
								/>

								<ContactInput
									id="contact-company"
									name="company"
									label="Company or workspace"
									type="text"
									autoComplete="organization"
									placeholder="Optional"
									icon={<Building2 className="h-4 w-4" />}
								/>

								<div>
									<label
										htmlFor="contact-topic"
										className="mb-2 block text-sm font-semibold text-darknavy"
									>
										Topic
									</label>
									<div className="relative">
										<Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40" />
										<select
											id="contact-topic"
											name="topic"
											required
											defaultValue=""
											className="h-12 w-full appearance-none rounded-lg border border-darknavy/10 bg-offwhite px-4 pl-11 text-sm text-darknavy outline-none transition hover:border-skyblue/60 focus:border-skyblue focus:bg-white focus:ring-4 focus:ring-skyblue/15"
										>
											<option value="" disabled>
												Select a topic
											</option>
											<option value="Account and access">
												Account and access
											</option>
											<option value="Workspace help">
												Workspace help
											</option>
											<option value="Billing and subscriptions">
												Billing and subscriptions
											</option>
											<option value="Technical issue">
												Technical issue
											</option>
											<option value="Feedback">
												Feedback
											</option>
											<option value="Other">Other</option>
										</select>
									</div>
								</div>

								<ContactInput
									id="contact-subject"
									name="subject"
									label="Subject"
									type="text"
									placeholder="How can we help?"
									icon={
										<MessageSquareText className="h-4 w-4" />
									}
									required
								/>

								<div className="sm:col-span-2">
									<label
										htmlFor="contact-message"
										className="mb-2 block text-sm font-semibold text-darknavy"
									>
										Message
									</label>
									<textarea
										id="contact-message"
										name="message"
										rows={6}
										required
										className="w-full resize-y rounded-lg border border-darknavy/10 bg-offwhite px-4 py-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 hover:border-skyblue/60 focus:border-skyblue focus:bg-white focus:ring-4 focus:ring-skyblue/15"
										placeholder="Describe your question or issue."
									/>
								</div>

								<div className="sm:col-span-2">
									<button
										type="submit"
										className="flex h-12 w-full items-center justify-center rounded-lg bg-darknavy px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(33,39,56,0.20)] transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/30"
									>
										Send message
									</button>
									<p className="mt-3 text-center text-xs leading-5 text-darknavy/50">
										Submitting opens your default email app
										with the form details already filled in.
									</p>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
};

function ContactInput({
	id,
	name,
	label,
	icon,
	...props
}: Readonly<
	{
		id: string;
		name: string;
		label: string;
		icon: ReactNode;
	} & ComponentPropsWithoutRef<"input">
>) {
	return (
		<div>
			<label
				htmlFor={id}
				className="mb-2 block text-sm font-semibold text-darknavy"
			>
				{label}
			</label>
			<div className="relative">
				<span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-darknavy/40">
					{icon}
				</span>
				<input
					id={id}
					name={name}
					className="h-12 w-full rounded-lg border border-darknavy/10 bg-offwhite px-4 pl-11 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 hover:border-skyblue/60 focus:border-skyblue focus:bg-white focus:ring-4 focus:ring-skyblue/15"
					{...props}
				/>
			</div>
		</div>
	);
}

export default ContactUsPage;
