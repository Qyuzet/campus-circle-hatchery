"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface WithdrawalFormProps {
  availableBalance: number;
  userStats: any;
}

export function WithdrawalForm({
  availableBalance,
  userStats,
}: WithdrawalFormProps) {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "GOPAY",
    accountNumber: "",
    accountName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MIN_WITHDRAWAL = 50000;

  const PAYMENT_METHODS = [{ value: "GOPAY", label: "GoPay" }];

  const hasSavedPayment =
    userStats?.savedAccountNumber && userStats?.savedAccountName;

  useEffect(() => {
    if (hasSavedPayment) {
      setPaymentData({
        paymentMethod: "GOPAY",
        accountNumber: userStats.savedAccountNumber,
        accountName: userStats.savedAccountName,
      });
    }
  }, [userStats, hasSavedPayment]);

  const quickAmounts = [50000, 100000, 200000, 500000];

  const getWithdrawalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseInt(customAmount);
    return 0;
  };

  const handleSavePaymentMethod = async () => {
    if (!paymentData.accountNumber || !paymentData.accountName) {
      toast.error("Please fill in all payment details");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savedBankName: "GoPay",
          savedAccountNumber: paymentData.accountNumber,
          savedAccountName: paymentData.accountName,
        }),
      });

      if (!response.ok) throw new Error("Failed to save payment method");

      toast.success("Payment method saved!");
      setShowPaymentForm(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save payment method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = getWithdrawalAmount();

    if (!amount || amount <= 0) {
      toast.error("Please select or enter an amount");
      return;
    }

    if (amount < MIN_WITHDRAWAL) {
      toast.error(
        `Minimum withdrawal is Rp ${MIN_WITHDRAWAL.toLocaleString()}`
      );
      return;
    }

    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!hasSavedPayment) {
      toast.error("Please add your payment method first");
      setShowPaymentForm(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod: "GOPAY",
          bankName: userStats.savedBankName || "GoPay",
          accountNumber: paymentData.accountNumber,
          accountName: paymentData.accountName,
          notes: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit withdrawal");
      }

      toast.success("Withdrawal request submitted!");

      setSelectedAmount(null);
      setCustomAmount("");

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit withdrawal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 border border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-dark-gray">Withdraw</h3>
        {hasSavedPayment && (
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="text-[10px] text-blue-600 hover:underline"
          >
            {showPaymentForm ? "Cancel" : "Edit Payment"}
          </button>
        )}
      </div>

      {showPaymentForm || !hasSavedPayment ? (
        <div className="space-y-2">
          <p className="text-[10px] text-medium-gray mb-2">
            {hasSavedPayment
              ? "Update your payment method"
              : "Add your payment method to withdraw"}
          </p>
          <div>
            <p className="text-xs font-medium text-dark-gray mb-1">
              Payment Method
            </p>
            <Select
              value={paymentData.paymentMethod}
              onValueChange={(value) =>
                setPaymentData({ ...paymentData, paymentMethod: value })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="text"
              value={paymentData.accountNumber}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  accountNumber: e.target.value,
                })
              }
              placeholder="GoPay Number (e.g., 08123456789)"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Input
              type="text"
              value={paymentData.accountName}
              onChange={(e) =>
                setPaymentData({ ...paymentData, accountName: e.target.value })
              }
              placeholder="Account Holder Name"
              className="h-8 text-xs"
            />
          </div>
          <Button
            onClick={handleSavePaymentMethod}
            disabled={isSubmitting}
            className="w-full h-8 text-xs bg-dark-blue hover:bg-primary-800"
          >
            {isSubmitting ? "Saving..." : "Save Payment Method"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border border-gray-200 rounded p-2 bg-gray-50">
            <p className="text-[10px] text-medium-gray">To: GoPay</p>
            <p className="text-[10px] text-medium-gray">
              {paymentData.accountNumber} - {paymentData.accountName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-dark-gray mb-1">
              Select Amount
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  disabled={amount > availableBalance}
                  className={`h-8 text-xs rounded border transition-colors ${
                    selectedAmount === amount
                      ? "bg-dark-blue text-white border-dark-blue"
                      : amount > availableBalance
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-dark-gray border-gray-300 hover:border-dark-blue"
                  }`}
                >
                  Rp {(amount / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-dark-gray mb-1">
              Or Enter Amount
            </p>
            <Input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder={`Min Rp ${(MIN_WITHDRAWAL / 1000).toFixed(0)}k`}
              className="h-8 text-xs"
              min={MIN_WITHDRAWAL}
              max={availableBalance}
            />
          </div>

          <p className="text-[10px] text-medium-gray">
            Available: Rp {availableBalance.toLocaleString()} • Processing: 1-3
            days
          </p>

          <Button
            onClick={handleWithdraw}
            disabled={isSubmitting || (!selectedAmount && !customAmount)}
            className="w-full h-8 text-xs bg-dark-blue hover:bg-primary-800"
          >
            {isSubmitting ? "Processing..." : "Withdraw"}
          </Button>
        </div>
      )}
    </Card>
  );
}
