import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/config";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import SettingsTabsClient from "./SettingsTabsClient";

export const metadata = {
  title: SITE_NAME + " - Beállítások",
};

export default async function SettingsPage() {
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

  return (
    <div className="space-y-6">
      <DynamicBreadcrumb />

      <div>
        <h1 className="text-xl font-semibold">Beállítások</h1>
        <p className="text-sm text-muted-foreground">
          Globális admin beállítások.
        </p>
      </div>

      <SettingsTabsClient />
    </div>
  );
}