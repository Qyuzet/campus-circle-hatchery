import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions for using CampusCircle. Rules and guidelines for Binus University students using our platform.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: "Terms of Service | CampusCircle",
    description:
      "Read the terms and conditions for using CampusCircle platform.",
    url: `${siteConfig.url}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using CampusCircle, you accept and agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use our platform.
              </p>
              <p>
                CampusCircle is exclusively for Binus University students. You
                must have a valid Binus email address (@binus.ac.id or
                @binus.edu) to use this platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. User Accounts
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 Account Creation
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You must be a current Binus University student</li>
                <li>You are responsible for maintaining account security</li>
                <li>One account per student</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Account Termination
              </h3>
              <p className="mb-4">
                We reserve the right to suspend or terminate accounts that
                violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Platform Services
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.1 Study Materials Marketplace
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  You may buy and sell study materials, notes, and textbooks
                </li>
                <li>
                  All materials must be your own work or properly licensed
                </li>
                <li>No copyrighted materials without permission</li>
                <li>Materials must be relevant to academic purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.2 Campus Food Ordering
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Food sellers must comply with health and safety standards
                </li>
                <li>Accurate descriptions and pricing required</li>
                <li>Pickup times must be honored</li>
                <li>
                  Food quality and safety is the seller&apos;s responsibility
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.3 Events and Activities
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Event organizers must provide accurate information</li>
                <li>Events must comply with university policies</li>
                <li>Refund policies must be clearly stated</li>
                <li>Organizers are responsible for event execution</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.4 Tutoring Services
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tutors must have expertise in their subject areas</li>
                <li>Sessions must be conducted professionally</li>
                <li>Pricing must be fair and transparent</li>
                <li>Academic integrity must be maintained</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Payments and Transactions
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.1 Payment Processing
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>All payments are processed through Midtrans</li>
                <li>We do not store your payment card information</li>
                <li>Transaction fees may apply</li>
                <li>Payments are final unless otherwise stated</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.2 Seller Payments
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Sellers receive payment after successful delivery</li>
                <li>Platform fees are deducted from seller earnings</li>
                <li>Withdrawals processed within 1-3 business days</li>
                <li>Minimum withdrawal amount may apply</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                4.3 Refunds and Disputes
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refund policies vary by item type</li>
                <li>Disputes must be reported within 7 days</li>
                <li>We reserve the right to mediate disputes</li>
                <li>Final decisions are at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Prohibited Activities
              </h2>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sell copyrighted materials without permission</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Harass or abuse other users</li>
                <li>Violate university policies or Indonesian law</li>
                <li>Use the platform for non-academic purposes</li>
                <li>Create multiple accounts</li>
                <li>Share your account credentials</li>
                <li>Attempt to manipulate ratings or reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Intellectual Property
              </h2>
              <p className="mb-4">
                You retain ownership of content you upload. By uploading
                content, you grant CampusCircle a license to display and
                distribute it on the platform.
              </p>
              <p>
                The CampusCircle platform, including its design, features, and
                code, is protected by intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Liability and Disclaimers
              </h2>
              <p className="mb-4">
                CampusCircle is provided &quot;as is&quot; without warranties of
                any kind. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quality or accuracy of user-generated content</li>
                <li>Disputes between users</li>
                <li>Loss of data or service interruptions</li>
                <li>Actions of third-party service providers</li>
                <li>Food quality or safety issues</li>
                <li>Event cancellations or changes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Privacy
              </h2>
              <p>
                Your use of CampusCircle is also governed by our Privacy Policy.
                Please review it to understand how we collect and use your
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Changes to Terms
              </h2>
              <p>
                We may modify these Terms of Service at any time. Continued use
                of the platform after changes constitutes acceptance of the new
                terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Governing Law
              </h2>
              <p>
                These terms are governed by the laws of Indonesia. Any disputes
                will be resolved in accordance with Indonesian law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Contact Information
              </h2>
              <p className="mb-4">
                For questions about these Terms of Service, contact us:
              </p>
              <ul className="space-y-2">
                <li>Email: support@campuscircle.com</li>
                <li>
                  Platform: Use the support contact feature in the dashboard
                </li>
              </ul>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Academic Integrity Notice
              </h2>
              <p className="text-gray-700">
                CampusCircle is designed to facilitate legitimate academic
                collaboration and resource sharing. Users must maintain academic
                integrity and comply with Binus University&apos;s academic
                policies. Misuse of the platform for academic dishonesty may
                result in account termination and reporting to university
                authorities.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
