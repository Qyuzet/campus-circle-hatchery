"use client";

import { useState } from "react";
import { MyHubClient } from "./MyHubClient";
import { LibraryTab } from "./LibraryTab";
import { PurchasesTab } from "./PurchasesTab";
import { SalesTab } from "./SalesTab";
import { WalletTab } from "./WalletTab";
import { ListingsTab } from "./ListingsTab";
import { EventsTab } from "./EventsTab";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MyHubWrapperProps {
  activeTab: string;
  userId: string;
}

export function MyHubWrapper({ activeTab, userId }: MyHubWrapperProps) {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportContext, setSupportContext] = useState<{
    itemId: string | null;
    itemType: string;
    itemTitle: string;
  } | null>(null);

  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleSupportClick = (context: {
    itemId: string | null;
    itemType: string;
    itemTitle: string;
  }) => {
    setSupportContext(context);
    setShowSupportModal(true);
  };

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setShowItemDetailModal(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditingItem(true);
    setShowItemDetailModal(true);
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  return (
    <>
      <div>
        {activeTab === "library" && <LibraryTab userId={userId} />}
        {activeTab === "purchases" && <PurchasesTab userId={userId} />}
        {activeTab === "sales" && <SalesTab userId={userId} />}
        {activeTab === "wallet" && <WalletTab userId={userId} />}
        {activeTab === "listings" && <ListingsTab userId={userId} />}
        {activeTab === "events" && <EventsTab userId={userId} />}
      </div>

      {showSupportModal && supportContext && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Contact Support</h2>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Need help with: <strong>{supportContext.itemTitle}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Item Type: {supportContext.itemType}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSupportModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log("Contact support for:", supportContext);
                  setShowSupportModal(false);
                }}
                className="flex-1"
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {showItemDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {isEditingItem ? "Edit Item" : selectedItem.title}
              </h2>
              <button
                onClick={() => {
                  setShowItemDetailModal(false);
                  setIsEditingItem(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Item details modal placeholder
            </p>
          </div>
        </div>
      )}
    </>
  );
}
