"use client";

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ListingsEmptyState() {
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">No listings yet</p>
      <Button
        onClick={() => setShowAddItemModal(true)}
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}

