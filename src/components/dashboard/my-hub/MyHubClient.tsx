"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PurchasesTabClient } from "./PurchasesTabClient";
import { SalesTabClient } from "./SalesTabClient";
import { LibraryTabClient } from "./LibraryTabClient";
import { ListingsGrid } from "./ListingsGrid";
import { EventsGrid } from "./EventsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LibraryEmptyState } from "./LibraryEmptyState";
import { ListingsEmptyState } from "./ListingsEmptyState";
import { EventsEmptyState } from "./EventsEmptyState";
import { WishlistTabClient } from "./WishlistTabClient";
import { MyOrganizedEvents } from "./MyOrganizedEvents";
import { BookOpen, FileText, Book } from "lucide-react";
import { usePageContext } from "@/contexts/PageContext";

interface MyHubClientProps {
  initialTab: string;
  purchases: any[];
  sales: any[];
  library: any[];
  listings: any[];
  eventRegistrations: any[];
  organizedEvents: any[];
  wishlistItems: any[];
  currentUserId?: string;
}

export function MyHubClient({
  initialTab,
  purchases,
  sales,
  library,
  listings,
  eventRegistrations,
  organizedEvents,
  wishlistItems,
  currentUserId,
}: MyHubClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { setPageContext } = usePageContext();

  const totalItems = library.length;
  const notesCount = library.filter((t) => t.item?.category === "Notes").length;
  const booksCount = library.filter((t) => t.item?.category === "Book").length;

  const handlePaymentCompleted = () => {
    setActiveTab("library");
  };

  // Set page context for AI chatbot - ONLY include current tab's data
  useEffect(() => {
    const tabLabels: Record<string, string> = {
      purchases: "My Purchases",
      sales: "My Sales",
      library: "My Library",
      listings: "My Listings",
      events: "My Events",
      wishlist: "My Wishlist",
    };

    const tabDescriptions: Record<string, string> = {
      purchases: "View your purchase history and track order status",
      sales: "Track your sales, view buyers, and monitor revenue",
      library:
        "Access your purchased study materials, download files, and review content",
      listings:
        "Manage your listed items for sale, edit prices, and track views",
      events: "View your organized events and event registrations",
      wishlist: "View items you saved for later",
    };

    // Build tab-specific context - ONLY include data for the current tab
    const contextData: any = {
      pageName: tabLabels[activeTab] || "My Hub",
      pageDescription: tabDescriptions[activeTab] || "Your personal hub",
      currentSection: activeTab,
    };

    if (activeTab === "purchases") {
      const completedPurchases = purchases.filter(
        (p) => p.status === "COMPLETED"
      );
      const totalSpent = completedPurchases.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      contextData.stats = {
        totalOrders: purchases.length,
        completedOrders: completedPurchases.length,
        pendingOrders: purchases.filter((p) => p.status === "PENDING").length,
        totalSpent: totalSpent,
      };
      contextData.myListings = purchases.slice(0, 30).map((order) => ({
        id: order.id,
        title:
          order.itemTitle ||
          order.item?.title ||
          order.foodItem?.name ||
          order.event?.title ||
          "Unknown",
        type:
          order.itemType === "marketplace"
            ? "Study Material"
            : order.itemType === "food"
            ? "Food"
            : "Event",
        status: order.status,
        price: order.amount,
      }));
    } else if (activeTab === "sales") {
      const completedSales = sales.filter((s) => s.status === "COMPLETED");
      const totalEarned = completedSales.reduce((sum, s) => sum + s.amount, 0);
      contextData.stats = {
        totalSales: completedSales.length,
        pendingSales: sales.filter((s) => s.status === "PENDING").length,
        totalRevenue: totalEarned,
      };
      contextData.myListings = sales.slice(0, 30).map((sale) => ({
        id: sale.id,
        title: sale.itemTitle || "Unknown",
        type:
          sale.itemType === "marketplace"
            ? "Study Material"
            : sale.itemType === "food"
            ? "Food"
            : "Event",
        status: sale.status,
        price: sale.amount,
        buyerName: sale.buyer?.name,
      }));
    } else if (activeTab === "library") {
      contextData.stats = {
        totalItems: library.length,
        notesCount: notesCount,
        booksCount: booksCount,
      };
      // Include library items with full details
      contextData.marketplaceItems = library.slice(0, 30).map((item) => {
        const aiMeta = item.item?.aiMetadata as any;
        return {
          id: item.item?.id || item.id,
          title: item.item?.title || item.itemTitle || "Unknown",
          description: item.item?.description || "",
          price: item.amount,
          category: item.item?.category || "Unknown",
          course: item.item?.course,
          fileUrl: item.item?.fileUrl,
          fileName: item.item?.fileName,
          aiMetadata: aiMeta
            ? {
                contentSummary:
                  aiMeta.contentSummary ||
                  aiMeta.extractedData?.metadata?.contentSummary,
                keywords:
                  aiMeta.keywords || aiMeta.extractedData?.metadata?.keywords,
                topics: aiMeta.topics || aiMeta.extractedData?.metadata?.topics,
                subject:
                  aiMeta.subject || aiMeta.extractedData?.metadata?.subject,
              }
            : undefined,
        };
      });
    } else if (activeTab === "listings") {
      contextData.stats = {
        totalListings: listings.length,
        activeListings: listings.filter((l) => l.status === "available").length,
        soldListings: listings.filter((l) => l.status === "sold").length,
      };
      contextData.marketplaceItems = listings.slice(0, 30).map((item) => {
        const aiMeta = item.aiMetadata as any;
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          course: item.course,
          status: item.status,
          viewCount: item.viewCount,
          rating: item.rating,
          aiMetadata: aiMeta
            ? {
                contentSummary:
                  aiMeta.contentSummary ||
                  aiMeta.extractedData?.metadata?.contentSummary,
                keywords:
                  aiMeta.keywords || aiMeta.extractedData?.metadata?.keywords,
                topics: aiMeta.topics || aiMeta.extractedData?.metadata?.topics,
                subject:
                  aiMeta.subject || aiMeta.extractedData?.metadata?.subject,
              }
            : undefined,
        };
      });
    } else if (activeTab === "events") {
      contextData.stats = {
        eventRegistrations: eventRegistrations.length,
        organizedEvents: organizedEvents.length,
        upcomingEvents: eventRegistrations.filter(
          (r) => new Date(r.event?.startDate) > new Date()
        ).length,
      };
      contextData.events = eventRegistrations.slice(0, 30).map((reg) => ({
        id: reg.event?.id || reg.id,
        title: reg.event?.title || "Unknown Event",
        description: reg.event?.description || "",
        date: reg.event?.startDate,
        location: reg.event?.location,
        price: reg.event?.price || 0,
        registrationStatus: reg.status,
      }));
    } else if (activeTab === "wishlist") {
      contextData.stats = {
        wishlistItems: wishlistItems.length,
      };
      contextData.marketplaceItems = wishlistItems.slice(0, 30).map((item) => ({
        id: item.item?.id || item.id,
        title: item.item?.title || "Unknown",
        description: item.item?.description || "",
        price: item.item?.price || 0,
        category: item.item?.category || "Unknown",
      }));
    }

    setPageContext(contextData);
  }, [
    activeTab,
    purchases,
    sales,
    library,
    listings,
    eventRegistrations,
    organizedEvents,
    wishlistItems,
    notesCount,
    booksCount,
    setPageContext,
  ]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6 mb-6 h-8">
        <TabsTrigger value="purchases" className="text-xs px-2 py-1">
          Purchases
        </TabsTrigger>
        <TabsTrigger value="sales" className="text-xs px-2 py-1">
          Sales
        </TabsTrigger>
        <TabsTrigger value="library" className="text-xs px-2 py-1">
          Library
        </TabsTrigger>
        <TabsTrigger value="listings" className="text-xs px-2 py-1">
          Listings
        </TabsTrigger>
        <TabsTrigger value="events" className="text-xs px-2 py-1">
          Events
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="text-xs px-2 py-1">
          Wishlist
        </TabsTrigger>
      </TabsList>

      <TabsContent value="purchases">
        <PurchasesTabClient
          transactions={purchases}
          onPaymentCompleted={handlePaymentCompleted}
        />
      </TabsContent>

      <TabsContent value="sales">
        <SalesTabClient transactions={sales} />
      </TabsContent>

      <TabsContent value="library">
        <LibraryTabClient
          transactions={library}
          totalItems={totalItems}
          notesCount={notesCount}
          booksCount={booksCount}
        />
      </TabsContent>

      <TabsContent value="listings">
        <Card>
          <CardHeader>
            <CardTitle>My Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <ListingsEmptyState />
            ) : (
              <ListingsGrid listings={listings} currentUserId={currentUserId} />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>My Organized Events</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Events you created and their registrants
            </p>
          </CardHeader>
          <CardContent>
            <MyOrganizedEvents events={organizedEvents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Event Registrations</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Events you registered for
            </p>
          </CardHeader>
          <CardContent>
            {eventRegistrations.length === 0 ? (
              <EventsEmptyState />
            ) : (
              <EventsGrid registrations={eventRegistrations} />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wishlist">
        <WishlistTabClient
          wishlistItems={wishlistItems}
          userId={currentUserId || ""}
        />
      </TabsContent>
    </Tabs>
  );
}
