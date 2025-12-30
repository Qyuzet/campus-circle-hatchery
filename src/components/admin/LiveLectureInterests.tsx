"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Mic,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LiveLectureInterest {
  id: string;
  userId: string;
  email: string;
  name: string;
  faculty: string;
  major: string;
  useCase: string;
  frequency: string;
  features: string[];
  preferredPricing: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    faculty: string;
    major: string;
    studentId: string;
  };
}

interface PricingStats {
  preferredPricing: string | null;
  _count: {
    preferredPricing: number;
  };
}

interface FrequencyStats {
  frequency: string;
  _count: {
    frequency: number;
  };
}

export default function LiveLectureInterests() {
  const [interests, setInterests] = useState<LiveLectureInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pricingStats, setPricingStats] = useState<PricingStats[]>([]);
  const [frequencyStats, setFrequencyStats] = useState<FrequencyStats[]>([]);
  const [selectedInterest, setSelectedInterest] =
    useState<LiveLectureInterest | null>(null);

  const loadInterests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/live-lecture-interests?page=${page}&limit=20`
      );
      const data = await response.json();

      if (data.success) {
        setInterests(data.interests);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
        setPricingStats(data.stats.pricing);
        setFrequencyStats(data.stats.frequency);
      }
    } catch (error) {
      console.error("Failed to load interests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
  }, [page]);

  const getPricingLabel = (pricing: string | null) => {
    if (!pricing) return "Not selected";
    const labels: Record<string, string> = {
      free: "Free",
      starter: "Starter (50k)",
      student: "Student (200k)",
      premium: "Premium (500k)",
    };
    return labels[pricing] || pricing;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "2-3 times/week",
      occasionally: "Occasionally",
      rarely: "Rarely",
    };
    return labels[frequency] || frequency;
  };

  const filteredInterests = useMemo(
    () =>
      interests.filter(
        (interest) =>
          interest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interest.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interest.major.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [interests, searchQuery]
  );

  const mostPopularPricing = useMemo(() => {
    if (pricingStats.length === 0) return "N/A";
    const sorted = [...pricingStats].sort(
      (a, b) => b._count.preferredPricing - a._count.preferredPricing
    );
    return getPricingLabel(sorted[0]?.preferredPricing);
  }, [pricingStats]);

  const mostCommonFrequency = useMemo(() => {
    if (frequencyStats.length === 0) return "N/A";
    const sorted = [...frequencyStats].sort(
      (a, b) => b._count.frequency - a._count.frequency
    );
    return getFrequencyLabel(sorted[0]?.frequency);
  }, [frequencyStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Live Lecture Interests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {total} total submissions
          </p>
        </div>
        <button
          onClick={loadInterests}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interests</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Most Popular Pricing</p>
              <p className="text-lg font-bold text-gray-900">
                {mostPopularPricing}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Most Common Frequency</p>
              <p className="text-lg font-bold text-gray-900">
                {mostCommonFrequency}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, faculty, or major..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Faculty / Major
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Frequency
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Pricing
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Features
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Submitted
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-gray-600">Loading interests...</p>
                  </td>
                </tr>
              ) : filteredInterests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No interests found
                  </td>
                </tr>
              ) : (
                filteredInterests.map((interest) => (
                  <tr key={interest.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {interest.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {interest.user.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {interest.user.studentId}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {interest.faculty}
                        </p>
                        <p className="text-gray-600">{interest.major}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {getFrequencyLabel(interest.frequency)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          interest.preferredPricing === "student"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {getPricingLabel(interest.preferredPricing)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">
                        {interest.features.length} selected
                      </p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {format(new Date(interest.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedInterest(interest)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedInterest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInterest(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Interest Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  User Information
                </label>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Name: {selectedInterest.user.name}</p>
                  <p>Email: {selectedInterest.user.email}</p>
                  <p>Student ID: {selectedInterest.user.studentId}</p>
                  <p>Faculty: {selectedInterest.faculty}</p>
                  <p>Major: {selectedInterest.major}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Use Case
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedInterest.useCase}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Usage Frequency
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {getFrequencyLabel(selectedInterest.frequency)}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Preferred Pricing
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {getPricingLabel(selectedInterest.preferredPricing)}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Selected Features ({selectedInterest.features.length})
                </label>
                <ul className="mt-1 space-y-1">
                  {selectedInterest.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Submitted At
                </label>
                <p className="mt-1 text-sm text-gray-600">
                  {format(
                    new Date(selectedInterest.createdAt),
                    "MMMM dd, yyyy 'at' HH:mm"
                  )}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedInterest(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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
