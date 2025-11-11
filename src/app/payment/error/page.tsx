"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, ArrowRight, RefreshCw, Home } from "lucide-react";
import { paymentAPI } from "@/lib/api";

function PaymentErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadTransactionDetails();
    }
  }, [orderId]);

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

  const handleRetry = () => {
    // Redirect back to dashboard to try purchasing again
    router.push("/dashboard?tab=marketplace");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-gray mb-2">
            Payment Failed
          </h1>
          <p className="text-medium-gray">
            We couldn't process your payment. Please try again.
          </p>
        </div>

        {/* Transaction Details */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-medium-gray mt-4">
              Loading transaction details...
            </p>
          </div>
        ) : transaction ? (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Order ID</span>
                <span className="text-sm font-medium text-dark-gray">
                  {transaction.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Item</span>
                <span className="text-sm font-medium text-dark-gray">
                  {transaction.itemTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Amount</span>
                <span className="text-lg font-bold text-dark-gray">
                  Rp {transaction.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Common Reasons */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-dark-gray mb-2">Common Reasons:</h3>
          <ul className="text-sm text-medium-gray space-y-2">
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Insufficient balance or credit limit</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Incorrect payment details</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Payment timeout or cancelled</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Network or connection issues</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-dark-blue text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors font-medium flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full border border-gray-300 text-dark-gray py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-dark-gray">
            <span className="font-semibold">Need help?</span> Contact support or
            check your payment method settings.
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-center text-medium-gray mt-6">
          No charges were made to your account
        </p>
      </div>
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      }
    >
      <PaymentErrorContent />
    </Suspense>
  );
}
