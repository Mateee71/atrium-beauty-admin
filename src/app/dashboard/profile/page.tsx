import React from "react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { SITE_NAME } from "@/config";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfileByEmail } from "@/lib/actions";
import UserPage from "@/app/dashboard/users/[id]/UserPage";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: SITE_NAME + " - Profil",
};

export default async function Page() {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.email) {
    redirect("/api/auth/login?callbackUrl=/dashboard/profile");
  }

  const userData = await getUserProfileByEmail(sessionUser.email);
  const roles = await prisma.role.findMany();

  if (!userData?.success || !userData.data) {
    redirect("/api/auth/login?callbackUrl=/dashboard/profile");
  }

  return (
    <div>
      <DynamicBreadcrumb userName={userData.data.name} />
      <UserPage
        user={userData.data}
        roles={roles}
        canEditRole={userData.data.role?.name === "ADMIN"}
        canEditAvailability
      />
    </div>
  );
}