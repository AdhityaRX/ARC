import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@arc.dev" },
    update: { role: "super_admin" },
    create: {
      email: "admin@arc.dev",
      name: "Super Admin",
      passwordHash,
      role: "super_admin",
    },
  });

  console.log("Seed complete.");
  console.log("  Super Admin → admin@arc.dev / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
