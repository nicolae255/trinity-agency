"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Settings, Save, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-users";
// lib/utils used below for other utilities if needed
import type { UpdateUserInput } from "@/hooks/use-users";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function GeneralTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-[rgb(var(--border))] p-4 bg-[rgb(var(--muted))]/30">
          <p className="text-sm font-medium text-[rgb(var(--foreground))]">
            Site Configuration
          </p>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            Global site settings are managed through environment variables and
            the server configuration. Contact your system administrator to
            update site name, URL, or other global settings.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Site Name
            </label>
            <Input
              defaultValue="Trinity CMS"
              disabled
              className="bg-[rgb(var(--muted))]/50"
            />
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Configured via environment variable.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Site Description
            </label>
            <Input
              defaultValue="A powerful content management system."
              disabled
              className="bg-[rgb(var(--muted))]/50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    await updateUser({
      id: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    } as UpdateUserInput);
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    try {
      await updateUser({
        id: user.id,
        password: data.newPassword,
      } as UpdateUserInput);
      resetPassword();
      toast.success("Password updated successfully.");
    } catch {
      // Error is handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar ?? undefined}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="lg"
              />
              <div>
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {user?.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                  First Name
                </label>
                <Input
                  {...registerProfile("firstName")}
                  placeholder="John"
                  autoComplete="given-name"
                />
                {profileErrors.firstName && (
                  <p className="text-xs text-red-600">
                    {profileErrors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Last Name
                </label>
                <Input
                  {...registerProfile("lastName")}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
                {profileErrors.lastName && (
                  <p className="text-xs text-red-600">
                    {profileErrors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                Email Address
              </label>
              <Input
                {...registerProfile("email")}
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
              />
              {profileErrors.email && (
                <p className="text-xs text-red-600">
                  {profileErrors.email.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-[rgb(var(--border))] pt-4">
            <Button type="submit" loading={isPending}>
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                Current Password
              </label>
              <Input
                {...registerPassword("currentPassword")}
                type="password"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-600">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                New Password
              </label>
              <Input
                {...registerPassword("newPassword")}
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-600">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                Confirm New Password
              </label>
              <Input
                {...registerPassword("confirmPassword")}
                type="password"
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-[rgb(var(--border))] pt-4">
            <Button type="submit" variant="outline" loading={isPending}>
              <KeyRound className="h-4 w-4" />
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and site preferences."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
