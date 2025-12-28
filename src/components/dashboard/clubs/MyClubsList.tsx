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
        <div key={club.id} className="relative h-full">
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
          <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                {club.logoUrl ? (
                  <Image
                    src={club.logoUrl}
                    alt={club.name}
                    width={64}
                    height={48}
                    className="w-12 h-10 sm:w-16 sm:h-12 rounded object-contain bg-white"
                  />
                ) : (
                  <div className="w-12 h-10 sm:w-16 sm:h-12 bg-blue-600 rounded flex items-center justify-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left w-full">
                  <CardTitle className="text-sm sm:text-base leading-tight line-clamp-2 mb-1.5 sm:mb-2">
                    {club.name}
                  </CardTitle>
                  <div className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-purple-50 border-l-4 border-purple-600 rounded-sm w-fit">
                    <span className="text-[10px] sm:text-xs font-semibold text-purple-800">
                      {club.category}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 flex-1 flex flex-col">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 leading-relaxed">
                {club.description}
              </p>
              <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      {club.memberCount} members
                    </span>
                  </div>
                  <div
                    className={
                      club.isOpenForRegistration
                        ? "inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-50 border-l-4 border-green-600 rounded-sm"
                        : "inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-50 border-l-4 border-gray-600 rounded-sm"
                    }
                  >
                    <span
                      className={
                        club.isOpenForRegistration
                          ? "text-[10px] sm:text-xs font-semibold text-green-800"
                          : "text-[10px] sm:text-xs font-semibold text-gray-800"
                      }
                    >
                      {club.isOpenForRegistration ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
                {club.registrationStartDate && club.registrationEndDate && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Registration:{" "}
                    {new Date(club.registrationStartDate).toLocaleDateString()}{" "}
                    - {new Date(club.registrationEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-auto space-y-1.5 sm:space-y-2">
                {club.websiteUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs sm:text-sm h-8 sm:h-9"
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
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Visit Website</span>
                    <span className="sm:hidden">Website</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => onLeaveClub(club.id)}
                >
                  Leave Club
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
