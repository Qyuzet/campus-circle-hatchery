import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventsGrid } from "./EventsGrid";
import { EventsEmptyState } from "./EventsEmptyState";

export async function EventsTab({ userId }: { userId: string }) {
  const registrations = await prisma.eventParticipant.findMany({
    where: {
      userId,
    },
    include: {
      event: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
          avatarUrl: true,
        },
      },
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
