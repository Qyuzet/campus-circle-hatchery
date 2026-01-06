"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAIContext } from "@/contexts/AIContext";
import { usePageContext } from "@/contexts/PageContext";
import {
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  Sparkles,
  User,
  Languages,
  BarChart3,
  CheckSquare,
  Paperclip,
  Globe,
  ChevronRight,
  Search,
  Send,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHAT_HISTORY_KEY = "campusai_chat_history";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  reasoning?: string;
}

interface StoredMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  reasoning?: string;
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
  const [selectedSources, setSelectedSources] = useState({
    webSearch: true,
    appsIntegrations: true,
    allSources: true,
  });
  const [autoMode, setAutoMode] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMentions, setIsLoadingMentions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [typingReasoning, setTypingReasoning] = useState("");
  const [isTypingReasoning, setIsTypingReasoning] = useState(false);
  const [currentContext, setCurrentContext] = useState<string>("No context");
  const [contextDetails, setContextDetails] = useState<any>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const fetchMentionData = async () => {
    setIsLoadingMentions(true);
    try {
      const [notesRes, usersRes] = await Promise.all([
        fetch("/api/ai-notes"),
        fetch("/api/users"),
      ]);

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching mention data:", error);
    } finally {
      setIsLoadingMentions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.endsWith("@")) {
      setShowMentions(true);
      setSearchTerm("");
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
  };

  const handleMentionSelect = (item: any, type: "note" | "user") => {
    const mentionText = type === "note" ? `@${item.title}` : `@${item.name}`;
    const newInput = input.replace(/@$/, mentionText + " ");
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const typeText = async (text: string, callback: (char: string) => void) => {
    for (let i = 0; i < text.length; i++) {
      callback(text.substring(0, i + 1));
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: currentContext,
          contextDetails: contextDetails,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      setIsThinking(false);
      setIsTypingReasoning(true);
      setTypingReasoning("");

      await typeText(data.reasoning, setTypingReasoning);

      setIsTypingReasoning(false);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.content,
        timestamp: new Date(data.timestamp),
        reasoning: data.reasoning,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setTypingReasoning("");
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
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            <div className="space-y-1">
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
                          <p className="text-sm text-gray-800">
                            {message.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
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

            <div className="border-t border-gray-200 p-3 md:p-4 flex-shrink-0">
              <div className="relative">
                <div className="flex items-center gap-1.5 md:gap-2 mb-2">
                  <button
                    onClick={() => {
                      setShowMentions(!showMentions);
                      if (!showMentions) {
                        setInput(input + "@");
                      }
                    }}
                    className="p-1 md:p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Mention pages or users"
                  >
                    <span className="text-gray-500 text-xs md:text-sm font-medium">
                      @
                    </span>
                  </button>
                  <button
                    className="p-1 md:p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500" />
                  </button>
                  <div className="flex-1 bg-gray-50 px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs text-gray-600 truncate">
                    {currentContext}
                  </div>
                </div>

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
                      disabled={!input.trim()}
                      className="p-1.5 md:p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Send message"
                    >
                      <Send className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                    </button>
                  </div>
                </div>

                {showMentions && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto">
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {isLoadingMentions ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredNotes.length > 0 && (
                          <>
                            <div className="text-xs font-medium text-gray-500 px-2 py-1">
                              Pages
                            </div>
                            {filteredNotes.map((note) => (
                              <button
                                key={note.id}
                                onClick={() =>
                                  handleMentionSelect(note, "note")
                                }
                                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-left"
                              >
                                <Paperclip className="h-4 w-4 text-gray-600" />
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

                        {filteredUsers.length > 0 && (
                          <>
                            <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">
                              Users
                            </div>
                            {filteredUsers.slice(0, 5).map((user) => (
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

                        {filteredNotes.length === 0 &&
                          filteredUsers.length === 0 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                              No results found
                            </div>
                          )}
                      </div>
                    )}
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
