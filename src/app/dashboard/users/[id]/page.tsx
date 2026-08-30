import React from 'react'
import DynamicBreadcrumb from '@/components/DynamicBreadcrumb'
import { SITE_NAME } from '@/config'
import { redirect } from 'next/navigation'
import { getUserProfileById } from '@/lib/actions'
import UserPage from './UserPage'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth";

export const metadata = {
  title: SITE_NAME + ' - Profil',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const userData = await getUserProfileById(id);

  const session = await auth();

  const currentUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
        include: {
          role: true,
        },
      })
    : null;

  const canEditRole = currentUser?.role?.name === "ADMIN";

  const roles = await prisma.role.findMany();

  if (!userData?.success || !userData.data) {
    redirect("/api/auth/login?callbackUrl=/profile");
  }

  const user = userData.data;

  return (
    <div>
      <DynamicBreadcrumb userName={user.name} />
      <UserPage
        user={user}
        roles={roles}
        canEditRole={canEditRole}
        canEditAvailability={canEditRole}
      />
    </div>
  )
}
