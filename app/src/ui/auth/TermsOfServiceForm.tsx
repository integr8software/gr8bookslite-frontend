import React from "react";

const TermsOfServiceForm = () => {
  return (
    <main>
      <header className="relative w-full overflow-hidden border-b border-white/10">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.15),transparent_60%)]" />

        {/* Glow blur accents */}
        <div className="absolute -top-20 -left-20 h-72 w-72 bg-indigo-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 bg-cyan-400/10 blur-3xl rounded-full" />

        {/* Content */}
        <div className="relative mx-auto max-w-360 px-6 py-16 text-left">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>

          <p className="mt-5 text-sm md:text-base text-white/70">
            Effective Date: <span className="text-white">May 6, 2025</span> ·
            Last Updated: <span className="text-white">May 6, 2025</span>
          </p>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto max-w-360 px-6 py-10 space-y-8 text-black">
          <div>
            <h2 className="font-bold text-lg">1. Acceptance of terms</h2>
            <p className="mt-1">
              By registering, you confirm you are at least 18 years old, have
              legal authority to enter this agreement, and accept these Terms in
              full. If you do not agree, please do not use the service.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-lg">2. Description of service</h2>
            <p className="mt-1">
              Gr8BookLite is a cloud-based accounting software for individuals
              and small businesses providing tools for managing income,
              expenses, invoices, and financial reporting. Features may change
              over time.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-lg">3. Account responsibilities</h2>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                You are responsible for maintaining confidentiality of login
                credentials
              </li>
              <li>
                You must provide accurate and up-to-date information during
                registration
              </li>
              <li>You are responsible for all activity under your account</li>
              <li>You must notify us immediately of unauthorized access</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-lg">4. Acceptable use</h2>

            <p className="mt-1">You must not use Gr8BookLite to:</p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Commit fraud or engage in illegal financial activity</li>
              <li>Attempt unauthorized access to any system or data</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Resell or sublicense the service without written consent</li>
              <li>Interfere with or disrupt the integrity of the service</li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="font-bold text-lg">5. Intellectual property</h2>
            <p className="mt-1">
              All software, designs, logos, and content within Gr8BookLite are
              owned by or licensed to Gr8BookLite. You retain ownership of all
              financial data you enter.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="font-bold text-lg">6. Payment & subscription</h2>
            <p className="mt-1">
              Paid subscriptions are billed on a recurring basis. You may cancel
              at any time, but refunds are not provided for partial billing
              periods unless required by law.
            </p>

            {/* Warning box */}
            <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-3 sm:w-lg w-auto ">
              <p className="text-sm font-medium text-yellow-800">
                ⚠ Failure to pay may result in suspension or termination of your
                account.
              </p>
            </div>
          </div>

          {/* 7 */}
          <div>
            <h2 className="font-bold text-lg">7. Disclaimers</h2>
            <p className="mt-1">
              Gr8BookLite is provided &quot;as is&quot; without warranties. We do not
              guarantee error-free or uninterrupted service. We are not a
              licensed accounting firm and do not provide legal, tax, or
              financial advice.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="font-bold text-lg">8. Limitation of liability</h2>
            <p className="mt-1">
              To the maximum extent permitted by law, Gr8BookLite shall not be
              liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="font-bold text-lg">9. Termination</h2>
            <p className="mt-1">
              We reserve the right to suspend or terminate your account at any
              time for violations of these Terms. You may also delete your
              account at any time through account settings.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="font-bold text-lg">10. Changes to terms</h2>
            <p className="mt-1">
              We will notify you at least 14 days before significant changes
              take effect. Continued use of the service constitutes acceptance
              of updated Terms.
            </p>
          </div>

          {/* 11 */}
          <div>
            <h2 className="font-bold text-lg">11. Governing law</h2>
            <p className="mt-1">
              These Terms are governed by the laws of the Republic of the
              Philippines. Disputes shall be resolved in the competent courts of
              the Philippines.
            </p>
          </div>

          {/* 12 */}
          <div>
            <h2 className="font-bold text-lg">12. Contact us</h2>
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
