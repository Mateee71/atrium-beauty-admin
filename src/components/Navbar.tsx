"use client";

import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import ThemeToggleButton from "@/components/ui/theme-toggle-button"

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  const avatarFallback = session?.user?.name?.charAt(0).toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        { session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex justify-center gap-4 cursor-pointer items-center">
                <span>{session?.user?.name || undefined}</span>
                <Avatar>
                  <AvatarImage src={ session.user?.image || undefined } />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={10}>
                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                    Profil
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut 
                    className="h-[1.2rem] w-[1.2rem] mr-2"
                  />
                  Kijelentkezés
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ):(
           <div></div>
        )
        }
        
      </div>
    </nav>
  );
};

export default Navbar;
