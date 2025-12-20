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
} from "lucide-react";
import { FoodItem } from "@/lib/api";
import Image from "next/image";

interface FoodItemCardProps {
  item: FoodItem;
  onClick?: () => void;
  viewMode?: "grid" | "list";
  isOwner?: boolean;
}

const FoodItemCardComponent = ({
  item,
  onClick,
  viewMode = "grid",
  isOwner = false,
}: FoodItemCardProps) => {
  const isListView = viewMode === "list";

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition-shadow group overflow-hidden ${
        isListView ? "flex flex-row" : ""
      }`}
      style={{ contentVisibility: "auto" }}
    >
      <div
        className={`relative bg-secondary-200 overflow-hidden ${
          isListView ? "w-24 h-24 flex-shrink-0" : "aspect-square"
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
          <div className="w-full h-full flex items-center justify-center bg-orange-100">
            <ShoppingCart className="h-8 w-8 md:h-12 md:w-12 text-orange-400" />
          </div>
        )}
        {item.status === "sold" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge
              variant="destructive"
              className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
            >
              Sold Out
            </Badge>
          </div>
        )}
        {isOwner && (
          <Badge className="absolute top-1 left-1 md:top-2 md:left-2 bg-blue-600 text-white text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2">
            <Edit className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
            My Item
          </Badge>
        )}
      </div>

      <CardContent className={`${isListView ? "flex-1 py-3" : "p-2 md:p-3"}`}>
        <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
          <h3 className="font-semibold text-xs md:text-sm line-clamp-1">
            {item.title}
          </h3>
          <Badge
            variant="secondary"
            className="text-[10px] md:text-xs shrink-0 h-4 md:h-5 px-1 md:px-2"
          >
            Rp{" "}
            {item.price >= 1000
              ? `${(item.price / 1000).toFixed(0)}K`
              : item.price.toLocaleString()}
          </Badge>
        </div>

        <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 mb-1 md:mb-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-0.5 md:gap-1 mb-1 md:mb-2">
          {item.isHalal && (
            <Badge
              variant="outline"
              className="text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2"
            >
              Halal
            </Badge>
          )}
          {item.isVegan && (
            <Badge
              variant="outline"
              className="text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2"
            >
              <Leaf className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
              Vegan
            </Badge>
          )}
          {item.isVegetarian && (
            <Badge
              variant="outline"
              className="text-[9px] md:text-xs h-4 md:h-5 px-1 md:px-2"
            >
              Veg
            </Badge>
          )}
        </div>

        <div className="space-y-0.5 md:space-y-1 text-[10px] md:text-xs text-muted-foreground">
          <div className="flex items-center gap-0.5 md:gap-1">
            <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
            <span className="line-clamp-1">{item.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1">
            <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
            <span className="truncate">{item.pickupTime}</span>
          </div>
          {item.rating > 0 && (
            <div className="flex items-center gap-0.5 md:gap-1">
              <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span>
                {item.rating.toFixed(1)} ({item.reviewCount})
              </span>
            </div>
          )}
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-1 md:mt-2 text-[9px] md:text-xs text-orange-600 line-clamp-1">
            Allergens: {item.allergens.join(", ")}
          </div>
        )}
      </CardContent>

      {!isListView && (
        <CardFooter className="p-3 pt-0">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>
              {item.quantity} {item.unit} left
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {item.viewCount}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export const FoodItemCard = memo(FoodItemCardComponent);
