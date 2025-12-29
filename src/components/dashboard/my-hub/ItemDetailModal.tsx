"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  User,
  Star,
  Eye,
  Trash2,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilePreview from "@/components/FilePreview";

interface ItemDetailModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (data: any) => void;
  onCancel: () => void;
  currentUserId?: string;
  onMessage?: () => void;
  onBuy?: () => void;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  currentUserId,
  onMessage,
  onBuy,
}: ItemDetailModalProps) {
  const [editFormData, setEditFormData] = useState({
    title: item.title,
    description: item.description,
    category: item.category,
    course: item.course || "",
    price: item.price,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editFormData);
    setIsSaving(false);
  };

  if (!isOpen) return null;

  const isOwner = item.sellerId === currentUserId;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-3"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-medium text-gray-900 line-clamp-1">
            {isEditing ? "Edit Item" : item.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* File Preview Section */}
          <div className="relative w-full h-40 overflow-hidden bg-gray-50">
            <FilePreview
              fileUrl={item.fileUrl || item.imageUrl || ""}
              fileType={item.fileType || ""}
              fileName={item.fileName || item.title}
              title={isEditing ? editFormData.title : item.title}
              category={isEditing ? editFormData.category : item.category}
              thumbnailUrl={item.thumbnailUrl}
            />
          </div>

          {isEditing ? (
            <>
              {/* Edit Form */}
              <div className="space-y-2">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-normal text-gray-700 mb-0.5 block">
                    Title
                  </label>
                  <Input
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className="text-xs h-8 border-gray-300"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-normal text-gray-700 mb-0.5 block">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full text-xs border border-gray-300 px-2 py-1.5 min-h-[60px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[10px] font-normal text-gray-700 mb-0.5 block">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full text-xs border border-gray-300 px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Notes">Notes</option>
                    <option value="Book">Book</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="text-[10px] font-normal text-gray-700 mb-0.5 block">
                    Course
                  </label>
                  <Input
                    value={editFormData.course}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        course: e.target.value,
                      })
                    }
                    className="text-xs h-8 border-gray-300"
                    placeholder="e.g., AEXXX"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] font-normal text-gray-700 mb-0.5 block">
                    Price (Rp)
                  </label>
                  <Input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="text-xs h-8 border-gray-300"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Category Badge */}
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 font-normal bg-gray-100 text-gray-700"
              >
                {item.category}
              </Badge>

              {/* Description */}
              <p className="text-[10px] text-gray-600 line-clamp-2 leading-snug">
                {item.description}
              </p>

              {/* Info - Compact Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-gray-600">
                {item.course && (
                  <div
                    className="flex items-center gap-1 bg-gray-50 px-2 py-1"
                    title="Course"
                  >
                    <BookOpen className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
                    <span className="font-normal text-gray-900 truncate">
                      {item.course}
                    </span>
                  </div>
                )}
                {item.seller && (
                  <div
                    className="flex items-center gap-1 bg-gray-50 px-2 py-1"
                    title="Seller"
                  >
                    <User className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
                    <span className="font-normal text-gray-900 truncate">
                      {typeof item.seller === "string"
                        ? item.seller.slice(-9)
                        : item.seller?.name || "Unknown"}
                    </span>
                  </div>
                )}
                <div
                  className="flex items-center gap-1 bg-gray-50 px-2 py-1"
                  title="Rating"
                >
                  <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  <span className="font-normal text-gray-900">
                    {item.rating || 0} ({item.reviewCount || 0})
                  </span>
                </div>
                {item.viewCount !== undefined && (
                  <div
                    className="flex items-center gap-1 bg-gray-50 px-2 py-1"
                    title="Views"
                  >
                    <Eye className="h-2.5 w-2.5 text-gray-500 flex-shrink-0" />
                    <span className="font-normal text-gray-900">
                      {item.viewCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-l-2 border-blue-600">
                <div>
                  <p className="text-[9px] text-gray-600 mb-0.5">Price</p>
                  <p className="text-base font-medium text-blue-600">
                    Rp {item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 mt-2">
            {isOwner ? (
              isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-[10px] px-3 py-2 h-auto font-normal border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={onCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-[10px] px-3 py-2 h-auto font-normal bg-blue-600 hover:bg-blue-700 transition-colors"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-[10px] px-3 py-2 h-auto font-normal border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={onEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 text-[10px] px-3 py-2 h-auto font-normal bg-red-600 hover:bg-red-700 transition-colors"
                    onClick={() => {
                      onDelete();
                      onClose();
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Item
                  </Button>
                </>
              )
            ) : (
              <>
                {onMessage && onBuy ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-[10px] px-3 py-2 h-auto font-normal border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={onMessage}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message Seller
                    </Button>
                    <Button
                      className="flex-1 text-[10px] px-3 py-2 h-auto font-normal bg-blue-600 hover:bg-blue-700 transition-colors"
                      onClick={onBuy}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Buy Now
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-600 px-3 py-2 text-center text-[10px] font-normal">
                    View Only
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
