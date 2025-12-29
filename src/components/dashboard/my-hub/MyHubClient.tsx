"use client";

import { useState } from "react";
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
import { BookOpen, FileText, Book } from "lucide-react";

interface MyHubClientProps {
  initialTab: string;
  purchases: any[];
  sales: any[];
  library: any[];
  listings: any[];
  eventRegistrations: any[];
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
  wishlistItems,
  currentUserId,
}: MyHubClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const totalItems = library.length;
  const notesCount = library.filter((t) => t.item?.category === "Notes").length;
  const booksCount = library.filter((t) => t.item?.category === "Book").length;

  const handlePaymentCompleted = () => {
    setActiveTab("library");
  };

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

      <TabsContent value="events">
        <Card>
          <CardHeader>
            <CardTitle>My Event Registrations</CardTitle>
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
