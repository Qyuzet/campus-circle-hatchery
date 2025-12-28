import React, { memo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Star,
  ShoppingCart,
  Leaf,
  Heart,
  Edit,
  HelpCircle,
} from "lucide-react";
import { FoodItem } from "@/lib/api";
import Image from "next/image";

interface FoodItemCardProps {
  item: FoodItem;
  onClick?: () => void;
  viewMode?: "grid" | "list";
  isOwner?: boolean;
  onSupportClick?: (itemId: string, itemTitle: string) => void;
}

const FoodItemCardComponent = ({
  item,
  onClick,
  viewMode = "grid",
  isOwner = false,
  onSupportClick,
}: FoodItemCardProps) => {
  const isListView = viewMode === "list";

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:border-gray-300 transition-all group overflow-hidden relative border border-gray-200 bg-white ${
        isListView ? "flex flex-row" : ""
      }`}
      style={{ contentVisibility: "auto" }}
    >
      {onSupportClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSupportClick(item.id, item.title);
          }}
          className="absolute top-1 right-1 z-10 bg-white p-1 transition-all"
          title="Contact Support"
        >
          <HelpCircle className="h-2.5 w-2.5 text-gray-600 hover:text-blue-600 transition-colors" />
        </button>
      )}
      <div
        className={`relative bg-gray-50 overflow-hidden ${
          isListView ? "w-16 h-20 flex-shrink-0" : "aspect-square"
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <ShoppingCart className="h-8 w-8 text-orange-300" />
          </div>
        )}
        {item.status === "sold" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge
              variant="destructive"
              className="text-[9px] px-1.5 py-0 font-normal"
            >
              Sold Out
            </Badge>
          </div>
        )}
        {isOwner && (
          <Badge className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] px-1 py-0 font-normal">
            <Edit className="h-2 w-2 mr-0.5" />
            My Item
          </Badge>
        )}
      </div>

      <CardContent
        className={`${isListView ? "flex-1 py-1.5" : "p-1 space-y-0.5"}`}
      >
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-normal text-[10px] line-clamp-1 text-gray-900">
            {item.title}
          </h3>
          <Badge
            variant="secondary"
            className="text-[8px] shrink-0 px-1 py-0 font-normal bg-gray-100 text-gray-700"
          >
            Rp{" "}
            {item.price >= 1000
              ? `${(item.price / 1000).toFixed(0)}K`
              : item.price.toLocaleString()}
          </Badge>
        </div>

        <p className="text-[9px] text-gray-600 line-clamp-1 leading-tight">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-0.5">
          {item.isHalal && (
            <Badge
              variant="outline"
              className="text-[7px] px-0.5 py-0 border-green-600 text-green-700 font-normal"
            >
              Halal
            </Badge>
          )}
          {item.isVegan && (
            <Badge
              variant="outline"
              className="text-[7px] px-0.5 py-0 border-green-600 text-green-700 font-normal"
            >
              <Leaf className="h-1.5 w-1.5 mr-0.5" />
              Vegan
            </Badge>
          )}
          {item.isVegetarian && (
            <Badge
              variant="outline"
              className="text-[7px] px-0.5 py-0 border-green-600 text-green-700 font-normal"
            >
              Veg
            </Badge>
          )}
        </div>

        <div className="space-y-0.5 text-[8px] text-gray-600">
          <div className="flex items-center gap-0.5">
            <MapPin className="h-2 w-2 flex-shrink-0 text-gray-500" />
            <span className="line-clamp-1">{item.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Clock className="h-2 w-2 flex-shrink-0 text-gray-500" />
            <span className="truncate">{item.pickupTime}</span>
          </div>
          {item.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="h-2 w-2 fill-yellow-500 text-yellow-500 flex-shrink-0" />
              <span>
                {item.rating.toFixed(1)} ({item.reviewCount})
              </span>
            </div>
          )}
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="text-[8px] text-orange-600 line-clamp-1">
            Allergens: {item.allergens.join(", ")}
          </div>
        )}
      </CardContent>

      {!isListView && (
        <CardFooter className="p-1 pt-0 border-t border-gray-100">
          <div className="flex items-center justify-between w-full text-[8px] text-gray-600">
            <span>
              {item.quantity} {item.unit} left
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="h-2 w-2 text-gray-500" />
              {item.viewCount}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export const FoodItemCard = memo(FoodItemCardComponent);
