"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Hash,
  Image,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Role } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  minRole?: Role;
  badge?: string;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Pages",
        href: "/pages",
        icon: FileText,
      },
      {
        label: "Posts",
        href: "/posts",
        icon: Newspaper,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: FolderOpen,
      },
      {
        label: "Tags",
        href: "/tags",
        icon: Hash,
      },
    ],
  },
  {
    label: "Assets",
    items: [
      {
        label: "Media",
        href: "/media",
        icon: Image,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,
        minRole: Role.ADMIN,
      },
      {
        label: "Activity",
        href: "/activity",
        icon: Shield,
        minRole: Role.ADMIN,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        minRole: Role.ADMIN,
      },
    ],
  },
  {
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

const ROLE_LEVELS: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.EDITOR]: 2,
  [Role.AUTHOR]: 1,
};

function canAccess(userRole: Role, minRole?: Role): boolean {
  if (!minRole) return true;
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const userRole = user?.role ?? Role.AUTHOR;

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base layout
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-[rgb(var(--sidebar-border))] bg-[rgb(var(--sidebar-bg))]",
          "transition-sidebar",
          // Width states
          collapsed ? "w-16" : "w-64",
          // Mobile: hidden by default, shown when mobileOpen
          "translate-x-0",
          !mobileOpen && "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-[rgb(var(--sidebar-border))] px-4",
            collapsed ? "justify-center" : "justify-between gap-3"
          )}
        >
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-xs font-bold text-white">T</span>
              </div>
              <span className="text-sm font-semibold text-[rgb(var(--foreground))]">
                Trinity CMS
              </span>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Trinity CMS - Home"
            >
              <span className="text-xs font-bold text-white">T</span>
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex items-center justify-center",
              "h-7 w-7 rounded-md text-[rgb(var(--muted-foreground))]",
              "transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navSections.map((section, sectionIdx) => {
            const visibleItems = section.items.filter((item) =>
              canAccess(userRole, item.minRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={sectionIdx} className="mb-4">
                {/* Section label */}
                {section.label && !collapsed && (
                  <p className="mb-1 px-4 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                    {section.label}
                  </p>
                )}

                <ul className="space-y-0.5 px-2">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onMobileClose}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2",
                            "text-sm font-medium transition-colors duration-150",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                            active
                              ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400"
                              : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
                            collapsed && "justify-center"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              active
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--foreground))]"
                            )}
                            aria-hidden="true"
                          />
                          {!collapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span className="ml-auto rounded-full bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User info at bottom */}
        {user && !collapsed && (
          <div className="border-t border-[rgb(var(--sidebar-border))] p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  {user.firstName?.[0]?.toUpperCase()}
                  {user.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[rgb(var(--foreground))]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-[rgb(var(--muted-foreground))]">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export function MobileSidebarToggle({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center lg:hidden",
        "h-9 w-9 rounded-md text-[rgb(var(--muted-foreground))]",
        "transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      )}
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
