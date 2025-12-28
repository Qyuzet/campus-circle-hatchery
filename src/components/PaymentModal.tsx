"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { paymentAPI } from "@/lib/api";
import { toast } from "sonner";

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
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let attempts = 0;
    const maxAttempts = 100;

    const checkSnapLoaded = () => {
      attempts++;

      // @ts-ignore
      if (window.snap) {
        setIsSnapLoaded(true);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error("Midtrans Snap failed to load after 10 seconds");
        setError(
          "Payment system failed to load. Please refresh the page and try again."
        );
        return;
      }

      setTimeout(checkSnapLoaded, 100);
    };

    checkSnapLoaded();
  }, [isOpen]);

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

              toast.success("Payment successful!", {
                description:
                  "Your purchase has been confirmed. Redirecting to My Hub...",
                duration: 3000,
              });

              onSuccess?.();
              onClose();

              setTimeout(() => {
                router.push("/dashboard/my-hub?tab=purchases");
              }, 1000);
            },
            onPending: function (result: any) {
              console.log("Payment pending:", result);

              toast.info("Payment pending", {
                description:
                  "Your payment is being processed. Please check My Hub for updates.",
                duration: 3000,
              });

              onClose();

              setTimeout(() => {
                router.push("/dashboard/my-hub?tab=purchases");
              }, 1000);
            },
            onError: function (result: any) {
              console.log("Payment error:", result);

              toast.error("Payment failed", {
                description:
                  "There was an error processing your payment. Please try again.",
                duration: 4000,
              });

              setError("Payment failed. Please try again.");
              setIsProcessing(false);
            },
            onClose: function () {
              console.log("Payment popup closed");
              setIsProcessing(false);
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-3">
      <div className="bg-white w-full max-w-sm shadow-sm">
        <h2 className="text-sm font-normal px-3 py-2 border-b border-gray-200 bg-gray-50">
          Confirm Purchase
        </h2>

        <div className="px-3 py-2">
          <div className="bg-blue-50 p-2 border-l border-blue-600">
            <h3 className="font-normal text-xs mb-1 text-gray-900 line-clamp-1">
              {item.title}
            </h3>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-gray-600">Price:</span>
              <span className="text-sm font-medium text-blue-600">
                Rp {item.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {!isSnapLoaded && !error && (
          <div className="mx-3 mb-2 p-1.5 bg-blue-50 border-l border-blue-600 text-blue-700 text-[10px] flex items-center">
            <svg
              className="animate-spin h-2.5 w-2.5 mr-1.5"
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
            Loading payment system...
          </div>
        )}

        {error && (
          <div className="mx-3 mb-2 p-1.5 bg-red-50 border-l border-red-600 text-red-700 text-[10px]">
            {error}
          </div>
        )}

        <div className="px-3 pb-2 text-[10px] text-gray-600 space-y-0.5">
          <p>You will be redirected to Midtrans secure payment page.</p>
          <p>
            Accepted payment methods: Credit Card, Bank Transfer, E-Wallet, and
            more.
          </p>
        </div>

        <div className="flex gap-1.5 px-3 pb-3 border-t border-gray-200 pt-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-3 py-1.5 text-[10px] font-normal border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !isSnapLoaded}
            className="flex-1 px-3 py-1.5 text-[10px] font-normal bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {!isSnapLoaded ? (
              <>
                <svg
                  className="animate-spin h-2.5 w-2.5 mr-1 text-white"
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
                Loading...
              </>
            ) : isProcessing ? (
              <>
                <svg
                  className="animate-spin h-2.5 w-2.5 mr-1 text-white"
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
