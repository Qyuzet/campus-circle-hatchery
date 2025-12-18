"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/lib/api";

interface EditEventFormProps {
  event: Event;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function EditEventForm({
  event,
  onSubmit,
  onCancel,
  isSaving,
}: EditEventFormProps) {
  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    category: event.category,
    eventType: event.eventType,
    price: event.price.toString(),
    imageUrl: event.imageUrl || "",
    bannerUrl: event.bannerUrl || "",
    location: event.location,
    venue: event.venue || "",
    isOnline: event.isOnline,
    meetingLink: event.meetingLink || "",
    startDate: formatDateForInput(event.startDate),
    endDate: formatDateForInput(event.endDate),
    registrationDeadline: event.registrationDeadline
      ? formatDateForInput(event.registrationDeadline)
      : "",
    maxParticipants: event.maxParticipants?.toString() || "",
    tags: event.tags.join(", "),
    requirements: event.requirements || "",
    organizer: event.organizer,
    contactEmail: event.contactEmail || "",
    contactPhone: event.contactPhone || "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>(
    event.bannerUrl || event.imageUrl || ""
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    setFormData({ ...formData, bannerUrl: "" });
  };

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile) return null;

    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", bannerFile);

      const response = await fetch("/api/upload-thumbnail", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading banner:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let bannerUrl = formData.bannerUrl;

    if (bannerFile) {
      const uploadedUrl = await uploadBanner();
      if (uploadedUrl) {
        bannerUrl = uploadedUrl;
      } else {
        toast.error("Failed to upload banner. Please try again.");
        return;
      }
    }

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    onSubmit({
      ...formData,
      bannerUrl,
      imageUrl: bannerUrl,
      tags: tagsArray,
      price: parseInt(formData.price),
      maxParticipants: formData.maxParticipants
        ? parseInt(formData.maxParticipants)
        : null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 max-h-[75vh] overflow-y-auto px-1"
    >
      <div>
        <Label>Event Banner</Label>
        <div className="mt-2">
          {bannerPreview ? (
            <div className="relative w-full h-40">
              <img
                src={bannerPreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload banner</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleBannerChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="organizer">Organizer *</Label>
          <Input
            id="organizer"
            value={formData.organizer}
            onChange={(e) =>
              setFormData({ ...formData, organizer: e.target.value })
            }
            required
            placeholder="e.g., CS Club"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          >
            <option value="Academic">Academic</option>
            <option value="Social">Social</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Competition">Competition</option>
          </select>
        </div>

        <div>
          <Label htmlFor="eventType">Event Type *</Label>
          <select
            id="eventType"
            value={formData.eventType}
            onChange={(e) =>
              setFormData({ ...formData, eventType: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          >
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
            <option value="Registration Required">Registration Required</option>
          </select>
        </div>

        {formData.eventType === "Paid" && (
          <div>
            <Label htmlFor="price">Price (Rp) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="maxParticipants">Max Participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) =>
              setFormData({ ...formData, maxParticipants: e.target.value })
            }
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isOnline"
          checked={formData.isOnline}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isOnline: checked as boolean })
          }
        />
        <label htmlFor="isOnline" className="text-sm cursor-pointer">
          This is an online event
        </label>
      </div>

      {formData.isOnline ? (
        <div>
          <Label htmlFor="meetingLink">Meeting Link *</Label>
          <Input
            id="meetingLink"
            value={formData.meetingLink}
            onChange={(e) =>
              setFormData({ ...formData, meetingLink: e.target.value })
            }
            required={formData.isOnline}
            placeholder="https://zoom.us/j/..."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required={!formData.isOnline}
              placeholder="e.g., Main Campus"
            />
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              placeholder="e.g., Auditorium A"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., networking, career, workshop"
        />
      </div>

      <div className="flex gap-2 pt-4 sticky bottom-0 bg-white pb-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSaving || isUploading}
        >
          {isSaving || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
