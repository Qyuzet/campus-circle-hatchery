"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";
import { LibraryItemCard } from "./LibraryItemCard";
import { LibraryEmptyState } from "./LibraryEmptyState";

interface Transaction {
  id: string;
  itemId: string | null;
  itemTitle: string;
  createdAt: Date;
  item: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    fileUrl: string | null;
    fileName: string | null;
  } | null;
}

interface LibraryTabClientProps {
  transactions: Transaction[];
  totalItems: number;
  notesCount: number;
  booksCount: number;
}

export function LibraryTabClient({
  transactions,
  totalItems,
  notesCount,
  booksCount,
}: LibraryTabClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Library</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <LibraryEmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            {transactions.map((transaction) => (
              <LibraryItemCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
