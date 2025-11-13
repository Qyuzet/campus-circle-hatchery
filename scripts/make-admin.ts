// Script to make a user admin
// Usage: npx tsx scripts/make-admin.ts <email>

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Error: Please provide an email address");
    console.log("Usage: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Error: User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    if (user.role === "admin") {
      console.log("ℹ️  User is already an admin");
      process.exit(0);
    }

    console.log("🔄 Updating user role to admin...");

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    console.log("✅ Success! User is now an admin");
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();

