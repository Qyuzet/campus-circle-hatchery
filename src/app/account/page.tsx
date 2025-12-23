"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Bell,
  ShoppingCart,
  Package,
  Library,
  MessageCircle,
  TrendingUp,
  Plus,
  LogOut,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  UserCircle,
  Wallet,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { statsAPI, notificationsAPI, userAPI } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    studentId: "",
    faculty: "",
    major: "",
    year: 1,
    bio: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      const [stats, notifs, profile] = await Promise.all([
        statsAPI.getUserStats(),
        notificationsAPI.getNotifications(),
        userAPI.getProfile(),
      ]);
      console.log("Account page - User profile loaded:", profile);
      console.log("Account page - Avatar URL:", profile?.avatarUrl);
      console.log("Account page - Session image:", session?.user?.image);

      // If profile doesn't have avatarUrl but session has image, update it
      if (!profile.avatarUrl && session?.user?.image) {
        console.log("Updating avatarUrl from session...");
        try {
          await userAPI.updateProfile({ avatarUrl: session.user.image });
          profile.avatarUrl = session.user.image;
        } catch (error) {
          console.error("Failed to update avatarUrl:", error);
        }
      }

      setUserStats(stats);
      setNotifications(notifs);
      setUserProfile(profile);
      setEditedProfile({
        name: profile.name || "",
        studentId: profile.studentId || "",
        faculty: profile.faculty || "",
        major: profile.major || "",
        year: profile.year || 1,
        bio: profile.bio || "",
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const result = await userAPI.updateProfile(editedProfile);
      setUserProfile(result.user);
      setIsEditing(false);
      await update();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-campus-blue-dark mx-auto mb-4"></div>
          <p className="text-dark-gray text-lg">Loading account...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-secondary-50">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/campus-circle-logo.png"
                alt="CampusCircle Logo"
                className="h-12 sm:h-14 w-auto"
              />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className="relative p-2 text-medium-gray hover:text-dark-gray transition-colors"
                onClick={() => router.push("/dashboard")}
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-dark-blue rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                      </div>
                    )}
                    <span className="text-xs sm:text-sm font-medium text-dark-gray hidden sm:block">
                      {session?.user?.name || session?.user?.email || "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/library")}>
                    <Library className="mr-2 h-4 w-4" />
                    <span>My Library</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard?tab=wallet")}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>My Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 pb-28 lg:pb-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-2xl">My Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row items-start gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || "User"}
                      width={96}
                      height={96}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 sm:border-4 border-primary-100"
                      unoptimized
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-dark-blue rounded-full flex items-center justify-center border-2 sm:border-4 border-primary-100">
                      <User className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-left w-full">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editedProfile.name}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                name: e.target.value,
                              })
                            }
                            className="mt-1"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentId">Student ID</Label>
                          <Input
                            id="studentId"
                            value={editedProfile.studentId}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                studentId: e.target.value,
                              })
                            }
                            className="mt-1"
                            placeholder="e.g., 2502012345"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="faculty">Faculty/School</Label>
                          <Select
                            value={editedProfile.faculty}
                            onValueChange={(value) =>
                              setEditedProfile({
                                ...editedProfile,
                                faculty: value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select faculty/school" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="School of Computer Science">
                                School of Computer Science
                              </SelectItem>
                              <SelectItem value="School of Information Systems">
                                School of Information Systems
                              </SelectItem>
                              <SelectItem value="School of Design">
                                School of Design
                              </SelectItem>
                              <SelectItem value="School of Accounting">
                                School of Accounting
                              </SelectItem>
                              <SelectItem value="Faculty of Engineering">
                                Faculty of Engineering
                              </SelectItem>
                              <SelectItem value="Faculty of Humanities">
                                Faculty of Humanities
                              </SelectItem>
                              <SelectItem value="Faculty of Digital Communication and Hotel & Tourism">
                                Faculty of Digital Communication and Hotel &
                                Tourism
                              </SelectItem>
                              <SelectItem value="BINUS Business School">
                                BINUS Business School
                              </SelectItem>
                              <SelectItem value="BINUS ASO School of Engineering">
                                BINUS ASO School of Engineering
                              </SelectItem>
                              <SelectItem value="School of Computing and Creative Arts">
                                School of Computing and Creative Arts (Binus
                                International)
                              </SelectItem>
                              <SelectItem value="BINUS Graduate Program">
                                BINUS Graduate Program
                              </SelectItem>
                              <SelectItem value="BINUS Online Learning">
                                BINUS Online Learning
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            value={editedProfile.major}
                            onChange={(e) =>
                              setEditedProfile({
                                ...editedProfile,
                                major: e.target.value,
                              })
                            }
                            className="mt-1"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={editedProfile.year.toString()}
                          onValueChange={(value) =>
                            setEditedProfile({
                              ...editedProfile,
                              year: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Year 1</SelectItem>
                            <SelectItem value="2">Year 2</SelectItem>
                            <SelectItem value="3">Year 3</SelectItem>
                            <SelectItem value="4">Year 4</SelectItem>
                            <SelectItem value="5">Year 5</SelectItem>
                            <SelectItem value="6">Year 6</SelectItem>
                            <SelectItem value="7">Year 7</SelectItem>
                            <SelectItem value="8">Year 8</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editedProfile.bio}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              bio: e.target.value,
                            })
                          }
                          className="mt-1"
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditedProfile({
                              name: userProfile?.name || "",
                              studentId: userProfile?.studentId || "",
                              faculty: userProfile?.faculty || "",
                              major: userProfile?.major || "",
                              year: userProfile?.year || 1,
                              bio: userProfile?.bio || "",
                            });
                            setIsEditing(false);
                          }}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-start gap-2 mb-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-dark-gray">
                          {userProfile?.name || "User"}
                        </h2>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 hover:bg-secondary-100 rounded transition-colors"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-medium-gray" />
                        </button>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-medium-gray">
                        <div className="flex items-center justify-start gap-2">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{userProfile?.email}</span>
                        </div>
                        <div className="flex items-center justify-start gap-2">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>
                            {userProfile?.studentId || "No Student ID"}
                          </span>
                        </div>
                        <div className="flex items-center justify-start gap-2 min-w-0">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate text-xs sm:text-sm">
                            {userProfile?.faculty || "No Faculty"} -{" "}
                            {userProfile?.major || "No Major"}
                          </span>
                        </div>
                        <div className="flex items-center justify-start gap-2">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>Year {userProfile?.year || "N/A"}</span>
                        </div>
                        {userProfile?.bio && (
                          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-700 italic">
                              {userProfile.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-dark-gray">
                    {userStats?.itemsSold || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Items Sold
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-dark-gray">
                    {userStats?.itemsBought || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Items Bought
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-dark-gray">
                    {userStats?.messagesCount || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Messages
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-dark-gray">
                    {userStats?.averageRating?.toFixed(1) || "5.0"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Rating
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                size="sm"
                onClick={() => router.push("/orders")}
              >
                <Package className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                size="sm"
                onClick={() => router.push("/library")}
              >
                <Library className="mr-2 h-4 w-4" />
                View My Library
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start text-sm"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
