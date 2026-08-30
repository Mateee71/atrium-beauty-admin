import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles...");

  const roles = [
    { name: "USER", longName: "Standard User" },
    { name: "ADMIN", longName: "Administrator" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  console.log("Roles seeded.");

  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });

  if (!userRole) throw new Error("USER role not found!");

  await prisma.user.updateMany({
    where: { roleId: null },
    data: { roleId: userRole.id },
  });

  console.log("Existing users assigned to USER role.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
