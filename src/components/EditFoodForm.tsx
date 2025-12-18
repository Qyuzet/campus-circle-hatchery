"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoodItem } from "@/lib/api";

interface EditFoodFormProps {
  foodItem: FoodItem;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function EditFoodForm({
  foodItem,
  onSubmit,
  onCancel,
  isSaving,
}: EditFoodFormProps) {
  const [formData, setFormData] = useState({
    title: foodItem.title,
    description: foodItem.description,
    price: foodItem.price.toString(),
    category: foodItem.category,
    foodType: foodItem.foodType,
    quantity: foodItem.quantity.toString(),
    unit: foodItem.unit,
    imageUrl: foodItem.imageUrl || "",
    allergens: foodItem.allergens || [],
    ingredients: foodItem.ingredients || "",
    pickupLocation: foodItem.pickupLocation,
    pickupTime: foodItem.pickupTime,
    isHalal: foodItem.isHalal,
    isVegan: foodItem.isVegan,
    isVegetarian: foodItem.isVegetarian,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    foodItem.imageUrl || ""
  );
  const [isUploading, setIsUploading] = useState(false);

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
    "Morning (08:00 - 12:00)",
    "Afternoon (12:00 - 17:00)",
    "Evening (17:00 - 21:00)",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, imageUrl: "" });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", imageFile);

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
      console.error("Error uploading image:", error);
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
      price: parseInt(formData.price),
      quantity: parseInt(formData.quantity),
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
      className="space-y-3 max-h-[75vh] overflow-y-auto px-1"
    >
      <div>
        <Label>Food Image</Label>
        <div className="mt-2">
          {imagePreview ? (
            <div className="relative w-full h-40">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="title">Title *</Label>
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
            <option value="Snacks">Snacks</option>
            <option value="Meals">Meals</option>
            <option value="Drinks">Drinks</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>

        <div>
          <Label htmlFor="foodType">Food Type *</Label>
          <select
            id="foodType"
            value={formData.foodType}
            onChange={(e) =>
              setFormData({ ...formData, foodType: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          >
            <option value="Homemade">Homemade</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Packaged">Packaged</option>
          </select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="pickupLocation">Pickup Location *</Label>
          <Input
            id="pickupLocation"
            value={formData.pickupLocation}
            onChange={(e) =>
              setFormData({ ...formData, pickupLocation: e.target.value })
            }
            required
            placeholder="e.g., Building A, Room 101"
          />
        </div>

        <div>
          <Label htmlFor="pickupTime">Pickup Time *</Label>
          <Select
            value={formData.pickupTime}
            onValueChange={(value) =>
              setFormData({ ...formData, pickupTime: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pickup time" />
            </SelectTrigger>
            <SelectContent>
              {pickupTimeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="ingredients">Ingredients (Optional)</Label>
        <Textarea
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) =>
            setFormData({ ...formData, ingredients: e.target.value })
          }
          rows={2}
          placeholder="List main ingredients"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Allergens</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {allergenOptions.map((allergen) => (
              <div key={allergen} className="flex items-center space-x-2">
                <Checkbox
                  id={allergen}
                  checked={formData.allergens.includes(allergen)}
                  onCheckedChange={() => toggleAllergen(allergen)}
                />
                <label htmlFor={allergen} className="text-sm cursor-pointer">
                  {allergen}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Dietary Information</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isHalal"
                checked={formData.isHalal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isHalal: checked as boolean })
                }
              />
              <label htmlFor="isHalal" className="text-sm cursor-pointer">
                Halal
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVegan"
                checked={formData.isVegan}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVegan: checked as boolean })
                }
              />
              <label htmlFor="isVegan" className="text-sm cursor-pointer">
                Vegan
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVegetarian"
                checked={formData.isVegetarian}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isVegetarian: checked as boolean })
                }
              />
              <label htmlFor="isVegetarian" className="text-sm cursor-pointer">
                Vegetarian
              </label>
            </div>
          </div>
        </div>
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
