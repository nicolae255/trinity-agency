"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/forms/user-form";
import { useCreateUser } from "@/hooks/use-users";
import type { CreateUserInput } from "@/hooks/use-users";

export default function NewUserPage() {
  const router = useRouter();
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const handleSubmit = async (data: CreateUserInput) => {
    await createUser(data as CreateUserInput);
    router.push("/users");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create User"
        description="Add a new team member to the CMS."
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
            <UserForm onSubmit={handleSubmit as any} isLoading={isPending} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
