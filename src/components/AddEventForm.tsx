"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddEventFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AddEventForm({ onSubmit, onCancel }: AddEventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Academic",
    eventType: "Free",
    price: "0",
    imageUrl: "",
    bannerUrl: "",
    location: "",
    venue: "",
    isOnline: false,
    meetingLink: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxParticipants: "",
    tags: "",
    requirements: "",
    organizer: "",
    contactEmail: "",
    contactPhone: "",
    isPublished: true,
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
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

      await analyzeImageWithAI(file);
    }
  };

  const analyzeImageWithAI = async (file: File) => {
    try {
      setIsAnalyzing(true);
      toast.info("Analyzing event poster with AI...", {
        duration: 2000,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "event");

      const response = await fetch("/api/ai-autofill", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const aiData = result.data;

        setFormData((prev) => ({
          ...prev,
          title: aiData.title || prev.title,
          description: aiData.description || prev.description,
          category: aiData.category || prev.category,
          eventType: aiData.eventType || prev.eventType,
          location: aiData.location || prev.location,
          venue: aiData.venue || prev.venue,
          startDate: aiData.startDate || prev.startDate,
          endDate: aiData.endDate || prev.endDate,
          organizer: aiData.organizer || prev.organizer,
          contactEmail: aiData.contactEmail || prev.contactEmail,
          contactPhone: aiData.contactPhone || prev.contactPhone,
          tags: aiData.tags || prev.tags,
          requirements: aiData.requirements || prev.requirements,
        }));

        toast.success("Form auto-filled with AI suggestions!", {
          description: "Review and adjust the information as needed.",
        });
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("Could not analyze image", {
        description: "Please fill in the form manually.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    setFormData({ ...formData, bannerUrl: "" });
  };

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile) return null;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", bannerFile);

      const response = await fetch("/api/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload banner");
      }

      const data = await response.json();
      return data.thumbnailUrl;
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Failed to upload banner");
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
      tags: tagsArray,
      maxParticipants: formData.maxParticipants
        ? parseInt(formData.maxParticipants)
        : null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2.5 max-h-[75vh] overflow-y-auto px-1"
    >
      <div>
        <Label className="text-sm">Event Banner</Label>
        <div className="mt-1.5">
          {bannerPreview ? (
            <div className="relative w-full h-28">
              <img
                src={bannerPreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">
                  Click to upload event banner
                </p>
                <p className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI auto-fill
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleBannerSelect}
              />
            </label>
          )}
        </div>
      </div>

      {isAnalyzing && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
          <span className="text-xs text-purple-700">
            AI is analyzing your image...
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="title" className="text-sm">
            Event Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="organizer" className="text-sm">
            Organizer *
          </Label>
          <Input
            id="organizer"
            value={formData.organizer}
            onChange={(e) =>
              setFormData({ ...formData, organizer: e.target.value })
            }
            required
            placeholder="e.g., CS Club"
            className="h-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">
          Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={1}
          className="resize-none text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <Label htmlFor="category" className="text-sm">
            Category *
          </Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full h-9 px-2 py-1.5 border rounded-md text-sm"
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
          <Label htmlFor="eventType" className="text-sm">
            Type *
          </Label>
          <select
            id="eventType"
            value={formData.eventType}
            onChange={(e) =>
              setFormData({ ...formData, eventType: e.target.value })
            }
            className="w-full h-9 px-2 py-1.5 border rounded-md text-sm"
            required
          >
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
            <option value="Registration Required">Registration</option>
          </select>
        </div>

        {formData.eventType === "Paid" && (
          <div>
            <Label htmlFor="price" className="text-sm">
              Price (Rp) *
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
              className="h-9"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <Label htmlFor="startDate" className="text-sm">
            Start Date *
          </Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
            className="h-9 text-sm"
          />
        </div>

        <div>
          <Label htmlFor="endDate" className="text-sm">
            End Date *
          </Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
            className="h-9 text-sm"
          />
        </div>

        <div>
          <Label htmlFor="registrationDeadline" className="text-sm">
            Reg. Deadline
          </Label>
          <Input
            id="registrationDeadline"
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) =>
              setFormData({ ...formData, registrationDeadline: e.target.value })
            }
            className="h-9 text-sm"
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
          className="h-3.5 w-3.5"
        />
        <label htmlFor="isOnline" className="text-xs cursor-pointer">
          This is an online event
        </label>
      </div>

      {formData.isOnline ? (
        <div>
          <Label htmlFor="meetingLink" className="text-sm">
            Meeting Link *
          </Label>
          <Input
            id="meetingLink"
            value={formData.meetingLink}
            onChange={(e) =>
              setFormData({ ...formData, meetingLink: e.target.value })
            }
            required={formData.isOnline}
            placeholder="https://zoom.us/j/..."
            className="h-9"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label htmlFor="location" className="text-sm">
              Location *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required={!formData.isOnline}
              placeholder="e.g., Main Campus"
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="venue" className="text-sm">
              Venue
            </Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              placeholder="e.g., Building A, Room 101"
              className="h-9"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <Label htmlFor="maxParticipants" className="text-sm">
            Max Participants
          </Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) =>
              setFormData({ ...formData, maxParticipants: e.target.value })
            }
            placeholder="Unlimited"
            className="h-9"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="tags" className="text-sm">
            Tags
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="networking, free-food"
            className="h-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="requirements" className="text-sm">
          Requirements
        </Label>
        <Input
          id="requirements"
          value={formData.requirements}
          onChange={(e) =>
            setFormData({ ...formData, requirements: e.target.value })
          }
          placeholder="Any prerequisites or requirements"
          className="h-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="contactEmail" className="text-sm">
            Contact Email
          </Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="contactPhone" className="text-sm">
            Contact Phone
          </Label>
          <Input
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            className="h-9"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublished"
          checked={formData.isPublished}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPublished: checked as boolean })
          }
          className="h-3.5 w-3.5"
        />
        <label htmlFor="isPublished" className="text-xs cursor-pointer">
          Publish immediately
        </label>
      </div>

      <div className="flex gap-2 pt-3 sticky bottom-0 bg-white pb-2">
        <Button type="submit" className="flex-1 h-9" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Create Event"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-9"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
