"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Grid,
  List,
  Plus,
  X,
  ShoppingCart,
  BookOpen,
  Star,
  Heart,
  HelpCircle,
  MessageCircle,
  Trash2,
  User,
  Eye,
  MapPin,
  Clock,
  Calendar,
  Users,
} from "lucide-react";
import { FoodItemCard } from "@/components/FoodItemCard";
import { EventCard } from "@/components/EventCard";
import FilePreview from "@/components/FilePreview";
import Image from "next/image";
import { format } from "date-fns";
import PaymentModal from "@/components/PaymentModal";
import {
  conversationsAPI,
  messagesAPI,
  marketplaceAPI,
  foodAPI,
  eventAPI,
} from "@/lib/api";
import { toast } from "sonner";
import { AddFoodForm } from "@/components/AddFoodForm";
import { AddEventForm } from "@/components/AddEventForm";
import { AddItemForm } from "@/components/AddItemForm";
import { EditItemForm } from "@/components/EditItemForm";
import { EditFoodForm } from "@/components/EditFoodForm";
import { EditEventForm } from "@/components/EditEventForm";
import { MessageSellerModal } from "./MessageSellerModal";
import { SupportContactModal } from "@/components/SupportContactModal";

interface MarketplaceClientProps {
  initialMarketplaceItems: any[];
  initialFoodItems: any[];
  initialEvents: any[];
  initialContentMode: "study" | "food" | "event";
  myEventRegistrations: string[];
  wishlistItemIds: string[];
  myPurchasedItemIds: string[];
  userId: string;
  userProfile: any;
}

export function MarketplaceClient({
  initialMarketplaceItems,
  initialFoodItems,
  initialEvents,
  initialContentMode,
  myEventRegistrations,
  wishlistItemIds,
  myPurchasedItemIds,
  userId,
  userProfile,
}: MarketplaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contentMode, setContentMode] = useState<"study" | "food" | "event">(
    initialContentMode
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<Set<string>>(
    new Set(wishlistItemIds)
  );
  const [purchasedItems] = useState<Set<string>>(new Set(myPurchasedItemIds));
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentItem, setPaymentItem] = useState<{
    id: string;
    title: string;
    price: number;
    type: "marketplace" | "tutoring" | "food" | "event";
  } | null>(null);
  const [hasPurchasedItem, setHasPurchasedItem] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
  const [showReorderConfirm, setShowReorderConfirm] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageItem, setMessageItem] = useState<any>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportContext, setSupportContext] = useState<{
    itemId: string;
    itemType: string;
    itemTitle: string;
  } | null>(null);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  const handleContentModeChange = (mode: "study" | "food" | "event") => {
    setContentMode(mode);
    router.push(`/dashboard/marketplace?mode=${mode}`, { scroll: false });
  };

  const handleAddClick = () => {
    if (!isProfileComplete()) {
      toast.error("Please complete your profile before adding items");
      router.push("/account");
      return;
    }

    setShowAddTypeModal(true);
  };

  const handleAddItem = async (itemData: any) => {
    try {
      await marketplaceAPI.createItem(itemData);
      setShowAddItemModal(false);
      toast.success("Study material added successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error adding study material:", error);
      toast.error("Failed to add study material. Please try again.");
    }
  };

  const handleAddFood = async (foodData: any) => {
    try {
      await foodAPI.createFoodItem(foodData);
      setShowAddFoodModal(false);
      toast.success("Food item added successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error("Failed to add food item. Please try again.");
    }
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      await eventAPI.createEvent(eventData);
      setShowAddEventModal(false);
      toast.success("Event created successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  const handleEditFood = (food: any) => {
    setEditingFood(food);
    setShowEditFoodModal(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEditEventModal(true);
  };

  const handleUpdateItem = async (itemData: any) => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      await marketplaceAPI.updateItem(editingItem.id, itemData);
      setShowEditItemModal(false);
      setEditingItem(null);
      toast.success("Study material updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating study material:", error);
      toast.error("Failed to update study material. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFood = async (foodData: any) => {
    if (!editingFood) return;

    setIsSaving(true);
    try {
      await foodAPI.updateFoodItem(editingFood.id, foodData);
      setShowEditFoodModal(false);
      setEditingFood(null);
      toast.success("Food item updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating food item:", error);
      toast.error("Failed to update food item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!editingEvent) return;

    setIsSaving(true);
    try {
      await eventAPI.updateEvent(editingEvent.id, eventData);
      setShowEditEventModal(false);
      setEditingEvent(null);
      toast.success("Event updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMarketplaceItems = useMemo(() => {
    let items = initialMarketplaceItems;

    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.course?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [initialMarketplaceItems, selectedCategory, searchQuery]);

  const filteredFoodItems = useMemo(() => {
    let items = initialFoodItems;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.ingredients?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [initialFoodItems, searchQuery]);

  const filteredEvents = useMemo(() => {
    let items = initialEvents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [initialEvents, searchQuery]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleWishlistToggle = async (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newWishlist = new Set(wishlist);
    if (wishlist.has(itemId)) {
      newWishlist.delete(itemId);
      await fetch(`/api/wishlist/${itemId}`, { method: "DELETE" });
    } else {
      newWishlist.add(itemId);
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
    }
    setWishlist(newWishlist);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
    }
    return price.toString();
  };

  const isProfileComplete = () => {
    if (!userProfile) return false;
    return !!(
      userProfile.name &&
      userProfile.studentId &&
      userProfile.faculty &&
      userProfile.faculty !== "Unknown" &&
      userProfile.major &&
      userProfile.major !== "Unknown" &&
      userProfile.year
    );
  };

  const handleBuyItem = (item: any) => {
    if (!isProfileComplete()) {
      toast.error("Please complete your profile before purchasing items");
      return;
    }

    if (hasPurchasedItem) {
      setShowReorderConfirm(true);
    } else {
      proceedWithPurchase(item);
    }
  };

  const proceedWithPurchase = (item: any) => {
    setPaymentItem({
      id: item.id,
      title: item.title,
      price: item.price,
      type: "marketplace",
    });
    setShowPaymentModal(true);
    setShowReorderConfirm(false);
  };

  const handleOrderFood = async (foodItem: any) => {
    try {
      const conversation = await conversationsAPI.createConversation(
        foodItem.sellerId
      );
      await messagesAPI.sendOrderRequest(conversation.id, foodItem);
      setShowFoodModal(false);
      toast.success("Order request sent to seller!");
      router.push("/dashboard/messages");
    } catch (error) {
      console.error("Error sending order request:", error);
      toast.error("Failed to send order request. Please try again.");
    }
  };

  const handleRegisterEvent = (event: any) => {
    if (event.price > 0) {
      setPaymentItem({
        id: event.id,
        title: event.title,
        price: event.price,
        type: "event",
      });
      setShowPaymentModal(true);
    } else {
      registerForFreeEvent(event.id);
    }
  };

  const registerForFreeEvent = async (eventId: string) => {
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      toast.success("Successfully registered for event!");
      setShowEventModal(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error registering for event:", error);
      toast.error(error.message || "Failed to register for event.");
    }
  };

  const handlePaymentSuccess = () => {
    setShowItemModal(false);
    setShowFoodModal(false);
    setShowEventModal(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card className="sticky top-28 z-40 bg-white">
        <CardContent className="p-3 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mode Selector - Study, Food, Event */}
            <div className="flex border border-input rounded-md h-7 sm:h-8 shrink-0">
              <Button
                variant={contentMode === "study" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleContentModeChange("study")}
                className="rounded-r-none h-full px-2 sm:px-3 text-xs sm:text-sm"
              >
                Study
              </Button>
              <Button
                variant={contentMode === "food" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleContentModeChange("food")}
                className="rounded-none h-full px-2 sm:px-3 text-xs sm:text-sm"
              >
                Food
              </Button>
              <Button
                variant={contentMode === "event" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleContentModeChange("event")}
                className="rounded-l-none h-full px-2 sm:px-3 text-xs sm:text-sm"
              >
                Event
              </Button>
            </div>

            {/* Category Filter */}
            {contentMode === "study" && (
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-1.5 sm:px-2 py-1 border border-input rounded-md text-[10px] sm:text-xs bg-background hover:bg-accent transition-colors h-7 sm:h-8 w-20 sm:w-auto shrink-0"
              >
                <option value="">All</option>
                <option value="Notes">Notes</option>
                <option value="Assignment">Assignment</option>
                <option value="Book">Book</option>
                <option value="Other">Other</option>
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex border border-input rounded-md h-7 sm:h-8 shrink-0">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none h-full px-1.5 sm:px-2"
              >
                <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none h-full px-1.5 sm:px-2"
              >
                <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddClick}
              size="sm"
              className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 shrink-0 ml-auto"
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button
                    onClick={() => handleCategoryFilter("")}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      const url = new URL(window.location.href);
                      url.searchParams.delete("search");
                      window.history.replaceState({}, "", url.toString());
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketplace Items */}
      {contentMode === "study" && (
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {filteredMarketplaceItems.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your filters"
                    : "No marketplace items available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMarketplaceItems.map((item) => (
              <Card
                key={item.id}
                onClick={async () => {
                  if (purchasedItems.has(item.id)) return;
                  setSelectedItem(item);
                  setShowItemModal(true);
                  setIsCheckingPurchase(true);
                  try {
                    const result = await fetch(
                      `/api/transactions/check-purchase?itemId=${item.id}`
                    );
                    const data = await result.json();
                    setHasPurchasedItem(data.hasPurchased);
                  } catch (error) {
                    console.error("Error checking purchase:", error);
                    setHasPurchasedItem(false);
                  } finally {
                    setIsCheckingPurchase(false);
                  }
                }}
                className={`transition-all duration-150 overflow-hidden border-0 ${
                  viewMode === "list" ? "flex flex-col" : ""
                } ${
                  purchasedItems.has(item.id)
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-lg"
                } shadow-sm bg-white`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSupportContext({
                      itemId: item.id,
                      itemType: "marketplace",
                      itemTitle: item.title,
                    });
                    setShowSupportModal(true);
                  }}
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-sm transition-all hover:shadow-md group"
                  title="Contact Support"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>

                {viewMode === "list" ? (
                  <>
                    {/* List View Layout */}
                    <div className="flex flex-row">
                      <div className="relative bg-gray-50 overflow-hidden w-24 h-32 flex-shrink-0">
                        <FilePreview
                          fileUrl={item.fileUrl}
                          fileType={item.fileType}
                          fileName={item.fileName}
                          category={item.category}
                          title={item.title}
                          compact={true}
                          thumbnailUrl={item.thumbnailUrl}
                        />
                      </div>

                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-base line-clamp-2 text-gray-900 flex-1 min-w-0">
                              {item.title}
                            </h3>
                            {purchasedItems.has(item.id) && (
                              <Badge
                                variant="default"
                                className="text-[10px] px-2 py-0.5 bg-green-600 hover:bg-green-700 flex-shrink-0"
                              >
                                Purchased
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{item.course}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              <span>{item.seller?.rating || 0}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              {item.category}
                            </Badge>
                            <p className="text-lg font-bold text-blue-600">
                              Rp {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2 p-3 pt-0 border-t border-gray-100">
                      {item.sellerId === userId ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 h-9 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(
                              "Delete functionality not implemented in SSR"
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </Button>
                      ) : purchasedItems.has(item.id) ? (
                        <div className="flex-1 bg-green-50 text-green-600 px-4 py-2 text-center rounded-md flex items-center justify-center h-9">
                          <span className="text-sm font-medium">
                            Already Purchased
                          </span>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 border-gray-300 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageItem(item);
                              setShowMessageModal(true);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1.5" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyItem(item);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1.5" />
                            Buy
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Grid View Layout */}
                    <div className="relative bg-gray-50 overflow-hidden aspect-[1/1.414]">
                      <FilePreview
                        fileUrl={item.fileUrl}
                        fileType={item.fileType}
                        fileName={item.fileName}
                        category={item.category}
                        title={item.title}
                        compact={false}
                        thumbnailUrl={item.thumbnailUrl}
                      />
                      <button
                        onClick={(e) => handleWishlistToggle(item.id, e)}
                        className={`absolute top-3 right-3 bg-white p-1.5 transition-all z-10 ${
                          wishlist.has(item.id)
                            ? "text-red-600"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            wishlist.has(item.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <CardContent className="p-1.5 md:p-2 space-y-1">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-medium text-[11px] md:text-xs line-clamp-2 text-gray-900 leading-tight flex-1">
                            {item.title}
                          </h3>
                          {purchasedItems.has(item.id) && (
                            <Badge
                              variant="default"
                              className="text-[8px] md:text-[9px] px-1 py-0 bg-green-600 hover:bg-green-700 font-normal flex-shrink-0"
                            >
                              Purchased
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[9px] md:text-[10px] font-medium text-gray-700">
                              {item.seller?.rating || 0}
                            </span>
                            <span className="text-[9px] md:text-[10px] text-gray-500">
                              ({item.reviewCount || 0})
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[8px] md:text-[9px] px-1 py-0 font-normal bg-gray-100 text-gray-700"
                          >
                            {item.category}
                          </Badge>
                        </div>

                        <p className="text-sm md:text-base font-semibold text-blue-600">
                          Rp {item.price.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-1 px-1.5 md:px-2 pb-1.5 md:pb-2 pt-0">
                      {item.sellerId === userId ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full text-[10px] md:text-xs px-2 py-1 h-6 md:h-7 font-normal"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(
                              "Delete functionality not implemented in SSR"
                            );
                          }}
                        >
                          <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5 md:mr-1" />
                          <span className="hidden md:inline">Delete</span>
                        </Button>
                      ) : purchasedItems.has(item.id) ? (
                        <div className="w-full bg-green-50 text-green-700 px-2 py-1 text-center text-[10px] md:text-xs font-medium h-6 md:h-7 flex items-center justify-center border border-green-200">
                          <span className="hidden md:inline">
                            Already Purchased
                          </span>
                          <span className="md:hidden">Purchased</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[10px] md:text-xs px-1.5 md:px-2 py-1 h-6 md:h-7 font-normal border-gray-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageItem(item);
                              setShowMessageModal(true);
                            }}
                          >
                            <MessageCircle className="h-3 w-3 md:h-3.5 md:w-3.5 md:mr-1" />
                            <span className="hidden md:inline truncate">
                              Message
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-[10px] md:text-xs px-1.5 md:px-2 py-1 h-6 md:h-7 font-normal bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyItem(item);
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 md:h-3.5 md:w-3.5 md:mr-1" />
                            <span className="hidden md:inline truncate">
                              Buy
                            </span>
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {contentMode === "food" && (
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredFoodItems.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No Food Items Found
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Be the first to share food items with your campus community!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFoodItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onClick={() => {
                  setSelectedFood(item);
                  setShowFoodModal(true);
                }}
                viewMode={viewMode as "grid" | "list"}
                isOwner={item.sellerId === userId}
                onSupportClick={(itemId, itemTitle) => {
                  setSupportContext({
                    itemId,
                    itemType: "food",
                    itemTitle,
                  });
                  setShowSupportModal(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {contentMode === "event" && (
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredEvents.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Be the first to create an event for your campus community!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
                isRegistered={myEventRegistrations.includes(event.id)}
                isOwner={event.organizerId === userId}
                onSupportClick={(eventId, eventTitle) => {
                  setSupportContext({
                    itemId: eventId,
                    itemType: "event",
                    itemTitle: eventTitle,
                  });
                  setShowSupportModal(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] md:p-4">
          <div className="bg-white md:rounded-lg w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-hidden flex flex-col relative">
            <button
              onClick={() => {
                setShowItemModal(false);
                setSelectedItem(null);
              }}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              {/* Mobile: Thumbnail + Buttons at top */}
              <div className="md:hidden flex flex-col">
                {/* Thumbnail */}
                <div className="relative w-full bg-gray-100">
                  <div className="aspect-[1/1.414] relative">
                    <FilePreview
                      fileUrl={
                        selectedItem.fileUrl || selectedItem.imageUrl || ""
                      }
                      fileType={selectedItem.fileType || ""}
                      fileName={selectedItem.fileName || selectedItem.title}
                      title={selectedItem.title}
                      category={selectedItem.category}
                      thumbnailUrl={selectedItem.thumbnailUrl}
                    />
                  </div>
                </div>

                {/* Title and Price */}
                <div className="p-3 border-b">
                  <h2 className="text-lg font-bold mb-2">
                    {selectedItem.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-sm">
                      Rp {selectedItem.price.toLocaleString()}
                    </Badge>
                    <Badge className="text-xs">{selectedItem.category}</Badge>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className="flex gap-2">
                    {selectedItem.sellerId === userId ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditItem(selectedItem)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            alert(
                              "Delete functionality not implemented in SSR"
                            );
                            setShowItemModal(false);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    ) : purchasedItems.has(selectedItem.id) ? (
                      <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 text-center text-sm font-medium rounded">
                        Already Purchased
                      </div>
                    ) : selectedItem.status === "available" ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            router.push(
                              `/dashboard/messages?userId=${selectedItem.sellerId}`
                            );
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            handleBuyItem(selectedItem);
                          }}
                          disabled={isCheckingPurchase}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {isCheckingPurchase
                            ? "Checking..."
                            : hasPurchasedItem
                            ? "Buy Again"
                            : "Buy Now"}
                        </Button>
                      </>
                    ) : selectedItem.status === "sold" ? (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 text-center text-sm font-medium rounded">
                        SOLD OUT
                      </div>
                    ) : (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 text-center text-sm font-medium rounded">
                        Item Not Available
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Details - Mobile */}
                <details className="border-b" open>
                  <summary className="px-3 py-2 font-semibold text-sm cursor-pointer hover:bg-gray-50">
                    Description
                  </summary>
                  <div className="px-3 pb-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                </details>

                <details className="border-b">
                  <summary className="px-3 py-2 font-semibold text-sm cursor-pointer hover:bg-gray-50">
                    Details
                  </summary>
                  <div className="px-3 pb-3 space-y-3">
                    <div>
                      <h3 className="font-semibold text-xs mb-1 text-gray-700">
                        Course
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{selectedItem.course}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs mb-1 text-gray-700">
                        Seller
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {typeof selectedItem.seller === "string"
                            ? selectedItem.seller.slice(-9)
                            : selectedItem.seller?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs mb-1 text-gray-700">
                        Rating
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>
                          {selectedItem.rating || 0} (
                          {selectedItem.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs mb-1 text-gray-700">
                        Views
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{selectedItem.viewCount || 0}</span>
                      </div>
                    </div>
                    {selectedItem.condition && (
                      <div>
                        <h3 className="font-semibold text-xs mb-1 text-gray-700">
                          Condition
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedItem.condition}
                        </p>
                      </div>
                    )}
                  </div>
                </details>

                {selectedItem.fileName && (
                  <details className="border-b">
                    <summary className="px-3 py-2 font-semibold text-sm cursor-pointer hover:bg-gray-50">
                      File Details
                    </summary>
                    <div className="px-3 pb-3 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Name: {selectedItem.fileName}
                      </p>
                      {selectedItem.fileType && (
                        <p className="text-xs text-muted-foreground">
                          Type: {selectedItem.fileType.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Desktop: Traditional Layout */}
              <div className="hidden md:flex md:flex-row w-full">
                {/* Left: Thumbnail Preview */}
                <div className="relative w-2/5 bg-gray-100 flex-shrink-0">
                  <div className="aspect-[1/1.414] relative">
                    <FilePreview
                      fileUrl={
                        selectedItem.fileUrl || selectedItem.imageUrl || ""
                      }
                      fileType={selectedItem.fileType || ""}
                      fileName={selectedItem.fileName || selectedItem.title}
                      title={selectedItem.title}
                      category={selectedItem.category}
                      thumbnailUrl={selectedItem.thumbnailUrl}
                    />
                  </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold mb-1">
                        {selectedItem.title}
                      </h2>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">
                          Rp {selectedItem.price.toLocaleString()}
                        </Badge>
                        <Badge className="text-xs">
                          {selectedItem.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Description
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">Course</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          <span>{selectedItem.course}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">Seller</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>
                            {typeof selectedItem.seller === "string"
                              ? selectedItem.seller.slice(-9)
                              : selectedItem.seller?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">Rating</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span>
                            {selectedItem.rating || 0} (
                            {selectedItem.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">Views</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{selectedItem.viewCount || 0}</span>
                        </div>
                      </div>
                      {selectedItem.condition && (
                        <div>
                          <h3 className="font-semibold text-sm mb-0.5">
                            Condition
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {selectedItem.condition}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedItem.fileName && (
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">
                          File Details
                        </h3>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Name: {selectedItem.fileName}</p>
                          {selectedItem.fileType && (
                            <p>Type: {selectedItem.fileType.toUpperCase()}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Badge
                        variant={
                          selectedItem.status === "available"
                            ? "default"
                            : "secondary"
                        }
                        className={`text-xs ${
                          selectedItem.status === "available"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : selectedItem.status === "sold"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {selectedItem.status || "available"}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="flex gap-2 pt-3 border-t mt-3">
                    {selectedItem.sellerId === userId ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 text-sm"
                          onClick={() => handleEditItem(selectedItem)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 text-sm"
                          onClick={() => {
                            alert(
                              "Delete functionality not implemented in SSR"
                            );
                            setShowItemModal(false);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    ) : purchasedItems.has(selectedItem.id) ? (
                      <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 text-center text-sm font-medium rounded">
                        Already Purchased
                      </div>
                    ) : selectedItem.status === "available" ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 text-sm"
                          onClick={() => {
                            setMessageItem(selectedItem);
                            setShowItemModal(false);
                            setShowMessageModal(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message Seller
                        </Button>
                        <Button
                          className="flex-1 text-sm bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            handleBuyItem(selectedItem);
                          }}
                          disabled={isCheckingPurchase}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {isCheckingPurchase
                            ? "Checking..."
                            : hasPurchasedItem
                            ? "Buy Again"
                            : "Buy Now"}
                        </Button>
                      </>
                    ) : selectedItem.status === "sold" ? (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 text-center text-sm font-medium rounded">
                        SOLD OUT
                      </div>
                    ) : (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 text-center text-sm font-medium rounded">
                        Item Not Available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Detail Modal */}
      {showFoodModal && selectedFood && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <button
              onClick={() => {
                setShowFoodModal(false);
                setSelectedFood(null);
              }}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {selectedFood.imageUrl && (
                <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0">
                  <Image
                    src={selectedFood.imageUrl}
                    alt={selectedFood.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {selectedFood.title}
                    </h2>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">
                        Rp {selectedFood.price.toLocaleString()}
                      </Badge>
                      <Badge className="text-xs">{selectedFood.category}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedFood.foodType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedFood.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Pickup Location
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedFood.pickupLocation}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Pickup Time
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedFood.pickupTime}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">Quantity</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedFood.quantity} {selectedFood.unit}
                      </p>
                    </div>
                    {(selectedFood.isHalal ||
                      selectedFood.isVegan ||
                      selectedFood.isVegetarian) && (
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">
                          Dietary
                        </h3>
                        <div className="flex gap-1 flex-wrap">
                          {selectedFood.isHalal && (
                            <Badge variant="outline" className="text-xs">
                              Halal
                            </Badge>
                          )}
                          {selectedFood.isVegan && (
                            <Badge variant="outline" className="text-xs">
                              Vegan
                            </Badge>
                          )}
                          {selectedFood.isVegetarian && (
                            <Badge variant="outline" className="text-xs">
                              Vegetarian
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedFood.allergens &&
                    selectedFood.allergens.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-0.5">
                          Allergens
                        </h3>
                        <p className="text-xs text-orange-600">
                          {selectedFood.allergens.join(", ")}
                        </p>
                      </div>
                    )}

                  {selectedFood.ingredients && (
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Ingredients
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {selectedFood.ingredients}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {selectedFood.sellerId === userId ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditFood(selectedFood)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            alert(
                              "Delete functionality not implemented in SSR"
                            );
                            setShowFoodModal(false);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : selectedFood.status === "available" ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMessageItem(selectedFood);
                            setShowFoodModal(false);
                            setShowMessageModal(true);
                          }}
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message Seller
                        </Button>
                        <Button
                          onClick={() => {
                            handleOrderFood(selectedFood);
                          }}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Order Now
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-md text-center font-medium">
                        Not Available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <button
              onClick={() => {
                setShowEventModal(false);
                setSelectedEvent(null);
              }}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {(selectedEvent.bannerUrl || selectedEvent.imageUrl) && (
                <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0">
                  <Image
                    src={
                      selectedEvent.bannerUrl || selectedEvent.imageUrl || ""
                    }
                    alt={selectedEvent.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {selectedEvent.title}
                    </h2>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs">
                        {selectedEvent.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedEvent.eventType}
                      </Badge>
                      {selectedEvent.isFeatured && (
                        <Badge className="bg-yellow-500 text-xs">
                          Featured
                        </Badge>
                      )}
                      {selectedEvent.price > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Rp {selectedEvent.price.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedEvent.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Start Date
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(selectedEvent.startDate),
                          "MMM dd, HH:mm"
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">End Date</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(selectedEvent.endDate),
                          "MMM dd, HH:mm"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">Location</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedEvent.isOnline
                          ? "Online"
                          : selectedEvent.location}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Participants
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {selectedEvent.currentParticipants}
                        {selectedEvent.maxParticipants
                          ? ` / ${selectedEvent.maxParticipants}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.organizer && (
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">
                        Organizer
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedEvent.organizer}
                      </p>
                    </div>
                  )}

                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.tags.map(
                          (tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {selectedEvent.organizerId === userId ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditEvent(selectedEvent)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            alert(
                              "Delete functionality not implemented in SSR"
                            );
                            setShowEventModal(false);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : myEventRegistrations.includes(selectedEvent.id) ? (
                      <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-md text-center font-medium">
                        Already Registered
                      </div>
                    ) : selectedEvent.maxParticipants &&
                      selectedEvent.currentParticipants >=
                        selectedEvent.maxParticipants ? (
                      <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-md text-center font-medium">
                        Event Full
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            router.push(
                              `/dashboard?message=${selectedEvent.organizerId}`
                            );
                          }}
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message Organizer
                        </Button>
                        <Button
                          onClick={() => {
                            handleRegisterEvent(selectedEvent);
                          }}
                          className="flex-1"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Register
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Confirmation Modal */}
      {showReorderConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold">Already Purchased</h3>
            <p className="text-sm text-gray-600">
              You have already bought this item. Would you like to purchase it
              again?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowReorderConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  proceedWithPurchase(selectedItem);
                  setShowItemModal(false);
                }}
              >
                Yes, Buy Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentItem && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          item={paymentItem}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Add New Study Material
              </h2>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AddItemForm
              onSubmit={handleAddItem}
              onCancel={() => setShowAddItemModal(false)}
            />
          </div>
        </div>
      )}

      {/* Add Type Selection Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-dark-gray">
                What would you like to add?
              </h2>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAddTypeModal(false);
                  setShowAddItemModal(true);
                }}
                className="w-full p-4 border-2 border-light-gray rounded-lg hover:border-dark-blue hover:bg-primary-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-gray">
                      Study Material
                    </h3>
                    <p className="text-sm text-medium-gray">
                      Notes, assignments, books
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowAddTypeModal(false);
                  setShowAddFoodModal(true);
                }}
                className="w-full p-4 border-2 border-light-gray rounded-lg hover:border-dark-blue hover:bg-primary-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-gray">Food</h3>
                    <p className="text-sm text-medium-gray">
                      Share or sell food items
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowAddTypeModal(false);
                  setShowAddEventModal(true);
                }}
                className="w-full p-4 border-2 border-light-gray rounded-lg hover:border-dark-blue hover:bg-primary-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-gray">Event</h3>
                    <p className="text-sm text-medium-gray">
                      Create campus events
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Add New Food Item
              </h2>
              <button
                onClick={() => setShowAddFoodModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AddFoodForm
              onSubmit={handleAddFood}
              onCancel={() => setShowAddFoodModal(false)}
            />
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Create New Event
              </h2>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AddEventForm
              onSubmit={handleAddEvent}
              onCancel={() => setShowAddEventModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Edit Study Material
              </h2>
              <button
                onClick={() => {
                  setShowEditItemModal(false);
                  setEditingItem(null);
                }}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <EditItemForm
              item={editingItem}
              onSubmit={handleUpdateItem}
              onCancel={() => {
                setShowEditItemModal(false);
                setEditingItem(null);
              }}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      {/* Edit Food Modal */}
      {showEditFoodModal && editingFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Edit Food Item
              </h2>
              <button
                onClick={() => {
                  setShowEditFoodModal(false);
                  setEditingFood(null);
                }}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <EditFoodForm
              foodItem={editingFood}
              onSubmit={handleUpdateFood}
              onCancel={() => {
                setShowEditFoodModal(false);
                setEditingFood(null);
              }}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Edit Event
              </h2>
              <button
                onClick={() => {
                  setShowEditEventModal(false);
                  setEditingEvent(null);
                }}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <EditEventForm
              event={editingEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setShowEditEventModal(false);
                setEditingEvent(null);
              }}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      <MessageSellerModal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setMessageItem(null);
        }}
        item={messageItem}
        currentUserId={userId}
      />

      <SupportContactModal
        isOpen={showSupportModal}
        onClose={() => {
          setShowSupportModal(false);
          setSupportContext(null);
        }}
        relatedItemId={supportContext?.itemId || ""}
        relatedItemType={supportContext?.itemType || ""}
        relatedItemTitle={supportContext?.itemTitle || ""}
      />
    </div>
  );
}
