"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pages: "Pages",
  posts: "Posts",
  categories: "Categories",
  tags: "Tags",
  media: "Media Library",
  users: "Users",
  activity: "Activity Log",
  analytics: "Analytics",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

function formatSegment(segment: string): string {
  // Check if segment is in our known labels
  if (pathLabels[segment]) return pathLabels[segment];

  // Looks like an ID (UUID or numeric) - skip with "..."
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    ) ||
    /^\d+$/.test(segment)
  ) {
    return "Detail";
  }

  // Otherwise capitalize each word
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Skip the leading slash and split into segments
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = formatSegment(segment);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1 text-sm">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))]"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>

        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight
              className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]"
              aria-hidden="true"
            />
            {crumb.isLast ? (
              <span
                className="font-medium text-[rgb(var(--foreground))]"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))]"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
