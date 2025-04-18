"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthSidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Account</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading ? (
            <SidebarMenuItem>
              <div className="flex items-center px-3 py-2">
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse mr-2" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </SidebarMenuItem>
          ) : isAuthenticated ? (
            <>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage
                          src={session?.user?.image || ""}
                          alt={session?.user?.name || "User"}
                        />
                        <AvatarFallback>
                          {session?.user?.name?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {session?.user?.name || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="start"
                    sideOffset={5}
                  >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  variant="outline"
                  className="w-full justify-start mt-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Sign in</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>Create account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
