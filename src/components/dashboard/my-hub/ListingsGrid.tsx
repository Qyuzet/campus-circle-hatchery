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
      <div className="grid gap-2 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            {item.imageUrl && (
              <div className="relative w-full h-24 md:h-48 bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <Badge
                  className="absolute top-1 right-1 md:top-2 md:right-2 text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
                  variant={
                    item.status === "available" ? "default" : "secondary"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            )}
            <CardHeader className="p-2 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs md:text-lg line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                    {item.category}
                  </p>
                </div>
                {!item.imageUrl && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2 flex-shrink-0 w-fit"
                  >
                    {item.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0">
              <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                {item.description}
              </p>
              <div className="mt-2 md:mt-4 flex items-center justify-between">
                <p className="text-xs md:text-lg font-bold text-dark-blue">
                  Rp {item.price.toLocaleString()}
                </p>
                <div className="text-[10px] md:text-xs text-muted-foreground">
                  {item.viewCount || 0} views
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-1 md:gap-2 p-2 md:p-6 pt-0">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewClick(item);
                }}
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                <span className="hidden md:inline">View</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
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
