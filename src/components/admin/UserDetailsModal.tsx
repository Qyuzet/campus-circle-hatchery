"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";

interface UserDetailsModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserDetailsModal({
  userId,
  onClose,
}: UserDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Student ID</p>
                    <p className="font-medium">{user.studentId || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Faculty</p>
                    <p className="font-medium">{user.faculty || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Major</p>
                    <p className="font-medium">{user.major || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Year</p>
                    <p className="font-medium">{user.year || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Activity Stats
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-600">Purchases</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {user.buyerTransactions?.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-600">Sales</p>
                    <p className="text-2xl font-bold text-green-600">
                      {user.sellerTransactions?.length || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-gray-600">Listings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(user.marketplaceItems?.length || 0) +
                        (user.foodItems?.length || 0) +
                        (user.organizedEvents?.length || 0) +
                        (user.tutoringSessions?.length || 0)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-gray-600">Messages</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {user._count?.sentMessages || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Recent Purchases
                </h4>
                {user.buyerTransactions && user.buyerTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {user.buyerTransactions.slice(0, 5).map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">{tx.itemTitle}</p>
                          <p className="text-xs text-gray-500">{tx.orderId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            Rp {tx.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No purchases yet</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">User not found</p>
          )}
        </div>
      </div>
    </div>
  );
}
