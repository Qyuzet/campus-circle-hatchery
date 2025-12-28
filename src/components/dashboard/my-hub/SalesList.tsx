"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  orderId: string;
  itemTitle: string;
  itemType: string;
  amount: number;
  status: string;
  createdAt: Date;
  buyer: {
    name: string | null;
  } | null;
}

interface SalesListProps {
  transactions: Transaction[];
}

export function SalesList({ transactions }: SalesListProps) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-sm">
                  {sale.orderId.substring(0, 12)}...
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{sale.itemTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.itemType === "marketplace"
                        ? "Study Material"
                        : sale.itemType === "food"
                        ? "Food"
                        : "Event"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {sale.buyer?.name || "Unknown"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-semibold">
                  Rp {sale.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div
                    className={
                      sale.status === "COMPLETED"
                        ? "inline-flex items-center px-3 py-1 bg-green-50 border-l-4 border-green-600 rounded-sm"
                        : sale.status === "PENDING"
                        ? "inline-flex items-center px-3 py-1 bg-yellow-50 border-l-4 border-yellow-600 rounded-sm"
                        : "inline-flex items-center px-3 py-1 bg-red-50 border-l-4 border-red-600 rounded-sm"
                    }
                  >
                    <span
                      className={
                        sale.status === "COMPLETED"
                          ? "text-sm font-medium text-green-800"
                          : sale.status === "PENDING"
                          ? "text-sm font-medium text-yellow-800"
                          : "text-sm font-medium text-red-800"
                      }
                    >
                      {sale.status}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {transactions.map((sale) => (
          <Card key={sale.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2 mb-1">
                    {sale.itemTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.itemType === "marketplace"
                      ? "Study Material"
                      : sale.itemType === "food"
                      ? "Food"
                      : "Event"}
                  </p>
                </div>
                <div
                  className={
                    sale.status === "COMPLETED"
                      ? "inline-flex items-center px-2.5 py-1 bg-green-50 border-l-4 border-green-600 rounded-sm flex-shrink-0"
                      : sale.status === "PENDING"
                      ? "inline-flex items-center px-2.5 py-1 bg-yellow-50 border-l-4 border-yellow-600 rounded-sm flex-shrink-0"
                      : "inline-flex items-center px-2.5 py-1 bg-red-50 border-l-4 border-red-600 rounded-sm flex-shrink-0"
                  }
                >
                  <span
                    className={
                      sale.status === "COMPLETED"
                        ? "text-xs font-semibold text-green-800"
                        : sale.status === "PENDING"
                        ? "text-xs font-semibold text-yellow-800"
                        : "text-xs font-semibold text-red-800"
                    }
                  >
                    {sale.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Buyer</span>
                  <span className="text-sm font-medium truncate">
                    {sale.buyer?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(sale.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="font-bold text-base text-green-600">
                    Rp {sale.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
