import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@arc.dev" },
    update: {},
    create: {
      email: "admin@arc.dev",
      name: "ARC Admin",
      passwordHash,
      role: "super_admin",
    },
  });

  console.log("Seed complete: admin@arc.dev / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
