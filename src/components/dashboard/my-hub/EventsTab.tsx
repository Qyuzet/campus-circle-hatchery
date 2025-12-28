import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventsGrid } from "./EventsGrid";
import { EventsEmptyState } from "./EventsEmptyState";

interface Event {
  id: string;
  title: string;
  category: string;
  eventType: string;
  startDate: Date;
  location: string;
  price: number;
  isOnline: boolean;
  meetingLink: string | null;
}

export async function EventsTab({ userId }: { userId: string }) {
  const registrations = await prisma.eventParticipant.findMany({
    where: {
      userId,
    },
    include: {
      event: true,
    },
    orderBy: {
      registeredAt: "desc",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Event Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <EventsEmptyState />
        ) : (
          <EventsGrid registrations={registrations} />
        )}
      </CardContent>
    </Card>
  );
}
