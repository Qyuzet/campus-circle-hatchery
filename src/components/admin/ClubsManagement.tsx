"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Edit, Trash2, RefreshCw, X, Upload } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  category: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClubsManagement() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    category: "",
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clubs");
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Club created successfully");
        setShowCreateModal(false);
        setFormData({ name: "", description: "", logoUrl: "", category: "" });
        loadClubs();
      } else {
        toast.error("Failed to create club");
      }
    } catch (error) {
      toast.error("Failed to create club");
    }
  };

  const handleUpdate = async () => {
    if (!editingClub) return;

    try {
      const response = await fetch(`/api/clubs/${editingClub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Club updated successfully");
        setEditingClub(null);
        setFormData({ name: "", description: "", logoUrl: "", category: "" });
        loadClubs();
      } else {
        toast.error("Failed to update club");
      }
    } catch (error) {
      toast.error("Failed to update club");
    }
  };

  const handleDelete = async (clubId: string) => {
    if (!confirm("Are you sure you want to delete this club?")) return;

    try {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Club deleted successfully");
        loadClubs();
      } else {
        toast.error("Failed to delete club");
      }
    } catch (error) {
      toast.error("Failed to delete club");
    }
  };

  const openEditModal = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      logoUrl: club.logoUrl || "",
      category: club.category,
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingClub(null);
    setFormData({ name: "", description: "", logoUrl: "", category: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clubs Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage student clubs
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Club
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <Card key={club.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {club.logoUrl ? (
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{club.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {club.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {club.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">
                  {club.memberCount} members
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(club)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(club.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No clubs created yet</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="mt-4"
            >
              Create First Club
            </Button>
          </CardContent>
        </Card>
      )}

      {(showCreateModal || editingClub) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingClub ? "Edit Club" : "Create New Club"}
                </CardTitle>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Club Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter club name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter club description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Technology, Sports, Arts"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Logo URL (optional)
                </label>
                <Input
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                  placeholder="Enter logo URL"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingClub ? handleUpdate : handleCreate}
                  className="flex-1"
                >
                  {editingClub ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
