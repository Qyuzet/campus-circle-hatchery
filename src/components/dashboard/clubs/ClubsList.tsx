"use client";

import ClubCard from "./ClubCard";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

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

type ClubsListProps = {
  clubs: Club[];
  myClubs: Club[];
  clubJoinRequests: Map<string, ClubJoinRequest>;
  requestingClubs: Set<string>;
  isProfileComplete: boolean;
  onJoinClick: (club: Club, joinMode: string, isApproved: boolean) => void;
  onRequestJoin: (clubId: string) => Promise<void>;
  onSupportClick: (clubId: string, clubName: string) => void;
};

export function ClubsList({
  clubs,
  myClubs,
  clubJoinRequests,
  requestingClubs,
  isProfileComplete,
  onJoinClick,
  onRequestJoin,
  onSupportClick,
}: ClubsListProps) {
  if (clubs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-medium-gray mx-auto mb-4" />
          <p className="text-medium-gray">No clubs available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
      {clubs.map((club) => {
        const isMember = myClubs.some((c) => c.id === club.id);
        const joinRequest = clubJoinRequests.get(club.id);
        const isRequesting = requestingClubs.has(club.id);

        return (
          <ClubCard
            key={club.id}
            club={club}
            isMember={isMember}
            joinRequest={joinRequest}
            isRequesting={isRequesting}
            isProfileComplete={isProfileComplete}
            onJoinClick={onJoinClick}
            onRequestJoin={onRequestJoin}
            onSupportClick={onSupportClick}
          />
        );
      })}
    </div>
  );
}
