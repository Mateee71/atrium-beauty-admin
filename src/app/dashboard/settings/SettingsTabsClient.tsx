"use client";

import { CalendarDays, Globe, Settings2 } from "lucide-react";

import AvailabilitySettings from "@/components/availability/AvailabilitySettings";
import SideTabsLayout from "@/components/layout/SideTabsLayout";
import SettingsClient from "./settingsClient";

export default function SettingsTabsClient() {
  return (
    <SideTabsLayout
      defaultTab="general"
      tabs={[
        {
          id: "general",
          title: "Alap adatok",
          description: "Weboldal, cím, elérhetőségek",
          icon: Globe,
          content: (
            <div className="rounded-lg border bg-primary-foreground p-6">
              <div className="mb-6 flex items-center gap-2">
                <Settings2 className="size-5" />
                <h2 className="text-lg font-semibold">
                  Weboldal beállítások
                </h2>
              </div>

              <SettingsClient />
            </div>
          ),
        },
        {
          id: "availability",
          title: "Elérhetőség",
          description: "Alap heti beosztás és kivételek",
          icon: CalendarDays,
          content: <AvailabilitySettings canEdit mode="default" />,
        },
      ]}
    />
  );
}