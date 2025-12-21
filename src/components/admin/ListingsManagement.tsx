"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  UtensilsCrossed,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  createdAt: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  organizerUser?: {
    id: string;
    name: string;
    email: string;
  };
  tutor?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    participants: number;
  };
  startDate?: string;
  subject?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ListingType = "marketplace" | "food" | "events" | "tutoring";

export default function ListingsManagement() {
  const [activeTab, setActiveTab] = useState<ListingType>("marketplace");
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadListings();
  }, [activeTab, pagination.page, search, statusFilter]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeTab,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/admin/listings?${params}`);
      const data = await response.json();

      if (data.success) {
        setListings(data.listings);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to load listings:", error);
    } finally {
      setLoading(false);
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

  const handleTabChange = (tab: ListingType) => {
    setActiveTab(tab);
    setSearch("");
    setSearchInput("");
    setStatusFilter("");
    setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700";
      case "sold":
        return "bg-gray-100 text-gray-700";
      case "unavailable":
        return "bg-red-100 text-red-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "ongoing":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const tabs = [
    { id: "marketplace" as ListingType, name: "Marketplace", icon: Package },
    { id: "food" as ListingType, name: "Food", icon: UtensilsCrossed },
    { id: "events" as ListingType, name: "Events", icon: Calendar },
    { id: "tutoring" as ListingType, name: "Tutoring", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Listings Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} total {activeTab} listings
          </p>
        </div>
        <button
          onClick={loadListings}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
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
                  placeholder={`Search ${activeTab} by title...`}
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {activeTab === "marketplace" || activeTab === "food" ? (
                <>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="unavailable">Unavailable</option>
                </>
              ) : activeTab === "events" ? (
                <>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-4 font-medium">
                    {activeTab === "tutoring" ? "Subject" : "Title"}
                  </th>
                  <th className="p-4 font-medium">
                    {activeTab === "events"
                      ? "Organizer"
                      : activeTab === "tutoring"
                      ? "Tutor"
                      : "Seller"}
                  </th>
                  <th className="p-4 font-medium">Price</th>
                  {activeTab === "events" && (
                    <th className="p-4 font-medium">Participants</th>
                  )}
                  {activeTab === "events" && (
                    <th className="p-4 font-medium">Date</th>
                  )}
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={activeTab === "events" ? 7 : 5}
                      className="p-8 text-center"
                    >
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "events" ? 7 : 5}
                      className="p-8 text-center text-gray-500"
                    >
                      No listings found
                    </td>
                  </tr>
                ) : (
                  listings.map((listing) => {
                    const owner =
                      listing.seller || listing.organizerUser || listing.tutor;
                    return (
                      <tr
                        key={listing.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <p className="font-medium text-gray-900">
                            {activeTab === "tutoring"
                              ? listing.subject
                              : listing.title}
                          </p>
                        </td>
                        <td className="p-4">
                          {owner ? (
                            <>
                              <p className="text-gray-900">{owner.name}</p>
                              <p className="text-xs text-gray-500">
                                {owner.email}
                              </p>
                            </>
                          ) : (
                            <p className="text-gray-500">-</p>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-gray-900">
                          Rp {listing.price.toLocaleString()}
                        </td>
                        {activeTab === "events" && (
                          <td className="p-4 text-gray-600">
                            {listing._count?.participants || 0}
                          </td>
                        )}
                        {activeTab === "events" && (
                          <td className="p-4 text-gray-600">
                            {listing.startDate
                              ? format(
                                  new Date(listing.startDate),
                                  "MMM dd, yyyy"
                                )
                              : "-"}
                          </td>
                        )}
                        <td className="p-4">
                          <Badge className={getStatusColor(listing.status)}>
                            {listing.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-600">
                          {format(new Date(listing.createdAt), "MMM dd, yyyy")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && listings.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} listings
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
    </div>
  );
}
