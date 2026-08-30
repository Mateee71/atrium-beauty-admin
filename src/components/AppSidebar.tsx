"use client";
import {
  Home,
  Calendar,
  Settings,
  ChevronDown,
  Users as UsersIcon,
  User as UserIcon,
  CalendarClock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { SITE_NAME, LOGO, LOGO_BLACK } from "../config";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";



const AppSidebar = ({ users, isAdmin }: { users: any[]; isAdmin: boolean }) => {

  const { state } = useSidebar();
  const collapsed = state === "collapsed"; 

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const items = [
    { title: "Kezdőlap", url: "/dashboard", icon: Home },
    { title: "Naptár", url: "/dashboard/calendar", icon: Calendar },
    { title: "Időpontok", url: "/dashboard/appointments", icon: CalendarClock },
    ...( isAdmin ? [{ title: "Alkalmazottak", url: "/dashboard/users", icon: UsersIcon },
                 { title: "Beállítások", url: "/dashboard/settings", icon: Settings }
                ] : []),
  ];

  return (
    <Sidebar collapsible="icon" className="group/sidebar">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Image
                  src={
                    mounted
                      ? theme === "dark"
                        ? LOGO
                        : LOGO_BLACK
                      : LOGO
                  }
                  alt="logo"
                  width={20}
                  height={20}
                />
                <span className="font-bold text-base">{SITE_NAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                  <Tooltip disableHoverableContent={!collapsed}>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="z-50">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
              </SidebarMenuItem>
            ))}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="hidden group-data-[state=collapsed]:flex" />

        {/* USERS COLLAPSIBLE */}
        {isAdmin && (
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Alkalmazottak
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {users.map((user) => (
                      <SidebarMenuItem key={user.id}>
                        <Tooltip disableHoverableContent={!collapsed}>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild>
                              <Link href={`/dashboard/users/${user.id}`}>
                                {user.image ? (
                                  <Image
                                    src={user.image}
                                    alt={user.name || "Felhasználó"}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <UserIcon className="w-5 h-5" />
                                )}
                                <span>{user.name || "Névtelen"}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right" className="z-50">
                              {user.name || "Felhasználó"}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
