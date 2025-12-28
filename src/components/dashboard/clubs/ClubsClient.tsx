"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClubsList } from "./ClubsList";
import { MyClubsList } from "./MyClubsList";
import { JoinClubConfirmDialog } from "./JoinClubConfirmDialog";
import { ProfileCompleteModal } from "./ProfileCompleteModal";
import { SupportContactModal } from "@/components/SupportContactModal";
import { toast } from "sonner";

type Club = {
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  category: string;
  memberCount: number;
  isOpenForRegistration: boolean;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  registrationLink: string | null;
  websiteUrl: string | null;
  joinMode: string;
  createdAt: Date;
  updatedAt: Date;
};

type ClubJoinRequest = {
  id: string;
  clubId: string;
  userId: string;
  status: string;
  requestedAt: Date;
  respondedAt: Date | null;
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  studentId: string | null;
  faculty: string | null;
  major: string | null;
  year: number | null;
} | null;

type ClubsClientProps = {
  initialAllClubs: Club[];
  initialMyClubs: Club[];
  initialClubJoinRequests: ClubJoinRequest[];
  initialSubTab: "browse" | "my-clubs";
  userId: string;
  isProfileComplete: boolean;
  userProfile: UserProfile;
};

export function ClubsClient({
  initialAllClubs,
  initialMyClubs,
  initialClubJoinRequests,
  initialSubTab,
  userId,
  isProfileComplete,
  userProfile,
}: ClubsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clubsSubTab, setClubsSubTab] = useState<"browse" | "my-clubs">(
    initialSubTab
  );
  const [allClubs, setAllClubs] = useState(initialAllClubs);
  const [myClubs, setMyClubs] = useState(initialMyClubs);
  const [clubJoinRequests, setClubJoinRequests] = useState(
    new Map(initialClubJoinRequests.map((r) => [r.clubId, r]))
  );
  const [requestingClubs, setRequestingClubs] = useState(new Set<string>());
  const [clubToJoin, setClubToJoin] = useState<{
    id: string;
    name: string;
    joinMode: string;
    isApproved: boolean;
  } | null>(null);
  const [showJoinClubConfirm, setShowJoinClubConfirm] = useState(false);
  const [showProfileCompleteModal, setShowProfileCompleteModal] =
    useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: userProfile?.name || "",
    studentId: userProfile?.studentId || "",
    faculty:
      userProfile?.faculty === "Unknown" ? "" : userProfile?.faculty || "",
    major: userProfile?.major === "Unknown" ? "" : userProfile?.major || "",
    year: userProfile?.year || 1,
  });
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportContext, setSupportContext] = useState<{
    itemId: string;
    itemType: string;
    itemTitle: string;
  } | null>(null);

  const handleSubTabChange = (tab: "browse" | "my-clubs") => {
    setClubsSubTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/dashboard/clubs?${params.toString()}`);
  };

  const refreshMyClubs = async () => {
    try {
      const response = await fetch("/api/clubs/my-clubs");
      if (response.ok) {
        const data = await response.json();
        setMyClubs(data);
      }
    } catch (error) {
      console.error("Failed to refresh my clubs:", error);
    }
  };

  const refreshClubRequests = async () => {
    try {
      const requests = await Promise.all(
        allClubs.map(async (club) => {
          const res = await fetch(`/api/clubs/${club.id}/request-status`);
          if (res.ok) {
            const { request } = await res.json();
            return request ? [club.id, request] : null;
          }
          return null;
        })
      );
      const newMap = new Map(
        requests.filter((r): r is [string, ClubJoinRequest] => r !== null)
      );
      setClubJoinRequests(newMap);
    } catch (error) {
      console.error("Failed to refresh club requests:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Sub-tabs */}
        <div className="flex gap-2 border-b border-light-gray">
          <button
            onClick={() => handleSubTabChange("browse")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              clubsSubTab === "browse"
                ? "text-dark-blue border-b-2 border-dark-blue"
                : "text-medium-gray hover:text-dark-gray"
            }`}
          >
            Browse Clubs
          </button>
          <button
            onClick={() => handleSubTabChange("my-clubs")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              clubsSubTab === "my-clubs"
                ? "text-dark-blue border-b-2 border-dark-blue"
                : "text-medium-gray hover:text-dark-gray"
            }`}
          >
            My Clubs
          </button>
        </div>

        {/* Browse Clubs */}
        {clubsSubTab === "browse" && (
          <ClubsList
            clubs={allClubs}
            myClubs={myClubs}
            clubJoinRequests={clubJoinRequests}
            requestingClubs={requestingClubs}
            isProfileComplete={isProfileComplete}
            onJoinClick={(club, joinMode, isApproved) => {
              if (!isProfileComplete) {
                setShowProfileCompleteModal(true);
                toast.error(
                  "Please complete your profile before joining a club"
                );
                return;
              }
              setClubToJoin({
                id: club.id,
                name: club.name,
                joinMode,
                isApproved,
              });
              setShowJoinClubConfirm(true);
            }}
            onRequestJoin={async (clubId) => {
              setRequestingClubs((prev) => new Set(prev).add(clubId));
              try {
                const response = await fetch(
                  `/api/clubs/${clubId}/request-join`,
                  {
                    method: "POST",
                  }
                );
                const data = await response.json();
                if (response.ok) {
                  toast.success("Request submitted successfully!");
                  await refreshClubRequests();
                } else {
                  toast.error(data.error || "Failed to submit request");
                }
              } catch (error) {
                toast.error("Failed to process request");
              } finally {
                setRequestingClubs((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(clubId);
                  return newSet;
                });
              }
            }}
            onSupportClick={(clubId, clubName) => {
              setSupportContext({
                itemId: clubId,
                itemType: "club",
                itemTitle: clubName,
              });
              setShowSupportModal(true);
            }}
          />
        )}

        {/* My Clubs */}
        {clubsSubTab === "my-clubs" && (
          <MyClubsList
            clubs={myClubs}
            onLeaveClub={async (clubId) => {
              try {
                const response = await fetch(`/api/clubs/${clubId}/leave`, {
                  method: "POST",
                });
                if (response.ok) {
                  toast.success("Left club successfully!");
                  await refreshMyClubs();
                } else {
                  toast.error("Failed to leave club");
                }
              } catch (error) {
                toast.error("Failed to leave club");
              }
            }}
            onBrowseClick={() => handleSubTabChange("browse")}
            onSupportClick={(clubId, clubName) => {
              setSupportContext({
                itemId: clubId,
                itemType: "club",
                itemTitle: clubName,
              });
              setShowSupportModal(true);
            }}
          />
        )}
      </div>

      {/* Join Club Confirmation Dialog */}
      {clubToJoin && (
        <JoinClubConfirmDialog
          open={showJoinClubConfirm}
          onOpenChange={setShowJoinClubConfirm}
          clubName={clubToJoin.name}
          joinMode={clubToJoin.joinMode}
          isApproved={clubToJoin.isApproved}
          onConfirm={async () => {
            try {
              const response = await fetch(`/api/clubs/${clubToJoin.id}/join`, {
                method: "POST",
              });
              const data = await response.json();
              if (response.ok) {
                toast.success(`Successfully joined ${clubToJoin.name}!`);
                await refreshMyClubs();
                setShowJoinClubConfirm(false);
                setClubToJoin(null);
              } else {
                toast.error(data.error || "Failed to join club");
              }
            } catch (error) {
              toast.error("Failed to join club");
            }
          }}
        />
      )}

      {/* Profile Complete Modal */}
      <ProfileCompleteModal
        open={showProfileCompleteModal}
        onOpenChange={setShowProfileCompleteModal}
        formData={profileFormData}
        onFormDataChange={setProfileFormData}
        userId={userId}
        onSuccess={() => {
          toast.success("Profile updated successfully!");
          setShowProfileCompleteModal(false);
          router.refresh();
        }}
      />

      {/* Support Modal */}
      {supportContext && (
        <SupportContactModal
          isOpen={showSupportModal}
          onClose={() => {
            setShowSupportModal(false);
            setSupportContext(null);
          }}
          relatedItemId={supportContext.itemId}
          relatedItemType={supportContext.itemType}
          relatedItemTitle={supportContext.itemTitle}
        />
      )}
    </>
  );
}
