"use client";

import {
  useState,
  useEffect,
  useRef,
  Suspense,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import {
  pusherClient,
  getConversationChannel,
  getGroupChannel,
  getUserTransactionChannel,
} from "@/lib/pusher";
import { playNotificationSound } from "@/lib/notification-sound";
import {
  groupsAPI,
  usersAPI,
  wishlistAPI,
  foodAPI,
  eventAPI,
  paymentAPI,
  FoodItem,
  Event,
} from "@/lib/api";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FoodItemCard } from "@/components/FoodItemCard";
import { EventCard } from "@/components/EventCard";
import { AddFoodForm } from "@/components/AddFoodForm";
import { AddEventForm } from "@/components/AddEventForm";
import { EditFoodForm } from "@/components/EditFoodForm";
import { EditEventForm } from "@/components/EditEventForm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Users,
  MessageCircle,
  ShoppingCart,
  Plus,
  Search,
  Bell,
  User,
  Star,
  Heart,
  Eye,
  Grid,
  List,
  Send,
  X,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  TrendingUp,
  Package,
  Library,
  RefreshCw,
  Wallet,
  Sparkles,
  Loader2,
  MapPin,
  Folders,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  marketplaceAPI,
  conversationsAPI,
  messagesAPI,
  tutoringAPI,
  notificationsAPI,
  statsAPI,
  transactionsAPI,
  fileAPI,
  withdrawalsAPI,
  userAPI,
} from "@/lib/api";
import {
  MarketplaceItem,
  Conversation,
  TutoringSession,
  Notification,
} from "@/types";
import PaymentModal from "@/components/PaymentModal";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import FilePreview from "@/components/FilePreview";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper function to format price with K for thousands (memoized)
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
    }
    return price.toString();
  }, []);

  const [activeTab, setActiveTab] = useState("discovery");
  const [myHubTab, setMyHubTab] = useState("purchases");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSyncingPayment, setIsSyncingPayment] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [contentMode, setContentMode] = useState<"study" | "food" | "event">(
    "study"
  );
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [myEventRegistrations, setMyEventRegistrations] = useState<any[]>([]);
  const [showFoodDetailModal, setShowFoodDetailModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditingFood, setIsEditingFood] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isSavingFood, setIsSavingFood] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showTutoringModal, setShowTutoringModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(
    null
  );
  const [messageContextItem, setMessageContextItem] =
    useState<MarketplaceItem | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentItem, setPaymentItem] = useState<{
    id: string;
    title: string;
    price: number;
    type: "marketplace" | "tutoring" | "food" | "event";
    conversationId?: string;
    messageId?: string;
  } | null>(null);
  const [hasPurchasedItem, setHasPurchasedItem] = useState(false);
  const [showReorderConfirm, setShowReorderConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [showProfileCompleteModal, setShowProfileCompleteModal] =
    useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    studentId: "",
    faculty: "",
    major: "",
    year: 1,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editItemFormData, setEditItemFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    course: "",
  });
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [wishlistItemIds, setWishlistItemIds] = useState<Set<string>>(
    new Set()
  );
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [showCompressionModal, setShowCompressionModal] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);

  // Data states
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(
    []
  );
  const [visibleItemsCount, setVisibleItemsCount] = useState(12);
  const [visibleFoodCount, setVisibleFoodCount] = useState(12);
  const [visibleEventCount, setVisibleEventCount] = useState(12);
  const loadMoreObserverRef = useRef<HTMLDivElement>(null);
  const foodObserverRef = useRef<HTMLDivElement>(null);
  const eventObserverRef = useRef<HTMLDivElement>(null);

  // Helper function to filter out items without files (untradable items)
  const filterTradableItems = (items: MarketplaceItem[]) => {
    return items.filter((item) => item.fileUrl && item.fileUrl.trim() !== "");
  };
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>(
    []
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [salesTransactions, setSalesTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Group messaging states
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [messageViewMode, setMessageViewMode] = useState<
    "conversations" | "groups"
  >("conversations");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showMemberListSidebar, setShowMemberListSidebar] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  // Loading states per tab
  const [loadingStates, setLoadingStates] = useState({
    discovery: false,
    messages: false,
    tutoring: false,
    orders: false,
    insights: false,
    wallet: false,
  });

  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState({
    discovery: false,
    messages: false,
    tutoring: false,
    orders: false,
    insights: false,
    wallet: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    const subTab = searchParams.get("subTab");

    if (tab && ["discovery", "my-hub", "messages", "wallet"].includes(tab)) {
      setActiveTab(tab);

      // Load tab data if not already loaded OR force reload for purchases after payment
      const shouldForceReload = tab === "my-hub" && subTab === "purchases";
      if (
        status === "authenticated" &&
        (!loadedTabs[tab as keyof typeof loadedTabs] || shouldForceReload)
      ) {
        loadTabData(tab);
      }

      // Scroll to top when navigating via URL
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Handle My Hub sub-tab parameter
    if (
      tab === "my-hub" &&
      subTab &&
      ["purchases", "sales", "library", "listings", "events"].includes(subTab)
    ) {
      setMyHubTab(subTab);
    }
  }, [searchParams, status]);

  // Initialize essential data on component mount (notifications and stats only)
  useEffect(() => {
    if (status === "authenticated") {
      loadEssentialData();
    }
  }, [status]);

  // Load data when tab changes (lazy loading)
  useEffect(() => {
    if (
      status === "authenticated" &&
      !loadedTabs[activeTab as keyof typeof loadedTabs]
    ) {
      loadTabData(activeTab);
    }
  }, [activeTab, status]);

  // Auto-sync payment status when on My Hub Purchases tab (like legacy Orders page)
  useEffect(() => {
    if (
      activeTab === "my-hub" &&
      myHubTab === "purchases" &&
      status === "authenticated"
    ) {
      const checkPendingPayments = async () => {
        try {
          setIsSyncingPayment(true);

          const transactions = await transactionsAPI.getTransactions(
            { type: "purchases" },
            false
          );

          const pendingOrders = transactions.filter(
            (t: any) => t.status === "PENDING"
          );

          setPendingOrdersCount(pendingOrders.length);

          for (const order of pendingOrders) {
            try {
              const response = await fetch(
                `/api/payment/status?orderId=${order.orderId}`
              );
              const result = await response.json();

              if (
                result.success &&
                result.transaction.status !== order.status
              ) {
                if (result.transaction.status === "COMPLETED") {
                  if (order.itemType === "food") {
                    // Update the message orderData status
                    let messageUpdated = false;
                    try {
                      const foodItemId = result.transaction.foodItemId;
                      if (foodItemId) {
                        // Find the payment_request message with this food item
                        const allConversations =
                          await conversationsAPI.getConversations();
                        for (const convo of allConversations) {
                          const msgs = await messagesAPI.getMessages(convo.id);
                          const paymentMessage = msgs.find(
                            (m: any) =>
                              m.messageType === "payment_request" &&
                              m.orderData?.foodId === foodItemId &&
                              m.orderData?.status === "awaiting_payment"
                          );

                          if (paymentMessage) {
                            // Update message orderData
                            await fetch(`/api/messages/${paymentMessage.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                orderData: {
                                  ...paymentMessage.orderData,
                                  status: "paid",
                                },
                              }),
                            });

                            messageUpdated = true;

                            // Reload messages if user is in this conversation
                            if (selectedConversation === convo.id) {
                              await loadMessages(convo.id);
                            }
                            break;
                          }
                        }
                      }
                    } catch (error) {
                      console.error("Error updating message status:", error);
                    }

                    // Only show toast if message was actually updated (not already paid)
                    if (messageUpdated) {
                      toast.success("Payment confirmed!", {
                        description: "Food order confirmed!",
                        duration: 2000,
                      });
                    }

                    setTimeout(async () => {
                      await loadTabData("my-hub");
                    }, 1500);
                  } else {
                    toast.success("Payment confirmed!", {
                      description: "Redirecting to Library...",
                      duration: 2000,
                    });
                    setTimeout(() => {
                      router.push("/dashboard?tab=my-hub&subTab=library");
                    }, 2000);
                  }
                } else if (result.transaction.status === "EXPIRED") {
                  toast.error("Payment expired", {
                    description:
                      "Payment time limit exceeded. Please try again.",
                    duration: 3000,
                  });
                  setTimeout(async () => {
                    await loadTabData("my-hub");
                  }, 1500);
                }
              }
            } catch (error) {
              console.error(
                `Error checking status for ${order.orderId}:`,
                error
              );
            }
          }
        } catch (error) {
          console.error("Error checking pending payments:", error);
        } finally {
          setIsSyncingPayment(false);
        }
      };

      // Aggressive polling for first 30 seconds (for fresh payments)
      // Then slower polling as backup
      let checkCount = 0;
      const maxFastChecks = 6; // 6 checks * 5 seconds = 30 seconds of fast polling

      const runCheck = async () => {
        await checkPendingPayments();
        checkCount++;
      };

      // Initial check after 500ms (let data load first)
      const initialTimeout = setTimeout(() => {
        runCheck();
      }, 500);

      // Fast polling for first 30 seconds (every 5 seconds)
      const fastInterval = setInterval(async () => {
        if (checkCount < maxFastChecks) {
          await runCheck();
        }
      }, 5000);

      // Slower polling after 30 seconds (every 15 seconds)
      const slowInterval = setInterval(async () => {
        if (checkCount >= maxFastChecks) {
          await runCheck();
        }
      }, 15000);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(fastInterval);
        clearInterval(slowInterval);
      };
    }
  }, [activeTab, myHubTab, status, router]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotifications &&
        !(event.target as Element).closest(".notifications-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Load messages when conversation is selected and subscribe to real-time updates
  useEffect(() => {
    if (selectedConversation) {
      console.log(
        "📱 Loading messages for conversation:",
        selectedConversation
      );
      loadMessages(selectedConversation);

      // Subscribe to Pusher channel for real-time messages
      const channelName = getConversationChannel(selectedConversation);
      console.log("🔌 Subscribing to Pusher channel:", channelName);
      const channel = pusherClient.subscribe(channelName);

      // Listen for new messages
      channel.bind("new-message", (newMessage: any) => {
        console.log("✅ Real-time message received:", newMessage);
        setMessages((prevMessages) => {
          // Check if message already exists (update scenario)
          const existingIndex = prevMessages.findIndex(
            (msg) => msg.id === newMessage.id
          );
          if (existingIndex !== -1) {
            console.log("🔄 Updating existing message:", newMessage.id);
            // Update the existing message
            const updatedMessages = [...prevMessages];
            updatedMessages[existingIndex] = newMessage;
            return updatedMessages;
          }
          console.log("➕ Adding new message to chat:", newMessage.id);
          return [...prevMessages, newMessage];
        });

        // Update conversation list with latest message
        setConversations((prevConvos) =>
          prevConvos.map((convo) =>
            convo.id === selectedConversation
              ? {
                  ...convo,
                  lastMessage: newMessage.content,
                  lastMessageTime: newMessage.createdAt,
                }
              : convo
          )
        );

        // Play notification sound and show toast for incoming messages
        if (newMessage.senderId !== currentUser?.id) {
          playNotificationSound();
          toast.success("New message received!", {
            duration: 2000,
          });
        }
      });

      // Listen for typing indicators (optional)
      channel.bind("typing", (data: { userId: string; isTyping: boolean }) => {
        console.log("Typing indicator:", data);
        // You can add typing indicator UI here
      });

      // Cleanup: Unsubscribe when conversation changes or component unmounts
      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(getConversationChannel(selectedConversation));
      };
    }
  }, [selectedConversation, currentUser]);

  // Load group messages when group is selected and subscribe to real-time updates
  useEffect(() => {
    if (selectedGroup) {
      console.log("📱 Loading messages for group:", selectedGroup);
      loadGroupMessages(selectedGroup);

      // Subscribe to Pusher channel for real-time group messages
      const channelName = getGroupChannel(selectedGroup);
      console.log("🔌 Subscribing to Pusher group channel:", channelName);
      const channel = pusherClient.subscribe(channelName);

      // Listen for new group messages
      channel.bind("new-group-message", (newMessage: any) => {
        console.log("✅ Real-time group message received:", newMessage);
        setGroupMessages((prevMessages) => {
          // Avoid duplicates
          if (prevMessages.some((msg) => msg.id === newMessage.id)) {
            console.log(
              "⚠️ Duplicate group message detected, skipping:",
              newMessage.id
            );
            return prevMessages;
          }
          console.log("➕ Adding new group message to chat:", newMessage.id);
          return [...prevMessages, newMessage];
        });

        // Update group list with latest message
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === selectedGroup
              ? {
                  ...group,
                  lastMessage: {
                    content: newMessage.content,
                    sender: newMessage.sender,
                    createdAt: newMessage.createdAt,
                  },
                }
              : group
          )
        );

        // Play notification sound and show toast for incoming messages
        if (newMessage.senderId !== currentUser?.id) {
          playNotificationSound();
          toast.success("New group message received!", {
            duration: 2000,
          });
        }
      });

      // Cleanup: Unsubscribe when group changes or component unmounts
      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(getGroupChannel(selectedGroup));
      };
    }
  }, [selectedGroup, currentUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, groupMessages]);

  // Subscribe to real-time transaction updates via Pusher
  useEffect(() => {
    if (currentUser?.id && status === "authenticated") {
      const channelName = getUserTransactionChannel(currentUser.id);
      console.log("🔌 Subscribing to transaction channel:", channelName);
      const channel = pusherClient.subscribe(channelName);

      channel.bind("transaction-updated", (updatedTransaction: any) => {
        console.log(
          "✅ Real-time transaction update received:",
          updatedTransaction
        );

        // Update allTransactions state
        setAllTransactions((prevTransactions) => {
          const existingIndex = prevTransactions.findIndex(
            (t) => t.id === updatedTransaction.id
          );

          if (existingIndex !== -1) {
            // Update existing transaction
            const updated = [...prevTransactions];
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...updatedTransaction,
            };
            return updated;
          } else {
            // Add new transaction (shouldn't happen, but just in case)
            return [
              { ...updatedTransaction, type: "purchase" },
              ...prevTransactions,
            ];
          }
        });

        // Show toast notification if payment completed
        if (updatedTransaction.status === "COMPLETED") {
          toast.success("Payment confirmed!", {
            description: `Your payment for ${updatedTransaction.itemTitle} has been confirmed.`,
            duration: 3000,
          });

          // Stop syncing animation
          setIsSyncingPayment(false);
          setPendingOrdersCount(0);

          // Reload event registrations if this was an event payment
          if (updatedTransaction.itemType === "event") {
            eventAPI.getMyRegistrations().then((registrations) => {
              setMyEventRegistrations(registrations);
              console.log("✅ Event registrations reloaded after payment");
            });
          }
        }
      });

      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(channelName);
      };
    }
  }, [currentUser, status]);

  // Load only essential data on mount (notifications, stats, current user)
  const loadEssentialData = async () => {
    try {
      const [notifs, stats, profile] = await Promise.all([
        notificationsAPI.getNotifications(),
        statsAPI.getUserStats(),
        userAPI.getProfile(),
      ]);

      setNotifications(notifs);
      setUserStats(stats);
      setUserProfile(profile);

      // Set current user from session
      if (session?.user) {
        setCurrentUser(session.user);
      }

      // Load wishlist
      await loadWishlist();
    } catch (error) {
      console.error("Error loading essential data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data for specific tab (lazy loading)
  const loadTabData = async (tab: string) => {
    // Mark tab as loading
    setLoadingStates((prev) => ({ ...prev, [tab]: true }));

    try {
      switch (tab) {
        case "discovery":
          const [items, foodData, eventData, myRegistrations] =
            await Promise.all([
              marketplaceAPI.getItems(),
              foodAPI.getFoodItems(),
              eventAPI.getEvents(),
              eventAPI.getMyRegistrations(),
            ]);
          setMarketplaceItems(filterTradableItems(items));
          setFoodItems(foodData);
          setEvents(eventData);
          setMyEventRegistrations(myRegistrations);
          break;

        case "messages":
          const [convos, groupsData] = await Promise.all([
            conversationsAPI.getConversations(),
            groupsAPI.getGroups(),
          ]);
          setConversations(convos);
          setGroups(groupsData);
          break;

        case "tutoring":
          const sessions = await tutoringAPI.getSessions({ type: "all" });
          setTutoringSessions(sessions);
          break;

        case "my-hub":
          const [sales, purchases, eventRegistrations] = await Promise.all([
            transactionsAPI.getTransactions({
              type: "sales",
            }),
            transactionsAPI.getTransactions({
              type: "purchases",
            }),
            eventAPI.getMyRegistrations(),
          ]);
          setSalesTransactions(
            sales.filter((t: any) => t.status === "COMPLETED")
          );

          // Combine sales and purchases with type field
          const allTrans = [
            ...sales.map((t: any) => ({ ...t, type: "sale" })),
            ...purchases.map((t: any) => ({ ...t, type: "purchase" })),
          ].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAllTransactions(allTrans);
          setMyEventRegistrations(eventRegistrations);

          // Also load marketplace items for My Hub Listings tab
          const marketplaceData = await marketplaceAPI.getItems();
          setMarketplaceItems(filterTradableItems(marketplaceData));
          break;

        case "wallet":
          const [withdrawalData, statsData, walletSales, walletPurchases] =
            await Promise.all([
              withdrawalsAPI.getWithdrawals({}),
              statsAPI.getUserStats(),
              transactionsAPI.getTransactions({
                type: "sales",
              }),
              transactionsAPI.getTransactions({
                type: "purchases",
              }),
            ]);
          setWithdrawals(withdrawalData);
          setUserStats(statsData);

          // Set transaction data for analytics in wallet
          setSalesTransactions(
            walletSales.filter((t: any) => t.status === "COMPLETED")
          );
          const walletAllTrans = [
            ...walletSales.map((t: any) => ({ ...t, type: "sale" })),
            ...walletPurchases.map((t: any) => ({ ...t, type: "purchase" })),
          ].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAllTransactions(walletAllTrans);

          // Load marketplace items for analytics
          const walletMarketplaceData = await marketplaceAPI.getItems();
          setMarketplaceItems(filterTradableItems(walletMarketplaceData));

          // Auto-sync balances if totalEarnings is 0 but user has transactions
          if (statsData && statsData.totalEarnings === 0) {
            try {
              const response = await fetch("/api/admin/backfill-balances", {
                method: "POST",
              });
              const data = await response.json();
              if (data.success) {
                // Reload stats after backfill
                const updatedStats = await statsAPI.getUserStats();
                setUserStats(updatedStats);
              }
            } catch (error) {
              console.error("Auto-sync failed:", error);
            }
          }
          break;
      }

      // Mark tab as loaded
      setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
      toast.error(`Failed to load ${tab} data`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [tab]: false }));
    }
  };

  // Handler functions (memoized to prevent recreation on every render)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryFilter = async (category: string) => {
    setSelectedCategory(category);
    try {
      const items = await marketplaceAPI.getItems({
        search: searchQuery,
        category: category !== "All" ? category : undefined,
      });
      setMarketplaceItems(filterTradableItems(items));
    } catch (error) {
      console.error("Error filtering items:", error);
    }
  };

  const isProfileComplete = () => {
    if (!userProfile) {
      console.log("Profile check: No user profile loaded");
      return false;
    }

    const isComplete = !!(
      userProfile.name &&
      userProfile.studentId &&
      userProfile.faculty &&
      userProfile.faculty !== "Unknown" &&
      userProfile.major &&
      userProfile.major !== "Unknown" &&
      userProfile.year
    );

    console.log("Profile check:", {
      name: userProfile.name,
      studentId: userProfile.studentId,
      faculty: userProfile.faculty,
      major: userProfile.major,
      year: userProfile.year,
      isComplete,
    });

    return isComplete;
  };

  const handleAddItemClick = async () => {
    // Ensure profile is loaded
    if (!userProfile) {
      console.log("Loading profile before checking...");
      try {
        const profile = await userAPI.getProfile();
        setUserProfile(profile);

        // Check if profile is complete after loading
        const isComplete = !!(
          profile.name &&
          profile.studentId &&
          profile.faculty &&
          profile.faculty !== "Unknown" &&
          profile.major &&
          profile.major !== "Unknown" &&
          profile.year
        );

        if (!isComplete) {
          setProfileFormData({
            name: profile?.name || "",
            studentId: profile?.studentId || "",
            faculty:
              profile?.faculty === "Unknown" ? "" : profile?.faculty || "",
            major: profile?.major === "Unknown" ? "" : profile?.major || "",
            year: profile?.year || 1,
          });
          setShowProfileCompleteModal(true);
        } else {
          setShowAddItemModal(true);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile. Please try again.");
      }
      return;
    }

    if (!isProfileComplete()) {
      // Pre-fill form with existing data
      setProfileFormData({
        name: userProfile?.name || "",
        studentId: userProfile?.studentId || "",
        faculty:
          userProfile?.faculty === "Unknown" ? "" : userProfile?.faculty || "",
        major: userProfile?.major === "Unknown" ? "" : userProfile?.major || "",
        year: userProfile?.year || 1,
      });
      setShowProfileCompleteModal(true);
    } else {
      setShowAddItemModal(true);
    }
  };

  const handleAddTutoringClick = async () => {
    // Ensure profile is loaded
    if (!userProfile) {
      console.log("Loading profile before checking...");
      try {
        const profile = await userAPI.getProfile();
        setUserProfile(profile);

        // Check if profile is complete after loading
        const isComplete = !!(
          profile.name &&
          profile.studentId &&
          profile.faculty &&
          profile.faculty !== "Unknown" &&
          profile.major &&
          profile.major !== "Unknown" &&
          profile.year
        );

        if (!isComplete) {
          setProfileFormData({
            name: profile?.name || "",
            studentId: profile?.studentId || "",
            faculty:
              profile?.faculty === "Unknown" ? "" : profile?.faculty || "",
            major: profile?.major === "Unknown" ? "" : profile?.major || "",
            year: profile?.year || 1,
          });
          setShowProfileCompleteModal(true);
        } else {
          setShowTutoringModal(true);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile. Please try again.");
      }
      return;
    }

    if (!isProfileComplete()) {
      // Pre-fill form with existing data
      setProfileFormData({
        name: userProfile?.name || "",
        studentId: userProfile?.studentId || "",
        faculty:
          userProfile?.faculty === "Unknown" ? "" : userProfile?.faculty || "",
        major: userProfile?.major === "Unknown" ? "" : userProfile?.major || "",
        year: userProfile?.year || 1,
      });
      setShowProfileCompleteModal(true);
    } else {
      setShowTutoringModal(true);
    }
  };

  const handleSaveProfileFromModal = async () => {
    try {
      setIsSavingProfile(true);

      // Validate required fields
      if (
        !profileFormData.name ||
        !profileFormData.studentId ||
        !profileFormData.faculty ||
        !profileFormData.major ||
        !profileFormData.year
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Update profile
      await userAPI.updateProfile(profileFormData);

      // Reload profile
      const updatedProfile = await userAPI.getProfile();
      setUserProfile(updatedProfile);

      // Close modal
      setShowProfileCompleteModal(false);

      // Show success message
      toast.success("Profile updated successfully! You can now add items.");

      // Reload stats
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      await marketplaceAPI.createItem(itemData);
      // Reload marketplace items
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(filterTradableItems(items));
      setShowAddItemModal(false);

      // Reload stats
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
      toast.success("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item. Please try again.");
    }
  };

  const handleAddFood = async (foodData: any) => {
    try {
      await foodAPI.createFoodItem(foodData);
      const foodData2 = await foodAPI.getFoodItems();
      setFoodItems(foodData2);
      setShowAddFoodModal(false);
      toast.success("Food item added successfully!");
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error("Failed to add food item. Please try again.");
    }
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      await eventAPI.createEvent(eventData);
      const eventData2 = await eventAPI.getEvents();
      setEvents(eventData2);
      setShowAddEventModal(false);
      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  const handleFoodClick = useCallback((food: FoodItem) => {
    setSelectedFood(food);
    setShowFoodDetailModal(true);
  }, []);

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  }, []);

  const handleItemClickMemoized = useCallback((item: MarketplaceItem) => {
    handleItemClick(item);
  }, []);

  const handleToggleWishlistMemoized = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      handleToggleWishlist(itemId, e);
    },
    []
  );

  const handleDeleteFood = async (foodId: string) => {
    try {
      await foodAPI.deleteFoodItem(foodId);
      const foodData = await foodAPI.getFoodItems();
      setFoodItems(foodData);
      setShowFoodDetailModal(false);
      toast.success("Food item deleted successfully!");
    } catch (error) {
      console.error("Error deleting food item:", error);
      toast.error("Failed to delete food item.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventAPI.deleteEvent(eventId);
      const eventData = await eventAPI.getEvents();
      setEvents(eventData);
      setShowEventDetailModal(false);
      toast.success("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event.");
    }
  };

  const handleSendFoodOrderRequest = async (foodItem: any) => {
    try {
      const conversation = await conversationsAPI.createConversation(
        foodItem.sellerId
      );

      await messagesAPI.sendOrderRequest(conversation.id, foodItem);

      setShowFoodDetailModal(false);
      setActiveTab("messages");
      setSelectedConversation(conversation.id);

      toast.success("Order request sent to seller!");
    } catch (error) {
      console.error("Error sending order request:", error);
      toast.error("Failed to send order request. Please try again.");
    }
  };

  const handleOrderFood = async (foodId: string, pickupTime: string) => {
    try {
      const response = await fetch("/api/food/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId: foodId,
          quantity: 1,
          pickupTime: pickupTime,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      toast.success("Order placed successfully!");
      const foodData = await foodAPI.getFoodItems();
      setFoodItems(foodData);
      setShowFoodDetailModal(false);
    } catch (error: any) {
      console.error("Error ordering food:", error);
      toast.error(error.message || "Failed to place order.");
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      toast.success("Registered for event successfully!", {
        description: "Redirecting to My Hub...",
      });

      // Reload event data
      const eventData = await eventAPI.getEvents();
      setEvents(eventData);

      // Reload event registrations
      const eventRegistrations = await eventAPI.getMyRegistrations();
      setMyEventRegistrations(eventRegistrations);

      setShowEventDetailModal(false);

      // Redirect to My Hub Events tab
      setTimeout(() => {
        window.location.href = "/dashboard?tab=my-hub&subTab=events";
      }, 1000);
    } catch (error: any) {
      console.error("Error registering for event:", error);
      toast.error(error.message || "Failed to register for event.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await marketplaceAPI.deleteItem(itemToDelete);
      // Reload marketplace items
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(filterTradableItems(items));

      // Show success message
      toast.success("Item deleted successfully!");
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const handleEditItem = (item: MarketplaceItem) => {
    setEditItemFormData({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      course: item.course,
    });
    setIsEditingItem(true);
  };

  const handleCancelEditItem = () => {
    setIsEditingItem(false);
    setEditItemFormData({
      title: "",
      description: "",
      price: 0,
      category: "",
      course: "",
    });
  };

  const handleSaveEditItem = async () => {
    if (!selectedItem) return;

    try {
      setIsSavingItem(true);
      const updatedItem = await marketplaceAPI.updateItem(
        selectedItem.id,
        editItemFormData
      );

      // Reload marketplace items
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(filterTradableItems(items));

      // Update selected item
      setSelectedItem(updatedItem);

      // Show success message
      toast.success("Item updated successfully!");
      setIsEditingItem(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item. Please try again.");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleEditFood = () => {
    setIsEditingFood(true);
  };

  const handleCancelEditFood = () => {
    setIsEditingFood(false);
  };

  const handleSaveEditFood = async (formData: any) => {
    if (!selectedFood) return;

    setIsSavingFood(true);
    try {
      const updatedFood = await foodAPI.updateFoodItem(
        selectedFood.id,
        formData
      );

      // Reload food items
      const foodData = await foodAPI.getFoodItems();
      setFoodItems(foodData);

      // Update selected food
      setSelectedFood(updatedFood);

      toast.success("Food item updated successfully!");
      setIsEditingFood(false);
    } catch (error) {
      console.error("Error updating food item:", error);
      toast.error("Failed to update food item. Please try again.");
    } finally {
      setIsSavingFood(false);
    }
  };

  const handleEditEvent = () => {
    setIsEditingEvent(true);
  };

  const handleCancelEditEvent = () => {
    setIsEditingEvent(false);
  };

  const handleSaveEditEvent = async (formData: any) => {
    if (!selectedEvent) return;

    setIsSavingEvent(true);
    try {
      const updatedEvent = await eventAPI.updateEvent(
        selectedEvent.id,
        formData
      );

      // Reload events
      const eventData = await eventAPI.getEvents();
      setEvents(eventData);

      // Update selected event
      setSelectedEvent(updatedEvent);

      toast.success("Event updated successfully!");
      setIsEditingEvent(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleToggleWishlist = useCallback(
    async (itemId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      try {
        const result = await wishlistAPI.toggleWishlist(itemId);

        setWishlistItemIds((prev) => {
          const newSet = new Set(prev);
          if (result.wishlisted) {
            newSet.add(itemId);
            toast.success("Added to wishlist!");
          } else {
            newSet.delete(itemId);
            toast.success("Removed from wishlist!");
          }
          return newSet;
        });

        await loadWishlist();
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast.error("Failed to update wishlist");
      }
    },
    []
  );

  const loadWishlist = async () => {
    try {
      const wishlist = await wishlistAPI.getWishlist();
      const itemIds = new Set<string>(
        wishlist.map((w: any) => w.itemId as string)
      );
      setWishlistItemIds(itemIds);
      setWishlistItems(wishlist);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !selectedGroup) return;

    try {
      await groupsAPI.removeMember(selectedGroup, memberToRemove.userId);
      toast.success("Member removed successfully!");
      await loadGroupMembers(selectedGroup);
      await loadGroups();
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await messagesAPI.getMessages(conversationId);
      setMessages(msgs);

      // Scroll to bottom after messages load
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await groupsAPI.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const loadGroupMessages = async (groupId: string) => {
    try {
      const msgs = await groupsAPI.getMessages(groupId);
      setGroupMessages(msgs);

      // Scroll to bottom after messages load
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 100);
    } catch (error) {
      console.error("Error loading group messages:", error);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const group = await groupsAPI.getGroup(groupId);
      setGroupMembers(group.members || []);
    } catch (error) {
      console.error("Error loading group members:", error);
    }
  };

  const handleSendGroupMessage = async (groupId: string, content: string) => {
    if (!content.trim() || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      await groupsAPI.sendMessage(groupId, content.trim());
      setMessageText("");
      await loadGroupMessages(groupId);
    } catch (error) {
      console.error("Error sending group message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendMessage = async (conversationId: string, content: string) => {
    if (!content.trim() || isSendingMessage) return;

    try {
      setIsSendingMessage(true);

      // Send message
      await messagesAPI.sendMessage(conversationId, content.trim());

      // Clear input and close modal immediately for better UX
      setMessageText("");
      setShowMessageModal(false);
      setMessageContextItem(null);

      // Reload only messages (optimistic update)
      await loadMessages(conversationId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCreateConversation = async (
    otherUserId: string,
    otherUserName: string
  ) => {
    try {
      const conversation = await conversationsAPI.createConversation(
        otherUserId
      );
      const convos = await conversationsAPI.getConversations();
      setConversations(convos);
      setSelectedConversation(conversation.id);
      setShowMessageModal(true);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation. Please try again.");
    }
  };

  const handleAddTutoringSession = async (sessionData: any) => {
    try {
      await tutoringAPI.createSession(sessionData);

      // Reload tutoring sessions
      const sessions = await tutoringAPI.getSessions({ type: "all" });
      setTutoringSessions(sessions);
      setShowTutoringModal(false);

      // Reload stats
      const stats = await statsAPI.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error adding tutoring session:", error);
      toast.error("Failed to add tutoring session. Please try again.");
    }
  };

  const handleDeleteTutoringSession = async (sessionId: string) => {
    try {
      await tutoringAPI.deleteSession(sessionId);

      // Reload tutoring sessions
      const sessions = await tutoringAPI.getSessions({ type: "all" });
      setTutoringSessions(sessions);
      toast.success("Tutoring session deleted successfully!");
    } catch (error) {
      console.error("Error deleting tutoring session:", error);
      toast.error("Failed to delete tutoring session. Please try again.");
    }
  };

  const handleItemClick = useCallback(async (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowItemDetailModal(true);

    try {
      const result = await transactionsAPI.checkPurchase(item.id);
      setHasPurchasedItem(result.hasPurchased);
    } catch (error) {
      console.error("Error checking purchase:", error);
      setHasPurchasedItem(false);
    }
  }, []);

  const handleBuyItem = async (item: MarketplaceItem) => {
    if (hasPurchasedItem) {
      setShowReorderConfirm(true);
    } else {
      proceedWithPurchase(item);
    }
  };

  const proceedWithPurchase = (item: MarketplaceItem) => {
    setPaymentItem({
      id: item.id,
      title: item.title,
      price: item.price,
      type: "marketplace",
    });
    setShowPaymentModal(true);
    setShowReorderConfirm(false);
  };

  const handlePaymentSuccess = async () => {
    // Reload data after successful payment
    try {
      const items = await marketplaceAPI.getItems();
      setMarketplaceItems(filterTradableItems(items));

      const foodData = await foodAPI.getFoodItems();
      setFoodItems(foodData);

      const eventData = await eventAPI.getEvents();
      setEvents(eventData);

      const eventRegistrations = await eventAPI.getMyRegistrations();
      setMyEventRegistrations(eventRegistrations);

      const stats = await statsAPI.getUserStats();
      setUserStats(stats);

      const notifs = await notificationsAPI.getNotifications();
      setNotifications(notifs);

      setShowItemDetailModal(false);
      setShowFoodDetailModal(false);
      setShowEventDetailModal(false);

      // If this was a food order payment, send confirmation message in chat
      if (paymentItem?.type === "food" && paymentItem?.conversationId) {
        try {
          await messagesAPI.sendMessage(
            paymentItem.conversationId,
            `Payment completed! Order confirmed for ${paymentItem.title}. The seller will prepare your order for pickup.`,
            "text"
          );

          // Reload messages to show the confirmation
          const msgs = await messagesAPI.getMessages(
            paymentItem.conversationId
          );
          setMessages(msgs);

          toast.success("Payment successful!", {
            description: "Order confirmed! Check your chat for details.",
          });
        } catch (error) {
          console.error("Error sending confirmation message:", error);
          toast.success("Payment successful!", {
            description: "Your order has been confirmed.",
          });
        }
      } else {
        toast.success("Payment successful! 🎉", {
          description: "Your purchase has been confirmed. Check Orders page.",
        });
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    }
  };

  // Memoize user's marketplace items
  const userMarketplaceItems = useMemo(
    () => marketplaceItems.filter((item) => item.sellerId === currentUser?.id),
    [marketplaceItems, currentUser?.id]
  );

  // Memoize sold items count
  const soldItemsCount = useMemo(
    () => userMarketplaceItems.filter((item) => item.status === "sold").length,
    [userMarketplaceItems]
  );

  // Memoize available items count
  const availableItemsCount = useMemo(
    () =>
      userMarketplaceItems.filter((item) => item.status === "available").length,
    [userMarketplaceItems]
  );

  // Memoize filtered marketplace items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    let items = marketplaceItems;

    if (selectedCategory && selectedCategory !== "All") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.course?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [marketplaceItems, selectedCategory, debouncedSearchQuery]);

  // Memoize filtered food items
  const filteredFoodItems = useMemo(() => {
    if (!debouncedSearchQuery) return foodItems;

    const query = debouncedSearchQuery.toLowerCase();
    return foodItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [foodItems, debouncedSearchQuery]);

  // Memoize filtered events
  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery) return events;

    const query = debouncedSearchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
    );
  }, [events, debouncedSearchQuery]);

  // Progressive loading with Intersection Observer for marketplace
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleItemsCount < filteredItems.length
        ) {
          setVisibleItemsCount((prev) =>
            Math.min(prev + 12, filteredItems.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentRef = loadMoreObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [visibleItemsCount, filteredItems.length]);

  // Progressive loading for food items
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleFoodCount < filteredFoodItems.length
        ) {
          setVisibleFoodCount((prev) =>
            Math.min(prev + 12, filteredFoodItems.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentRef = foodObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [visibleFoodCount, filteredFoodItems.length]);

  // Progressive loading for events
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleEventCount < filteredEvents.length
        ) {
          setVisibleEventCount((prev) =>
            Math.min(prev + 12, filteredEvents.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentRef = eventObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [visibleEventCount, filteredEvents.length]);

  // Reset visible count when filtered items change
  useEffect(() => {
    setVisibleItemsCount(12);
  }, [filteredItems]);

  useEffect(() => {
    setVisibleFoodCount(12);
  }, [filteredFoodItems]);

  useEffect(() => {
    setVisibleEventCount(12);
  }, [filteredEvents]);

  // Dynamic stats based on real data (memoized to prevent recalculation)
  const stats = useMemo(
    () => [
      {
        label: "Items Sold",
        value: soldItemsCount.toString(),
        icon: ShoppingCart,
        color: "bg-dark-blue",
      },
      {
        label: "Items Bought",
        value: (userStats.itemsBought || 0).toString(),
        icon: BookOpen,
        color: "bg-campus-green",
      },
      {
        label: "Messages",
        value: conversations.length.toString(),
        icon: MessageCircle,
        color: "bg-soft-blue",
      },
      {
        label: "Rating",
        value: "5.0",
        icon: Star,
        color: "bg-light-blue",
      },
    ],
    [soldItemsCount, userStats.itemsBought, conversations.length]
  );

  // Show loading state only for initial auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-campus-blue-dark mx-auto mb-4"></div>
          <p className="text-dark-gray text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but this is a fallback)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/campus-circle-logo.png"
                alt="CampusCircle Logo"
                className="h-12 sm:h-14 w-auto"
              />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search - Hidden on mobile, shown on larger screens */}
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search materials, courses..."
                  className="pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue w-48 lg:w-64 transition-colors"
                />
              </div>

              <button
                className="relative p-2 text-medium-gray hover:text-dark-gray transition-colors"
                onClick={() => setShowWishlistModal(true)}
                title="Wishlist"
              >
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                {wishlistItemIds.size > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItemIds.size}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  className="relative p-2 text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="notifications-dropdown absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-light-gray z-50">
                    <div className="p-4 border-b border-light-gray">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-dark-gray">
                          Notifications
                        </h3>
                        <button
                          onClick={async () => {
                            try {
                              const notifIds = notifications
                                .filter((n) => !n.isRead)
                                .map((n) => n.id);
                              if (notifIds.length > 0) {
                                await notificationsAPI.markAsRead(notifIds);
                                const notifs =
                                  await notificationsAPI.getNotifications();
                                setNotifications(notifs);
                              }
                            } catch (error) {
                              console.error(
                                "Error marking notifications:",
                                error
                              );
                            }
                          }}
                          className="text-sm text-dark-blue hover:text-blue-700"
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-light-gray hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={async () => {
                              try {
                                if (!notification.isRead) {
                                  await notificationsAPI.markAsRead([
                                    notification.id,
                                  ]);
                                  const notifs =
                                    await notificationsAPI.getNotifications();
                                  setNotifications(notifs);
                                }
                              } catch (error) {
                                console.error(
                                  "Error marking notification:",
                                  error
                                );
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-full ${
                                  notification.type === "message"
                                    ? "bg-blue-100"
                                    : notification.type === "purchase"
                                    ? "bg-green-100"
                                    : notification.type === "tutoring"
                                    ? "bg-purple-100"
                                    : notification.type === "system"
                                    ? "bg-yellow-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                {notification.type === "message" && (
                                  <MessageCircle className="h-4 w-4 text-blue-600" />
                                )}
                                {notification.type === "purchase" && (
                                  <ShoppingCart className="h-4 w-4 text-green-600" />
                                )}
                                {notification.type === "tutoring" && (
                                  <GraduationCap className="h-4 w-4 text-purple-600" />
                                )}
                                {notification.type === "system" && (
                                  <Star className="h-4 w-4 text-yellow-600" />
                                )}
                                {![
                                  "message",
                                  "purchase",
                                  "tutoring",
                                  "system",
                                ].includes(notification.type) && (
                                  <Bell className="h-4 w-4 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark-gray">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-medium-gray mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-medium-gray mt-2">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                          <p className="text-medium-gray">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/account")}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-dark-blue rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-dark-gray hidden sm:block">
                  {session?.user?.name || session?.user?.email || "User"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:relative">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            {/* Mobile Tab Navigation */}
            <div className="bg-white rounded-lg shadow p-2 mb-4">
              <div className="flex justify-around items-center">
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    activeTab === "discovery"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="Marketplace"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveTab("my-hub")}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    activeTab === "my-hub"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="My Hub"
                >
                  <Folders className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex flex-col items-center p-2 transition-colors relative ${
                    activeTab === "messages"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="Messages"
                >
                  <MessageCircle className="h-5 w-5" />
                  {userStats && userStats.messagesCount > 0 && (
                    <span className="absolute top-1 right-1 bg-green-status text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {userStats.messagesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("wallet")}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    activeTab === "wallet"
                      ? "text-dark-blue"
                      : "text-medium-gray hover:text-dark-blue"
                  }`}
                  title="Wallet"
                >
                  <Wallet className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-lg shadow p-6 self-start">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("discovery")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "discovery"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Marketplace
                </button>

                <button
                  onClick={() => setActiveTab("my-hub")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "my-hub"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <Folders className="mr-3 h-5 w-5" />
                  My Hub
                </button>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "messages"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <MessageCircle className="mr-3 h-5 w-5" />
                  Messages
                  {conversations.filter((c) => c.unreadCount > 0).length >
                    0 && (
                    <span className="ml-auto bg-green-status bg-opacity-10 text-green-status text-xs rounded-full px-2 py-1">
                      {conversations.filter((c) => c.unreadCount > 0).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("wallet")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "wallet"
                      ? "bg-primary-100 text-dark-blue"
                      : "text-medium-gray hover:bg-secondary-100"
                  }`}
                >
                  <Wallet className="mr-3 h-5 w-5" />
                  Wallet
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAddItemClick}
                  className="w-full bg-dark-blue text-white px-4 py-2.5 rounded-md hover:bg-primary-800 transition-colors flex items-center justify-center font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "discovery" && (
              <div className="space-y-6">
                {/* Show skeleton loader while loading */}
                {loadingStates.discovery && (
                  <div className="space-y-6 animate-pulse">
                    <Card>
                      <CardHeader>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </CardHeader>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                          <CardContent className="p-4 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show content when loaded */}
                {!loadingStates.discovery && (
                  <>
                    {/* Header with Search and Filters - Ultra Compact Desktop Version */}
                    <Card className="sticky top-28 z-40 bg-white">
                      <CardContent className="p-3 sm:p-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {/* Mode Selector - Study, Food, Event */}
                          <div className="flex border border-input rounded-md h-7 sm:h-8 shrink-0">
                            <Button
                              variant={
                                contentMode === "study" ? "secondary" : "ghost"
                              }
                              size="sm"
                              onClick={() => setContentMode("study")}
                              className="rounded-r-none h-full px-2 sm:px-3 text-xs sm:text-sm"
                            >
                              Study
                            </Button>
                            <Button
                              variant={
                                contentMode === "food" ? "secondary" : "ghost"
                              }
                              size="sm"
                              onClick={() => setContentMode("food")}
                              className="rounded-none h-full px-2 sm:px-3 text-xs sm:text-sm"
                            >
                              Food
                            </Button>
                            <Button
                              variant={
                                contentMode === "event" ? "secondary" : "ghost"
                              }
                              size="sm"
                              onClick={() => setContentMode("event")}
                              className="rounded-l-none h-full px-2 sm:px-3 text-xs sm:text-sm"
                            >
                              Event
                            </Button>
                          </div>

                          {/* Category Filter */}
                          {contentMode === "study" && (
                            <select
                              value={selectedCategory}
                              onChange={(e) =>
                                handleCategoryFilter(e.target.value)
                              }
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
                              variant={
                                viewMode === "grid" ? "secondary" : "ghost"
                              }
                              size="sm"
                              onClick={() => setViewMode("grid")}
                              className="rounded-r-none h-full px-1.5 sm:px-2"
                            >
                              <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <Button
                              variant={
                                viewMode === "list" ? "secondary" : "ghost"
                              }
                              size="sm"
                              onClick={() => setViewMode("list")}
                              className="rounded-l-none h-full px-1.5 sm:px-2"
                            >
                              <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </div>

                          {/* Add Button */}
                          <Button
                            onClick={() => setShowAddTypeModal(true)}
                            size="sm"
                            className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 shrink-0 ml-auto"
                          >
                            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Add</span>
                          </Button>
                        </div>

                        {/* Active Filters */}
                        {(selectedCategory || searchQuery) && (
                          <div className="flex items-center gap-2 mt-4">
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
                                Search: "{searchQuery}"
                                <button
                                  onClick={() => setSearchQuery("")}
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
                    {contentMode === "food" ? (
                      <div
                        className={`grid gap-2 sm:gap-4 ${
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
                                No Food Items Yet
                              </h3>
                              <p className="text-muted-foreground text-center max-w-md">
                                Be the first to share food items with your
                                campus community!
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <>
                            {filteredFoodItems
                              .slice(0, visibleFoodCount)
                              .map((item) => (
                                <FoodItemCard
                                  key={item.id}
                                  item={item}
                                  viewMode={viewMode as "grid" | "list"}
                                  onClick={() => handleFoodClick(item)}
                                  isOwner={
                                    session?.user?.email === item.seller?.email
                                  }
                                />
                              ))}
                            {visibleFoodCount < filteredFoodItems.length && (
                              <div
                                ref={foodObserverRef}
                                className="col-span-full h-10"
                              />
                            )}
                          </>
                        )}
                      </div>
                    ) : contentMode === "event" ? (
                      <div
                        className={`grid gap-2 sm:gap-4 ${
                          viewMode === "grid"
                            ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                        }`}
                      >
                        {filteredEvents.length === 0 ? (
                          <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="h-8 w-8 text-purple-600" />
                              </div>
                              <h3 className="text-xl font-semibold mb-2">
                                No Events Yet
                              </h3>
                              <p className="text-muted-foreground text-center max-w-md">
                                Be the first to create campus events!
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <>
                            {filteredEvents
                              .slice(0, visibleEventCount)
                              .map((event) => (
                                <EventCard
                                  key={event.id}
                                  event={event}
                                  onClick={() => handleEventClick(event)}
                                  isOwner={
                                    session?.user?.email ===
                                    event.organizerUser?.email
                                  }
                                />
                              ))}
                            {visibleEventCount < filteredEvents.length && (
                              <div
                                ref={eventObserverRef}
                                className="col-span-full h-10"
                              />
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`grid gap-2 sm:gap-4 ${
                          viewMode === "grid"
                            ? "grid-cols-3 md:grid-cols-3 lg:grid-cols-5"
                            : "grid-cols-1"
                        }`}
                      >
                        {filteredItems.length === 0 ? (
                          <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                              <h3 className="text-lg font-semibold mb-2">
                                No items found
                              </h3>
                              <p className="text-muted-foreground text-center mb-4">
                                {searchQuery || selectedCategory
                                  ? "Try adjusting your filters"
                                  : "Be the first to add a study material!"}
                              </p>
                              <Button onClick={() => setShowAddTypeModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <>
                            {filteredItems
                              .slice(0, visibleItemsCount)
                              .map((item) => (
                                <Card
                                  key={item.id}
                                  onClick={() => handleItemClickMemoized(item)}
                                  className={`cursor-pointer hover:shadow-lg transition-shadow group overflow-hidden ${
                                    viewMode === "list" ? "flex flex-row" : ""
                                  }`}
                                  style={{ contentVisibility: "auto" }}
                                >
                                  {/* Image Section - Show File Preview */}
                                  <div
                                    className={`relative bg-secondary-200 overflow-hidden ${
                                      viewMode === "list"
                                        ? "w-12 h-12 flex-shrink-0 rounded-md"
                                        : "aspect-square sm:aspect-video lg:aspect-[3/2]"
                                    }`}
                                  >
                                    <FilePreview
                                      fileUrl={item.fileUrl}
                                      fileType={item.fileType}
                                      fileName={item.fileName}
                                      category={item.category}
                                      title={item.title}
                                      compact={viewMode === "list"}
                                      thumbnailUrl={item.thumbnailUrl}
                                    />
                                    {/* Favorite Button */}
                                    {viewMode === "grid" && (
                                      <button
                                        onClick={(e) =>
                                          handleToggleWishlistMemoized(
                                            item.id,
                                            e
                                          )
                                        }
                                        className={`absolute top-1 right-1 sm:top-2 sm:right-2 lg:top-1.5 lg:right-1.5 bg-white/95 p-1 sm:p-1.5 lg:p-1 rounded-full transition-colors shadow-sm z-10 ${
                                          wishlistItemIds.has(item.id)
                                            ? "text-red-500 hover:text-red-600"
                                            : "text-gray-600 hover:text-red-500"
                                        } hover:bg-white`}
                                      >
                                        <Heart
                                          className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-3 lg:w-3 ${
                                            wishlistItemIds.has(item.id)
                                              ? "fill-current"
                                              : ""
                                          }`}
                                        />
                                      </button>
                                    )}
                                  </div>

                                  {/* Content Section */}
                                  <div
                                    className={`flex ${
                                      viewMode === "list"
                                        ? "flex-row flex-1"
                                        : "flex-col"
                                    }`}
                                  >
                                    <CardContent
                                      className={`${
                                        viewMode === "list"
                                          ? "p-1.5 flex-1 flex items-center"
                                          : "p-2 sm:p-3 lg:p-2.5 space-y-1.5 sm:space-y-2 lg:space-y-1.5"
                                      }`}
                                    >
                                      <div
                                        className={
                                          viewMode === "list"
                                            ? "flex-1 min-w-0"
                                            : "space-y-3"
                                        }
                                      >
                                        {/* Category Badge and Title */}
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            {viewMode === "list" ? (
                                              <div className="flex items-center gap-1.5">
                                                <Badge
                                                  variant="secondary"
                                                  className="text-[9px] px-1 py-0 flex-shrink-0"
                                                >
                                                  {item.category}
                                                </Badge>
                                                <h3 className="font-bold text-xs line-clamp-1 text-gray-900 flex-1 min-w-0">
                                                  {item.title}
                                                </h3>
                                                <BookOpen className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                                                <span className="text-[9px] text-gray-500 truncate max-w-[60px]">
                                                  {item.course}
                                                </span>
                                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                                  <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                                                  <span className="text-[9px] font-medium text-gray-700">
                                                    {item.rating}
                                                  </span>
                                                </div>
                                                <p className="text-xs font-bold text-blue-600 flex-shrink-0">
                                                  Rp {formatPrice(item.price)}
                                                </p>
                                              </div>
                                            ) : (
                                              <h3 className="font-bold text-xs sm:text-base lg:text-sm line-clamp-1 text-gray-900 leading-tight">
                                                {item.title}
                                              </h3>
                                            )}
                                          </div>
                                        </div>

                                        {/* Description - Hidden on mobile grid view */}
                                        {viewMode === "list" ? null : (
                                          <p className="hidden sm:block text-xs lg:text-[11px] text-gray-600 line-clamp-2 lg:line-clamp-1 lg:min-h-0 min-h-[40px]">
                                            {item.description}
                                          </p>
                                        )}

                                        {/* Course Info */}
                                        {viewMode === "list" ? null : (
                                          <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-0.5 text-[9px] sm:text-xs lg:text-[10px] text-gray-500">
                                            <BookOpen className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-2.5 lg:w-2.5" />
                                            <span className="font-medium truncate">
                                              {item.course}
                                            </span>
                                          </div>
                                        )}

                                        {viewMode === "grid" && (
                                          <>
                                            {/* Price and Rating */}
                                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-1 sm:pt-1.5 lg:pt-1 border-t gap-0.5 sm:gap-0">
                                              <div className="flex items-center justify-between sm:block">
                                                <p className="text-sm sm:text-lg lg:text-base font-bold text-blue-600 leading-tight">
                                                  <span className="sm:hidden">
                                                    Rp {formatPrice(item.price)}
                                                  </span>
                                                  <span className="hidden sm:inline">
                                                    Rp{" "}
                                                    {item.price.toLocaleString()}
                                                  </span>
                                                </p>
                                                <div className="flex items-center gap-0.5 sm:gap-1 sm:mt-0.5 lg:mt-0">
                                                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-2.5 lg:w-2.5 text-yellow-400 fill-yellow-400" />
                                                  <span className="text-[9px] sm:text-xs lg:text-[10px] font-medium text-gray-700">
                                                    {item.rating}
                                                  </span>
                                                  <span className="text-[9px] sm:text-xs lg:text-[10px] text-gray-500">
                                                    ({item.reviewCount || 0})
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="text-right hidden sm:block">
                                                <p className="text-[10px] lg:text-[9px] text-gray-500">
                                                  by
                                                </p>
                                                <p className="text-xs lg:text-[10px] font-medium text-gray-700">
                                                  {typeof item.seller ===
                                                  "string"
                                                    ? `Student ${item.seller.slice(
                                                        -9
                                                      )}`
                                                    : item.seller?.name ||
                                                      "Unknown"}
                                                </p>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </CardContent>

                                    {/* Action Buttons */}
                                    {viewMode === "list" ? (
                                      <div className="flex flex-col gap-1 p-1 justify-center border-l">
                                        {item.sellerId === currentUser?.id ? (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteItem(item.id);
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        ) : (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setMessageContextItem(item);
                                                handleCreateConversation(
                                                  item.sellerId,
                                                  typeof item.seller ===
                                                    "string"
                                                    ? item.seller
                                                    : item.seller?.name ||
                                                        "Unknown"
                                                );
                                              }}
                                            >
                                              <MessageCircle className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuyItem(item);
                                              }}
                                            >
                                              <ShoppingCart className="h-3 w-3" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <CardFooter className="flex gap-1 sm:gap-2 p-2 sm:p-4 pt-0">
                                        {item.sellerId === currentUser?.id ? (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full text-[9px] sm:text-xs lg:text-[10px] px-1.5 sm:px-3 lg:px-2 py-1 sm:py-1.5 lg:py-1 h-6 sm:h-8 lg:h-7"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteItem(item.id);
                                            }}
                                          >
                                            <Trash2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 lg:h-3 lg:w-3 sm:mr-1 lg:mr-0.5" />
                                            <span className="hidden sm:inline">
                                              Delete
                                            </span>
                                          </Button>
                                        ) : (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex-1 text-[9px] sm:text-xs lg:text-[10px] px-1.5 sm:px-3 lg:px-2 py-1 sm:py-1.5 lg:py-1 h-6 sm:h-8 lg:h-7"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setMessageContextItem(item);
                                                handleCreateConversation(
                                                  item.sellerId,
                                                  typeof item.seller ===
                                                    "string"
                                                    ? item.seller
                                                    : item.seller?.name ||
                                                        "Unknown"
                                                );
                                              }}
                                            >
                                              <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3 lg:w-3 sm:mr-1 lg:mr-0.5" />
                                              <span className="hidden sm:inline">
                                                Message
                                              </span>
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="flex-1 text-[9px] sm:text-xs lg:text-[10px] px-1.5 sm:px-3 lg:px-2 py-1 sm:py-1.5 lg:py-1 h-6 sm:h-8 lg:h-7"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuyItem(item);
                                              }}
                                            >
                                              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-3 lg:w-3 sm:mr-1 lg:mr-0.5" />
                                              <span className="hidden sm:inline">
                                                Buy
                                              </span>
                                            </Button>
                                          </>
                                        )}
                                      </CardFooter>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            {visibleItemsCount < filteredItems.length && (
                              <div
                                ref={loadMoreObserverRef}
                                className="col-span-full flex justify-center py-8"
                              >
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-sm">
                                    Loading more items...
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="flex flex-col">
                {/* Show skeleton loader while loading */}
                {loadingStates.messages ? (
                  <div className="bg-white rounded-lg shadow border border-light-gray h-[500px] sm:h-[600px] flex animate-pulse">
                    <div className="w-1/3 border-r border-light-gray p-4 space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center items-center">
                      <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* WhatsApp-style Messages Interface */}
                    <div className="bg-white rounded-lg shadow border border-light-gray h-[500px] sm:h-[600px] flex flex-col sm:flex-row">
                      {/* Conversations/Groups List */}
                      <div
                        className={`${
                          selectedConversation || selectedGroup
                            ? "hidden sm:flex"
                            : "flex"
                        } w-full sm:w-1/3 border-r border-light-gray flex-col`}
                      >
                        {/* Header with Toggle */}
                        <div className="p-4 border-b border-light-gray bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-dark-gray">
                              Messages
                            </h2>
                            {messageViewMode === "groups" && (
                              <button
                                onClick={() => setShowCreateGroupModal(true)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                title="Create Group"
                              >
                                <Plus className="h-5 w-5 text-dark-blue" />
                              </button>
                            )}
                          </div>
                          {/* Toggle between Conversations and Groups */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setMessageViewMode("conversations");
                                setSelectedGroup(null);
                              }}
                              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                messageViewMode === "conversations"
                                  ? "bg-dark-blue text-white"
                                  : "bg-gray-200 text-medium-gray hover:bg-gray-300"
                              }`}
                            >
                              <Users className="h-4 w-4 inline mr-1" />
                              Chats
                            </button>
                            <button
                              onClick={() => {
                                setMessageViewMode("groups");
                                setSelectedConversation(null);
                              }}
                              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                messageViewMode === "groups"
                                  ? "bg-dark-blue text-white"
                                  : "bg-gray-200 text-medium-gray hover:bg-gray-300"
                              }`}
                            >
                              <Users className="h-4 w-4 inline mr-1" />
                              Groups
                            </button>
                          </div>
                        </div>

                        {/* Conversations or Groups List */}
                        <div className="flex-1 overflow-y-auto">
                          {messageViewMode === "conversations" ? (
                            // Conversations List
                            conversations.length > 0 ? (
                              conversations.map((conversation) => (
                                <div
                                  key={conversation.id}
                                  onClick={() => {
                                    setSelectedConversation(conversation.id);
                                    setSelectedGroup(null);
                                  }}
                                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selectedConversation === conversation.id
                                      ? "bg-blue-50 border-l-4 border-l-dark-blue"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-campus-green rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-semibold text-sm">
                                        {conversation.otherUserName
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-dark-gray truncate">
                                          {conversation.otherUserName}
                                        </h3>
                                        <span className="text-xs text-medium-gray flex-shrink-0 ml-2">
                                          {new Date(
                                            conversation.lastMessageTime
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm text-medium-gray truncate break-all line-clamp-1">
                                          {conversation.lastMessage &&
                                          conversation.lastMessage.length > 50
                                            ? conversation.lastMessage.substring(
                                                0,
                                                50
                                              ) + "..."
                                            : conversation.lastMessage ||
                                              "No messages yet"}
                                        </p>
                                        {conversation.unreadCount > 0 && (
                                          <span className="bg-campus-green text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center flex-shrink-0">
                                            {conversation.unreadCount}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center">
                                <MessageCircle className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                                <p className="text-medium-gray text-sm">
                                  No conversations yet
                                </p>
                              </div>
                            )
                          ) : // Groups List
                          groups.length > 0 ? (
                            groups.map((group) => (
                              <div
                                key={group.id}
                                onClick={() => {
                                  setSelectedGroup(group.id);
                                  setSelectedConversation(null);
                                }}
                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                  selectedGroup === group.id
                                    ? "bg-blue-50 border-l-4 border-l-dark-blue"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-medium text-dark-gray truncate">
                                        {group.name}
                                      </h3>
                                      <span className="text-xs text-medium-gray flex-shrink-0 ml-2">
                                        {group.lastMessage
                                          ? new Date(
                                              group.lastMessage.createdAt
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm text-medium-gray truncate break-all line-clamp-1">
                                        {group.lastMessage
                                          ? (() => {
                                              const fullMessage = `${group.lastMessage.sender.name}: ${group.lastMessage.content}`;
                                              return fullMessage.length > 50
                                                ? fullMessage.substring(0, 50) +
                                                    "..."
                                                : fullMessage;
                                            })()
                                          : `${group.memberCount} members`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Users className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                              <p className="text-medium-gray text-sm mb-4">
                                No groups yet
                              </p>
                              <button
                                onClick={() => setShowCreateGroupModal(true)}
                                className="px-4 py-2 bg-dark-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
                              >
                                Create Group
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Chat Area */}
                      <div
                        className={`${
                          selectedConversation || selectedGroup
                            ? "flex"
                            : "hidden sm:flex"
                        } flex-1 flex-col h-full`}
                      >
                        {selectedConversation || selectedGroup ? (
                          <>
                            {/* Chat Header */}
                            <div className="p-3 sm:p-4 border-b border-light-gray bg-gray-50 flex items-center space-x-3">
                              {/* Back button for mobile */}
                              <button
                                onClick={() => {
                                  setSelectedConversation(null);
                                  setSelectedGroup(null);
                                }}
                                className="sm:hidden p-1 text-medium-gray hover:text-dark-gray"
                              >
                                <X className="h-5 w-5" />
                              </button>
                              {selectedConversation ? (
                                <>
                                  <div className="w-10 h-10 bg-gradient-to-br from-dark-blue to-campus-green rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {conversations
                                        .find(
                                          (c) => c.id === selectedConversation
                                        )
                                        ?.otherUserName.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-dark-gray">
                                      {
                                        conversations.find(
                                          (c) => c.id === selectedConversation
                                        )?.otherUserName
                                      }
                                    </h3>
                                    <p className="text-xs text-medium-gray">
                                      Online
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-dark-gray">
                                      {
                                        groups.find(
                                          (g) => g.id === selectedGroup
                                        )?.name
                                      }
                                    </h3>
                                    <p className="text-xs text-medium-gray">
                                      {
                                        groups.find(
                                          (g) => g.id === selectedGroup
                                        )?.memberCount
                                      }{" "}
                                      members
                                    </p>
                                  </div>
                                  {/* Group Actions */}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={async () => {
                                        if (selectedGroup) {
                                          await loadGroupMembers(selectedGroup);
                                          setShowMemberListSidebar(true);
                                        }
                                      }}
                                      className="p-2 text-medium-gray hover:text-dark-gray hover:bg-gray-100 rounded-lg transition-colors"
                                      title="View members"
                                    >
                                      <Users className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddMembersModal(true);
                                        setSelectedMembers([]);
                                        setUserSearchQuery("");
                                      }}
                                      className="p-2 text-medium-gray hover:text-dark-gray hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Add members"
                                    >
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-0">
                              <div className="space-y-4">
                                {(selectedConversation
                                  ? messages
                                  : groupMessages
                                ).length > 0 ? (
                                  (selectedConversation
                                    ? messages
                                    : groupMessages
                                  ).map((message) => (
                                    <div
                                      key={message.id}
                                      className={`flex ${
                                        message.senderId === currentUser?.id
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      <div className="flex flex-col items-start max-w-xs">
                                        {/* Show sender name for group messages */}
                                        {selectedGroup &&
                                          message.senderId !==
                                            currentUser?.id && (
                                            <span className="text-xs text-medium-gray mb-1 ml-2">
                                              {message.sender?.name}
                                            </span>
                                          )}
                                        <div
                                          className={`rounded-lg shadow-sm ${
                                            message.senderId === currentUser?.id
                                              ? "bg-dark-blue text-white rounded-br-none self-end"
                                              : "bg-white text-dark-gray rounded-bl-none"
                                          } ${
                                            message.messageType ===
                                              "order_request" ||
                                            message.messageType ===
                                              "payment_request"
                                              ? "p-0 overflow-hidden"
                                              : "p-3"
                                          }`}
                                        >
                                          {message.messageType ===
                                          "order_request" ? (
                                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                              <div className="flex items-start gap-3">
                                                {message.orderData
                                                  ?.foodImage && (
                                                  <Image
                                                    src={
                                                      message.orderData
                                                        .foodImage
                                                    }
                                                    alt={
                                                      message.orderData
                                                        .foodTitle
                                                    }
                                                    width={60}
                                                    height={60}
                                                    className="rounded object-cover"
                                                  />
                                                )}
                                                <div className="flex-1">
                                                  <p className="font-semibold text-sm text-gray-900">
                                                    {
                                                      message.orderData
                                                        ?.foodTitle
                                                    }
                                                  </p>
                                                  <p className="text-sm text-gray-700 font-medium">
                                                    Rp{" "}
                                                    {message.orderData?.price?.toLocaleString()}
                                                  </p>
                                                  <p className="text-xs text-gray-600 mt-1">
                                                    Pickup:{" "}
                                                    {
                                                      message.orderData
                                                        ?.pickupLocation
                                                    }
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                    Time:{" "}
                                                    {
                                                      message.orderData
                                                        ?.pickupTime
                                                    }
                                                  </p>
                                                  {message.orderData?.status ===
                                                    "pending" &&
                                                    message.receiverId ===
                                                      currentUser?.id && (
                                                      <div className="flex gap-2 mt-2">
                                                        <Button
                                                          size="sm"
                                                          onClick={async () => {
                                                            try {
                                                              await fetch(
                                                                `/api/messages/${message.id}/respond`,
                                                                {
                                                                  method:
                                                                    "POST",
                                                                  headers: {
                                                                    "Content-Type":
                                                                      "application/json",
                                                                  },
                                                                  body: JSON.stringify(
                                                                    {
                                                                      action:
                                                                        "accept",
                                                                    }
                                                                  ),
                                                                }
                                                              );
                                                              toast.success(
                                                                "Order accepted!"
                                                              );
                                                              // Reload messages to show updated status
                                                              await loadMessages(
                                                                message.conversationId
                                                              );
                                                            } catch (error) {
                                                              toast.error(
                                                                "Failed to accept order"
                                                              );
                                                            }
                                                          }}
                                                          className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                          Accept
                                                        </Button>
                                                        <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={async () => {
                                                            try {
                                                              await fetch(
                                                                `/api/messages/${message.id}/respond`,
                                                                {
                                                                  method:
                                                                    "POST",
                                                                  headers: {
                                                                    "Content-Type":
                                                                      "application/json",
                                                                  },
                                                                  body: JSON.stringify(
                                                                    {
                                                                      action:
                                                                        "reject",
                                                                    }
                                                                  ),
                                                                }
                                                              );
                                                              toast.success(
                                                                "Order declined"
                                                              );
                                                              // Reload messages to show updated status
                                                              await loadMessages(
                                                                message.conversationId
                                                              );
                                                            } catch (error) {
                                                              toast.error(
                                                                "Failed to decline order"
                                                              );
                                                            }
                                                          }}
                                                          className="border-red-600 text-red-600 hover:bg-red-50"
                                                        >
                                                          Decline
                                                        </Button>
                                                      </div>
                                                    )}
                                                  {message.orderData?.status ===
                                                    "accepted" && (
                                                    <p className="text-xs text-green-600 font-medium mt-2">
                                                      ✓ Accepted
                                                    </p>
                                                  )}
                                                  {message.orderData?.status ===
                                                    "rejected" && (
                                                    <p className="text-xs text-red-600 font-medium mt-2">
                                                      ✗ Declined
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <span className="text-xs mt-2 block text-gray-500">
                                                {new Date(
                                                  message.createdAt
                                                ).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                          ) : message.messageType ===
                                            "payment_request" ? (
                                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                              <p className="text-sm text-gray-900 font-medium mb-2">
                                                {message.content}
                                              </p>
                                              {message.orderData?.status ===
                                                "awaiting_payment" &&
                                                message.receiverId ===
                                                  currentUser?.id && (
                                                  <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                      try {
                                                        const result =
                                                          await paymentAPI.createPayment(
                                                            {
                                                              itemId:
                                                                message
                                                                  .orderData
                                                                  .foodId,
                                                              itemType: "food",
                                                              amount:
                                                                message
                                                                  .orderData
                                                                  .price,
                                                              itemTitle:
                                                                message
                                                                  .orderData
                                                                  .foodTitle,
                                                            }
                                                          );

                                                        if (
                                                          result.success &&
                                                          result.payment.token
                                                        ) {
                                                          // @ts-ignore - Midtrans Snap is loaded via script tag
                                                          if (window.snap) {
                                                            // @ts-ignore
                                                            window.snap.pay(
                                                              result.payment
                                                                .token,
                                                              {
                                                                onSuccess:
                                                                  async function (
                                                                    result: any
                                                                  ) {
                                                                    console.log(
                                                                      "Payment success:",
                                                                      result
                                                                    );

                                                                    toast.success(
                                                                      "Payment successful!",
                                                                      {
                                                                        description:
                                                                          "Redirecting to My Hub...",
                                                                      }
                                                                    );

                                                                    // Update message orderData immediately
                                                                    try {
                                                                      await fetch(
                                                                        `/api/messages/${message.id}`,
                                                                        {
                                                                          method:
                                                                            "PATCH",
                                                                          headers:
                                                                            {
                                                                              "Content-Type":
                                                                                "application/json",
                                                                            },
                                                                          body: JSON.stringify(
                                                                            {
                                                                              orderData:
                                                                                {
                                                                                  ...message.orderData,
                                                                                  status:
                                                                                    "paid",
                                                                                },
                                                                            }
                                                                          ),
                                                                        }
                                                                      );

                                                                      console.log(
                                                                        "✅ Message updated, Pusher will sync UI"
                                                                      );
                                                                    } catch (error) {
                                                                      console.error(
                                                                        "Error updating message:",
                                                                        error
                                                                      );
                                                                    }

                                                                    // Redirect to My Hub Purchases
                                                                    setTimeout(
                                                                      () => {
                                                                        window.location.href =
                                                                          "/dashboard?tab=my-hub&subTab=purchases";
                                                                      },
                                                                      1000
                                                                    );
                                                                  },
                                                                onPending:
                                                                  function (
                                                                    result: any
                                                                  ) {
                                                                    console.log(
                                                                      "Payment pending:",
                                                                      result
                                                                    );
                                                                    toast.info(
                                                                      "Payment pending",
                                                                      {
                                                                        description:
                                                                          "Waiting for confirmation...",
                                                                      }
                                                                    );
                                                                  },
                                                                onError:
                                                                  function (
                                                                    result: any
                                                                  ) {
                                                                    console.log(
                                                                      "Payment error:",
                                                                      result
                                                                    );
                                                                    toast.error(
                                                                      "Payment failed. Please try again."
                                                                    );
                                                                  },
                                                                onClose:
                                                                  function () {
                                                                    console.log(
                                                                      "Payment popup closed"
                                                                    );
                                                                  },
                                                              }
                                                            );
                                                          } else {
                                                            toast.error(
                                                              "Payment system not loaded. Please refresh the page."
                                                            );
                                                          }
                                                        } else {
                                                          toast.error(
                                                            "Failed to create payment. Please try again."
                                                          );
                                                        }
                                                      } catch (error) {
                                                        console.error(
                                                          "Payment error:",
                                                          error
                                                        );
                                                        toast.error(
                                                          "Failed to process payment"
                                                        );
                                                      }
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                                                  >
                                                    Pay Now - Rp{" "}
                                                    {message.orderData?.price?.toLocaleString()}
                                                  </Button>
                                                )}
                                              {message.orderData?.status ===
                                                "paid" && (
                                                <div className="bg-green-100 border border-green-300 rounded p-2 text-center">
                                                  <p className="text-sm text-green-700 font-medium">
                                                    ✓ Payment Completed
                                                  </p>
                                                </div>
                                              )}
                                              <span className="text-xs mt-2 block text-gray-500">
                                                {new Date(
                                                  message.createdAt
                                                ).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                          ) : (
                                            <>
                                              <p className="text-sm">
                                                {message.content}
                                              </p>
                                              <span
                                                className={`text-xs mt-1 block ${
                                                  message.senderId ===
                                                  currentUser?.id
                                                    ? "text-blue-200"
                                                    : "text-medium-gray"
                                                }`}
                                              >
                                                {new Date(
                                                  message.createdAt
                                                ).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-8">
                                    <MessageCircle className="h-12 w-12 text-medium-gray mx-auto mb-4" />
                                    <p className="text-medium-gray text-sm">
                                      No messages yet. Start the conversation!
                                    </p>
                                  </div>
                                )}
                                {/* Invisible div for auto-scroll */}
                                <div ref={messagesEndRef} />
                              </div>
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-light-gray bg-white">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="text"
                                  value={messageText}
                                  onChange={(e) =>
                                    setMessageText(e.target.value)
                                  }
                                  placeholder="Type a message..."
                                  className="flex-1 p-3 border border-light-gray rounded-full focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      messageText.trim() &&
                                      !isSendingMessage
                                    ) {
                                      e.preventDefault();
                                      if (selectedConversation) {
                                        handleSendMessage(
                                          selectedConversation,
                                          messageText
                                        );
                                      } else if (selectedGroup) {
                                        handleSendGroupMessage(
                                          selectedGroup,
                                          messageText
                                        );
                                      }
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (
                                      messageText.trim() &&
                                      !isSendingMessage
                                    ) {
                                      if (selectedConversation) {
                                        handleSendMessage(
                                          selectedConversation,
                                          messageText
                                        );
                                      } else if (selectedGroup) {
                                        handleSendGroupMessage(
                                          selectedGroup,
                                          messageText
                                        );
                                      }
                                    }
                                  }}
                                  disabled={isSendingMessage}
                                  className="bg-dark-blue text-white p-3 rounded-full hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isSendingMessage ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Send className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                              <MessageCircle className="h-16 w-16 text-medium-gray mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-dark-gray mb-2">
                                Select a conversation
                              </h3>
                              <p className="text-medium-gray">
                                Choose a chat to start messaging
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "my-hub" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-dark-gray">My Hub</h1>
                  <p className="text-sm text-medium-gray mt-1">
                    Manage your purchases, sales, library, listings, and events
                  </p>
                </div>

                <Tabs value={myHubTab} onValueChange={setMyHubTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="purchases">Purchases</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="library">Library</TabsTrigger>
                    <TabsTrigger value="listings">Listings</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                  </TabsList>

                  <TabsContent value="purchases" className="space-y-4 mt-6">
                    {isSyncingPayment && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 animate-pulse">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              Checking payment status...
                            </p>
                            <p className="text-xs text-blue-700">
                              {pendingOrdersCount > 0
                                ? `Verifying ${pendingOrdersCount} pending ${
                                    pendingOrdersCount === 1
                                      ? "order"
                                      : "orders"
                                  } with the payment gateway`
                                : "Verifying your recent payment with the payment gateway"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter((t) => t.type === "purchase")
                              .length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Total Orders
                        </p>
                      </Card>
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <Download className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter(
                              (t) =>
                                t.type === "purchase" &&
                                t.status === "COMPLETED"
                            ).length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Completed
                        </p>
                      </Card>
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm md:text-xl font-bold truncate">
                          Rp
                          {allTransactions
                            .filter(
                              (t) =>
                                t.type === "purchase" &&
                                t.status === "COMPLETED"
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                            .toLocaleString()}
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Total Spent
                        </p>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Purchase History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {allTransactions.filter((t) => t.type === "purchase")
                          .length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No purchases yet
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="hidden md:block overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {allTransactions
                                    .filter((t) => t.type === "purchase")
                                    .map((order) => (
                                      <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm">
                                          {order.orderId.substring(0, 12)}...
                                        </TableCell>
                                        <TableCell>
                                          <div>
                                            <p className="font-medium">
                                              {order.itemTitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {order.itemType === "marketplace"
                                                ? "Study Material"
                                                : order.itemType === "food"
                                                ? "Food"
                                                : "Event"}
                                            </p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {new Date(
                                            order.createdAt
                                          ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                          Rp {order.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant={
                                                order.status === "COMPLETED"
                                                  ? "default"
                                                  : order.status === "PENDING"
                                                  ? "secondary"
                                                  : "destructive"
                                              }
                                            >
                                              {order.status}
                                            </Badge>
                                            {isSyncingPayment &&
                                              order.status === "PENDING" && (
                                                <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
                                              )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="md:hidden space-y-2">
                              {allTransactions
                                .filter((t) => t.type === "purchase")
                                .map((order) => (
                                  <Card key={order.id} className="p-2">
                                    <div className="space-y-1.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-xs line-clamp-1">
                                            {order.itemTitle}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            {order.itemType === "marketplace"
                                              ? "Study Material"
                                              : order.itemType === "food"
                                              ? "Food"
                                              : "Event"}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Badge
                                            variant={
                                              order.status === "COMPLETED"
                                                ? "default"
                                                : order.status === "PENDING"
                                                ? "secondary"
                                                : "destructive"
                                            }
                                            className="text-[10px] h-4 px-1.5"
                                          >
                                            {order.status}
                                          </Badge>
                                          {isSyncingPayment &&
                                            order.status === "PENDING" && (
                                              <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />
                                            )}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground">
                                          {new Date(
                                            order.createdAt
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                          })}
                                        </span>
                                        <span className="font-semibold text-xs">
                                          Rp {order.amount.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sales" className="space-y-4 mt-6">
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter(
                              (t) =>
                                t.type === "sale" && t.status === "COMPLETED"
                            ).length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Total Sales
                        </p>
                      </Card>
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm md:text-xl font-bold truncate">
                          Rp
                          {allTransactions
                            .filter(
                              (t) =>
                                t.type === "sale" && t.status === "COMPLETED"
                            )
                            .reduce((sum, t) => sum + t.amount, 0)
                            .toLocaleString()}
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Revenue
                        </p>
                      </Card>
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter(
                              (t) => t.type === "sale" && t.status === "PENDING"
                            ).length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Pending
                        </p>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sales History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {allTransactions.filter((t) => t.type === "sale")
                          .length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No sales yet
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="hidden md:block overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {allTransactions
                                    .filter(
                                      (t) =>
                                        t.type === "sale" &&
                                        t.status === "COMPLETED"
                                    )
                                    .map((sale) => (
                                      <TableRow key={sale.id}>
                                        <TableCell className="font-mono text-sm">
                                          {sale.orderId.substring(0, 12)}...
                                        </TableCell>
                                        <TableCell>
                                          <div>
                                            <p className="font-medium">
                                              {sale.itemTitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {sale.itemType === "marketplace"
                                                ? "Study Material"
                                                : sale.itemType === "food"
                                                ? "Food"
                                                : "Event"}
                                            </p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {sale.buyer?.name || "Unknown"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {new Date(
                                            sale.createdAt
                                          ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                          Rp {sale.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              sale.status === "COMPLETED"
                                                ? "default"
                                                : sale.status === "PENDING"
                                                ? "secondary"
                                                : "destructive"
                                            }
                                          >
                                            {sale.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="md:hidden space-y-2">
                              {allTransactions
                                .filter(
                                  (t) =>
                                    t.type === "sale" &&
                                    t.status === "COMPLETED"
                                )
                                .map((sale) => (
                                  <Card key={sale.id} className="p-2">
                                    <div className="space-y-1.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-xs line-clamp-1">
                                            {sale.itemTitle}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            {sale.itemType === "marketplace"
                                              ? "Study Material"
                                              : sale.itemType === "food"
                                              ? "Food"
                                              : "Event"}
                                          </p>
                                        </div>
                                        <Badge
                                          variant={
                                            sale.status === "COMPLETED"
                                              ? "default"
                                              : sale.status === "PENDING"
                                              ? "secondary"
                                              : "destructive"
                                          }
                                          className="text-[10px] h-4 px-1.5 flex-shrink-0"
                                        >
                                          {sale.status}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                          <span className="truncate">
                                            {sale.buyer?.name || "Unknown"}
                                          </span>
                                          <span>•</span>
                                          <span>
                                            {new Date(
                                              sale.createdAt
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <span className="font-semibold text-xs flex-shrink-0">
                                          Rp {sale.amount.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="library" className="space-y-4 mt-6">
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-1">
                          <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter(
                              (t) =>
                                t.type === "purchase" &&
                                t.status === "COMPLETED" &&
                                t.itemType === "marketplace"
                            ).length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Total Items
                        </p>
                      </Card>
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-1">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter(
                              (t) =>
                                t.type === "purchase" &&
                                t.status === "COMPLETED" &&
                                t.itemType === "marketplace" &&
                                t.item?.category === "Notes"
                            ).length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Notes
                        </p>
                      </Card>
                      <Card className="p-2 md:p-4">
                        <div className="flex items-center justify-between mb-1">
                          <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        <div className="text-lg md:text-2xl font-bold">
                          {
                            allTransactions.filter(
                              (t) =>
                                t.type === "purchase" &&
                                t.status === "COMPLETED" &&
                                t.itemType === "marketplace" &&
                                t.item?.category === "Book"
                            ).length
                          }
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          Books
                        </p>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>My Library</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {allTransactions.filter(
                          (t) =>
                            t.type === "purchase" &&
                            t.status === "COMPLETED" &&
                            t.itemType === "marketplace"
                        ).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-dark-gray mb-2">
                              No items in your library
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              Start purchasing study materials to build your
                              library
                            </p>
                            <Button onClick={() => setActiveTab("discovery")}>
                              Browse Marketplace
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                            {allTransactions
                              .filter(
                                (t) =>
                                  t.type === "purchase" &&
                                  t.status === "COMPLETED" &&
                                  t.itemType === "marketplace"
                              )
                              .map((item) => (
                                <Card
                                  key={item.id}
                                  className="hover:shadow-lg transition-shadow"
                                >
                                  <CardHeader className="p-2 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
                                      <div className="flex-1 min-w-0">
                                        <CardTitle className="text-xs md:text-lg line-clamp-2">
                                          {item.itemTitle}
                                        </CardTitle>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                                          {item.item?.category ||
                                            "Study Material"}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2 flex-shrink-0 w-fit"
                                      >
                                        {item.item?.category || "Material"}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-2 md:p-6 pt-0">
                                    <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                                      {item.item?.description ||
                                        "No description available"}
                                    </p>
                                    <div className="mt-2 md:mt-4 space-y-0.5 md:space-y-1">
                                      <div className="text-[10px] md:text-xs text-muted-foreground">
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </div>
                                    </div>
                                  </CardContent>
                                  <CardFooter className="p-2 md:p-6 pt-0">
                                    <Button
                                      size="sm"
                                      className="w-full text-[10px] md:text-sm h-7 md:h-9"
                                      onClick={async () => {
                                        if (item.item?.fileUrl) {
                                          try {
                                            await fileAPI.downloadFile(
                                              item.itemId,
                                              item.item.fileUrl,
                                              item.item.fileName ||
                                                item.itemTitle
                                            );
                                            toast.success("Download started!");
                                          } catch (error) {
                                            toast.error("Download failed");
                                          }
                                        } else {
                                          toast.error("No file available");
                                        }
                                      }}
                                      disabled={!item.item?.fileUrl}
                                    >
                                      <Download className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                                      <span className="hidden md:inline">
                                        Download
                                      </span>
                                      <span className="md:hidden">Get</span>
                                    </Button>
                                  </CardFooter>
                                </Card>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="listings" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Listings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {marketplaceItems.filter(
                          (item) => item.sellerId === currentUser?.id
                        ).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No listings yet
                            </p>
                            <Button
                              onClick={() => setShowAddItemModal(true)}
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                          </div>
                        ) : (
                          <div className="grid gap-2 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                            {marketplaceItems
                              .filter(
                                (item) => item.sellerId === currentUser?.id
                              )
                              .map((item) => (
                                <Card
                                  key={item.id}
                                  className="hover:shadow-lg transition-shadow"
                                >
                                  {item.imageUrl && (
                                    <div className="relative w-full h-24 md:h-48 bg-gray-100">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover rounded-t-lg"
                                      />
                                      <Badge
                                        className="absolute top-1 right-1 md:top-2 md:right-2 text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
                                        variant={
                                          item.status === "available"
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {item.status}
                                      </Badge>
                                    </div>
                                  )}
                                  <CardHeader className="p-2 md:p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2">
                                      <div className="flex-1 min-w-0">
                                        <CardTitle className="text-xs md:text-lg line-clamp-2">
                                          {item.title}
                                        </CardTitle>
                                        <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                                          {item.category}
                                        </p>
                                      </div>
                                      {!item.imageUrl && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2 flex-shrink-0 w-fit"
                                        >
                                          {item.category}
                                        </Badge>
                                      )}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-2 md:p-6 pt-0">
                                    <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                                      {item.description}
                                    </p>
                                    <div className="mt-2 md:mt-4 flex items-center justify-between">
                                      <p className="text-xs md:text-lg font-bold text-dark-blue">
                                        Rp {item.price.toLocaleString()}
                                      </p>
                                      <div className="text-[10px] md:text-xs text-muted-foreground">
                                        {item.viewCount || 0}
                                      </div>
                                    </div>
                                  </CardContent>
                                  <CardFooter className="flex gap-1 md:gap-2 p-2 md:p-6 pt-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(item);
                                        setShowItemDetailModal(true);
                                      }}
                                    >
                                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                                      <span className="hidden md:inline">
                                        View
                                      </span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(item);
                                        handleEditItem(item);
                                        setShowItemDetailModal(true);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  </CardFooter>
                                </Card>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="events" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Event Registrations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {myEventRegistrations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No event registrations yet
                            </p>
                            <Button
                              onClick={() => setActiveTab("discovery")}
                              className="mt-4"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Browse Events
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 md:gap-4">
                            {myEventRegistrations.map((registration: any) => (
                              <Card
                                key={registration.id}
                                className="hover:shadow-lg transition-shadow"
                              >
                                <CardHeader className="p-2 md:p-6">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <CardTitle className="text-xs md:text-lg line-clamp-2">
                                        {registration.event.title}
                                      </CardTitle>
                                      <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                                        {registration.event.category} •{" "}
                                        {registration.event.eventType}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 md:gap-2 flex-shrink-0">
                                      <Badge
                                        variant={
                                          registration.paymentStatus === "paid"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
                                      >
                                        {registration.paymentStatus === "paid"
                                          ? "Paid"
                                          : "Pending"}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] md:text-xs h-4 md:h-5 px-1 md:px-2"
                                      >
                                        {registration.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 md:p-6 pt-0">
                                  <div className="space-y-1 md:space-y-2 text-[10px] md:text-sm">
                                    <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
                                      <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                      <span className="truncate">
                                        {new Date(
                                          registration.event.startDate
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
                                      <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                      <span className="truncate">
                                        {registration.event.location}
                                      </span>
                                    </div>
                                    {registration.event.price > 0 && (
                                      <div className="flex items-center gap-1 md:gap-2 font-semibold text-dark-blue">
                                        <span className="text-xs md:text-sm">
                                          Rp{" "}
                                          {registration.event.price.toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                                <CardFooter className="flex gap-1 md:gap-2 p-2 md:p-6 pt-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
                                    onClick={() => {
                                      setSelectedEvent(registration.event);
                                      setShowEventDetailModal(true);
                                    }}
                                  >
                                    <Eye className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                                    <span className="hidden md:inline">
                                      View Details
                                    </span>
                                    <span className="md:hidden">View</span>
                                  </Button>
                                  {registration.event.isOnline &&
                                    registration.event.meetingLink &&
                                    registration.paymentStatus === "paid" && (
                                      <Button
                                        size="sm"
                                        className="flex-1 text-[10px] md:text-sm h-7 md:h-9 px-1 md:px-3"
                                        onClick={() => {
                                          window.open(
                                            registration.event.meetingLink,
                                            "_blank"
                                          );
                                        }}
                                      >
                                        <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                                        <span className="hidden md:inline">
                                          Join Meeting
                                        </span>
                                        <span className="md:hidden">Join</span>
                                      </Button>
                                    )}
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="space-y-3">
                {/* Header */}
                <div>
                  <h1 className="text-xl font-semibold text-dark-gray">
                    Wallet & Withdrawals
                  </h1>
                  <p className="text-xs text-medium-gray mt-0.5">
                    Platform fee: 5% • Holding: 3 days • Min withdrawal: Rp
                    50,000
                  </p>
                </div>

                {loadingStates.wallet ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-blue mx-auto mb-2"></div>
                      <p className="text-xs text-medium-gray">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Balance Cards - Compact */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      <Card className="border border-gray-300">
                        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
                          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
                            Total
                            <br className="sm:hidden" />
                            Earnings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-3 pt-0">
                          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
                            Rp{" "}
                            {(userStats?.totalEarnings || 0).toLocaleString()}
                          </div>
                          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
                            After platform fee
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-300">
                        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
                          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
                            Available
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-3 pt-0">
                          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
                            Rp{" "}
                            {(
                              userStats?.availableBalance || 0
                            ).toLocaleString()}
                          </div>
                          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
                            Ready to withdraw
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-300">
                        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
                          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
                            Pending
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-3 pt-0">
                          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
                            Rp{" "}
                            {(userStats?.pendingBalance || 0).toLocaleString()}
                          </div>
                          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
                            3-day hold
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-300">
                        <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
                          <CardTitle className="text-[10px] sm:text-xs font-medium text-medium-gray leading-tight">
                            Withdrawn
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-3 pt-0">
                          <div className="text-sm sm:text-lg font-semibold text-dark-gray leading-tight break-all">
                            Rp{" "}
                            {(
                              userStats?.withdrawnBalance || 0
                            ).toLocaleString()}
                          </div>
                          <p className="text-[8px] sm:text-[10px] text-medium-gray mt-0.5 leading-tight">
                            All-time
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Withdrawal Form and History */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {/* Withdrawal Form */}
                      <WithdrawalForm
                        availableBalance={userStats?.availableBalance || 0}
                        userStats={userStats}
                        onSuccess={() => loadTabData("wallet")}
                      />

                      {/* Withdrawal History */}
                      <Card className="p-4 border border-gray-300">
                        <h3 className="text-sm font-semibold text-dark-gray mb-3">
                          Withdrawal History
                        </h3>

                        <div className="space-y-2">
                          {withdrawals.length > 0 ? (
                            withdrawals.map((withdrawal: any) => (
                              <div
                                key={withdrawal.id}
                                className="border border-gray-200 rounded p-2"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-dark-gray">
                                        Rp {withdrawal.amount.toLocaleString()}
                                      </p>
                                      <Badge
                                        className={`text-[10px] px-1.5 py-0 ${
                                          withdrawal.status === "COMPLETED"
                                            ? "bg-green-100 text-green-800"
                                            : withdrawal.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : withdrawal.status === "REJECTED"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                      >
                                        {withdrawal.status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-medium-gray mt-0.5">
                                      {withdrawal.bankName} •{" "}
                                      {withdrawal.accountNumber}
                                    </p>
                                    <p className="text-[10px] text-medium-gray mt-0.5">
                                      {new Date(
                                        withdrawal.createdAt
                                      ).toLocaleDateString("id-ID", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </p>
                                    {withdrawal.rejectionReason && (
                                      <p className="text-[10px] text-red-600 mt-1">
                                        Reason: {withdrawal.rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-medium-gray text-xs">
                                No withdrawal history yet
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* Analytics & Insights Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h2 className="text-lg font-semibold text-dark-gray mb-4">
                        Analytics & Insights
                      </h2>

                      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                        <Card>
                          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                              Total Sales
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 md:p-6 pt-0">
                            <div className="text-lg md:text-2xl font-bold">
                              {
                                allTransactions.filter(
                                  (t) =>
                                    t.type === "sale" &&
                                    t.status === "COMPLETED"
                                ).length
                              }
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              Completed
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                              Revenue
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 md:p-6 pt-0">
                            <div className="text-sm md:text-2xl font-bold truncate">
                              Rp{" "}
                              {allTransactions
                                .filter(
                                  (t) =>
                                    t.type === "sale" &&
                                    t.status === "COMPLETED"
                                )
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toLocaleString()}
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              Before fee
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                              Listings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 md:p-6 pt-0">
                            <div className="text-lg md:text-2xl font-bold">
                              {
                                marketplaceItems.filter(
                                  (item) =>
                                    item.sellerId === currentUser?.id &&
                                    item.status === "available"
                                ).length
                              }
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              Active
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Sales by Category</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {["Study Material", "Food", "Event"].map(
                                (category) => {
                                  const categoryType =
                                    category === "Study Material"
                                      ? "marketplace"
                                      : category.toLowerCase();
                                  const count = allTransactions.filter(
                                    (t) =>
                                      t.type === "sale" &&
                                      t.status === "COMPLETED" &&
                                      t.itemType === categoryType
                                  ).length;
                                  const total = allTransactions.filter(
                                    (t) =>
                                      t.type === "sale" &&
                                      t.status === "COMPLETED"
                                  ).length;
                                  const percentage =
                                    total > 0
                                      ? Math.round((count / total) * 100)
                                      : 0;

                                  return (
                                    <div key={category}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                          {category}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {count} ({percentage}%)
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-dark-blue h-2 rounded-full"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {allTransactions
                                .filter((t) => t.type === "sale")
                                .slice(0, 5)
                                .map((transaction) => (
                                  <div
                                    key={transaction.id}
                                    className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1">
                                        {transaction.itemTitle}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          transaction.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className="text-sm font-semibold">
                                        Rp {transaction.amount.toLocaleString()}
                                      </p>
                                      <Badge
                                        variant={
                                          transaction.status === "COMPLETED"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {transaction.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              {allTransactions.filter((t) => t.type === "sale")
                                .length === 0 && (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                  No sales yet
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "insights-old-removed" && (
              <div className="space-y-4">
                {/* Header with Refresh Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-dark-gray">
                      Analytics Dashboard
                    </h1>
                    <p className="text-sm text-medium-gray mt-1">
                      Real-time insights from your transactions
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setLoadedTabs((prev) => ({ ...prev, insights: false }));
                      loadTabData("insights");
                    }}
                    variant="outline"
                    size="sm"
                    disabled={loadingStates.insights}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loadingStates.insights ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>

                {loadingStates.insights ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
                      <p className="text-medium-gray">Loading analytics...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <Card className="col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-6">
                          <CardTitle className="text-[10px] md:text-xs font-medium">
                            Revenue
                          </CardTitle>
                          <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-2 md:p-6 pt-0">
                          <div className="text-sm md:text-xl font-bold truncate">
                            Rp
                            {allTransactions
                              .filter(
                                (t) =>
                                  t.type === "sale" && t.status === "COMPLETED"
                              )
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            {
                              allTransactions.filter(
                                (t) =>
                                  t.type === "sale" && t.status === "COMPLETED"
                              ).length
                            }{" "}
                            sales
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-6">
                          <CardTitle className="text-[10px] md:text-xs font-medium">
                            Spent
                          </CardTitle>
                          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-2 md:p-6 pt-0">
                          <div className="text-sm md:text-xl font-bold truncate">
                            Rp
                            {allTransactions
                              .filter(
                                (t) =>
                                  t.type === "purchase" &&
                                  t.status === "COMPLETED"
                              )
                              .reduce((sum, t) => sum + t.amount, 0)
                              .toLocaleString()}
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            {
                              allTransactions.filter(
                                (t) =>
                                  t.type === "purchase" &&
                                  t.status === "COMPLETED"
                              ).length
                            }{" "}
                            purchases
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-2 md:p-6">
                          <CardTitle className="text-[10px] md:text-xs font-medium">
                            Listings
                          </CardTitle>
                          <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-2 md:p-6 pt-0">
                          <div className="text-lg md:text-xl font-bold">
                            {
                              marketplaceItems.filter(
                                (item) =>
                                  item.sellerId === currentUser?.id &&
                                  item.status === "available"
                              ).length
                            }
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            Of{" "}
                            {
                              marketplaceItems.filter(
                                (item) => item.sellerId === currentUser?.id
                              ).length
                            }{" "}
                            total
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Second Row - Avg Rating (Full Width) */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium">
                          Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {stats[3].value}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From all your items
                        </p>
                      </CardContent>
                    </Card>

                    {/* Recent Activity & Top Items - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Recent Activity */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Recent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {allTransactions.slice(0, 3).length === 0 ? (
                              <div className="text-center py-6 text-sm text-muted-foreground">
                                No recent activity
                              </div>
                            ) : (
                              allTransactions.slice(0, 3).map((transaction) => (
                                <div
                                  key={transaction.id}
                                  className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`p-1.5 rounded ${
                                        transaction.type === "sale"
                                          ? "bg-green-100"
                                          : "bg-blue-100"
                                      }`}
                                    >
                                      {transaction.type === "sale" ? (
                                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                                      ) : (
                                        <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium line-clamp-1">
                                        {transaction.itemTitle}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          transaction.createdAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className={`text-sm font-semibold ${
                                        transaction.type === "sale"
                                          ? "text-green-600"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      {transaction.type === "sale" ? "+" : "-"}
                                      {(transaction.amount / 1000).toFixed(0)}k
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Top Performing Items */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Top Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {marketplaceItems
                              .filter(
                                (item) => item.sellerId === currentUser?.id
                              )
                              .sort(
                                (a, b) =>
                                  (b.viewCount || 0) - (a.viewCount || 0)
                              )
                              .slice(0, 3).length === 0 ? (
                              <div className="text-center py-6 text-sm text-muted-foreground">
                                No items yet
                              </div>
                            ) : (
                              marketplaceItems
                                .filter(
                                  (item) => item.sellerId === currentUser?.id
                                )
                                .sort(
                                  (a, b) =>
                                    (b.viewCount || 0) - (a.viewCount || 0)
                                )
                                .slice(0, 3)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1">
                                        {item.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.category}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className="text-sm font-semibold">
                                        {item.viewCount || 0}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        views
                                      </p>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h2 className="text-lg font-semibold text-dark-gray mb-4">
                        Analytics & Insights
                      </h2>

                      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                        <Card>
                          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                              Total Sales
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 md:p-6 pt-0">
                            <div className="text-lg md:text-2xl font-bold">
                              {
                                allTransactions.filter(
                                  (t) =>
                                    t.type === "sale" &&
                                    t.status === "COMPLETED"
                                ).length
                              }
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              Completed
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                              Revenue
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 md:p-6 pt-0">
                            <div className="text-sm md:text-2xl font-bold truncate">
                              Rp{" "}
                              {allTransactions
                                .filter(
                                  (t) =>
                                    t.type === "sale" &&
                                    t.status === "COMPLETED"
                                )
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toLocaleString()}
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              Before fee
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-1 md:pb-2 p-2 md:p-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                              Listings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 md:p-6 pt-0">
                            <div className="text-lg md:text-2xl font-bold">
                              {
                                marketplaceItems.filter(
                                  (item) => item.sellerId === currentUser?.id
                                ).length
                              }
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                              For sale
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Sales by Category</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {["Study Material", "Food", "Event"].map(
                                (category) => {
                                  const categoryType =
                                    category === "Study Material"
                                      ? "marketplace"
                                      : category.toLowerCase();
                                  const count = allTransactions.filter(
                                    (t) =>
                                      t.type === "sale" &&
                                      t.status === "COMPLETED" &&
                                      t.itemType === categoryType
                                  ).length;
                                  const total = allTransactions.filter(
                                    (t) =>
                                      t.type === "sale" &&
                                      t.status === "COMPLETED"
                                  ).length;
                                  const percentage =
                                    total > 0
                                      ? Math.round((count / total) * 100)
                                      : 0;

                                  return (
                                    <div key={category}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                          {category}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {count} ({percentage}%)
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-dark-blue h-2 rounded-full"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {allTransactions
                                .filter((t) => t.type === "sale")
                                .slice(0, 5)
                                .map((transaction) => (
                                  <div
                                    key={transaction.id}
                                    className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1">
                                        {transaction.itemTitle}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          transaction.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className="text-sm font-semibold">
                                        Rp {transaction.amount.toLocaleString()}
                                      </p>
                                      <Badge
                                        variant={
                                          transaction.status === "COMPLETED"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {transaction.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              {allTransactions.filter((t) => t.type === "sale")
                                .length === 0 && (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                  No sales yet
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Type Selection Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  setContentMode("study");
                  handleAddItemClick();
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
                onClick={async () => {
                  setShowAddTypeModal(false);

                  if (!userProfile) {
                    const profile = await userAPI.getProfile();
                    setUserProfile(profile);

                    const isComplete = !!(
                      profile.name &&
                      profile.studentId &&
                      profile.faculty &&
                      profile.faculty !== "Unknown" &&
                      profile.major &&
                      profile.major !== "Unknown" &&
                      profile.year
                    );

                    if (!isComplete) {
                      setProfileFormData({
                        name: profile?.name || "",
                        studentId: profile?.studentId || "",
                        faculty:
                          profile?.faculty === "Unknown"
                            ? ""
                            : profile?.faculty || "",
                        major:
                          profile?.major === "Unknown"
                            ? ""
                            : profile?.major || "",
                        year: profile?.year || 1,
                      });
                      setShowProfileCompleteModal(true);
                      return;
                    }
                  } else if (!isProfileComplete()) {
                    setProfileFormData({
                      name: userProfile?.name || "",
                      studentId: userProfile?.studentId || "",
                      faculty:
                        userProfile?.faculty === "Unknown"
                          ? ""
                          : userProfile?.faculty || "",
                      major:
                        userProfile?.major === "Unknown"
                          ? ""
                          : userProfile?.major || "",
                      year: userProfile?.year || 1,
                    });
                    setShowProfileCompleteModal(true);
                    return;
                  }

                  setContentMode("food");
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
                onClick={async () => {
                  setShowAddTypeModal(false);

                  if (!userProfile) {
                    const profile = await userAPI.getProfile();
                    setUserProfile(profile);

                    const isComplete = !!(
                      profile.name &&
                      profile.studentId &&
                      profile.faculty &&
                      profile.faculty !== "Unknown" &&
                      profile.major &&
                      profile.major !== "Unknown" &&
                      profile.year
                    );

                    if (!isComplete) {
                      setProfileFormData({
                        name: profile?.name || "",
                        studentId: profile?.studentId || "",
                        faculty:
                          profile?.faculty === "Unknown"
                            ? ""
                            : profile?.faculty || "",
                        major:
                          profile?.major === "Unknown"
                            ? ""
                            : profile?.major || "",
                        year: profile?.year || 1,
                      });
                      setShowProfileCompleteModal(true);
                      return;
                    }
                  } else if (!isProfileComplete()) {
                    setProfileFormData({
                      name: userProfile?.name || "",
                      studentId: userProfile?.studentId || "",
                      faculty:
                        userProfile?.faculty === "Unknown"
                          ? ""
                          : userProfile?.faculty || "",
                      major:
                        userProfile?.major === "Unknown"
                          ? ""
                          : userProfile?.major || "",
                      year: userProfile?.year || 1,
                    });
                    setShowProfileCompleteModal(true);
                    return;
                  }

                  setContentMode("event");
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

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Add New Item
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

      {/* Add Food Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Add Food Item
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-base sm:text-lg font-bold text-dark-gray">
                Create Event
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

      {/* Food Detail Modal */}
      {showFoodDetailModal && selectedFood && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setShowFoodDetailModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className={
                isEditingFood
                  ? "p-3 overflow-y-auto"
                  : "flex flex-col md:flex-row overflow-y-auto"
              }
            >
              {isEditingFood ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Food Item</h2>
                    <button
                      onClick={() => {
                        setShowFoodDetailModal(false);
                        setIsEditingFood(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <EditFoodForm
                    foodItem={selectedFood}
                    onSubmit={handleSaveEditFood}
                    onCancel={handleCancelEditFood}
                    isSaving={isSavingFood}
                  />
                </div>
              ) : (
                <>
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
                          <Badge className="text-xs">
                            {selectedFood.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selectedFood.foodType}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <h3 className="font-semibold text-sm mb-1">
                          Description
                        </h3>
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
                          <h3 className="font-semibold text-sm mb-0.5">
                            Quantity
                          </h3>
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
                        {session?.user?.email === selectedFood.seller?.email ? (
                          isEditingFood ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancelEditFood}
                                disabled={isSavingFood}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={handleSaveEditFood}
                                disabled={isSavingFood}
                              >
                                {isSavingFood ? "Saving..." : "Save Changes"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleEditFood}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this food item?"
                                    )
                                  ) {
                                    handleDeleteFood(selectedFood.id);
                                  }
                                }}
                                className="flex-1"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )
                        ) : selectedFood.status === "available" ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowFoodDetailModal(false);
                                handleCreateConversation(
                                  selectedFood.sellerId,
                                  selectedFood.seller?.name || "Seller"
                                );
                              }}
                              className="flex-1"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message Seller
                            </Button>
                            <Button
                              onClick={() =>
                                handleSendFoodOrderRequest(selectedFood)
                              }
                              className="flex-1"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Order Now
                            </Button>
                          </>
                        ) : (
                          <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-2 rounded-md text-center font-medium">
                            Sold Out
                          </div>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowFoodDetailModal(false);
                            setIsEditingFood(false);
                          }}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setShowEventDetailModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className={
                isEditingEvent
                  ? "p-3 overflow-y-auto"
                  : "flex flex-col md:flex-row overflow-y-auto"
              }
            >
              {isEditingEvent ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Event</h2>
                    <button
                      onClick={() => {
                        setShowEventDetailModal(false);
                        setIsEditingEvent(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <EditEventForm
                    event={selectedEvent}
                    onSubmit={handleSaveEditEvent}
                    onCancel={handleCancelEditEvent}
                    isSaving={isSavingEvent}
                  />
                </div>
              ) : (
                <>
                  {(selectedEvent.bannerUrl || selectedEvent.imageUrl) && (
                    <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0">
                      <Image
                        src={
                          selectedEvent.bannerUrl ||
                          selectedEvent.imageUrl ||
                          ""
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
                        <h3 className="font-semibold text-sm mb-1">
                          Description
                        </h3>
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
                          <h3 className="font-semibold text-sm mb-0.5">
                            End Date
                          </h3>
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
                          <h3 className="font-semibold text-sm mb-0.5">
                            Location
                          </h3>
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
                            {selectedEvent.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {session?.user?.email ===
                        selectedEvent.organizerUser?.email ? (
                          isEditingEvent ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancelEditEvent}
                                disabled={isSavingEvent}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={handleSaveEditEvent}
                                disabled={isSavingEvent}
                              >
                                {isSavingEvent ? "Saving..." : "Save Changes"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleEditEvent}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this event?"
                                    )
                                  ) {
                                    handleDeleteEvent(selectedEvent.id);
                                  }
                                }}
                                className="flex-1"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )
                        ) : myEventRegistrations.some(
                            (reg) => reg.eventId === selectedEvent.id
                          ) ? (
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
                                setShowEventDetailModal(false);
                                handleCreateConversation(
                                  selectedEvent.organizerId,
                                  selectedEvent.organizer || "Organizer"
                                );
                              }}
                              className="flex-1"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message Organizer
                            </Button>
                            <Button
                              onClick={() => {
                                if (selectedEvent.price > 0) {
                                  setPaymentItem({
                                    id: selectedEvent.id,
                                    title: selectedEvent.title,
                                    price: selectedEvent.price,
                                    type: "event",
                                  });
                                  setShowPaymentModal(true);
                                  setShowEventDetailModal(false);
                                } else {
                                  handleRegisterEvent(selectedEvent.id);
                                }
                              }}
                              className="flex-1"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Register
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEventDetailModal(false);
                            setIsEditingEvent(false);
                          }}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Message Seller
                    </h2>
                    <p className="text-xs text-white/80">
                      Start a conversation about this item
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContextItem(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Item Context Card */}
            {messageContextItem && (
              <div className="mx-5 mt-4 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {messageContextItem.imageUrl ? (
                      <img
                        src={messageContextItem.imageUrl}
                        alt={messageContextItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 mb-0.5">
                      Asking about:
                    </p>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                      {messageContextItem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {messageContextItem.category}
                      </Badge>
                      <span className="text-sm font-bold text-blue-600">
                        Rp {messageContextItem.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <div className="relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Hi! I'm interested in this item. Is it still available?"
                    className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={4}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {messageText.length}/500
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-green-500 rounded-full"></span>
                  Seller will be notified instantly
                </p>
              </div>

              {/* Quick Message Templates */}
              {!messageText && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">
                    Quick messages:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setMessageText("Hi! Is this item still available?")
                      }
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      Is it available?
                    </button>
                    <button
                      onClick={() =>
                        setMessageText(
                          "Can you provide more details about the condition?"
                        )
                      }
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      More details?
                    </button>
                    <button
                      onClick={() => setMessageText("Is the price negotiable?")}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      Negotiable?
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContextItem(null);
                    setMessageText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() =>
                    handleSendMessage(selectedConversation, messageText)
                  }
                  disabled={!messageText.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutoring Modal */}
      {showTutoringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-gray">
                Offer Tutoring
              </h2>
              <button
                onClick={() => setShowTutoringModal(false)}
                className="text-medium-gray hover:text-dark-gray"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <TutoringForm
              onSubmit={handleAddTutoringSession}
              onCancel={() => setShowTutoringModal(false)}
            />
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h2 className="text-base font-bold text-gray-900 line-clamp-1">
                {isEditingItem ? "Edit Item" : selectedItem.title}
              </h2>
              <button
                onClick={() => {
                  setShowItemDetailModal(false);
                  setIsEditingItem(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content - No scrollbar */}
            <div className="p-3 space-y-2">
              {/* File Preview Section */}
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <FilePreview
                  fileUrl={selectedItem.fileUrl || selectedItem.imageUrl || ""}
                  fileType={selectedItem.fileType || ""}
                  fileName={selectedItem.fileName || selectedItem.title}
                  title={
                    isEditingItem ? editItemFormData.title : selectedItem.title
                  }
                  category={
                    isEditingItem
                      ? editItemFormData.category
                      : selectedItem.category
                  }
                  thumbnailUrl={selectedItem.thumbnailUrl}
                />
              </div>

              {isEditingItem ? (
                <>
                  {/* Edit Form */}
                  <div className="space-y-2">
                    {/* Title */}
                    <div>
                      <label className="text-xs font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        value={editItemFormData.title}
                        onChange={(e) =>
                          setEditItemFormData({
                            ...editItemFormData,
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
                        value={editItemFormData.description}
                        onChange={(e) =>
                          setEditItemFormData({
                            ...editItemFormData,
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
                        value={editItemFormData.category}
                        onChange={(e) =>
                          setEditItemFormData({
                            ...editItemFormData,
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
                        value={editItemFormData.course}
                        onChange={(e) =>
                          setEditItemFormData({
                            ...editItemFormData,
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
                        value={editItemFormData.price}
                        onChange={(e) =>
                          setEditItemFormData({
                            ...editItemFormData,
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
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5"
                  >
                    {selectedItem.category}
                  </Badge>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {selectedItem.description}
                  </p>

                  {/* Info - Single Line with Icons */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-600 bg-gray-50 px-2 py-1.5 rounded-md">
                    <div className="flex items-center gap-1" title="Course">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                      <span className="font-medium text-gray-900 truncate max-w-[60px]">
                        {selectedItem.course}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1" title="Seller">
                      <User className="h-3 w-3 text-gray-500" />
                      <span className="font-medium text-gray-900 truncate max-w-[80px]">
                        {typeof selectedItem.seller === "string"
                          ? `${selectedItem.seller.slice(-9)}`
                          : selectedItem.seller?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1" title="Rating">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {selectedItem.rating} ({selectedItem.reviews || 0})
                      </span>
                    </div>
                    {selectedItem.condition && (
                      <>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div
                          className="flex items-center gap-1"
                          title="Condition"
                        >
                          <Eye className="h-3 w-3 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {selectedItem.condition}
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
                        Rp {selectedItem.price.toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        selectedItem.status === "available"
                          ? "default"
                          : "secondary"
                      }
                      className={`text-[10px] px-2 py-0.5 ${
                        selectedItem.status === "available"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : selectedItem.status === "sold"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedItem.status}
                    </Badge>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {selectedItem.sellerId === currentUser?.id ? (
                  isEditingItem ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 text-xs px-3 py-1.5 h-auto"
                        onClick={handleCancelEditItem}
                        disabled={isSavingItem}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 text-xs px-3 py-1.5 h-auto"
                        onClick={handleSaveEditItem}
                        disabled={isSavingItem}
                      >
                        {isSavingItem ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 text-xs px-3 py-1.5 h-auto"
                        onClick={() => handleEditItem(selectedItem)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 text-xs px-3 py-1.5 h-auto"
                        onClick={() => {
                          handleDeleteItem(selectedItem.id);
                          setShowItemDetailModal(false);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1.5" />
                        Delete Item
                      </Button>
                    </>
                  )
                ) : selectedItem.status === "available" ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-xs px-3 py-1.5 h-auto"
                      onClick={() => {
                        setMessageContextItem(selectedItem);
                        handleCreateConversation(
                          selectedItem.sellerId,
                          typeof selectedItem.seller === "string"
                            ? selectedItem.seller
                            : selectedItem.seller?.name || "Unknown"
                        );
                        setShowItemDetailModal(false);
                      }}
                    >
                      <MessageCircle className="h-3 w-3 mr-1.5" />
                      Message Seller
                    </Button>
                    <Button
                      className="flex-1 text-xs px-3 py-1.5 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => handleBuyItem(selectedItem)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1.5" />
                      {hasPurchasedItem ? "Order Again" : "Buy Now"}
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-md text-center text-xs font-medium">
                    {selectedItem.status === "sold"
                      ? "Item Sold"
                      : "Not Available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Confirmation Modal */}
      {showReorderConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Already Purchased
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You have already purchased this item. Do you want to order it
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  proceedWithPurchase(selectedItem);
                  setShowItemDetailModal(false);
                }}
              >
                Yes, Order Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentItem && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentItem(null);
          }}
          item={paymentItem}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Profile Completion Modal */}
      {showProfileCompleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please complete your profile before adding items or offering
              tutoring. This helps other students know more about you and builds
              trust in the community.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfileFromModal();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileFormData.name}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileFormData.studentId}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      studentId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2502012345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty/School <span className="text-red-500">*</span>
                </label>
                <select
                  value={profileFormData.faculty}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      faculty: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Faculty/School</option>
                  <option value="School of Computer Science">
                    School of Computer Science
                  </option>
                  <option value="School of Information Systems">
                    School of Information Systems
                  </option>
                  <option value="School of Design">School of Design</option>
                  <option value="School of Accounting">
                    School of Accounting
                  </option>
                  <option value="Faculty of Engineering">
                    Faculty of Engineering
                  </option>
                  <option value="Faculty of Humanities">
                    Faculty of Humanities
                  </option>
                  <option value="Faculty of Digital Communication and Hotel & Tourism">
                    Faculty of Digital Communication and Hotel & Tourism
                  </option>
                  <option value="BINUS Business School">
                    BINUS Business School
                  </option>
                  <option value="BINUS ASO School of Engineering">
                    BINUS ASO School of Engineering
                  </option>
                  <option value="School of Computing and Creative Arts">
                    School of Computing and Creative Arts (Binus International)
                  </option>
                  <option value="BINUS Graduate Program">
                    BINUS Graduate Program
                  </option>
                  <option value="BINUS Online Learning">
                    BINUS Online Learning
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Major <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileFormData.major}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      major: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={profileFormData.year}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                  <option value={6}>Year 6</option>
                  <option value={7}>Year 7</option>
                  <option value={8}>Year 8</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowProfileCompleteModal(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save & Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">
              Create New Group
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const description = formData.get("description") as string;

                try {
                  await groupsAPI.createGroup({
                    name,
                    description,
                    memberIds: selectedMembers.map((m) => m.id),
                  });
                  toast.success("Group created successfully!");
                  setShowCreateGroupModal(false);
                  setSelectedMembers([]);
                  setUserSearchQuery("");
                  await loadGroups();
                } catch (error) {
                  console.error("Error creating group:", error);
                  toast.error("Failed to create group");
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Enter group description"
                  />
                </div>

                {/* Member Selection */}
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Add Members (Optional)
                  </label>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setUserSearchQuery(query);
                      if (query.trim()) {
                        try {
                          const users = await usersAPI.getUsers(query);
                          setAvailableUsers(users);
                        } catch (error) {
                          console.error("Error searching users:", error);
                        }
                      } else {
                        setAvailableUsers([]);
                      }
                    }}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Search users by name or email..."
                  />

                  {/* Search Results */}
                  {userSearchQuery && availableUsers.length > 0 && (
                    <div className="mt-2 border border-light-gray rounded-lg max-h-48 overflow-y-auto">
                      {availableUsers
                        .filter(
                          (user) =>
                            !selectedMembers.find((m) => m.id === user.id)
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedMembers([...selectedMembers, user]);
                              setUserSearchQuery("");
                              setAvailableUsers([]);
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-light-gray last:border-b-0 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-blue to-medium-blue flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-dark-gray">
                                {user.name}
                              </div>
                              <div className="text-sm text-medium-gray">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Selected Members */}
                  {selectedMembers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-dark-gray">
                        Selected Members ({selectedMembers.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-light-blue px-3 py-1 rounded-full"
                          >
                            <span className="text-sm text-dark-gray">
                              {member.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMembers(
                                  selectedMembers.filter(
                                    (m) => m.id !== member.id
                                  )
                                )
                              }
                              className="text-medium-gray hover:text-dark-gray"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setSelectedMembers([]);
                    setUserSearchQuery("");
                  }}
                  className="flex-1 px-4 py-2 border border-light-gray text-medium-gray rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">
              Add Members to {groups.find((g) => g.id === selectedGroup)?.name}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (selectedMembers.length === 0) {
                  toast.error("Please select at least one member");
                  return;
                }

                try {
                  await groupsAPI.addMembers(
                    selectedGroup,
                    selectedMembers.map((m) => m.id)
                  );
                  toast.success("Members added successfully!");
                  setShowAddMembersModal(false);
                  setSelectedMembers([]);
                  setUserSearchQuery("");
                  await loadGroups();
                } catch (error) {
                  console.error("Error adding members:", error);
                  toast.error("Failed to add members");
                }
              }}
            >
              <div className="space-y-4">
                {/* Member Selection */}
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Search Users
                  </label>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setUserSearchQuery(query);
                      if (query.trim()) {
                        try {
                          const users = await usersAPI.getUsers(query);
                          setAvailableUsers(users);
                        } catch (error) {
                          console.error("Error searching users:", error);
                        }
                      } else {
                        setAvailableUsers([]);
                      }
                    }}
                    className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
                    placeholder="Search users by name or email..."
                  />

                  {/* Search Results */}
                  {userSearchQuery && availableUsers.length > 0 && (
                    <div className="mt-2 border border-light-gray rounded-lg max-h-48 overflow-y-auto">
                      {availableUsers
                        .filter(
                          (user) =>
                            !selectedMembers.find((m) => m.id === user.id)
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedMembers([...selectedMembers, user]);
                              setUserSearchQuery("");
                              setAvailableUsers([]);
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-light-gray last:border-b-0 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dark-blue to-medium-blue flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-dark-gray">
                                {user.name}
                              </div>
                              <div className="text-sm text-medium-gray">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Selected Members */}
                  {selectedMembers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-dark-gray">
                        Selected Members ({selectedMembers.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-light-blue px-3 py-1 rounded-full"
                          >
                            <span className="text-sm text-dark-gray">
                              {member.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMembers(
                                  selectedMembers.filter(
                                    (m) => m.id !== member.id
                                  )
                                )
                              }
                              className="text-medium-gray hover:text-dark-gray"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMembersModal(false);
                    setSelectedMembers([]);
                    setUserSearchQuery("");
                  }}
                  className="flex-1 px-4 py-2 border border-light-gray text-medium-gray rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Add Members
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member List Sidebar */}
      {showMemberListSidebar && selectedGroup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={() => setShowMemberListSidebar(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-light-gray p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-dark-gray">
                Group Members
              </h2>
              <button
                onClick={() => setShowMemberListSidebar(false)}
                className="p-2 text-medium-gray hover:text-dark-gray hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {groupMembers.length > 0 ? (
                groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dark-blue to-medium-blue flex items-center justify-center text-white font-semibold">
                      {member.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-dark-gray">
                        {member.user?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-medium-gray">
                        {member.user?.email || ""}
                      </div>
                      <div className="text-xs text-medium-gray mt-1">
                        {member.role === "admin" ? (
                          <span className="bg-dark-blue text-white px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-gray-300 text-dark-gray px-2 py-0.5 rounded-full">
                            Member
                          </span>
                        )}
                      </div>
                    </div>
                    {member.role !== "admin" &&
                      member.userId !== currentUser?.id && (
                        <button
                          onClick={() => {
                            setMemberToRemove({
                              userId: member.userId,
                              name: member.user?.name || "this member",
                            });
                            setShowRemoveMemberConfirm(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                  </div>
                ))
              ) : (
                <div className="text-center text-medium-gray py-8">
                  No members found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDeleteItem}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone and will permanently remove the item from the database."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon="trash"
      />

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveMemberConfirm}
        onClose={() => {
          setShowRemoveMemberConfirm(false);
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        description={`Are you sure you want to remove ${memberToRemove?.name} from the group?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        icon="user-minus"
      />

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-light-gray flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dark-gray">My Wishlist</h2>
              <button
                onClick={() => setShowWishlistModal(false)}
                className="text-medium-gray hover:text-dark-gray transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-dark-gray mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding items to your wishlist by clicking the heart
                    icon on marketplace items
                  </p>
                  <Button onClick={() => setShowWishlistModal(false)}>
                    Browse Marketplace
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistItems.map((wishlistItem: any) => {
                    const item = wishlistItem.item;
                    return (
                      <Card
                        key={wishlistItem.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowWishlistModal(false);
                        }}
                      >
                        <div className="relative">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(item.id);
                            }}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-red-500 hover:text-red-600 hover:bg-white transition-all shadow-sm z-10"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-dark-gray mb-1 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-medium-gray mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-dark-blue">
                              Rp {item.price.toLocaleString()}
                            </span>
                            <Badge variant="secondary">{item.category}</Badge>
                          </div>
                          <div className="mt-2 flex items-center text-xs text-medium-gray">
                            <User className="h-3 w-3 mr-1" />
                            {item.seller.name}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tutoring Form Component
function TutoringForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    subject: "",
    course: "",
    description: "",
    price: "",
    duration: "60",
    scheduledAt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.subject ||
      !formData.course ||
      !formData.description ||
      !formData.price ||
      !formData.scheduledAt
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit({
      ...formData,
      price: parseInt(formData.price),
      duration: parseInt(formData.duration),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Subject *
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          placeholder="e.g., Data Structures"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Course *
        </label>
        <input
          type="text"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          placeholder="e.g., COMP6048"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          rows={3}
          placeholder="Describe what you'll teach..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Price (Rp) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
            placeholder="100000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-gray mb-1">
            Duration (minutes)
          </label>
          <select
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
          >
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-gray mb-1">
          Scheduled Date & Time *
        </label>
        <input
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) =>
            setFormData({ ...formData, scheduledAt: e.target.value })
          }
          className="w-full p-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-campus-green text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors"
        >
          Offer Tutoring
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-light-gray text-medium-gray rounded-lg hover:bg-secondary-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Helper function to generate PDF thumbnail client-side
async function generatePdfThumbnailClientSide(file: File): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        };
        document.head.appendChild(script);
        await new Promise((res) => setTimeout(res, 1000));
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = (window as any).pdfjsLib.getDocument({
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const targetWidth = 800;
      const scale = targetWidth / canvas.width;
      const targetHeight = canvas.height * scale;

      const resizedCanvas = document.createElement("canvas");
      resizedCanvas.width = targetWidth;
      resizedCanvas.height = targetHeight;
      const resizedContext = resizedCanvas.getContext("2d");
      resizedContext?.drawImage(canvas, 0, 0, targetWidth, targetHeight);

      resizedCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.85
      );
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to generate Word document thumbnail with real content
async function generateWordThumbnailClientSide(fileUrl: string): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("fileUrl", fileUrl);

      const response = await fetch("/api/generate-word-thumbnail", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract Word content");
      }

      const data = await response.json();
      const lines = data.lines || [];

      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 1000);

      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(0, 0, 800, 60);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial";
      ctx.fillText("DOCX", 30, 38);

      ctx.fillStyle = "#000000";
      ctx.font = "16px Arial";

      let yPosition = 100;
      const lineHeight = 24;
      const maxWidth = 740;

      for (let i = 0; i < Math.min(lines.length, 25); i++) {
        const line = lines[i];
        if (line.length > 80) {
          const words = line.split(" ");
          let currentLine = "";

          for (const word of words) {
            const testLine = currentLine + word + " ";
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine !== "") {
              ctx.fillText(currentLine, 30, yPosition);
              yPosition += lineHeight;
              currentLine = word + " ";

              if (yPosition > 950) break;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine && yPosition <= 950) {
            ctx.fillText(currentLine, 30, yPosition);
            yPosition += lineHeight;
          }
        } else {
          ctx.fillText(line, 30, yPosition);
          yPosition += lineHeight;
        }

        if (yPosition > 950) break;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.85
      );
    } catch (error) {
      reject(error);
    }
  });
}

// Add Item Form Component
function AddItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Notes",
    course: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCompressionModal, setShowCompressionModal] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [compressionAttempts, setCompressionAttempts] = useState(0);
  const [isAnalyzingStudyMaterial, setIsAnalyzingStudyMaterial] =
    useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type - PDF, Word, and Images
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Only PDF, Word (DOC/DOCX), and image files (JPG/PNG) are allowed."
        );
        e.target.value = "";
        return;
      }

      setUploadedFile(file);

      await analyzeStudyMaterialWithAI(file);
    }
  };

  const analyzeStudyMaterialWithAI = async (file: File) => {
    try {
      setIsAnalyzingStudyMaterial(true);
      toast.info("Analyzing image with AI...", {
        duration: 2000,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "study");

      const response = await fetch("/api/ai-autofill", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const aiData = result.data;

        setFormData((prev) => ({
          ...prev,
          title: aiData.title || prev.title,
          description: aiData.description || prev.description,
          category: aiData.category || prev.category,
          course: aiData.course || prev.course,
        }));

        toast.success("Form auto-filled with AI suggestions!", {
          description: "Review and adjust the information as needed.",
        });
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("Could not analyze image", {
        description: "Please fill in the form manually.",
      });
    } finally {
      setIsAnalyzingStudyMaterial(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.course
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!uploadedFile) {
      toast.error("Please upload a file");
      return;
    }

    try {
      setUploading(true);
      let fileData = {};

      // Upload file (required)
      setUploadProgress(30);

      try {
        const uploadResult = await fileAPI.uploadFile(uploadedFile, false);
        setUploadProgress(60);

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error("Upload failed - no URL returned");
        }

        if (uploadResult.compressionInfo?.wasCompressed) {
          toast.success(
            `File compressed: ${(
              uploadResult.compressionInfo.originalSize /
              1024 /
              1024
            ).toFixed(2)}MB → ${(
              uploadResult.compressionInfo.finalSize /
              1024 /
              1024
            ).toFixed(
              2
            )}MB (${uploadResult.compressionInfo.compressionRatio.toFixed(
              1
            )}% reduction)`
          );
        }

        fileData = {
          fileUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileType: uploadResult.fileType,
        };

        if (uploadResult.fileType === "application/pdf") {
          try {
            setUploadProgress(70);
            const thumbnailBlob = await generatePdfThumbnailClientSide(
              uploadedFile
            );
            setUploadProgress(80);

            const thumbnailFormData = new FormData();
            thumbnailFormData.append(
              "file",
              thumbnailBlob,
              `thumbnail-${Date.now()}-${uploadResult.fileName.replace(
                ".pdf",
                ".jpg"
              )}`
            );
            thumbnailFormData.append("itemId", "temp");

            const thumbnailUploadResponse = await fetch(
              "/api/upload-thumbnail",
              {
                method: "POST",
                body: thumbnailFormData,
              }
            );

            if (thumbnailUploadResponse.ok) {
              const thumbnailData = await thumbnailUploadResponse.json();
              if (thumbnailData.success) {
                (fileData as any).thumbnailUrl = thumbnailData.thumbnailUrl;
              }
            }
          } catch (thumbError) {
            console.error("Thumbnail generation failed:", thumbError);
          }
        } else if (
          uploadResult.fileType === "application/msword" ||
          uploadResult.fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          try {
            setUploadProgress(70);
            const thumbnailBlob = await generateWordThumbnailClientSide(
              uploadResult.url
            );
            setUploadProgress(80);

            const thumbnailFormData = new FormData();
            thumbnailFormData.append(
              "file",
              thumbnailBlob,
              `thumbnail-${Date.now()}-${uploadResult.fileName.replace(
                /\.(doc|docx)$/i,
                ".jpg"
              )}`
            );
            thumbnailFormData.append("itemId", "temp");

            const thumbnailUploadResponse = await fetch(
              "/api/upload-thumbnail",
              {
                method: "POST",
                body: thumbnailFormData,
              }
            );

            if (thumbnailUploadResponse.ok) {
              const thumbnailData = await thumbnailUploadResponse.json();
              if (thumbnailData.success) {
                (fileData as any).thumbnailUrl = thumbnailData.thumbnailUrl;
              }
            }
          } catch (thumbError) {
            console.error("Word thumbnail generation failed:", thumbError);
          }
        }
      } catch (uploadError: any) {
        console.error("File upload error:", uploadError);

        if (uploadError.message?.includes("too large even after compression")) {
          if (uploadError.details) {
            const { originalSize, compressedSize } = uploadError.details;
            setCompressionInfo({
              originalSize,
              compressedSize,
              compressionRatio:
                ((originalSize - compressedSize) / originalSize) * 100,
            });
          }
          setPendingUploadFile(uploadedFile);
          setCompressionAttempts(1);
          setShowCompressionModal(true);
          setUploading(false);
          setUploadProgress(0);
          return;
        } else {
          throw new Error(
            uploadError.message || "Failed to upload file. Please try again."
          );
        }
      }

      setUploadProgress(90);

      await onSubmit({
        ...formData,
        price: parseInt(formData.price),
        ...fileData,
      });

      setUploadProgress(100);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to add item. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRecompress = async () => {
    if (!pendingUploadFile) return;

    setShowCompressionModal(false);
    setUploading(true);
    setUploadProgress(0);

    try {
      let fileData: any = {};

      try {
        setUploadProgress(10);
        const recompressResult = await fileAPI.uploadFile(
          pendingUploadFile,
          true
        );
        setUploadProgress(60);

        if (!recompressResult.success || !recompressResult.url) {
          throw new Error("Recompression failed");
        }

        if (recompressResult.compressionInfo?.wasCompressed) {
          toast.success(
            `File recompressed: ${(
              recompressResult.compressionInfo.originalSize /
              1024 /
              1024
            ).toFixed(2)}MB → ${(
              recompressResult.compressionInfo.finalSize /
              1024 /
              1024
            ).toFixed(
              2
            )}MB (${recompressResult.compressionInfo.compressionRatio.toFixed(
              1
            )}% reduction)`
          );
        }

        fileData = {
          fileUrl: recompressResult.url,
          fileName: recompressResult.fileName,
          fileSize: recompressResult.fileSize,
          fileType: recompressResult.fileType,
        };

        if (recompressResult.fileType === "application/pdf") {
          try {
            setUploadProgress(70);
            const thumbnailBlob = await generatePdfThumbnailClientSide(
              pendingUploadFile
            );
            setUploadProgress(80);

            const thumbnailFormData = new FormData();
            thumbnailFormData.append(
              "file",
              thumbnailBlob,
              `thumbnail-${Date.now()}-${recompressResult.fileName.replace(
                ".pdf",
                ".jpg"
              )}`
            );
            thumbnailFormData.append("itemId", "temp");

            const thumbnailUploadResponse = await fetch(
              "/api/upload-thumbnail",
              {
                method: "POST",
                body: thumbnailFormData,
              }
            );

            if (thumbnailUploadResponse.ok) {
              const thumbnailData = await thumbnailUploadResponse.json();
              if (thumbnailData.success) {
                (fileData as any).thumbnailUrl = thumbnailData.thumbnailUrl;
              }
            }
          } catch (thumbError) {
            console.error("PDF thumbnail generation failed:", thumbError);
          }
        } else if (
          recompressResult.fileType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          recompressResult.fileType === "application/msword"
        ) {
          try {
            setUploadProgress(70);
            const wordThumbnailFormData = new FormData();
            wordThumbnailFormData.append("file", pendingUploadFile);
            wordThumbnailFormData.append("itemId", "temp");

            const thumbnailResponse = await fetch("/api/upload-thumbnail", {
              method: "POST",
              body: wordThumbnailFormData,
            });

            if (thumbnailResponse.ok) {
              const thumbnailData = await thumbnailResponse.json();
              if (thumbnailData.success) {
                (fileData as any).thumbnailUrl = thumbnailData.thumbnailUrl;
              }
            }
          } catch (thumbError) {
            console.error("Word thumbnail generation failed:", thumbError);
          }
        }

        setUploadProgress(90);

        await onSubmit({
          ...formData,
          price: parseInt(formData.price),
          ...fileData,
        });

        setUploadProgress(100);
        setPendingUploadFile(null);
        setCompressionAttempts(0);
      } catch (recompressError: any) {
        console.error("Recompression error:", recompressError);

        if (
          recompressError.message?.includes("too large even after compression")
        ) {
          if (recompressError.details) {
            const { originalSize, compressedSize } = recompressError.details;
            setCompressionInfo({
              originalSize,
              compressedSize,
              compressionRatio:
                ((originalSize - compressedSize) / originalSize) * 100,
            });
          }
          setCompressionAttempts((prev) => prev + 1);
          setShowCompressionModal(true);
          setUploading(false);
          setUploadProgress(0);
          return;
        }

        toast.error(
          recompressError.message ||
            "Failed to recompress file. Please try reducing the file size manually."
        );
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label className="block text-xs font-medium text-dark-gray mb-0.5">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-2.5 py-1.5 text-sm border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue"
            placeholder="e.g., Data Structures Notes"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-gray mb-0.5">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-2.5 py-1.5 text-sm border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue"
            rows={2}
            placeholder="Describe your item..."
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-dark-gray mb-0.5">
              Price (Rp) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-gray mb-0.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue"
            >
              <option value="Notes">Notes</option>
              <option value="Assignment">Assignment</option>
              <option value="Book">Book</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-gray mb-0.5">
              Course *
            </label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) =>
                setFormData({ ...formData, course: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue"
              placeholder="e.g., COMP6048"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-dark-gray mb-0.5">
            Upload File (PDF, Word, or Image) *
            <span className="flex items-center gap-0.5 text-[10px] text-purple-600 font-normal">
              <Sparkles className="h-2.5 w-2.5" />
              AI Auto-fill enabled
            </span>
          </label>
          <div className="mt-0.5">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              className="w-full px-2 py-1 border border-light-gray rounded-md focus:outline-none focus:ring-1 focus:ring-dark-blue focus:border-dark-blue text-xs"
              required
            />
            {isAnalyzingStudyMaterial && (
              <div className="mt-1.5 p-1.5 bg-purple-50 border border-purple-200 rounded-md flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 text-purple-600 animate-spin" />
                <span className="text-xs text-purple-700">
                  Analyzing document with AI...
                </span>
              </div>
            )}
            {uploadedFile && !isAnalyzingStudyMaterial && (
              <div className="mt-1.5 p-1.5 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <FileText className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-700 truncate">
                    {uploadedFile.name}
                  </span>
                  <span className="text-[10px] text-green-600">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-medium-gray mt-0.5">
            AI will automatically analyze your file and fill in the form.
            Supports PDF, Word, and Image files. Max file size: 10MB.
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-medium-gray">Uploading...</span>
              <span className="text-dark-blue font-medium">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-dark-blue h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-dark-blue text-white px-3 py-1.5 text-sm rounded-md hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Add Item"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border border-light-gray text-medium-gray rounded-md hover:bg-secondary-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {showCompressionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-blue mb-2">
                  File is too large even after compression
                </h3>
                {compressionAttempts > 1 && (
                  <div className="mb-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      Compression attempt {compressionAttempts} - File is still
                      too large
                    </p>
                  </div>
                )}
                {compressionInfo && (
                  <div className="space-y-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-medium-gray">Original Size:</span>
                        <span className="font-medium text-dark-blue">
                          {(compressionInfo.originalSize / 1024 / 1024).toFixed(
                            2
                          )}{" "}
                          MB
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-medium-gray">
                          After Compression:
                        </span>
                        <span className="font-medium text-dark-blue">
                          {(
                            compressionInfo.compressedSize /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-medium-gray">Reduction:</span>
                        <span className="font-medium text-green-600">
                          {compressionInfo.compressionRatio.toFixed(1)}%
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-medium-gray">
                            Maximum Allowed:
                          </span>
                          <span className="font-medium text-red-600">
                            15.00 MB
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-medium-gray">
                      Would you like to try a more aggressive compression? This
                      may reduce quality but will make the file smaller.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRecompress}
                className="flex-1 bg-dark-blue text-white px-4 py-2.5 rounded-lg hover:bg-primary-800 transition-colors font-medium"
              >
                Compress More
              </button>
              <button
                onClick={() => {
                  setShowCompressionModal(false);
                  setPendingUploadFile(null);
                  setCompressionInfo(null);
                  setCompressionAttempts(0);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-medium-gray rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Wrapper component with Suspense boundary
export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
