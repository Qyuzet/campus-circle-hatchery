import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingsGrid } from "./ListingsGrid";
import { ListingsEmptyState } from "./ListingsEmptyState";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: string;
  imageUrl: string | null;
  viewCount: number;
}

export async function ListingsTab({ userId }: { userId: string }) {
  const listings = await prisma.marketplaceItem.findMany({
    where: {
      sellerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Listings</CardTitle>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <ListingsEmptyState />
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </CardContent>
    </Card>
  );
}
