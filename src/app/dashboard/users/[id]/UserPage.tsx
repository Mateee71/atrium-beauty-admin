"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Edit,
  Mail,
  Phone,
  User,
} from "lucide-react";

import AppBarCartInteractive from "@/components/AppBarChartInteractive";
import AvailabilitySettings from "@/components/availability/AvailabilitySettings";
import EditUser from "@/components/EditUser";
import SideTabsLayout from "@/components/layout/SideTabsLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NO_USER_IMAGE } from "@/config";
import { cn } from "@/lib/utils";

interface UserType {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  profile: {
    phone: string | null;
    bio: string | null;
  } | null;
  accounts: {
    provider: string;
  }[];
  role: {
    name: string;
    longName: string | null;
  };
}

interface Role {
  id: string;
  name: string;
  longName: string | null;
}

interface UserPageProps {
  user: UserType;
  roles: Role[];
  canEditRole?: boolean;
  canEditAvailability?: boolean;
}

const tabs = [
  {
    id: "overview",
    title: "Áttekintés",
    description: "Profil és alap adatok",
    icon: User,
  },
  {
    id: "availability",
    title: "Elérhetőség",
    description: "Heti beosztás és kivételek",
    icon: CalendarDays,
  },
  {
    id: "performance",
    title: "Teljesítmény",
    description: "Ügyfelek és statisztikák",
    icon: BarChart3,
  },
] as const;

const UserPage: React.FC<UserPageProps> = ({
  user,
  roles,
  canEditRole = false,
  canEditAvailability = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function capitalizeFirstLetter(str: any) {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const roleLabel = capitalizeFirstLetter(user.role.longName || user.role.name);

  return (
    <div className="mt-4">
      <SideTabsLayout
        defaultTab="overview"
        tabs={[
          {
            id: "overview",
            title: "Áttekintés",
            description: "Profil és alap adatok",
            icon: User,
            content: (
              <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary-foreground p-4 pt-6">
                    <div className="mb-6 flex items-center gap-2">
                      <Avatar className="mr-4 size-18">
                        <AvatarImage
                          src={user.image || NO_USER_IMAGE}
                          className="rounded-full object-cover"
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col items-start">
                        <span className="mb-1 text-2xl font-bold tracking-tight">
                          {user.name}
                        </span>
                        <span className="text-sm font-bold text-muted-foreground">
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Csatlakozott:{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("hu-HU")
                          : "Ismeretlen dátum"}
                      </p>

                      <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                          <Button className="rounded-md border">
                            <Edit />
                            Szerkesztés
                          </Button>
                        </SheetTrigger>

                        <SheetContent>
                          <SheetTitle>Edit User Profile</SheetTitle>

                          <EditUser
                            user={user}
                            roles={roles}
                            canEditRole={canEditRole}
                            onClose={() => setIsOpen(false)}
                          />
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary-foreground p-4">
                    <h1 className="mb-4 text-md font-semibold">
                      Felhasználó adatai
                    </h1>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Teljes név
                            </p>
                            <p className="text-sm font-medium">{user.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-emerald-300 bg-emerald-50 text-emerald-600"
                          >
                            Online
                          </Badge>
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{user.email}</p>
                          </div>
                        </div>

                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Telefonszám
                            </p>
                            <p className="text-sm font-medium">
                              {user.profile?.phone || "Nincs adat"}
                            </p>
                          </div>
                        </div>

                        <Phone className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Beosztás
                            </p>
                            <p className="text-sm font-medium">{roleLabel}</p>
                          </div>
                        </div>

                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-primary-foreground p-4">
                  <h1 className="text-xl font-semibold">Ügyfelek száma</h1>
                  <AppBarCartInteractive />
                </div>
              </div>
            ),
          },
          {
            id: "availability",
            title: "Elérhetőség",
            description: "Heti beosztás és kivételek",
            icon: CalendarDays,
            content: (
              <AvailabilitySettings
                userId={user.id}
                canEdit={canEditAvailability}
              />
            ),
          },
          {
            id: "performance",
            title: "Teljesítmény",
            description: "Ügyfelek és statisztikák",
            icon: BarChart3,
            content: (
              <div className="rounded-lg bg-primary-foreground p-4">
                <h1 className="text-xl font-semibold">Ügyfelek száma</h1>
                <AppBarCartInteractive />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default UserPage;