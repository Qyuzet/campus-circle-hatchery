import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  bankName: string | null;
  accountNumber: string;
  accountName: string;
  rejectionReason: string | null;
  createdAt: Date;
}

interface WalletWithdrawalHistoryProps {
  withdrawals: Withdrawal[];
}

export function WalletWithdrawalHistory({
  withdrawals,
}: WalletWithdrawalHistoryProps) {
  return (
    <Card className="p-4 border border-gray-300">
      <h3 className="text-sm font-semibold text-dark-gray mb-3">
        Withdrawal History
      </h3>

      <div className="space-y-2">
        {withdrawals.length > 0 ? (
          withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="border border-gray-200 rounded p-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-dark-gray">
                      Rp {withdrawal.amount.toLocaleString()}
                    </p>
                    <Badge
                      className={`text-[10px] px-1.5 py-0 ${
                        withdrawal.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : withdrawal.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : withdrawal.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {withdrawal.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-medium-gray mt-0.5">
                    {withdrawal.bankName || withdrawal.paymentMethod} •{" "}
                    {withdrawal.accountNumber}
                  </p>
                  <p className="text-[10px] text-medium-gray mt-0.5">
                    {new Date(withdrawal.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                  {withdrawal.rejectionReason && (
                    <p className="text-[10px] text-red-600 mt-1">
                      Reason: {withdrawal.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-medium-gray text-xs">
              No withdrawal history yet
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

