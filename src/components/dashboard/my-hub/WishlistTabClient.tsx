"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  BookOpen,
  User,
  X,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import FilePreview from "@/components/FilePreview";

interface WishlistItem {
  id: string;
  itemId: string;
  item: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    course: string;
    imageUrl: string | null;
    fileUrl: string | null;
    fileType: string | null;
    fileName: string | null;
    thumbnailUrl: string | null;
    sellerId: string;
    seller: {
      name: string | null;
    };
    createdAt: Date;
  };
}

interface WishlistTabClientProps {
  wishlistItems: WishlistItem[];
  userId: string;
}

export function WishlistTabClient({
  wishlistItems,
  userId,
}: WishlistTabClientProps) {
  const router = useRouter();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  const handleRemoveFromWishlist = async (
    itemId: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    setRemovingItems((prev) => new Set(prev).add(itemId));
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Removed from wishlist");
        router.refresh();
      } else {
        toast.error("Failed to remove from wishlist");
      }
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  if (wishlistItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-dark-gray mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-muted-foreground mb-4 text-center">
            Start adding items to your wishlist by clicking the heart icon on
            marketplace items
          </p>
          <Button
            onClick={() => router.push("/dashboard/marketplace?mode=study")}
          >
            Browse Marketplace
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist ({wishlistItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((wishlistItem) => {
              const item = wishlistItem.item;
              const isRemoving = removingItems.has(item.id);

              return (
                <Card
                  key={wishlistItem.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    {item.fileUrl ? (
                      <FilePreview
                        fileUrl={item.fileUrl}
                        fileType={item.fileType || ""}
                        fileName={item.fileName || item.title}
                        category={item.category}
                        title={item.title}
                        thumbnailUrl={item.thumbnailUrl || undefined}
                      />
                    ) : item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-16 w-16 text-gray-300" />
                    )}
                    <button
                      onClick={(e) => handleRemoveFromWishlist(item.id, e)}
                      disabled={isRemoving}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full transition-all shadow-sm text-red-500 hover:bg-white disabled:opacity-50 z-10"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <BookOpen className="h-3 w-3" />
                      <span className="truncate">{item.course}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <User className="h-3 w-3" />
                      <span className="truncate">{item.seller.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-dark-blue">
                        Rp {item.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h2 className="text-base font-bold text-gray-900 line-clamp-1">
                {selectedItem.title}
              </h2>
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <FilePreview
                  fileUrl={selectedItem.fileUrl || selectedItem.imageUrl || ""}
                  fileType={selectedItem.fileType || ""}
                  fileName={selectedItem.fileName || selectedItem.title}
                  title={selectedItem.title}
                  category={selectedItem.category}
                  thumbnailUrl={selectedItem.thumbnailUrl}
                />
              </div>

              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {selectedItem.category}
              </Badge>

              <p className="text-xs text-gray-600 line-clamp-2">
                {selectedItem.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Course</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.course}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Seller</p>
                  <p className="font-medium text-gray-900">
                    {selectedItem.seller.name}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Price</span>
                  <span className="text-lg font-bold text-blue-600">
                    Rp {selectedItem.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 text-xs px-3 py-1.5 h-auto"
                  onClick={() => {
                    router.push(
                      `/dashboard/messages?userId=${selectedItem.sellerId}`
                    );
                  }}
                >
                  <MessageCircle className="h-3 w-3 mr-1.5" />
                  Message Seller
                </Button>
                <Button
                  className="flex-1 text-xs px-3 py-1.5 h-auto"
                  onClick={() => {
                    router.push(
                      `/dashboard/marketplace?itemId=${selectedItem.id}`
                    );
                  }}
                >
                  <ShoppingCart className="h-3 w-3 mr-1.5" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
