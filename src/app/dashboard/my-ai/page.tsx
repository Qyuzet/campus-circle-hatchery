import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { MyAIClient } from "@/components/my-ai/MyAIClient";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "My AI - CampusCircle",
  description: "AI-powered note-taking and lecture transcription",
};

export default async function MyAIPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const [aiNotes, liveLectureInterest] = await Promise.all([
    prisma.aINote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.liveLectureInterest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tab = searchParams.tab || "notes";

  return (
    <DashboardLayout activeTab="my-ai">
      <MyAIClient
        initialNotes={aiNotes}
        hasSubmittedInterest={!!liveLectureInterest}
        user={{
          id: user.id,
          email: user.email,
          name: user.name,
          faculty: user.faculty,
          major: user.major,
        }}
        initialTab={tab}
      />
    </DashboardLayout>
  );
}

