import { prisma } from "@/lib/prisma";
import { LibraryTabClient } from "./LibraryTabClient";

export async function LibraryTab({ userId }: { userId: string }) {
  const transactions = await prisma.transaction.findMany({
    where: {
      buyerId: userId,
      status: "COMPLETED",
      itemType: "marketplace",
    },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          fileUrl: true,
          fileName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalItems = transactions.length;
  const notesCount = transactions.filter(
    (t) => t.item?.category === "Notes"
  ).length;
  const booksCount = transactions.filter(
    (t) => t.item?.category === "Book"
  ).length;

  return (
    <LibraryTabClient
      transactions={transactions}
      totalItems={totalItems}
      notesCount={notesCount}
      booksCount={booksCount}
    />
  );
}
