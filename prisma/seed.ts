import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test users
  console.log("Creating test users...");

  const seller = await prisma.user.upsert({
    where: { email: "seller@binus.ac.id" },
    update: {},
    create: {
      email: "seller@binus.ac.id",
      name: "John Seller",
      studentId: "2501001",
      faculty: "Computer Science",
      major: "Software Engineering",
      year: 3,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@binus.ac.id" },
    update: {},
    create: {
      email: "buyer@binus.ac.id",
      name: "Jane Buyer",
      studentId: "2501002",
      faculty: "Computer Science",
      major: "Computer Science",
      year: 2,
    },
  });

  console.log("✅ Users created:", {
    seller: seller.email,
    buyer: buyer.email,
  });

  // Create user stats
  await prisma.userStats.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      itemsSold: 0,
      itemsBought: 0,
      totalEarnings: 0,
      totalSpent: 0,
      messagesCount: 0,
      tutoringSessions: 0,
      reviewsGiven: 0,
      reviewsReceived: 0,
    },
  });

  await prisma.userStats.upsert({
    where: { userId: buyer.id },
    update: {},
    create: {
      userId: buyer.id,
      itemsSold: 0,
      itemsBought: 0,
      totalEarnings: 0,
      totalSpent: 0,
      messagesCount: 0,
      tutoringSessions: 0,
      reviewsGiven: 0,
      reviewsReceived: 0,
    },
  });

  console.log("✅ User stats created");

  // Create marketplace items
  console.log("Creating marketplace items...");

  const items = [
    {
      title: "Introduction to Algorithms (CLRS)",
      description:
        "Classic algorithms textbook in excellent condition. Perfect for Data Structures course.",
      price: 150000,
      category: "Books",
      course: "Data Structures",
      faculty: "Computer Science",
      condition: "Used - Like New",
      imageUrl:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
      status: "available",
      sellerId: seller.id,
    },
    {
      title: "Scientific Calculator Casio FX-991EX",
      description:
        "Advanced scientific calculator, barely used. Great for engineering students.",
      price: 250000,
      category: "Electronics",
      course: "Engineering Mathematics",
      faculty: "Engineering",
      condition: "Used - Like New",
      imageUrl:
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
      status: "available",
      sellerId: seller.id,
    },
    {
      title: "Data Structures & Algorithms Notes",
      description:
        "Comprehensive handwritten notes from Prof. Anderson's class. Includes all topics and examples.",
      price: 50000,
      category: "Notes",
      course: "Data Structures & Algorithms",
      faculty: "Computer Science",
      condition: "Used - Good",
      imageUrl:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
      status: "available",
      sellerId: seller.id,
    },
    {
      title: "Laptop Stand - Aluminum",
      description:
        "Ergonomic laptop stand, adjustable height. Perfect for online classes.",
      price: 120000,
      category: "Accessories",
      course: "General",
      faculty: "General",
      condition: "Used - Like New",
      imageUrl:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
      status: "available",
      sellerId: seller.id,
    },
    {
      title: "Python Programming Book",
      description: "Learn Python the Hard Way - Complete guide for beginners",
      price: 80000,
      category: "Books",
      course: "Programming Fundamentals",
      faculty: "Computer Science",
      condition: "Used - Good",
      imageUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
      status: "available",
      sellerId: seller.id,
    },
  ];

  for (const item of items) {
    await prisma.marketplaceItem.create({
      data: item,
    });
  }

  console.log(`✅ Created ${items.length} marketplace items`);

  // Create tutoring sessions
  console.log("Creating tutoring sessions...");

  const sessions = [
    {
      subject: "Data Structures & Algorithms",
      course: "Data Structures & Algorithms",
      description:
        "Expert tutoring in DSA. Covers arrays, linked lists, trees, graphs, sorting, and searching algorithms.",
      price: 100000,
      duration: 120,
      status: "pending",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      tutorId: seller.id,
      studentId: buyer.id,
    },
    {
      subject: "Database Systems",
      course: "Database Management Systems",
      description:
        "SQL, NoSQL, database design, normalization, and query optimization.",
      price: 120000,
      duration: 90,
      status: "pending",
      scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      tutorId: seller.id,
      studentId: buyer.id,
    },
    {
      subject: "Web Development (React & Next.js)",
      course: "Web Programming",
      description:
        "Modern web development with React, Next.js, and TypeScript. Build real-world projects.",
      price: 150000,
      duration: 120,
      status: "pending",
      scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      tutorId: seller.id,
      studentId: buyer.id,
    },
  ];

  for (const session of sessions) {
    await prisma.tutoringSession.create({
      data: session,
    });
  }

  console.log(`✅ Created ${sessions.length} tutoring sessions`);

  // Create a sample conversation
  console.log("Creating sample conversation...");

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        connect: [{ id: seller.id }, { id: buyer.id }],
      },
      lastMessage: "Hi! Is the calculator still available?",
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: buyer.id,
      content: "Hi! Is the calculator still available?",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: seller.id,
      content: "Yes, it's still available! Would you like to buy it?",
    },
  });

  console.log("✅ Created sample conversation with messages");

  // Create sample notifications
  console.log("Creating sample notifications...");

  await prisma.notification.create({
    data: {
      userId: seller.id,
      type: "message",
      title: "New Message",
      message: "Jane Buyer sent you a message",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: buyer.id,
      type: "system",
      title: "Welcome to CampusCircle!",
      message: "Start exploring marketplace items and tutoring sessions",
      isRead: false,
    },
  });

  console.log("✅ Created sample notifications");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Test Accounts:");
  console.log("   Seller: seller@binus.ac.id (Student ID: 2501001)");
  console.log("   Buyer:  buyer@binus.ac.id (Student ID: 2501002)");
  console.log("\n💡 You can now test the payment flow:");
  console.log("   1. Login as buyer@binus.ac.id");
  console.log("   2. Go to Discovery tab");
  console.log("   3. Click on any item");
  console.log("   4. Click 'Buy Now' to test payment");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
