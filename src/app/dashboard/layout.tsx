import { cookies } from "next/headers";
import DashboardProvider from "./DashboardProvider";

import { SITE_NAME } from "@/config";
import { prisma } from "@/lib/prisma";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: SITE_NAME + " - Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

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

  if (!currentUser) {
    redirect("/login");
  }

  const isAdmin = currentUser.role?.name === "ADMIN";

  const users = isAdmin
    ? await prisma.user.findMany({
        include: {
          role: true,
          profile: true,
        },
      })
    : [];

  return (
    <DashboardProvider
      defaultOpen={defaultOpen}
      users={users}
      isAdmin={isAdmin}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </DashboardProvider>
  );
}