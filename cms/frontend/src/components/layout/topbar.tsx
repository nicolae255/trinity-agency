"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { ThemeToggle } from "./theme-toggle";
import { MobileSidebarToggle } from "./sidebar";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  className?: string;
}

export function Topbar({ onMobileMenuToggle, className }: TopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 px-4 backdrop-blur-sm",
        className
      )}
    >
      {/* Left side: mobile toggle + breadcrumbs */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <MobileSidebarToggle onClick={onMobileMenuToggle} />
        <Breadcrumbs className="hidden sm:flex" />
      </div>

      {/* Right side: theme toggle + user dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />

        {/* User dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownTrigger
              className="rounded-full focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="User menu"
            >
              <Avatar
                src={user.avatar}
                firstName={user.firstName}
                lastName={user.lastName}
                size="sm"
                className="cursor-pointer ring-2 ring-transparent hover:ring-primary-500 transition-all"
              />
            </DropdownTrigger>

            <DropdownContent align="end" sideOffset={8}>
              <DropdownLabel>
                {user.firstName} {user.lastName}
              </DropdownLabel>

              <div className="px-2 pb-1">
                <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                  {user.email}
                </p>
              </div>

              <DropdownSeparator />

              <DropdownItem
                icon={<User className="h-4 w-4" />}
                onClick={() => {}}
              >
                <Link href="/settings" className="flex w-full items-center gap-2">
                  Profile
                </Link>
              </DropdownItem>

              <DropdownItem
                icon={<Settings className="h-4 w-4" />}
                onClick={() => {}}
              >
                <Link href="/settings" className="flex w-full items-center gap-2">
                  Settings
                </Link>
              </DropdownItem>

              <DropdownSeparator />

              <DropdownItem
                icon={<LogOut className="h-4 w-4" />}
                onClick={logout}
                destructive
              >
                Sign out
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
