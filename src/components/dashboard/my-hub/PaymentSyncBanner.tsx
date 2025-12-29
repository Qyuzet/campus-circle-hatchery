"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { paymentAPI } from "@/lib/api/payment";
import { toast } from "sonner";

interface PaymentSyncBannerProps {
  pendingOrdersCount: number;
}

export function PaymentSyncBanner({
  pendingOrdersCount,
}: PaymentSyncBannerProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncPayments = async () => {
      if (pendingOrdersCount === 0) return;

      setIsSyncing(true);
      try {
        await paymentAPI.syncPendingPayments();
      } catch (error) {
        console.error("Failed to sync payments:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncPayments();
  }, [pendingOrdersCount]);

  if (pendingOrdersCount === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <RefreshCw
          className={`h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5 ${
            isSyncing ? "animate-spin" : ""
          }`}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-900 mb-1">
            {pendingOrdersCount}{" "}
            {pendingOrdersCount === 1 ? "Payment" : "Payments"} Pending
            Confirmation
          </p>
          <p className="text-xs text-yellow-800 mb-2">
            Your payment is being verified by the payment gateway. This usually
            takes 1-2 minutes.
          </p>
          <div className="flex items-center gap-2 text-xs text-yellow-700">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Auto-checking every 30 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
