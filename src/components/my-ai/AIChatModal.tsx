"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAIContext } from "@/contexts/AIContext";
import { usePageContext } from "@/contexts/PageContext";
import {
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  User,
  Languages,
  BarChart3,
  CheckSquare,
  Paperclip,
  Globe,
  ChevronRight,
  ChevronLeft,
  Search,
  Send,
  Plus,
  FileText,
  Image,
  Calendar,
  ShoppingBag,
  BookOpen,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHAT_HISTORY_KEY = "campusai_chat_history";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // base64 for images, text content for documents
  url?: string;
}

interface MentionItem {
  id: string;
  title: string;
  type: "note" | "library" | "listing" | "event" | "user";
  content?: string;
  description?: string;
  aiMetadata?: any;
}

interface SearchSource {
  uri: string;
  title: string;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  reasoning?: string;
  attachments?: Attachment[];
  mentions?: MentionItem[];
  webSearchUsed?: boolean;
  searchSources?: SearchSource[];
}

interface StoredMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  reasoning?: string;
  attachments?: Attachment[];
  mentions?: MentionItem[];
}

interface MentionsData {
  notes: any[];
  library: any[];
  listings: any[];
  events: any[];
  users: any[];
}

interface AIChatModalProps {
  onClose: () => void;
}

type ChatView = "main" | "sources";

// Helper functions for localStorage persistence
const loadMessagesFromStorage = (): Message[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];
    const parsed: StoredMessage[] = JSON.parse(stored);
    return parsed.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
};

const saveMessagesToStorage = (messages: Message[]) => {
  if (typeof window === "undefined") return;
  try {
    const toStore: StoredMessage[] = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

export function AIChatModal({ onClose }: AIChatModalProps) {
  const pathname = usePathname();
  const { currentNote } = useAIContext();
  const { context: pageContext, getContextSummary } = usePageContext();
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatView, setChatView] = useState<ChatView>("main");
  const [showMentions, setShowMentions] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [input, setInput] = useState("");
  // Web search OFF by default - AI should prioritize local context
  const [selectedSources, setSelectedSources] = useState({
    webSearch: false,
    appsIntegrations: true,
    allSources: true,
  });
  const [autoMode, setAutoMode] = useState(true);
  const [mentionsData, setMentionsData] = useState<MentionsData>({
    notes: [],
    library: [],
    listings: [],
    events: [],
    users: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMentions, setIsLoadingMentions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [typingReasoning, setTypingReasoning] = useState("");
  const [isTypingReasoning, setIsTypingReasoning] = useState(false);

  // Multi-stage loading states
  type LoadingStage =
    | "idle"
    | "context"
    | "web-search"
    | "reasoning"
    | "generating";
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [currentContext, setCurrentContext] = useState<string>("No context");
  const [contextDetails, setContextDetails] = useState<any>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<MentionItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mentionCategory, setMentionCategory] = useState<
    "all" | "notes" | "library" | "listings" | "events" | "users"
  >("all");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    setHasLoadedHistory(true);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (hasLoadedHistory) {
      saveMessagesToStorage(messages);
    }
  }, [messages, hasLoadedHistory]);

  // Function to start a new chat
  const handleNewChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setChatView("main");
    toast.success("Started a new chat");
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (showMentions) {
      fetchMentionData();
    }
  }, [showMentions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchCurrentContext();
  }, [pathname, currentNote, pageContext]);

  const fetchCurrentContext = async () => {
    try {
      // Priority 1: Current note being viewed/edited
      if (currentNote) {
        setCurrentContext(currentNote.title || "Untitled");
        setContextDetails(currentNote);
        return;
      }

      // Priority 2: Page context from PageContextProvider
      if (pageContext) {
        setCurrentContext(pageContext.pageName);
        setContextDetails({
          ...pageContext,
          pageContextSummary: getContextSummary(),
        });
        return;
      }

      // Priority 3: Fallback to pathname-based context
      if (!pathname) {
        setCurrentContext("No context");
        return;
      }

      if (pathname.includes("/dashboard/my-ai")) {
        setCurrentContext("My AI");
      } else if (pathname.includes("/dashboard/marketplace")) {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get("mode");
        setCurrentContext(
          mode === "food"
            ? "Food Marketplace"
            : mode === "event"
            ? "Events"
            : "Study Marketplace"
        );
      } else if (pathname.includes("/dashboard/messages")) {
        setCurrentContext("Messages");
      } else if (pathname.includes("/dashboard/my-hub")) {
        setCurrentContext("My Hub");
      } else if (pathname.includes("/dashboard/wallet")) {
        setCurrentContext("Wallet");
      } else if (pathname.includes("/dashboard/clubs")) {
        setCurrentContext("Clubs");
      } else if (pathname.includes("/dashboard")) {
        setCurrentContext("Dashboard");
      } else {
        setCurrentContext("CampusCircle");
      }
    } catch (error) {
      console.error("Error fetching context:", error);
      setCurrentContext("No context");
    }
  };

  const fetchMentionData = async (search?: string) => {
    setIsLoadingMentions(true);
    try {
      const url = search
        ? `/api/ai/mentions?search=${encodeURIComponent(search)}`
        : "/api/ai/mentions";
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        setMentionsData(data);
      }
    } catch (error) {
      console.error("Error fetching mention data:", error);
    } finally {
      setIsLoadingMentions(false);
    }
  };

  // File handling functions
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(
          `File type "${file.type}" is not supported. Allowed: images, PDF, text, Word documents.`
        );
        continue;
      }

      try {
        let content: string | undefined;

        if (file.type.startsWith("image/")) {
          // Convert image to base64
          content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else if (
          file.type === "text/plain" ||
          file.type === "text/markdown"
        ) {
          // Read text content
          content = await file.text();
        } else if (
          file.type === "application/pdf" ||
          file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          // Read PDF/Word as base64 for server-side processing
          content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        newAttachments.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          content,
        });
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error(`Failed to process "${file.name}"`);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      toast.success(
        `Added ${newAttachments.length} file${
          newAttachments.length > 1 ? "s" : ""
        }`
      );
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.endsWith("@")) {
      setShowMentions(true);
      setSearchTerm("");
      fetchMentionData();
    } else if (!value.includes("@")) {
      setShowMentions(false);
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === "Escape" && showMentions) {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (
    item: any,
    type: "note" | "library" | "listing" | "event" | "user"
  ) => {
    const displayName =
      type === "user" ? item.name : item.title || item.name || "Untitled";
    const mentionText = `@${displayName}`;

    // Add to selected mentions for context
    const mentionItem: MentionItem = {
      id: item.id,
      title: displayName,
      type,
      content: item.content,
      description: item.description,
      aiMetadata: item.aiMetadata,
    };

    setSelectedMentions((prev) => {
      const exists = prev.some((m) => m.id === item.id && m.type === type);
      if (exists) return prev;
      return [...prev, mentionItem];
    });
    const newInput = input.replace(/@$/, mentionText + " ");
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const typeText = async (text: string, callback: (char: string) => void) => {
    // Much faster typing - 5ms per character (was 20ms)
    // Also type multiple characters at once for longer texts
    const charsPerStep = text.length > 100 ? 3 : text.length > 50 ? 2 : 1;
    for (let i = 0; i < text.length; i += charsPerStep) {
      callback(text.substring(0, Math.min(i + charsPerStep, text.length)));
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  };

  const removeMention = (id: string) => {
    setSelectedMentions((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      mentions: selectedMentions.length > 0 ? [...selectedMentions] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentAttachments = [...attachments];
    const currentMentions = [...selectedMentions];
    setInput("");
    setAttachments([]);
    setSelectedMentions([]);
    setIsThinking(true);

    // ALWAYS get fresh context summary to ensure follow-up questions have up-to-date data
    // This is critical because the pageContext might have been updated since the modal opened
    let freshContextDetails = contextDetails;
    if (pageContext) {
      const freshSummary = getContextSummary();
      freshContextDetails = {
        ...pageContext,
        pageContextSummary: freshSummary,
      };
    } else if (currentNote) {
      freshContextDetails = currentNote;
    }

    // Determine what sources are available/needed
    const hasNewMentions = currentMentions.length > 0;
    const hasNewAttachments = currentAttachments.length > 0;
    const isFirstMessage = messages.length === 0;
    const hasPageContext = !!freshContextDetails?.pageContextSummary;
    const hasLocalContext =
      hasNewMentions || hasPageContext || hasNewAttachments;

    // Web search: Always pass the user's setting to the backend
    // The AI will dynamically decide whether to use web search based on the question
    // This allows the AI to intelligently choose between local context and web search
    const shouldUseWebSearch = selectedSources.webSearch;

    // Only show "Reading AI context" if:
    // 1. This is the first message (need to load initial context), OR
    // 2. User added NEW mentions or attachments
    const needsToReadContext =
      (isFirstMessage && hasPageContext) || hasNewMentions || hasNewAttachments;

    // Show appropriate loading stage based on what we're actually doing
    if (needsToReadContext) {
      setLoadingStage("context");
      await new Promise((r) => setTimeout(r, 400));
    } else if (shouldUseWebSearch) {
      // Only show web search when no local context available
      setLoadingStage("web-search");
    } else {
      // For follow-up questions with existing context, go straight to thinking
      setLoadingStage("reasoning");
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: currentContext,
          contextDetails: freshContextDetails,
          attachments: currentAttachments,
          mentions: currentMentions,
          sourceSettings: {
            ...selectedSources,
            // Override: disable web search when user has specific mentions
            webSearch: shouldUseWebSearch,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      // Hide the loading bubble - reasoning text will show instead
      setLoadingStage("idle");
      setIsThinking(false);
      setIsTypingReasoning(true);
      setTypingReasoning("");

      await typeText(data.reasoning, setTypingReasoning);

      // Done with reasoning, hide it
      setIsTypingReasoning(false);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.content,
        timestamp: new Date(data.timestamp),
        reasoning: data.reasoning,
        webSearchUsed: data.webSearchUsed,
        searchSources: data.searchSources,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setTypingReasoning("");
      setLoadingStage("idle");
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error("Failed to get AI response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsThinking(false);
      setIsTypingReasoning(false);
      setTypingReasoning("");
      setLoadingStage("idle");
    }
  };

  // Filter mentions based on search term and category
  const getFilteredMentions = () => {
    const term = searchTerm.toLowerCase();
    const result: {
      notes: any[];
      library: any[];
      listings: any[];
      events: any[];
      users: any[];
    } = {
      notes: [],
      library: [],
      listings: [],
      events: [],
      users: [],
    };

    if (mentionCategory === "all" || mentionCategory === "notes") {
      result.notes = mentionsData.notes.filter(
        (n) =>
          n.title?.toLowerCase().includes(term) ||
          n.subject?.toLowerCase().includes(term)
      );
    }
    if (mentionCategory === "all" || mentionCategory === "library") {
      result.library = mentionsData.library.filter(
        (l) =>
          l.title?.toLowerCase().includes(term) ||
          l.category?.toLowerCase().includes(term)
      );
    }
    if (mentionCategory === "all" || mentionCategory === "listings") {
      result.listings = mentionsData.listings.filter(
        (l) =>
          l.title?.toLowerCase().includes(term) ||
          l.category?.toLowerCase().includes(term)
      );
    }
    if (mentionCategory === "all" || mentionCategory === "events") {
      result.events = mentionsData.events.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.location?.toLowerCase().includes(term)
      );
    }
    if (mentionCategory === "all" || mentionCategory === "users") {
      result.users = mentionsData.users.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.studentId?.toLowerCase().includes(term)
      );
    }

    return result;
  };

  const filteredMentions = getFilteredMentions();
  const hasAnyMentions =
    filteredMentions.notes.length > 0 ||
    filteredMentions.library.length > 0 ||
    filteredMentions.listings.length > 0 ||
    filteredMentions.events.length > 0 ||
    filteredMentions.users.length > 0;

  const quickActions = [
    {
      icon: User,
      label: "Personalize your Campus AI",
      badge: "New",
      action: () => toast.info("Personalization coming soon"),
    },
    {
      icon: Languages,
      label: "Translate this page",
      action: () => toast.info("Translation coming soon"),
    },
    {
      icon: BarChart3,
      label: "Analyze for insights",
      badge: "New",
      action: () => toast.info("Analysis coming soon"),
    },
    {
      icon: CheckSquare,
      label: "Create a task tracker",
      badge: "New",
      action: () => toast.info("Task tracker coming soon"),
    },
  ];

  const modalClasses = isMaximized
    ? "fixed inset-4 md:inset-8"
    : "fixed top-[120px] right-4 left-4 md:right-6 md:left-auto md:w-[420px] bottom-4 md:bottom-6";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div
        ref={modalRef}
        className={`${modalClasses} bg-white rounded-xl md:rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-200`}
      >
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
              title="Start new chat"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            {messages.length > 0 && (
              <span className="text-xs text-gray-400">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4 text-gray-600" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Close"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {chatView === "sources" ? (
          <div className="flex-1 overflow-y-auto">
            {/* Sources panel header with back button */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <button
                onClick={() => setChatView("main")}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to chat"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm font-medium text-gray-800">
                Search Settings
              </span>
            </div>

            <div className="p-3 md:p-4 space-y-1">
              <button
                onClick={() => {
                  setSelectedSources((prev) => ({
                    ...prev,
                    webSearch: !prev.webSearch,
                  }));
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Web search</span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    selectedSources.webSearch ? "bg-blue-600" : "bg-gray-300"
                  } relative`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      selectedSources.webSearch ? "right-1" : "left-1"
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedSources((prev) => ({
                    ...prev,
                    appsIntegrations: !prev.appsIntegrations,
                  }));
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Apps and integrations
                  </span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    selectedSources.appsIntegrations
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  } relative`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      selectedSources.appsIntegrations ? "right-1" : "left-1"
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => setChatView("main")}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">
                    All sources I can access
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <div className="border-t border-gray-200 my-2" />

              <p className="text-xs text-gray-500 px-3 py-2">
                Campus AI will only search information from the sources selected
                here.
              </p>

              <button
                onClick={() => setChatView("main")}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    All sources
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="text-center text-xs text-gray-400 mb-4">
                    Wednesday, Dec 31 • Campus AI
                  </div>

                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5 text-gray-700" />
                  </div>

                  <h2 className="text-base font-semibold text-gray-900 mb-1">
                    Your improved Campus AI
                  </h2>
                  <p className="text-xs text-gray-600 mb-4">
                    Here are a few things I can do, or ask me anything!
                  </p>

                  <div className="space-y-1.5">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <action.icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700 flex-1">
                          {action.label}
                        </span>
                        {action.badge && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                            {action.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center text-xs text-gray-400 mb-4">
                    Wednesday, Dec 31 • Campus AI
                  </div>

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.type === "ai" && (
                        <div className="flex-1">
                          {message.reasoning && (
                            <div className="mb-2 flex items-start gap-2">
                              <ChevronRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {message.reasoning}
                              </p>
                            </div>
                          )}
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                      {message.type === "user" && (
                        <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                          {/* Show attachments if any */}
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="mb-2">
                                {/* Image attachments - show thumbnails */}
                                {message.attachments.filter((att) =>
                                  att.type.startsWith("image/")
                                ).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {message.attachments
                                      .filter((att) =>
                                        att.type.startsWith("image/")
                                      )
                                      .map((att) => (
                                        <div
                                          key={att.id}
                                          className="relative group"
                                        >
                                          <img
                                            src={att.content || att.url}
                                            alt={att.name}
                                            className="max-w-[200px] max-h-[150px] rounded-lg object-cover border border-gray-200"
                                          />
                                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-b-lg truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                            {att.name}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                                {/* Non-image attachments - show as chips */}
                                {message.attachments.filter(
                                  (att) => !att.type.startsWith("image/")
                                ).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {message.attachments
                                      .filter(
                                        (att) => !att.type.startsWith("image/")
                                      )
                                      .map((att) => (
                                        <div
                                          key={att.id}
                                          className="flex items-center gap-1 bg-white rounded px-1.5 py-0.5 text-xs text-gray-600"
                                        >
                                          <FileText className="h-3 w-3" />
                                          <span className="max-w-[80px] truncate">
                                            {att.name}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          {/* Show mentions if any */}
                          {message.mentions && message.mentions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {message.mentions.map((m) => (
                                <span
                                  key={`${m.type}-${m.id}`}
                                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 text-xs"
                                >
                                  @{m.title}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-800">
                            {message.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Single dynamic loading status */}
                  {(isThinking || loadingStage !== "idle") && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {/* Context Stage */}
                          {loadingStage === "context" && (
                            <>
                              <BookOpen className="w-4 h-4 text-purple-500 animate-pulse" />
                              <span className="text-sm text-purple-600">
                                Reading AI context...
                              </span>
                              <div className="flex gap-1 ml-1">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                <div
                                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <div
                                  className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </div>
                            </>
                          )}

                          {/* Web Search Stage */}
                          {loadingStage === "web-search" && (
                            <>
                              <Globe className="w-4 h-4 text-blue-500 animate-spin" />
                              <span className="text-sm text-blue-600">
                                Fetching from web...
                              </span>
                              <div className="flex gap-1 ml-1">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                <div
                                  className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <div
                                  className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </div>
                            </>
                          )}

                          {/* Reasoning Stage */}
                          {loadingStage === "reasoning" && (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                              <span className="text-sm text-amber-600">
                                Thinking...
                              </span>
                              <div className="flex gap-1 ml-1">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                                <div
                                  className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <div
                                  className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </div>
                            </>
                          )}

                          {/* Generating Stage */}
                          {loadingStage === "generating" && (
                            <>
                              <Send className="w-4 h-4 text-green-500 animate-pulse" />
                              <span className="text-sm text-green-600">
                                Generating response...
                              </span>
                              <div className="flex gap-1 ml-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
                                <div
                                  className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <div
                                  className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </div>
                            </>
                          )}

                          {/* Default thinking (no specific stage) */}
                          {loadingStage === "idle" && isThinking && (
                            <>
                              <Sparkles className="w-4 h-4 text-gray-500 animate-pulse" />
                              <span className="text-sm text-gray-600">
                                Thinking...
                              </span>
                              <div className="flex gap-1 ml-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                <div
                                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <div
                                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isTypingReasoning && typingReasoning && (
                    <div className="flex justify-start">
                      <div className="flex-1">
                        <div className="mb-2 flex items-start gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {typingReasoning}
                            <span className="inline-block w-1 h-3 bg-gray-400 ml-0.5 animate-pulse" />
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div
              className={`border-t border-gray-200 p-3 md:p-4 flex-shrink-0 ${
                isDragging ? "bg-blue-50 border-blue-300" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(",")}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <div className="relative">
                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="mb-2">
                    {/* Image attachments - show thumbnails */}
                    {attachments.filter((f) => f.type.startsWith("image/"))
                      .length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {attachments
                          .filter((f) => f.type.startsWith("image/"))
                          .map((file) => (
                            <div key={file.id} className="relative group">
                              <img
                                src={file.content}
                                alt={file.name}
                                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                              />
                              <button
                                onClick={() => removeAttachment(file.id)}
                                className="absolute -top-1 -right-1 p-0.5 bg-gray-800 hover:bg-gray-700 rounded-full shadow-sm"
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                    {/* Non-image attachments - show as chips */}
                    {attachments.filter((f) => !f.type.startsWith("image/"))
                      .length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments
                          .filter((f) => !f.type.startsWith("image/"))
                          .map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs"
                            >
                              <FileText className="h-3.5 w-3.5 text-gray-500" />
                              <span className="max-w-[100px] truncate text-gray-700">
                                {file.name}
                              </span>
                              <button
                                onClick={() => removeAttachment(file.id)}
                                className="p-0.5 hover:bg-gray-200 rounded"
                              >
                                <X className="h-3 w-3 text-gray-500" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected mentions preview */}
                {selectedMentions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedMentions.map((mention) => (
                      <div
                        key={`${mention.type}-${mention.id}`}
                        className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-xs"
                      >
                        {mention.type === "note" && (
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {mention.type === "library" && (
                          <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {mention.type === "listing" && (
                          <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {mention.type === "event" && (
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {mention.type === "user" && (
                          <User className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span className="max-w-[120px] truncate text-blue-700">
                          @{mention.title}
                        </span>
                        <button
                          onClick={() => removeMention(mention.id)}
                          className="p-0.5 hover:bg-blue-100 rounded"
                        >
                          <X className="h-3 w-3 text-blue-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 md:gap-2 mb-2">
                  <button
                    onClick={() => {
                      setShowMentions(!showMentions);
                      if (!showMentions) {
                        setInput(input + "@");
                        fetchMentionData();
                      }
                    }}
                    className={`p-1 md:p-1.5 rounded transition-colors ${
                      showMentions
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    title="Mention notes, items, events, or users"
                  >
                    <span className="text-xs md:text-sm font-medium">@</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 md:p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Attach file (images, PDF, text)"
                  >
                    <Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
                  </button>
                  <div className="flex-1 bg-gray-50 px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs text-gray-600 truncate">
                    {currentContext}
                  </div>
                </div>

                {/* Drag overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-blue-600 font-medium">
                        Drop files here
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask, search, or make anything..."
                    className="w-full px-2.5 md:px-3 py-2 text-xs md:text-sm focus:outline-none resize-none bg-transparent"
                    rows={2}
                  />

                  <div className="flex items-center justify-between px-2.5 md:px-3 pb-2 pt-1">
                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={() => setAutoMode(!autoMode)}
                        className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-600" />
                        <span className="text-[10px] md:text-xs text-gray-600">
                          Auto
                        </span>
                      </button>
                      <button
                        onClick={() => setChatView("sources")}
                        className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Globe className="h-3 w-3 md:h-3.5 md:w-3.5 text-gray-600" />
                        <span className="text-[10px] md:text-xs text-gray-600">
                          All sources
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() && attachments.length === 0}
                      className="p-1.5 md:p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Send message"
                    >
                      <Send className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                    </button>
                  </div>
                </div>

                {showMentions && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden z-20">
                    {/* Category tabs */}
                    <div className="flex border-b border-gray-100 px-2 pt-2 gap-1 overflow-x-auto">
                      {(
                        [
                          "all",
                          "notes",
                          "library",
                          "listings",
                          "events",
                          "users",
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setMentionCategory(cat)}
                          className={`px-2 py-1 text-xs rounded-t whitespace-nowrap transition-colors ${
                            mentionCategory === cat
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="p-2">
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto">
                        {isLoadingMentions ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : !hasAnyMentions ? (
                          <div className="text-center py-4 text-sm text-gray-500">
                            No results found
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {/* Notes */}
                            {filteredMentions.notes.length > 0 && (
                              <>
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  My Notes
                                </div>
                                {filteredMentions.notes.map((note) => (
                                  <button
                                    key={note.id}
                                    onClick={() =>
                                      handleMentionSelect(note, "note")
                                    }
                                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-left"
                                  >
                                    <FileText className="h-4 w-4 text-purple-500" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-gray-700 truncate">
                                        {note.title}
                                      </div>
                                      {note.subject && (
                                        <div className="text-xs text-gray-500 truncate">
                                          {note.subject}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Library items */}
                            {filteredMentions.library.length > 0 && (
                              <>
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2 flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  My Library
                                </div>
                                {filteredMentions.library.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() =>
                                      handleMentionSelect(item, "library")
                                    }
                                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-left"
                                  >
                                    <BookOpen className="h-4 w-4 text-green-500" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-gray-700 truncate">
                                        {item.title}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {item.category}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* My listings */}
                            {filteredMentions.listings.length > 0 && (
                              <>
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2 flex items-center gap-1">
                                  <ShoppingBag className="h-3 w-3" />
                                  My Listings
                                </div>
                                {filteredMentions.listings.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() =>
                                      handleMentionSelect(item, "listing")
                                    }
                                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-left"
                                  >
                                    <ShoppingBag className="h-4 w-4 text-orange-500" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-gray-700 truncate">
                                        {item.title}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {item.category} - Rp{" "}
                                        {item.price?.toLocaleString()}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Events */}
                            {filteredMentions.events.length > 0 && (
                              <>
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  My Events
                                </div>
                                {filteredMentions.events.map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() =>
                                      handleMentionSelect(event, "event")
                                    }
                                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-left"
                                  >
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-gray-700 truncate">
                                        {event.title}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {event.location ||
                                          new Date(
                                            event.startDate
                                          ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Users */}
                            {filteredMentions.users.length > 0 && (
                              <>
                                <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2 flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Users
                                </div>
                                {filteredMentions.users
                                  .slice(0, 5)
                                  .map((user) => (
                                    <button
                                      key={user.id}
                                      onClick={() =>
                                        handleMentionSelect(user, "user")
                                      }
                                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-left"
                                    >
                                      <User className="h-4 w-4 text-gray-600" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-700 truncate">
                                          {user.name}
                                        </div>
                                        {user.studentId && (
                                          <div className="text-xs text-gray-500 truncate">
                                            {user.studentId}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
