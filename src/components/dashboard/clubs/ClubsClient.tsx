"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClubsList } from "./ClubsList";
import { MyClubsList } from "./MyClubsList";
import { JoinClubConfirmDialog } from "./JoinClubConfirmDialog";
import { LeaveClubConfirmDialog } from "./LeaveClubConfirmDialog";
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
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppLink, setWhatsAppLink] = useState("");
  const [clubToLeave, setClubToLeave] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showLeaveClubConfirm, setShowLeaveClubConfirm] = useState(false);

  const handleSubTabChange = (tab: "browse" | "my-clubs") => {
    setClubsSubTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/dashboard/clubs?${params.toString()}`);
  };

  const refreshAllClubs = async () => {
    try {
      const response = await fetch("/api/clubs");
      if (response.ok) {
        const data = await response.json();
        setAllClubs(data);
      }
    } catch (error) {
      console.error("Failed to refresh all clubs:", error);
    }
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
            onLeaveClub={(clubId) => {
              const club = myClubs.find((c) => c.id === clubId);
              if (club) {
                setClubToLeave({ id: club.id, name: club.name });
                setShowLeaveClubConfirm(true);
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
                await Promise.all([refreshMyClubs(), refreshAllClubs()]);
                setShowJoinClubConfirm(false);
                setClubToJoin(null);

                if (data.registrationLink) {
                  setWhatsAppLink(data.registrationLink);
                  setShowWhatsAppModal(true);
                }
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

      {/* Leave Club Confirmation Dialog */}
      {clubToLeave && (
        <LeaveClubConfirmDialog
          open={showLeaveClubConfirm}
          onOpenChange={setShowLeaveClubConfirm}
          clubName={clubToLeave.name}
          onConfirm={async () => {
            try {
              const response = await fetch(
                `/api/clubs/${clubToLeave.id}/leave`,
                {
                  method: "POST",
                }
              );
              if (response.ok) {
                toast.success("Left club successfully!");
                await Promise.all([refreshMyClubs(), refreshAllClubs()]);
                setShowLeaveClubConfirm(false);
                setClubToLeave(null);
              } else {
                toast.error("Failed to leave club");
              }
            } catch (error) {
              toast.error("Failed to leave club");
            }
          }}
        />
      )}

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

      {/* WhatsApp Group Modal */}
      {showWhatsAppModal && whatsAppLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Join WhatsApp Group
                  </h2>
                  <p className="text-sm text-white/90">
                    Click below to join the club group
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                You have successfully joined the club! Click the button below to
                join the WhatsApp group and connect with other members.
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowWhatsAppModal(false);
                    setWhatsAppLink("");
                  }}
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  onClick={() => {
                    window.open(whatsAppLink, "_blank");
                    setShowWhatsAppModal(false);
                    setWhatsAppLink("");
                  }}
                >
                  Join WhatsApp Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
