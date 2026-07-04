import { type HTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  alt?: string;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; image: number }> = {
  xs: { container: "h-6 w-6", text: "text-xs", image: 24 },
  sm: { container: "h-8 w-8", text: "text-xs", image: 32 },
  md: { container: "h-10 w-10", text: "text-sm", image: 40 },
  lg: { container: "h-12 w-12", text: "text-base", image: 48 },
  xl: { container: "h-16 w-16", text: "text-lg", image: 64 },
};

export function Avatar({
  src,
  firstName,
  lastName,
  alt,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const sizes = sizeClasses[size];
  const initials = getInitials(firstName, lastName);
  const displayName = alt ?? [firstName, lastName].filter(Boolean).join(" ") ?? "User";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        "bg-primary-100 dark:bg-primary-900/40",
        sizes.container,
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={displayName}
          width={sizes.image}
          height={sizes.image}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className={cn(
            "font-semibold text-primary-700 dark:text-primary-300",
            sizes.text
          )}
          aria-label={displayName}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
