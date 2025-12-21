"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { format } from "date-fns";

interface Conversation {
  id: string;
  lastMessage: string | null;
  lastMessageTime: string;
  createdAt: string;
  user1: {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  };
  user2: {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  };
  _count: {
    messages: number;
  };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

interface ConversationDetails {
  id: string;
  user1: {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  };
  user2: {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  };
  messages: Message[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ConversationsMonitor() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [pagination.page, search, dateRange]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        dateRange,
      });

      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/conversations?${params}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async (conversationId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(
        `/api/admin/conversations/${conversationId}`
      );
      const data = await response.json();

      if (data.success) {
        setSelectedConversation(data.conversation);
      }
    } catch (error) {
      console.error("Failed to load conversation details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Conversations Monitor
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} total conversations
          </p>
        </div>
        <button
          onClick={loadConversations}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-4 font-medium">Participants</th>
                  <th className="p-4 font-medium">Last Message</th>
                  <th className="p-4 font-medium">Messages</th>
                  <th className="p-4 font-medium">Last Activity</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : conversations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No conversations found
                    </td>
                  </tr>
                ) : (
                  conversations.map((conv) => (
                    <tr key={conv.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {conv.user1.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conv.user1.email}
                            </p>
                          </div>
                          <div className="text-gray-400">↔</div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {conv.user2.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conv.user2.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-600 truncate max-w-xs">
                          {conv.lastMessage || "No messages yet"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {conv._count.messages}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {conv.lastMessageTime
                          ? format(
                              new Date(conv.lastMessageTime),
                              "MMM dd, yyyy HH:mm"
                            )
                          : format(new Date(conv.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => loadConversationDetails(conv.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && conversations.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} conversations
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation Details Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Conversation Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedConversation.user1.name} ↔{" "}
                  {selectedConversation.user2.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : selectedConversation.messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No messages in this conversation
                </div>
              ) : (
                selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-gray-50 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {message.sender.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.sender.email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(message.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedConversation(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
