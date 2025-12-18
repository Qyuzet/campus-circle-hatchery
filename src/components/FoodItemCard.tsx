import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, ShoppingCart, Leaf, Heart } from "lucide-react";
import { FoodItem } from "@/lib/api";
import Image from "next/image";

interface FoodItemCardProps {
  item: FoodItem;
  onClick?: () => void;
  viewMode?: "grid" | "list";
}

export function FoodItemCard({ item, onClick, viewMode = "grid" }: FoodItemCardProps) {
  const isListView = viewMode === "list";

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition-all group overflow-hidden ${
        isListView ? "flex flex-row" : ""
      }`}
    >
      <div
        className={`relative bg-secondary-200 overflow-hidden ${
          isListView
            ? "w-24 h-24 flex-shrink-0"
            : "aspect-square"
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
            <ShoppingCart className="h-12 w-12 text-orange-400" />
          </div>
        )}
        {item.status === "sold" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive">Sold Out</Badge>
          </div>
        )}
      </div>

      <CardContent className={`${isListView ? "flex-1 py-3" : "p-3"}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            Rp {item.price.toLocaleString()}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-2">
          {item.isHalal && (
            <Badge variant="outline" className="text-xs">
              Halal
            </Badge>
          )}
          {item.isVegan && (
            <Badge variant="outline" className="text-xs">
              <Leaf className="h-3 w-3 mr-1" />
              Vegan
            </Badge>
          )}
          {item.isVegetarian && (
            <Badge variant="outline" className="text-xs">
              Vegetarian
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{item.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{item.pickupTime}</span>
          </div>
          {item.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{item.rating.toFixed(1)} ({item.reviewCount})</span>
            </div>
          )}
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-2 text-xs text-orange-600">
            Allergens: {item.allergens.join(", ")}
          </div>
        )}
      </CardContent>

      {!isListView && (
        <CardFooter className="p-3 pt-0">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>{item.quantity} {item.unit} left</span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {item.viewCount}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

