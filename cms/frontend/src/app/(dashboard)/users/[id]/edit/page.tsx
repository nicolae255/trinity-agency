"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/forms/user-form";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import type { UpdateUserInput } from "@/hooks/use-users";

interface EditUserProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: user, isLoading } = useUser(id);
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const handleSubmit = async (data: UpdateUserInput) => {
    await updateUser({ ...data, id } as any);
    router.push("/users");
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          user
            ? `Edit: ${user.firstName} ${user.lastName}`
            : "Edit User"
        }
        description="Update user profile and permissions."
        actions={
          <Button variant="outline" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        }
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm
              initialData={user}
              onSubmit={handleSubmit as any}
              isLoading={isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
