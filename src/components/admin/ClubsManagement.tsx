"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Upload,
  Eye,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  category: string;
  memberCount: number;
  initialMemberCount?: number;
  actualMemberCount?: number;
  isOpenForRegistration: boolean;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  registrationLink: string | null;
  websiteUrl: string | null;
  joinMode: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
}

interface ClubMember {
  id: string;
  joinedAt: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    faculty: string;
    major: string;
  };
}

interface ClubJoinRequest {
  id: string;
  clubId: string;
  userId: string;
  status: string;
  requestedAt: string;
  respondedAt: string | null;
  memberStatus: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    faculty: string;
    major: string;
    avatarUrl: string | null;
  };
}

export default function ClubsManagement() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [viewingMembers, setViewingMembers] = useState<Club | null>(null);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [viewingRequests, setViewingRequests] = useState<Club | null>(null);
  const [clubRequests, setClubRequests] = useState<ClubJoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    category: "",
    memberCount: 0,
    isOpenForRegistration: true,
    registrationStartDate: "",
    registrationEndDate: "",
    registrationLink: "",
    websiteUrl: "",
    joinMode: "DIRECT",
  });
  const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("url");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

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

  const loadClubMembers = async (clubId: string) => {
    try {
      setLoadingMembers(true);
      const response = await fetch(`/api/clubs/${clubId}/members`);
      const data = await response.json();
      setClubMembers(data);
    } catch (error) {
      toast.error("Failed to load club members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadClubRequests = async (clubId: string) => {
    try {
      setLoadingRequests(true);
      const response = await fetch(`/api/clubs/${clubId}/requests`);
      const data = await response.json();
      setClubRequests(data);
    } catch (error) {
      toast.error("Failed to load club requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: "APPROVED" | "REJECTED"
  ) => {
    try {
      const response = await fetch(
        `/api/clubs/${viewingRequests?.id}/requests`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, action }),
        }
      );

      if (response.ok) {
        toast.success(`Request ${action.toLowerCase()} successfully`);
        if (viewingRequests) {
          loadClubRequests(viewingRequests.id);
        }
      } else {
        toast.error("Failed to update request");
      }
    } catch (error) {
      toast.error("Failed to update request");
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
        setFormData({
          name: "",
          description: "",
          logoUrl: "",
          category: "",
          memberCount: 0,
          isOpenForRegistration: true,
          registrationStartDate: "",
          registrationEndDate: "",
          registrationLink: "",
          websiteUrl: "",
          joinMode: "DIRECT",
        });
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
        setFormData({
          name: "",
          description: "",
          logoUrl: "",
          category: "",
          memberCount: 0,
          isOpenForRegistration: true,
          registrationStartDate: "",
          registrationEndDate: "",
          registrationLink: "",
          websiteUrl: "",
          joinMode: "DIRECT",
        });
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingLogo(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/clubs/upload-logo", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, logoUrl: data.logoUrl });
        setLogoPreview(data.logoUrl);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload logo");
      }
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const openEditModal = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      logoUrl: club.logoUrl || "",
      category: club.category,
      memberCount: club.initialMemberCount ?? club.memberCount,
      isOpenForRegistration: club.isOpenForRegistration,
      registrationStartDate: club.registrationStartDate
        ? new Date(club.registrationStartDate).toISOString().split("T")[0]
        : "",
      registrationEndDate: club.registrationEndDate
        ? new Date(club.registrationEndDate).toISOString().split("T")[0]
        : "",
      registrationLink: club.registrationLink || "",
      websiteUrl: club.websiteUrl || "",
      joinMode: club.joinMode || "DIRECT",
    });
    setLogoPreview(club.logoUrl || "");
    setUploadMethod("url");
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingClub(null);
    setFormData({
      name: "",
      description: "",
      logoUrl: "",
      category: "",
      memberCount: 0,
      isOpenForRegistration: true,
      registrationStartDate: "",
      registrationEndDate: "",
      registrationLink: "",
      websiteUrl: "",
      joinMode: "DIRECT",
    });
    setLogoPreview("");
    setUploadMethod("url");
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
                      className="w-16 h-12 rounded-lg object-contain bg-white"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {club.memberCount} members
                    {club.initialMemberCount !== undefined &&
                      club.actualMemberCount !== undefined && (
                        <span className="text-gray-400">
                          {" "}
                          ({club.initialMemberCount} initial +{" "}
                          {club.actualMemberCount} app)
                        </span>
                      )}
                  </span>
                  <Badge
                    variant={
                      club.isOpenForRegistration ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {club.isOpenForRegistration ? "Open" : "Closed"}
                  </Badge>
                </div>
                {club.registrationStartDate && club.registrationEndDate && (
                  <p className="text-xs text-gray-500">
                    Registration:{" "}
                    {new Date(club.registrationStartDate).toLocaleDateString()}{" "}
                    - {new Date(club.registrationEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setViewingRequests(club);
                    loadClubRequests(club.id);
                  }}
                  className="flex-1"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Requests
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setViewingMembers(club);
                    loadClubMembers(club.id);
                  }}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Members
                </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
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
            <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
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
                  Initial Member Count
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.memberCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memberCount: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set initial member count (existing members outside the app)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Club Logo (optional)
                </label>

                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    size="sm"
                    variant={uploadMethod === "url" ? "default" : "outline"}
                    onClick={() => setUploadMethod("url")}
                    className="flex-1"
                  >
                    URL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={uploadMethod === "upload" ? "default" : "outline"}
                    onClick={() => setUploadMethod("upload")}
                    className="flex-1"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </div>

                {uploadMethod === "url" ? (
                  <Input
                    value={formData.logoUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, logoUrl: e.target.value });
                      setLogoPreview(e.target.value);
                    }}
                    placeholder="Enter logo URL"
                  />
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      {uploadingLogo ? (
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                      ) : logoPreview ? (
                        <div className="relative w-full h-full p-2">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setLogoPreview("");
                              setFormData({ ...formData, logoUrl: "" });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            Click to upload logo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                )}

                {logoPreview && uploadMethod === "url" && (
                  <div className="mt-2 p-2 border rounded-lg">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain mx-auto"
                      onError={() => setLogoPreview("")}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Registration Period
                </label>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="isOpenForRegistration"
                    checked={formData.isOpenForRegistration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isOpenForRegistration: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="isOpenForRegistration"
                    className="text-sm text-gray-700"
                  >
                    Open for registration
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      Start Date (optional)
                    </label>
                    <Input
                      type="date"
                      value={formData.registrationStartDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationStartDate: e.target.value,
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">
                      End Date (optional)
                    </label>
                    <Input
                      type="date"
                      value={formData.registrationEndDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationEndDate: e.target.value,
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                </div>

                {formData.registrationStartDate &&
                  formData.registrationEndDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Registration:{" "}
                      {new Date(
                        formData.registrationStartDate
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        formData.registrationEndDate
                      ).toLocaleDateString()}
                    </p>
                  )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Registration Link (optional)
                </label>
                <Input
                  type="url"
                  value={formData.registrationLink}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationLink: e.target.value,
                    })
                  }
                  placeholder="https://chat.whatsapp.com/... or https://t.me/..."
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  External link (WhatsApp, Telegram, etc.) for additional
                  registration
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Website URL (optional)
                </label>
                <Input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      websiteUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Club website or social media page
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Join Mode
                </label>
                <select
                  value={formData.joinMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      joinMode: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DIRECT">Direct Join</option>
                  <option value="REQUEST">Request-Based Join</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Direct: Users join immediately. Request: Admin must approve
                  join requests
                </p>
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

      {viewingMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl my-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {viewingMembers.name} - Registered Members
                </CardTitle>
                <button
                  onClick={() => {
                    setViewingMembers(null);
                    setClubMembers([]);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total: {clubMembers.length} registered members
              </p>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : clubMembers.length > 0 ? (
                <div className="space-y-3">
                  {clubMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {index + 1}. {member.user.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {member.user.email}
                            </div>
                            <div>
                              <span className="font-medium">Student ID:</span>{" "}
                              {member.user.studentId}
                            </div>
                            <div>
                              <span className="font-medium">Faculty:</span>{" "}
                              {member.user.faculty}
                            </div>
                            <div>
                              <span className="font-medium">Major:</span>{" "}
                              {member.user.major}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No members have registered yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {viewingRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{viewingRequests.name} - Join Requests</CardTitle>
                <button
                  onClick={() => {
                    setViewingRequests(null);
                    setClubRequests([]);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total: {clubRequests.length} requests
              </p>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : clubRequests.length > 0 ? (
                <div className="space-y-3">
                  {clubRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {request.user.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {request.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Student ID:</span>{" "}
                              {request.user.studentId}
                            </div>
                            <div>
                              <span className="font-medium">Faculty:</span>{" "}
                              {request.user.faculty}
                            </div>
                            <div>
                              <span className="font-medium">Major:</span>{" "}
                              {request.user.major}
                            </div>
                            <div>
                              <span className="font-medium">Requested:</span>{" "}
                              {new Date(
                                request.requestedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={
                                request.status === "PENDING"
                                  ? "secondary"
                                  : request.status === "APPROVED"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                            {request.memberStatus && (
                              <Badge variant="outline">
                                Member Status: {request.memberStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {request.status === "PENDING" && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRequestAction(request.id, "APPROVED")
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRequestAction(request.id, "REJECTED")
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No join requests yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
