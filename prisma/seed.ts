import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const email = "demo@example.com";
  const rawPassword = "password123";

  console.log("Seeding database...");

  // Check if the demo user already exists
  const existingUser = await prisma.user?.findUnique({
    where: { email },
  });

  if (!existingUser) {
    // Hash password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create demo user
    const user = await prisma.user?.create({
      data: {
        name: "Demo User",
        email,
        password: hashedPassword,
      },
    });

    console.log(`Demo user created:`);
    console.log(`- ID: ${user.id}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Password: ${rawPassword}`);
  } else {
    console.log(`Demo user already exists: ${email}`);
  }

  // Check if the admin user already exists
  const adminEmail = "admin@example.com";
  const existingAdmin = await prisma.user?.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user?.create({
      data: {
        name: "Platform Admin",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "ADMIN",
      },
    });

    console.log(`Admin user created:`);
    console.log(`- ID: ${admin.id}`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Password: admin123`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
