"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Package } from "lucide-react";
import { paymentAPI } from "@/lib/api";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (orderId) {
      loadTransactionDetails();
    }
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/dashboard?tab=my-hub&subTab=purchases");
    }
  }, [countdown, router]);

  const loadTransactionDetails = async () => {
    try {
      const result = await paymentAPI.getPaymentStatus(orderId!);
      if (result.success) {
        setTransaction(result.transaction);
      }
    } catch (error) {
      console.error("Error loading transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-gray mb-2">
            Payment Successful!
          </h1>
          <p className="text-medium-gray">
            Your payment has been processed successfully
          </p>
        </div>

        {/* Transaction Details */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto"></div>
            <p className="text-medium-gray mt-4">
              Loading transaction details...
            </p>
          </div>
        ) : transaction ? (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <Package className="h-5 w-5 text-dark-blue mt-1" />
              <div className="flex-1">
                <p className="text-sm text-medium-gray">Item</p>
                <p className="font-semibold text-dark-gray">
                  {transaction.itemTitle}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Order ID</span>
                <span className="text-sm font-medium text-dark-gray">
                  {transaction.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Amount</span>
                <span className="text-lg font-bold text-dark-blue">
                  Rp {transaction.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {transaction.status}
                </span>
              </div>
              {transaction.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-sm text-medium-gray">
                    Payment Method
                  </span>
                  <span className="text-sm font-medium text-dark-gray capitalize">
                    {transaction.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
            <p className="text-medium-gray">
              Transaction details not available
            </p>
          </div>
        )}

        {/* Auto-redirect notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-dark-gray mb-1">
                Redirecting to Dashboard...
              </h3>
              <p className="text-sm text-medium-gray">
                You&apos;ll be redirected in {countdown} second
                {countdown !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-3xl font-bold text-green-600">{countdown}</div>
          </div>
        </div>

        {/* What&apos;s Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-dark-gray mb-2">
            What&apos;s Next?
          </h3>
          <ul className="text-sm text-medium-gray space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Wait for payment confirmation in My Purchases</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                Once confirmed, you&apos;ll be redirected to Library
                automatically
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                Download your purchased materials anytime from Library
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() =>
              router.push("/dashboard?tab=my-hub&subTab=purchases")
            }
            className="w-full bg-dark-blue text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors font-medium flex items-center justify-center"
          >
            View My Purchases
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={() => router.push("/dashboard?tab=my-hub&subTab=library")}
            className="w-full border border-gray-300 text-dark-gray py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Go to Library
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-center text-medium-gray mt-6">
          A confirmation email has been sent to your registered email address
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
