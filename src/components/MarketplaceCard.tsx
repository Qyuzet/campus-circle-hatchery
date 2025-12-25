"use client";

import { memo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Eye, Heart, HelpCircle } from "lucide-react";
import Image from "next/image";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  course: string;
  thumbnailUrl: string | null;
  rating: number;
  reviewCount: number;
  viewCount: number;
  seller: {
    id: string;
    name: string | null;
  };
}

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onClick: (item: MarketplaceItem) => void;
  onWishlistToggle?: (itemId: string) => void;
  isWishlisted?: boolean;
  viewMode?: "grid" | "list";
  onSupportClick?: (itemId: string, itemTitle: string) => void;
}

const MarketplaceCardComponent = ({
  item,
  onClick,
  onWishlistToggle,
  isWishlisted = false,
  viewMode = "grid",
  onSupportClick,
}: MarketplaceCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
    }
    return price.toString();
  };

  return (
    <Card
      onClick={() => onClick(item)}
      className={`cursor-pointer hover:shadow-lg transition-all group overflow-hidden ${
        viewMode === "list" ? "flex flex-row" : ""
      }`}
    >
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {item.thumbnailUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              className={`object-cover group-hover:scale-105 transition-all duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              priority={false}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50">
            <BookOpen className="h-12 w-12 text-blue-300" />
          </div>
        )}

        <div className="absolute top-1 right-1 flex gap-1 z-10">
          {onSupportClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSupportClick(item.id, item.title);
              }}
              className="bg-white/90 hover:bg-white backdrop-blur-sm p-1 rounded-full shadow-sm transition-all hover:shadow-md group"
              title="Contact Support"
            >
              <HelpCircle className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
          )}
          {onWishlistToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWishlistToggle(item.id);
              }}
              className={`bg-white/90 backdrop-blur-sm p-1 rounded-full transition-all shadow-sm ${
                isWishlisted
                  ? "text-red-500"
                  : "text-gray-600 hover:text-red-500"
              } hover:bg-white`}
            >
              <Heart
                className={`h-3 w-3 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      <CardContent className="p-2">
        <h3 className="font-bold text-xs line-clamp-1 mb-1">{item.title}</h3>

        <div className="flex items-center gap-0.5 text-[9px] text-gray-500 mb-1">
          <BookOpen className="h-2.5 w-2.5" />
          <span className="font-medium truncate">{item.course}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t">
          <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rp {formatPrice(item.price)}
          </p>
          <div className="flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[9px] font-medium text-gray-700">
              {item.rating}
            </span>
            <span className="text-[9px] text-gray-500">
              ({item.reviewCount || 0})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-1">
          <Eye className="h-2.5 w-2.5" />
          <span>{item.viewCount || 0} views</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const MarketplaceCard = memo(MarketplaceCardComponent);
