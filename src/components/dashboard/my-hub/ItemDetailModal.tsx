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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-3"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h2 className="text-base font-bold text-gray-900 line-clamp-1">
            {isEditing ? "Edit Item" : item.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* File Preview Section */}
          <div className="relative w-full h-48 rounded-md overflow-hidden">
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
                  <label className="text-xs font-medium text-gray-700">
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
                    className="text-xs h-8"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-gray-700">
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
                    className="w-full text-xs border rounded-md px-2 py-1.5 min-h-[60px]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-gray-700">
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
                    className="w-full text-xs border rounded-md px-2 py-1.5 h-8"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Notes">Notes</option>
                    <option value="Book">Book</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="text-xs font-medium text-gray-700">
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
                    className="text-xs h-8"
                    placeholder="e.g., AEXXX"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-medium text-gray-700">
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
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Category Badge */}
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {item.category}
              </Badge>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-2">
                {item.description}
              </p>

              {/* Info - Single Line with Icons */}
              <div className="flex items-center gap-3 text-[10px] text-gray-600 bg-gray-50 px-2 py-1.5 rounded-md">
                {item.course && (
                  <>
                    <div className="flex items-center gap-1" title="Course">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                      <span className="font-medium text-gray-900 truncate max-w-[60px]">
                        {item.course}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                  </>
                )}
                {item.seller && (
                  <>
                    <div className="flex items-center gap-1" title="Seller">
                      <User className="h-3 w-3 text-gray-500" />
                      <span className="font-medium text-gray-900 truncate max-w-[80px]">
                        {typeof item.seller === "string"
                          ? item.seller.slice(-9)
                          : item.seller?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                  </>
                )}
                <div className="flex items-center gap-1" title="Rating">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-900">
                    {item.rating || 0} ({item.reviewCount || 0})
                  </span>
                </div>
                {item.viewCount !== undefined && (
                  <>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1" title="Views">
                      <Eye className="h-3 w-3 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {item.viewCount}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Price & Status */}
              <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-md">
                <div>
                  <p className="text-[10px] text-gray-600">Price</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Rp {item.price.toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={
                    item.status === "available" ? "default" : "secondary"
                  }
                  className={`text-[10px] px-2 py-0.5 ${
                    item.status === "available"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : item.status === "sold"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </Badge>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {isOwner ? (
              isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 text-xs px-3 py-1.5 h-auto"
                    onClick={onCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-xs px-3 py-1.5 h-auto"
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
                    className="flex-1 text-xs px-3 py-1.5 h-auto"
                    onClick={onEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 text-xs px-3 py-1.5 h-auto"
                    onClick={() => {
                      onDelete();
                      onClose();
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
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
                      className="flex-1 text-xs px-3 py-1.5 h-auto"
                      onClick={onMessage}
                    >
                      <MessageCircle className="h-3 w-3 mr-1.5" />
                      Message Seller
                    </Button>
                    <Button
                      className="flex-1 text-xs px-3 py-1.5 h-auto"
                      onClick={onBuy}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1.5" />
                      Buy Now
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-md text-center text-xs font-medium">
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
