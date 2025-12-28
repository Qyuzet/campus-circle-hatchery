"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { paymentAPI } from "@/lib/api/payment";
import { toast } from "sonner";

interface PaymentSyncBannerProps {
  pendingOrdersCount: number;
}

export function PaymentSyncBanner({ pendingOrdersCount }: PaymentSyncBannerProps) {
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

  if (!isSyncing) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 animate-pulse">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            Checking payment status...
          </p>
          <p className="text-xs text-blue-700">
            {pendingOrdersCount > 0
              ? `Verifying ${pendingOrdersCount} pending ${
                  pendingOrdersCount === 1 ? "order" : "orders"
                } with the payment gateway`
              : "Verifying your recent payment with the payment gateway"}
          </p>
        </div>
      </div>
    </div>
  );
}

