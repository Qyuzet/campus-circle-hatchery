"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, HelpCircle } from "lucide-react";

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

type MyClubsListProps = {
  clubs: Club[];
  onLeaveClub: (clubId: string) => Promise<void>;
  onBrowseClick: () => void;
  onSupportClick: (clubId: string, clubName: string) => void;
};

export function MyClubsList({
  clubs,
  onLeaveClub,
  onBrowseClick,
  onSupportClick,
}: MyClubsListProps) {
  if (clubs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-medium-gray mx-auto mb-4" />
          <p className="text-medium-gray mb-2">
            You have not joined any clubs yet
          </p>
          <Button onClick={onBrowseClick} variant="outline" size="sm">
            Browse Clubs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
      {clubs.map((club) => (
        <div key={club.id} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSupportClick(club.id, club.name);
            }}
            className="absolute top-1 right-1 md:top-2 md:right-2 z-50 bg-white/90 hover:bg-white backdrop-blur-sm p-1 md:p-1.5 rounded-full shadow-sm transition-all hover:shadow-md group pointer-events-auto cursor-pointer"
            title="Contact Support"
          >
            <HelpCircle className="h-3 w-3 md:h-4 md:w-4 text-gray-600 group-hover:text-blue-600 transition-colors pointer-events-none" />
          </button>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-2 md:p-6 pb-2 md:pb-6">
              <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
                {club.logoUrl ? (
                  <Image
                    src={club.logoUrl}
                    alt={club.name}
                    width={64}
                    height={48}
                    className="w-14 h-11 md:w-16 md:h-12 rounded-md md:rounded-lg object-contain bg-white"
                  />
                ) : (
                  <div className="w-14 h-11 md:w-16 md:h-12 bg-dark-blue rounded-md md:rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left w-full">
                  <CardTitle className="text-xs md:text-base leading-tight md:leading-normal line-clamp-2 md:line-clamp-none">
                    {club.name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="text-[10px] md:text-xs mt-0.5 md:mt-1 px-1.5 md:px-2.5 py-0 md:py-0.5"
                  >
                    {club.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
              <p className="text-[10px] md:text-sm text-medium-gray line-clamp-2 mb-1.5 md:mb-3 leading-tight md:leading-normal">
                {club.description}
              </p>
              <div className="space-y-1 md:space-y-2 mb-1.5 md:mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-medium-gray">
                    {club.memberCount} members
                  </span>
                  <Badge
                    variant={
                      club.isOpenForRegistration ? "default" : "secondary"
                    }
                    className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0 md:py-0.5"
                  >
                    {club.isOpenForRegistration ? "Open" : "Closed"}
                  </Badge>
                </div>
                {club.registrationStartDate && club.registrationEndDate && (
                  <p className="text-[10px] md:text-xs text-medium-gray leading-tight md:leading-normal">
                    Registration:{" "}
                    {new Date(club.registrationStartDate).toLocaleDateString()}{" "}
                    - {new Date(club.registrationEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {club.websiteUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mb-1 md:mb-2 text-[10px] md:text-sm h-7 md:h-9 px-2 md:px-4"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = club.websiteUrl!;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                  <span className="hidden md:inline">Visit Website</span>
                  <span className="md:hidden">Website</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[10px] md:text-sm h-7 md:h-9 px-2 md:px-4"
                onClick={() => onLeaveClub(club.id)}
              >
                Leave
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

