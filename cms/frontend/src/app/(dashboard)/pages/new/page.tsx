"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PageForm } from "@/components/forms/page-form";
import { useCreatePage } from "@/hooks/use-pages";
import type { CreatePageInput } from "@/types/page";

export default function NewPagePage() {
  const router = useRouter();
  const { mutateAsync: createPage, isPending } = useCreatePage();

  const handleSubmit = async (data: CreatePageInput & { publish?: boolean }) => {
    const { publish: _publish, ...input } = data;
    await createPage(input);
    router.push("/pages");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Page"
        description="Create a new static page for your site."
        actions={
          <Button variant="outline" asChild>
            <Link href="/pages">
              <ArrowLeft className="h-4 w-4" />
              Back to Pages
            </Link>
          </Button>
        }
      />

      <PageForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
}
