import { prisma } from "@/lib/prisma";
import UsersPageClient from "@/components/Users/UsersPageClient";
import { SITE_NAME } from "@/config";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: SITE_NAME + " - Alkalmazottak",
};

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      role: true,
    },
  });

  if (currentUser?.role?.name !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      profile: true,
      role: true,
    },
  });

  const roles = await prisma.role.findMany();

  return <UsersPageClient users={users} roles={roles} />;
}