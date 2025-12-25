import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how CampusCircle collects, uses, and protects your personal information. Our privacy policy for Binus University students.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | CampusCircle",
    description:
      "Learn how CampusCircle collects, uses, and protects your personal information.",
    url: `${siteConfig.url}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="mb-4">
                CampusCircle is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our platform.
              </p>
              <p>
                By using CampusCircle, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and student ID (NIM)</li>
                <li>
                  Binus University email address (@binus.ac.id or @binus.edu)
                </li>
                <li>Faculty and major information</li>
                <li>Profile picture (optional)</li>
                <li>Contact information for transactions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Transaction Information
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Purchase and sales history</li>
                <li>
                  Payment information (processed securely through Midtrans)
                </li>
                <li>Wallet balance and withdrawal requests</li>
                <li>Order details for food, events, and tutoring services</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.3 Usage Information
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Messages and communications within the platform</li>
                <li>Items listed for sale</li>
                <li>Search queries and browsing history</li>
                <li>Device information and IP address</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our platform services</li>
                <li>To process transactions and payments</li>
                <li>To facilitate communication between users</li>
                <li>
                  To send notifications about your account and transactions
                </li>
                <li>To improve our platform and user experience</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Information Sharing
              </h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your
                information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With other users as necessary to complete transactions</li>
                <li>With payment processors (Midtrans) to process payments</li>
                <li>
                  With service providers who assist in operating our platform
                </li>
                <li>When required by law or to protect our rights</li>
                <li>With your consent for any other purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data</li>
                <li>Secure payment processing through Midtrans</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Object to processing of your information</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar tracking technologies to track
                activity on our platform and store certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Third-Party Services
              </h2>
              <p className="mb-4">
                Our platform integrates with third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google OAuth for authentication</li>
                <li>Midtrans for payment processing</li>
                <li>Supabase for file storage</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies. We encourage you
                to review them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Changes to This Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <ul className="space-y-2">
                <li>Email: support@campuscircle.com</li>
                <li>
                  Platform: Use the support contact feature in the dashboard
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
