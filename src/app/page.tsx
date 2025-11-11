"use client";

import { signIn } from "next-auth/react";
import {
  BookOpen,
  Users,
  MessageCircle,
  ShoppingCart,
  GraduationCap,
  TrendingUp,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/campusCircle-logo.png"
                alt="CampusCircle Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-2xl font-bold">
                <span className="bg-gradient-to-r from-campus-blue-light to-campus-blue-dark bg-clip-text text-transparent">
                  Campus
                </span>
                <span className="bg-gradient-to-r from-circle-teal-light to-circle-teal-dark bg-clip-text text-transparent">
                  Circle
                </span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-medium-gray hover:text-dark-gray transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-medium-gray hover:text-dark-gray transition-colors"
              >
                How it Works
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-medium-gray hover:text-dark-gray transition-colors"
              >
                FAQ
              </a>
              <Button
                onClick={handleGoogleLogin}
                className="bg-dark-blue hover:bg-dark-blue/90"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-dark-gray" />
              ) : (
                <Menu className="h-6 w-6 text-dark-gray" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-sm font-medium text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it Works
                </a>
                <a
                  href="#faq"
                  className="text-sm font-medium text-medium-gray hover:text-dark-gray transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
                <Button
                  onClick={handleGoogleLogin}
                  className="bg-dark-blue hover:bg-dark-blue/90 w-full"
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge variant="outline" className="mb-8 px-4 py-2 text-sm">
              <GraduationCap className="h-4 w-4 mr-2 inline" />
              Exclusively for Binus University Students
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-dark-gray mb-6">
              Your Academic{" "}
              <span className="bg-gradient-to-r from-campus-blue-light via-dark-blue to-circle-teal-dark bg-clip-text text-transparent">
                Success Hub
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl sm:text-2xl text-medium-gray max-w-3xl mx-auto mb-12">
              Connect, learn, and grow with Binus University's premier student
              marketplace for study materials, tutoring, and academic resources.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={handleGoogleLogin}
                size="lg"
                className="bg-dark-blue hover:bg-dark-blue/90 text-lg px-8 py-6 w-full sm:w-auto"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Get Started with Google
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 w-full sm:w-auto"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </Button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-dark-blue">
                <BookOpen className="h-10 w-10 text-dark-blue mx-auto mb-3" />
                <h3 className="font-semibold text-dark-gray mb-1">
                  Study Materials
                </h3>
                <p className="text-sm text-medium-gray">Notes & Resources</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-campus-green">
                <Users className="h-10 w-10 text-campus-green mx-auto mb-3" />
                <h3 className="font-semibold text-dark-gray mb-1">Tutoring</h3>
                <p className="text-sm text-medium-gray">Expert Help</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-soft-blue">
                <MessageCircle className="h-10 w-10 text-soft-blue mx-auto mb-3" />
                <h3 className="font-semibold text-dark-gray mb-1">Chat</h3>
                <p className="text-sm text-medium-gray">Connect Instantly</p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-light-blue">
                <ShoppingCart className="h-10 w-10 text-light-blue mx-auto mb-3" />
                <h3 className="font-semibold text-dark-gray mb-1">
                  Marketplace
                </h3>
                <p className="text-sm text-medium-gray">Buy & Sell</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-dark-gray mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-medium-gray max-w-2xl mx-auto">
              Powerful features designed specifically for Binus University
              students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-blue-100 text-dark-blue mb-6">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-3">
                Lightning Fast
              </h3>
              <p className="text-medium-gray">
                Instant access to study materials and tutoring sessions. No
                waiting, just learning.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-green-100 text-campus-green mb-6">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-3">
                Secure & Trusted
              </h3>
              <p className="text-medium-gray">
                Verified Binus students only. Your data and transactions are
                always protected.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-teal-100 text-circle-teal-dark mb-6">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-3">
                Track Progress
              </h3>
              <p className="text-medium-gray">
                Monitor your purchases, sales, and academic growth all in one
                place.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-blue-100 text-dark-blue mb-6">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-3">
                Quality Resources
              </h3>
              <p className="text-medium-gray">
                Access high-quality notes, tutorials, and study materials from
                top students.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-purple-100 text-purple-600 mb-6">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-3">
                Expert Tutors
              </h3>
              <p className="text-medium-gray">
                Connect with experienced students who excel in their subjects.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-orange-100 text-orange-600 mb-6">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-3">
                Real-time Chat
              </h3>
              <p className="text-medium-gray">
                Communicate instantly with sellers and tutors through our
                built-in messaging.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-dark-gray mb-4">
              How It Works
            </h2>
            <p className="text-xl text-medium-gray max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-dark-blue text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">
                Sign Up
              </h3>
              <p className="text-medium-gray text-lg">
                Create your account using your Binus University Google account.
                Quick and secure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-campus-green text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">
                Browse & Connect
              </h3>
              <p className="text-medium-gray text-lg">
                Explore study materials, find tutors, or list your own resources
                for sale.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-circle-teal-dark text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-semibold text-dark-gray mb-4">
                Learn & Grow
              </h3>
              <p className="text-medium-gray text-lg">
                Access your purchases, attend tutoring sessions, and excel in
                your studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <img
                src="/campusCircle-logo.png"
                alt="CampusCircle Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-2xl font-bold">
                <span className="bg-gradient-to-r from-campus-blue-light to-campus-blue-dark bg-clip-text text-transparent">
                  Campus
                </span>
                <span className="bg-gradient-to-r from-circle-teal-light to-circle-teal-dark bg-clip-text text-transparent">
                  Circle
                </span>
              </span>
            </div>
            <p className="mt-4 text-secondary-300">
              Exclusively for Binus University Students
            </p>
            <p className="mt-2 text-sm text-secondary-400">
              © 2024 CampusCircle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
