"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  Sparkles,
  CheckCircle2,
  Loader2,
  Clock,
  Zap,
  FileAudio,
  Brain,
  DollarSign,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface LiveLectureTabProps {
  hasSubmittedInterest: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    faculty: string;
    major: string;
  };
}

export function LiveLectureTab({
  hasSubmittedInterest: initialHasSubmitted,
  user,
}: LiveLectureTabProps) {
  const [hasSubmitted, setHasSubmitted] = useState(initialHasSubmitted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCase, setUseCase] = useState("");
  const [frequency, setFrequency] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string>("");

  const features = [
    "Real-time transcription",
    "AI-powered summarization",
    "Key points extraction",
    "Automatic topic detection",
    "Speaker identification",
    "Searchable transcripts",
    "Export to multiple formats",
    "Integration with note-taking",
  ];

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      price: "Rp 0",
      description: "Try it out",
      features: ["2 hours/month", "Basic transcription"],
    },
    {
      id: "starter",
      name: "Starter",
      price: "Rp 50,000",
      pricePerMonth: "/mo",
      description: "Light usage",
      features: ["7.5 hours/month", "AI summarization", "Export formats"],
      popular: false,
    },
    {
      id: "student",
      name: "Student",
      price: "Rp 200,000",
      pricePerMonth: "/mo",
      description: "Best value",
      features: [
        "30 hours/month",
        "All AI features",
        "Cloud storage",
        "Priority support",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "Rp 500,000",
      pricePerMonth: "/mo",
      description: "Unlimited",
      features: [
        "Unlimited hours",
        "Advanced AI",
        "Team features",
        "API access",
      ],
      popular: false,
    },
  ];

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!useCase.trim() || !frequency || selectedFeatures.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/live-lecture-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          faculty: user.faculty,
          major: user.major,
          useCase,
          frequency,
          features: selectedFeatures,
          preferredPricing: selectedPricing || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit interest");

      toast.success(
        "Thank you for your interest! We'll notify you when this feature launches."
      );
      setHasSubmitted(true);
    } catch (error) {
      console.error("Error submitting interest:", error);
      toast.error("Failed to submit interest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="pb-24 sm:pb-6">
        <Card className="max-w-2xl mx-auto border-gray-200 m-3 sm:m-4">
          <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-green-100 rounded">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
              Thank You for Your Interest
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
              We have received your request for the Live Lecture Recording
              feature. You will be among the first to know when it launches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setHasSubmitted(false)}
                className="gap-2 border-gray-300 text-sm"
              >
                Update My Response
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-0 pb-24 sm:pb-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-3 sm:p-4 bg-blue-600 rounded">
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                Live Lecture Recording
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Coming Soon: AI-powered lecture transcription and note-taking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-4 bg-white rounded border border-gray-200">
              <FileAudio className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 flex-shrink-0" />
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-[10px] sm:text-xs md:text-sm lg:text-base">
                  Record Lectures
                </h4>
                <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 leading-tight">
                  Capture audio during class
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-4 bg-white rounded border border-gray-200">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 flex-shrink-0" />
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-[10px] sm:text-xs md:text-sm lg:text-base">
                  AI Transcription
                </h4>
                <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 leading-tight">
                  Speech-to-text accuracy
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-4 bg-white rounded border border-gray-200">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 flex-shrink-0" />
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-[10px] sm:text-xs md:text-sm lg:text-base">
                  Smart Notes
                </h4>
                <p className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 leading-tight">
                  Summaries & key points
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Express Your Interest
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Help us build the perfect lecture recording feature by sharing your
            needs
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="useCase" className="text-sm">
                How would you use this feature?
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g., I want to record my programming lectures to review complex algorithms later..."
                rows={4}
                required
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="frequency" className="text-sm">
                How often would you use this?
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={frequency} onValueChange={setFrequency} required>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">2-3 times per week</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 sm:mb-3 block text-sm">
                Which features are most important to you?
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-2 p-2.5 sm:p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleFeatureToggle(feature)}
                  >
                    <Checkbox
                      id={feature}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label
                      htmlFor={feature}
                      className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
              {selectedFeatures.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  Please select at least one feature
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2 sm:mb-3 block text-sm">
                Which pricing would you prefer?
              </Label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPricing(tier.id)}
                    className={`relative p-2 sm:p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPricing === tier.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    } ${tier.popular ? "ring-2 ring-blue-400" : ""}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">
                          POPULAR
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">
                        {tier.name}
                      </h4>
                      {selectedPricing === tier.id && (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="mb-1 sm:mb-2">
                      <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                        {tier.price}
                      </div>
                      {tier.pricePerMonth && (
                        <span className="text-[9px] sm:text-xs text-gray-500">
                          {tier.pricePerMonth}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 mb-1.5 sm:mb-2">
                      {tier.description}
                    </p>
                    <ul className="space-y-0.5 sm:space-y-1">
                      {tier.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-xs text-gray-600"
                        >
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-gray-900 mb-1">
                    Early Access Opportunity
                  </p>
                  <p className="text-gray-600">
                    By expressing your interest, you will be among the first to
                    access this feature when it launches. We will also consider
                    your feedback in our development process.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 sm:gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Submit Interest
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
