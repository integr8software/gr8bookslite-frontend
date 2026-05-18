import React from "react";

const PrivacyPolicyForm = () => {
  return (
    <main className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="relative w-full overflow-hidden border-b border-white/10">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.18),transparent_60%)]" />

        {/* Glow blur accents */}
        <div className="absolute -top-20 -left-20 h-72 w-72 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 bg-cyan-400/10 blur-3xl rounded-full" />

        {/* Content */}
        <div className="relative mx-auto max-w-360 px-6 py-16 text-left">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              Data Privacy Statement
            </span>
          </h1>

          <p className="mt-5 text-sm md:text-base text-white/70">
            Effective Date: <span className="text-white">May 6, 2025</span> ·
            Last Updated: <span className="text-white">May 6, 2025</span>
          </p>
        </div>
      </header>
      {/* Content */}
      <section className="mx-auto max-w-360 px-6 py-10 text-black">
        <p className="mb-6">
          Gr8BookLite is committed to protecting the privacy and security of
          your financial and personal data. By creating an account, you agree to
          the collection and use of your information as described below.
        </p>

        {/* Section 1 */}
        <h2 className="font-semibold text-lg mb-2">
          1. Information we collect
        </h2>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>
            Account data — full name, email address, contact number, and
            password
          </li>
          <li>
            Business data — invoices, expenses, income records, and financial
            transactions
          </li>
          <li>
            Usage data — features used, session duration, and interaction
            patterns
          </li>
          <li>Device data — browser type, operating system, and IP address</li>
        </ul>

        {/* Section 2 */}
        <h2 className="font-semibold text-lg mb-2">2. How we use your data</h2>
        <ul className="list-disc pl-6 mb-2 space-y-1">
          <li>To create and manage your account securely</li>
          <li>To process and display your accounting records</li>
          <li>To generate financial reports and insights</li>
          <li>To send service-related notifications</li>
          <li>To improve the app using anonymized usage data</li>
        </ul>
        <p className="mb-6">
          We do <strong>not</strong> sell, rent, or share your financial data
          with third parties for marketing purposes.
        </p>

        {/* Section 3 */}
        <h2 className="font-semibold text-lg mb-2">3. Data security</h2>
        <p className="mb-6">
          All data in transit is protected with SSL/TLS encryption. Records are
          encrypted at rest. We use role-based access controls and automated
          backups to prevent data loss.
        </p>

        {/* Section 4 */}
        <h2 className="font-semibold text-lg mb-2">4. Data sharing</h2>
        <p className="mb-6">
          We may share your data only with trusted service providers (e.g.,
          cloud hosting), when required by law or court order, or in the event
          of a business transfer—with advance notice to users.
        </p>

        {/* Section 5 */}
        <h2 className="font-semibold text-lg mb-2">5. Your rights</h2>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>Access your data at any time</li>
          <li>Correct inaccurate information</li>
          <li>Export your data in a portable format</li>
          <li>Delete your account and data upon request</li>
          <li>Opt out of non-essential communications</li>
        </ul>

        {/* Section 6 */}
        <h2 className="font-semibold text-lg mb-2">6. Data retention</h2>
        <p className="mb-6">
          Financial records may be retained for up to 7 years to comply with
          accounting and tax regulations. Upon account deletion, personal data
          is removed within 30 days.
        </p>

        {/* Section 7 */}
        <h2 className="font-semibold text-lg mb-2">7. Cookies</h2>
        <p className="mb-6">
          Gr8BookLite uses essential cookies only to maintain session security.
          No advertising or tracking cookies are used.
        </p>

        {/* Section 8 */}
        <h2 className="font-semibold text-lg mb-2">8. Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a
            href="mailto:privacy@gr8booklite.com"
            className="text-blue-600 hover:underline"
          >
            privacy@gr8booklite.com
          </a>
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicyForm;
