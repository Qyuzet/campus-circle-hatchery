"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { paymentAPI } from "@/lib/api";

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadTransactionDetails();
      // Auto-check status every 10 seconds
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [orderId]);

  const loadTransactionDetails = async () => {
    try {
      const result = await paymentAPI.getPaymentStatus(orderId!);
      if (result.success) {
        setTransaction(result.transaction);
        
        // If status changed to completed, redirect to success page
        if (result.transaction.status === "COMPLETED") {
          router.push(`/payment/success?order_id=${orderId}`);
        } else if (result.transaction.status === "FAILED" || result.transaction.status === "CANCELLED") {
          router.push(`/payment/error?order_id=${orderId}`);
        }
      }
    } catch (error) {
      console.error("Error loading transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId || checking) return;
    
    setChecking(true);
    try {
      const result = await paymentAPI.getPaymentStatus(orderId);
      if (result.success) {
        setTransaction(result.transaction);
        
        // Redirect based on status
        if (result.transaction.status === "COMPLETED") {
          router.push(`/payment/success?order_id=${orderId}`);
        } else if (result.transaction.status === "FAILED" || result.transaction.status === "CANCELLED") {
          router.push(`/payment/error?order_id=${orderId}`);
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Pending Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-4 relative">
            <Clock className="h-16 w-16 text-yellow-600" />
            {checking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-yellow-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Pending Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-gray mb-2">
            Payment Pending
          </h1>
          <p className="text-medium-gray">
            Your payment is being processed. This may take a few moments.
          </p>
        </div>

        {/* Transaction Details */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
            <p className="text-medium-gray mt-4">Loading transaction details...</p>
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
                <span className="text-lg font-bold text-dark-blue">
                  Rp {transaction.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-medium-gray">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {transaction.status}
                </span>
              </div>
              {transaction.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-sm text-medium-gray">Payment Method</span>
                  <span className="text-sm font-medium text-dark-gray capitalize">
                    {transaction.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-dark-gray mb-2">What's happening?</h3>
              <ul className="text-sm text-medium-gray space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Your payment is being verified by the payment provider</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>This page will auto-update when status changes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>You'll receive a notification once payment is confirmed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Instructions (for bank transfer, etc.) */}
        {transaction?.paymentMethod === "bank_transfer" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-dark-gray mb-2">
              Complete Your Payment
            </h3>
            <p className="text-sm text-medium-gray mb-3">
              Please complete the bank transfer using the details provided by Midtrans.
              Your payment will be confirmed automatically once received.
            </p>
            <p className="text-xs text-medium-gray">
              Check your email for complete payment instructions.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className="w-full bg-dark-blue text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? "Checking..." : "Check Status Now"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full border border-gray-300 text-dark-gray py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-medium-gray">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Auto-checking status every 10 seconds</span>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-center text-medium-gray mt-6">
          You can safely close this page. We'll notify you when payment is confirmed.
        </p>
      </div>
    </div>
  );
}

