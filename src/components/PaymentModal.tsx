"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentAPI } from "@/lib/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    price: number;
    type: "marketplace" | "tutoring" | "food" | "event";
  };
  onSuccess?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError("");

      // Create payment
      const result = await paymentAPI.createPayment({
        itemId: item.id,
        itemType: item.type,
        amount: item.price,
        itemTitle: item.title,
      });

      if (result.success && result.payment.token) {
        // Open Midtrans Snap payment page
        // @ts-ignore - Midtrans Snap is loaded via script tag
        if (window.snap) {
          // @ts-ignore
          window.snap.pay(result.payment.token, {
            onSuccess: function (result: any) {
              console.log("Payment success:", result);
              onSuccess?.();
              onClose();

              // Redirect to My Hub > Purchases to wait for confirmation
              setTimeout(() => {
                router.push("/dashboard?tab=my-hub&subTab=purchases");
              }, 500);
            },
            onPending: function (result: any) {
              console.log("Payment pending:", result);
              onClose();

              // Redirect to My Hub > Purchases to wait for confirmation
              setTimeout(() => {
                router.push("/dashboard?tab=my-hub&subTab=purchases");
              }, 500);
            },
            onError: function (result: any) {
              console.log("Payment error:", result);
              setError("Payment failed. Please try again.");
              setIsProcessing(false);
            },
            onClose: function () {
              console.log("Payment popup closed");
              setIsProcessing(false);
              onClose();

              // Redirect to My Hub > Purchases to check status
              setTimeout(() => {
                router.push("/dashboard?tab=my-hub&subTab=purchases");
              }, 500);
            },
          });
        } else {
          setError("Payment system not loaded. Please refresh the page.");
          setIsProcessing(false);
        }
      } else {
        setError("Failed to create payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price:</span>
              <span className="text-2xl font-bold text-dark-blue">
                Rp {item.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6 text-sm text-gray-600">
          <p>You will be redirected to Midtrans secure payment page.</p>
          <p className="mt-2">
            Accepted payment methods: Credit Card, Bank Transfer, E-Wallet, and
            more.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
