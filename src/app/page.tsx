"use client";

import { useState } from "react";
import {
  BookOpen,
  Users,
  MessageCircle,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const [studentId, setStudentId] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.trim()) {
      // For now, just redirect to dashboard without actual authentication
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
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
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-medium-gray hover:text-dark-gray transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-medium-gray hover:text-dark-gray transition-colors"
              >
                How it Works
              </a>
              <a
                href="#about"
                className="text-medium-gray hover:text-dark-gray transition-colors"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-dark-gray sm:text-5xl md:text-6xl">
                <span className="block">Your Academic</span>
                <span className="block text-dark-blue">Success Hub</span>
              </h1>
              <p className="mt-3 text-base text-medium-gray sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Binus University student marketplace for study materials and
                tutoring.
              </p>

              {/* Login Form */}
              <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-light-gray">
                <h3 className="text-lg font-medium text-dark-gray mb-4">
                  Login with Student ID
                </h3>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="studentId"
                      className="block text-sm font-medium text-medium-gray"
                    >
                      Student ID (NIM)
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g., 2501234567"
                      className="mt-1 block w-full px-3 py-2 border border-light-gray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-dark-blue transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dark-blue hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue transition-colors"
                  >
                    Enter CampusCircle
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 text-xs text-medium-gray">
                  Only for Binus University students
                </p>
              </div>
            </div>

            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="bg-white p-8 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary-50 rounded-lg border border-light-gray">
                      <BookOpen className="h-8 w-8 text-dark-blue mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark-gray">
                        Study Materials
                      </p>
                    </div>
                    <div className="text-center p-4 bg-success-50 rounded-lg border border-light-gray">
                      <Users className="h-8 w-8 text-campus-green mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark-gray">
                        Tutoring
                      </p>
                    </div>
                    <div className="text-center p-4 bg-primary-50 rounded-lg border border-light-gray">
                      <MessageCircle className="h-8 w-8 text-soft-blue mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark-gray">Chat</p>
                    </div>
                    <div className="text-center p-4 bg-secondary-50 rounded-lg border border-light-gray">
                      <ShoppingCart className="h-8 w-8 text-light-blue mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark-gray">
                        Marketplace
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-dark-gray">Features</h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-dark-blue text-white mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-dark-gray">
                Study Materials
              </h3>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-campus-green text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-dark-gray">
                Tutoring
              </h3>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-soft-blue text-white mx-auto">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-dark-gray">Chat</h3>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-light-blue text-white mx-auto">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-dark-gray">
                Marketplace
              </h3>
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
