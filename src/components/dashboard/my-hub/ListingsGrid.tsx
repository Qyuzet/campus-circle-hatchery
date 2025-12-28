"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ItemDetailModal } from "./ItemDetailModal";
import { toast } from "sonner";
import { marketplaceAPI } from "@/lib/api";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: string;
  imageUrl: string | null;
  viewCount: number;
}

interface ListingsGridProps {
  listings: Listing[];
  currentUserId?: string;
}

export function ListingsGrid({ listings, currentUserId }: ListingsGridProps) {
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleViewClick = (item: Listing) => {
    setSelectedItem(item);
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const handleEditClick = (item: Listing) => {
    setSelectedItem(item);
    setIsEditing(true);
    setShowDetailModal(true);
  };

  const handleSave = async (data: any) => {
    if (!selectedItem) return;

    try {
      await marketplaceAPI.updateItem(selectedItem.id, data);
      toast.success("Item updated successfully");
      setIsEditing(false);
      setShowDetailModal(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await marketplaceAPI.deleteItem(selectedItem.id);
      toast.success("Item deleted successfully");
      setShowDetailModal(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            {item.imageUrl && (
              <div className="relative w-full h-48 bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div
                  className={
                    item.status === "available"
                      ? "absolute top-2 right-2 inline-flex items-center px-2.5 py-1 bg-green-50 border-l-4 border-green-600 rounded-sm shadow-sm"
                      : "absolute top-2 right-2 inline-flex items-center px-2.5 py-1 bg-gray-50 border-l-4 border-gray-600 rounded-sm shadow-sm"
                  }
                >
                  <span
                    className={
                      item.status === "available"
                        ? "text-xs font-semibold text-green-800"
                        : "text-xs font-semibold text-gray-800"
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            )}
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-1.5 sm:mb-2">
                    {item.title}
                  </CardTitle>
                  <div className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-purple-50 border-l-4 border-purple-600 rounded-sm w-fit">
                    <span className="text-[10px] sm:text-xs font-semibold text-purple-800">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-2 sm:mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-base sm:text-lg font-bold text-blue-600">
                  Rp {item.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {item.viewCount || 0}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-3 sm:p-4 pt-0">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-sm h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewClick(item);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                className="flex-1 text-sm h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(item);
                }}
              >
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setIsEditing(false);
          }}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
