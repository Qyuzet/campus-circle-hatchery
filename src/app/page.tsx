"use client";

import { signIn } from "next-auth/react";
import { BookOpen, Users, MessageCircle, ShoppingCart } from "lucide-react";

export default function LandingPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
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
                  Login to CampusCircle
                </h3>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-light-gray rounded-md shadow-sm text-sm font-medium text-dark-gray bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <p className="mt-4 text-xs text-center text-medium-gray">
                  For Binus University students
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
