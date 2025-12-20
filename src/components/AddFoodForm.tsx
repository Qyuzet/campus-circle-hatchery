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

interface AddFoodFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AddFoodForm({ onSubmit, onCancel }: AddFoodFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Snacks",
    foodType: "Homemade",
    quantity: "1",
    unit: "pieces",
    imageUrl: "",
    allergens: [] as string[],
    ingredients: "",
    expiryDate: "",
    pickupLocation: "",
    pickupTime: "",
    isHalal: false,
    isVegan: false,
    isVegetarian: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const allergenOptions = [
    "Nuts",
    "Dairy",
    "Gluten",
    "Eggs",
    "Soy",
    "Shellfish",
    "Fish",
  ];

  const pickupTimeOptions = [
    "Morning (8:00 - 12:00)",
    "Afternoon (12:00 - 17:00)",
    "Evening (17:00 - 21:00)",
    "Anytime",
  ];

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      await analyzeImageWithAI(file);
    }
  };

  const analyzeImageWithAI = async (file: File) => {
    try {
      setIsAnalyzing(true);
      toast.info("Analyzing image with AI...", {
        duration: 2000,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "food");

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
          foodType: aiData.foodType || prev.foodType,
          ingredients: aiData.ingredients || prev.ingredients,
          allergens: aiData.allergens || prev.allergens,
          isVegan: aiData.isVegan ?? prev.isVegan,
          isVegetarian: aiData.isVegetarian ?? prev.isVegetarian,
          isHalal: aiData.isHalal ?? prev.isHalal,
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, imageUrl: "" });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.thumbnailUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl;

    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        toast.error("Failed to upload image. Please try again.");
        return;
      }
    }

    onSubmit({
      ...formData,
      imageUrl,
    });
  };

  const toggleAllergen = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2.5 max-h-[75vh] overflow-y-auto px-1"
    >
      <div>
        <Label className="text-sm">Food Image</Label>
        <div className="mt-1.5">
          {imagePreview ? (
            <div className="relative w-full h-28">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
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
                  Click to upload food image
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
                onChange={handleImageSelect}
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

      <div className="grid grid-cols-3 gap-2.5">
        <div className="col-span-2">
          <Label htmlFor="title" className="text-sm">
            Title *
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

      <div className="grid grid-cols-4 gap-2.5">
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
            <option value="Snacks">Snacks</option>
            <option value="Meals">Meals</option>
            <option value="Drinks">Drinks</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>

        <div>
          <Label htmlFor="foodType" className="text-sm">
            Type *
          </Label>
          <select
            id="foodType"
            value={formData.foodType}
            onChange={(e) =>
              setFormData({ ...formData, foodType: e.target.value })
            }
            className="w-full h-9 px-2 py-1.5 border rounded-md text-sm"
            required
          >
            <option value="Homemade">Homemade</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Packaged">Packaged</option>
          </select>
        </div>

        <div>
          <Label htmlFor="quantity" className="text-sm">
            Qty *
          </Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="pickupTime" className="text-sm">
            Pickup Time *
          </Label>
          <Select
            value={formData.pickupTime}
            onValueChange={(value) =>
              setFormData({ ...formData, pickupTime: value })
            }
            required
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {pickupTimeOptions.map((time) => (
                <SelectItem key={time} value={time} className="text-sm">
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label htmlFor="pickupLocation" className="text-sm">
            Pickup Location *
          </Label>
          <Input
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) =>
              setFormData({ ...formData, pickupLocation: e.target.value })
            }
            required
            placeholder="e.g., Building A, Room 101"
            className="h-9"
          />
        </div>

        <div>
          <Label htmlFor="ingredients" className="text-sm">
            Ingredients
          </Label>
          <Input
            id="ingredients"
            value={formData.ingredients}
            onChange={(e) =>
              setFormData({ ...formData, ingredients: e.target.value })
            }
            placeholder="List main ingredients"
            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label className="text-sm">Allergens</Label>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            {allergenOptions.map((allergen) => (
              <div key={allergen} className="flex items-center space-x-1.5">
                <Checkbox
                  id={allergen}
                  checked={formData.allergens.includes(allergen)}
                  onCheckedChange={() => toggleAllergen(allergen)}
                  className="h-3.5 w-3.5"
                />
                <label htmlFor={allergen} className="text-xs cursor-pointer">
                  {allergen}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm">Dietary Tags</Label>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <div className="flex items-center space-x-1.5">
              <Checkbox
                id="isHalal"
                checked={formData.isHalal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isHalal: checked as boolean })
                }
                className="h-3.5 w-3.5"
              />
              <label htmlFor="isHalal" className="text-xs cursor-pointer">
                Halal
              </label>
            </div>
            <div className="flex items-center space-x-1.5">
              <Checkbox
                id="isVegan"
                checked={formData.isVegan}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVegan: checked as boolean })
                }
                className="h-3.5 w-3.5"
              />
              <label htmlFor="isVegan" className="text-xs cursor-pointer">
                Vegan
              </label>
            </div>
            <div className="flex items-center space-x-1.5 col-span-2">
              <Checkbox
                id="isVegetarian"
                checked={formData.isVegetarian}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVegetarian: checked as boolean })
                }
                className="h-3.5 w-3.5"
              />
              <label htmlFor="isVegetarian" className="text-xs cursor-pointer">
                Vegetarian
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-3 sticky bottom-0 bg-white pb-2">
        <Button type="submit" className="flex-1 h-9" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Add Food Item"
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
