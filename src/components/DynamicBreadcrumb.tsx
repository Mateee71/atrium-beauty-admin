"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import React from "react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  calendar: "Naptár",
  settings: "Beállítások",
  users: "Alkalmazottak",
  profile: "Profil",
  appointments: "Időpontok",
};

interface DynamicBreadcrumbProps {
  userName?: string | null;
}

export default function DynamicBreadcrumb({ userName }: DynamicBreadcrumbProps) {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter((segment) => segment.length > 0);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          let label = labelMap[segment] || decodeURIComponent(segment);

          const usersIndex = segments.indexOf("users");
          if (usersIndex !== -1 && index === usersIndex + 1 && userName) {
            label = `${userName} Profilja`;
          }

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {!isLast ? (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
