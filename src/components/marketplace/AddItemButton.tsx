"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface AddItemButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  fullWidth?: boolean;
  onAddItemClick?: () => void;
}

export function AddItemButton({
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
  onAddItemClick,
}: AddItemButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    studentId: "",
    faculty: "",
    major: "",
    year: 1,
  });
  const [isSaving, setIsSaving] = useState(false);

  const isProfileComplete = (profile: any) => {
    return !!(
      profile?.name &&
      profile?.studentId &&
      profile?.faculty &&
      profile?.faculty !== "Unknown" &&
      profile?.major &&
      profile?.major !== "Unknown" &&
      profile?.year
    );
  };

  const handleAddItemClick = async () => {
    if (onAddItemClick) {
      onAddItemClick();
      return;
    }

    try {
      const profile = await userAPI.getProfile();

      if (!isProfileComplete(profile)) {
        setProfileData({
          name: profile?.name || "",
          studentId: profile?.studentId || "",
          faculty: profile?.faculty === "Unknown" ? "" : profile?.faculty || "",
          major: profile?.major === "Unknown" ? "" : profile?.major || "",
          year: profile?.year || 1,
        });
        setShowProfileModal(true);
      } else {
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem("addItemReturnPath", currentPath);
        router.push("/dashboard?showAddItem=true");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile. Please try again.");
    }
  };

  const handleProfileSave = async () => {
    if (
      !profileData.name ||
      !profileData.studentId ||
      !profileData.faculty ||
      !profileData.major
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);
      await userAPI.updateProfile(profileData);
      toast.success("Profile updated successfully!");
      setShowProfileModal(false);

      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem("addItemReturnPath", currentPath);
      router.push("/dashboard?showAddItem=true");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleAddItemClick}
        variant={variant}
        size={size}
        className={`${fullWidth ? "w-full" : ""} ${className}`}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Complete Your Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please complete your profile before adding items.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={profileData.studentId}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      studentId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Faculty *
                </label>
                <select
                  value={profileData.faculty}
                  onChange={(e) =>
                    setProfileData({ ...profileData, faculty: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Faculty</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Business">Business</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Law">Law</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Major *
                </label>
                <input
                  type="text"
                  value={profileData.major}
                  onChange={(e) =>
                    setProfileData({ ...profileData, major: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year *</label>
                <select
                  value={profileData.year}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5+</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleProfileSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Saving..." : "Save & Continue"}
              </Button>
              <Button
                onClick={() => setShowProfileModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
