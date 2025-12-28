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
  onSupportClick?: (context: {
    itemId: string | null;
    itemType: string;
    itemTitle: string;
  }) => void;
}

export function LibraryTabClient({
  transactions,
  totalItems,
  notesCount,
  booksCount,
  onSupportClick,
}: LibraryTabClientProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {totalItems}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Total Items
          </p>
        </Card>
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {notesCount}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Notes
          </p>
        </Card>
        <Card className="p-2 sm:p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
            {booksCount}
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Books
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Library</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <LibraryEmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.map((transaction) => (
                <LibraryItemCard
                  key={transaction.id}
                  transaction={transaction}
                  onSupportClick={onSupportClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
