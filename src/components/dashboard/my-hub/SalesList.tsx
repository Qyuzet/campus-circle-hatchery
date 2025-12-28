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
                  <Badge
                    variant={
                      sale.status === "COMPLETED"
                        ? "default"
                        : sale.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-2">
        {transactions.map((sale) => (
          <Card key={sale.id} className="p-2">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs line-clamp-1">{sale.itemTitle}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {sale.itemType === "marketplace"
                      ? "Study Material"
                      : sale.itemType === "food"
                      ? "Food"
                      : "Event"}
                  </p>
                </div>
                <Badge
                  variant={
                    sale.status === "COMPLETED"
                      ? "default"
                      : sale.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-[10px] h-4 px-1.5 flex-shrink-0"
                >
                  {sale.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="truncate">{sale.buyer?.name || "Unknown"}</span>
                  <span>•</span>
                  <span>
                    {new Date(sale.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span className="font-semibold text-xs flex-shrink-0">
                  Rp {sale.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

