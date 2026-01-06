"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface MarketplaceItemContext {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  course?: string;
  sellerName?: string;
  rating?: number;
  status?: string;
  aiMetadata?: {
    contentSummary?: string;
    keywords?: string[];
    topics?: string[];
    academicLevel?: string;
    subject?: string;
  };
}

export interface FoodItemContext {
  id: string;
  title: string;
  description: string;
  price: number;
  location?: string;
  sellerName?: string;
  status?: string;
  isHalal?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  category?: string;
  foodType?: string;
  aiMetadata?: {
    contentSummary?: string;
    keywords?: string[];
    cuisine?: string;
  };
}

export interface EventContext {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  organizerName?: string;
  price?: number;
  capacity?: number;
  registeredCount?: number;
  category?: string;
  eventType?: string;
  isOnline?: boolean;
  aiMetadata?: {
    contentSummary?: string;
    keywords?: string[];
  };
}

export interface ClubContext {
  id: string;
  name: string;
  description: string;
  category?: string;
  memberCount?: number;
  isJoined?: boolean;
}

export interface NoteContext {
  id: string;
  title: string;
  content?: string;
  subject?: string;
  course?: string;
  tags?: string[];
}

export interface UserListingContext {
  id: string;
  title: string;
  type: "marketplace" | "food" | "event";
  status?: string;
  price?: number;
}

export interface PageContextMetadata {
  pageName: string;
  pageDescription: string;
  currentSection?: string;

  // Marketplace context
  marketplaceItems?: MarketplaceItemContext[];
  selectedMarketplaceItem?: MarketplaceItemContext;

  // Food context
  foodItems?: FoodItemContext[];
  selectedFoodItem?: FoodItemContext;

  // Events context
  events?: EventContext[];
  selectedEvent?: EventContext;

  // Clubs context
  clubs?: ClubContext[];
  myClubs?: ClubContext[];
  selectedClub?: ClubContext;

  // Notes context
  notes?: NoteContext[];
  selectedNote?: NoteContext;

  // User's own listings
  myListings?: UserListingContext[];

  // Search/filter state
  searchQuery?: string;
  activeFilters?: string[];

  // User context
  userWishlistCount?: number;
  userPurchasedItemIds?: string[];

  // Statistics
  stats?: Record<string, number | string>;

  // Custom data for specific pages
  customData?: Record<string, any>;
}

interface PageContextType {
  context: PageContextMetadata | null;
  setPageContext: (context: PageContextMetadata) => void;
  updatePageContext: (updates: Partial<PageContextMetadata>) => void;
  clearPageContext: () => void;
  getContextSummary: () => string;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<PageContextMetadata | null>(null);

  const setPageContext = useCallback((newContext: PageContextMetadata) => {
    setContext(newContext);
  }, []);

  const updatePageContext = useCallback(
    (updates: Partial<PageContextMetadata>) => {
      setContext((prev) => (prev ? { ...prev, ...updates } : null));
    },
    []
  );

  const clearPageContext = useCallback(() => {
    setContext(null);
  }, []);

  const getContextSummary = useCallback((): string => {
    if (!context) return "No page context available.";

    let summary = `## Current Page: ${context.pageName}\n`;
    summary += `${context.pageDescription}\n`;

    if (context.currentSection) {
      summary += `Active Section: ${context.currentSection}\n`;
    }

    if (context.searchQuery) {
      summary += `User's Search Query: "${context.searchQuery}"\n`;
    }

    if (context.activeFilters?.length) {
      summary += `Active Filters: ${context.activeFilters.join(", ")}\n`;
    }

    // FULL Marketplace items data - include each item with details AND AI content summary
    if (context.marketplaceItems?.length) {
      summary += `\n## STUDY MATERIALS LIST (${context.marketplaceItems.length} items)\n`;
      summary += `Each item includes its AI-analyzed content summary. Use this to answer questions about what each study material contains.\n\n`;
      context.marketplaceItems.forEach((item, index) => {
        summary += `${index + 1}. "${item.title}"\n`;
        summary += `   - Price: Rp ${item.price.toLocaleString()}\n`;
        summary += `   - Category: ${item.category}\n`;
        if (item.course) summary += `   - Course: ${item.course}\n`;
        if (item.sellerName) summary += `   - Seller: ${item.sellerName}\n`;
        if (item.rating) summary += `   - Rating: ${item.rating}/5\n`;
        // Include AI content summary - this tells the AI what the material actually contains
        if (item.aiMetadata?.contentSummary) {
          summary += `   - CONTENT: ${item.aiMetadata.contentSummary}\n`;
        } else if (item.description) {
          summary += `   - Description: ${item.description}\n`;
        }
        if (item.aiMetadata?.topics?.length) {
          summary += `   - Topics: ${item.aiMetadata.topics.join(", ")}\n`;
        }
        if (item.aiMetadata?.keywords?.length) {
          summary += `   - Keywords: ${item.aiMetadata.keywords.join(", ")}\n`;
        }
        summary += `\n`;
      });
    }

    // Currently selected item with FULL details
    if (context.selectedMarketplaceItem) {
      const item = context.selectedMarketplaceItem;
      summary += `\n## CURRENTLY VIEWING STUDY MATERIAL\n`;
      summary += `Title: ${item.title}\n`;
      summary += `Price: Rp ${item.price.toLocaleString()}\n`;
      summary += `Category: ${item.category}\n`;
      summary += `Description: ${item.description}\n`;
      if (item.course) summary += `Course: ${item.course}\n`;
      if (item.sellerName) summary += `Seller: ${item.sellerName}\n`;
      if (item.rating) summary += `Rating: ${item.rating}/5\n`;
      if (item.aiMetadata) {
        if (item.aiMetadata.contentSummary) {
          summary += `AI Summary: ${item.aiMetadata.contentSummary}\n`;
        }
        if (item.aiMetadata.topics?.length) {
          summary += `Topics: ${item.aiMetadata.topics.join(", ")}\n`;
        }
      }
    }

    // FULL Food items data with AI content
    if (context.foodItems?.length) {
      summary += `\n## FOOD ITEMS LIST (${context.foodItems.length} items)\n`;
      summary += `Each item includes AI-analyzed content. Use this to answer questions about the food.\n\n`;
      context.foodItems.forEach((item, index) => {
        summary += `${index + 1}. "${item.title}"\n`;
        summary += `   - Price: Rp ${item.price.toLocaleString()}\n`;
        if (item.category) summary += `   - Category: ${item.category}\n`;
        if (item.location)
          summary += `   - Pickup Location: ${item.location}\n`;
        if (item.sellerName) summary += `   - Seller: ${item.sellerName}\n`;
        if (item.isHalal) summary += `   - Halal: Yes\n`;
        if (item.isVegetarian) summary += `   - Vegetarian: Yes\n`;
        if (item.isVegan) summary += `   - Vegan: Yes\n`;
        // Include AI content summary
        if (item.aiMetadata?.contentSummary) {
          summary += `   - CONTENT: ${item.aiMetadata.contentSummary}\n`;
        } else if (item.description) {
          summary += `   - Description: ${item.description}\n`;
        }
        if (item.aiMetadata?.keywords?.length) {
          summary += `   - Keywords: ${item.aiMetadata.keywords.join(", ")}\n`;
        }
        summary += `\n`;
      });
    }

    if (context.selectedFoodItem) {
      const item = context.selectedFoodItem;
      summary += `\n## CURRENTLY VIEWING FOOD ITEM\n`;
      summary += `Title: ${item.title}\n`;
      summary += `Price: Rp ${item.price.toLocaleString()}\n`;
      summary += `Description: ${item.description}\n`;
      if (item.location) summary += `Pickup Location: ${item.location}\n`;
      if (item.sellerName) summary += `Seller: ${item.sellerName}\n`;
      summary += `Halal: ${item.isHalal ? "Yes" : "No"}\n`;
      summary += `Vegetarian: ${item.isVegetarian ? "Yes" : "No"}\n`;
    }

    // FULL Events data with AI content
    if (context.events?.length) {
      summary += `\n## EVENTS LIST (${context.events.length} events)\n`;
      summary += `Each event includes AI-analyzed content. Use this to answer questions about events.\n\n`;
      context.events.forEach((event, index) => {
        summary += `${index + 1}. "${event.title}"\n`;
        if (event.date) summary += `   - Date: ${event.date}\n`;
        summary += `   - Price: ${
          event.price ? `Rp ${event.price.toLocaleString()}` : "Free"
        }\n`;
        if (event.location) summary += `   - Location: ${event.location}\n`;
        if (event.organizerName)
          summary += `   - Organizer: ${event.organizerName}\n`;
        if (event.capacity) {
          summary += `   - Capacity: ${event.registeredCount || 0}/${
            event.capacity
          } registered\n`;
        }
        if (event.category) summary += `   - Category: ${event.category}\n`;
        if (event.isOnline) summary += `   - Format: Online\n`;
        // Include AI content summary
        if (event.aiMetadata?.contentSummary) {
          summary += `   - CONTENT: ${event.aiMetadata.contentSummary}\n`;
        } else if (event.description) {
          summary += `   - Description: ${event.description}\n`;
        }
        if (event.aiMetadata?.keywords?.length) {
          summary += `   - Keywords: ${event.aiMetadata.keywords.join(", ")}\n`;
        }
        summary += `\n`;
      });
    }

    if (context.selectedEvent) {
      const event = context.selectedEvent;
      summary += `\n## CURRENTLY VIEWING EVENT\n`;
      summary += `Title: ${event.title}\n`;
      summary += `Description: ${event.description}\n`;
      if (event.date) summary += `Date: ${event.date}\n`;
      if (event.location) summary += `Location: ${event.location}\n`;
      if (event.organizerName) summary += `Organizer: ${event.organizerName}\n`;
      summary += `Price: ${
        event.price ? `Rp ${event.price.toLocaleString()}` : "Free"
      }\n`;
      if (event.capacity) {
        summary += `Registration: ${event.registeredCount || 0}/${
          event.capacity
        }\n`;
      }
    }

    // FULL Clubs data
    if (context.clubs?.length) {
      summary += `\n## CLUBS LIST (${context.clubs.length} clubs)\n`;
      context.clubs.forEach((club, index) => {
        summary += `${index + 1}. "${club.name}"${
          club.isJoined ? " [JOINED]" : ""
        }\n`;
        if (club.category) summary += `   - Category: ${club.category}\n`;
        if (club.memberCount) summary += `   - Members: ${club.memberCount}\n`;
        if (club.description) {
          summary += `   - Description: ${club.description.substring(0, 100)}${
            club.description.length > 100 ? "..." : ""
          }\n`;
        }
        summary += `\n`;
      });
    }

    if (context.myClubs?.length) {
      summary += `\n## USER'S JOINED CLUBS (${context.myClubs.length})\n`;
      context.myClubs.forEach((club) => {
        summary += `- ${club.name}`;
        if (club.category) summary += ` (${club.category})`;
        summary += `\n`;
      });
    }

    if (context.selectedClub) {
      const club = context.selectedClub;
      summary += `\n## CURRENTLY VIEWING CLUB\n`;
      summary += `Name: ${club.name}\n`;
      summary += `Description: ${club.description}\n`;
      if (club.category) summary += `Category: ${club.category}\n`;
      if (club.memberCount) summary += `Members: ${club.memberCount}\n`;
      summary += `Membership: ${club.isJoined ? "Joined" : "Not a member"}\n`;
    }

    // FULL Notes data
    if (context.notes?.length) {
      summary += `\n## USER'S AI NOTES (${context.notes.length} notes)\n`;
      context.notes.forEach((note, index) => {
        summary += `${index + 1}. "${note.title}"\n`;
        if (note.subject) summary += `   - Subject: ${note.subject}\n`;
        if (note.course) summary += `   - Course: ${note.course}\n`;
        if (note.tags?.length)
          summary += `   - Tags: ${note.tags.join(", ")}\n`;
        if (note.content) {
          summary += `   - Preview: ${note.content.substring(0, 100)}${
            note.content.length > 100 ? "..." : ""
          }\n`;
        }
        summary += `\n`;
      });
    }

    if (context.selectedNote) {
      const note = context.selectedNote;
      summary += `\n## CURRENTLY VIEWING NOTE\n`;
      summary += `Title: ${note.title}\n`;
      if (note.subject) summary += `Subject: ${note.subject}\n`;
      if (note.course) summary += `Course: ${note.course}\n`;
      if (note.tags?.length) summary += `Tags: ${note.tags.join(", ")}\n`;
      if (note.content) {
        summary += `Content:\n${note.content.substring(0, 1000)}${
          note.content.length > 1000 ? "..." : ""
        }\n`;
      }
    }

    // User's own listings
    if (context.myListings?.length) {
      summary += `\n## USER'S OWN LISTINGS (${context.myListings.length})\n`;
      context.myListings.forEach((listing) => {
        summary += `- "${listing.title}" (${listing.type})`;
        if (listing.price) summary += ` - Rp ${listing.price.toLocaleString()}`;
        if (listing.status) summary += ` [${listing.status}]`;
        summary += `\n`;
      });
    }

    // Statistics
    if (context.stats && Object.keys(context.stats).length) {
      summary += `\n## PAGE STATISTICS\n`;
      Object.entries(context.stats).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
        summary += `- ${formattedKey}: ${value}\n`;
      });
    }

    return summary;
  }, [context]);

  return (
    <PageContext.Provider
      value={{
        context,
        setPageContext,
        updatePageContext,
        clearPageContext,
        getContextSummary,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePageContext must be used within a PageContextProvider");
  }
  return context;
}
