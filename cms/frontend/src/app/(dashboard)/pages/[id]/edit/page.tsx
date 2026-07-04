"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/loading-spinner";
import { PageForm } from "@/components/forms/page-form";
import { usePage, useUpdatePage } from "@/hooks/use-pages";
import type { UpdatePageInput } from "@/types/page";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPagePage({ params }: EditPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: page, isLoading } = usePage(id);
  const { mutateAsync: updatePage, isPending } = useUpdatePage();

  const handleSubmit = async (
    data: Omit<UpdatePageInput, "id"> & { publish?: boolean }
  ) => {
    const { publish: _publish, ...input } = data;
    await updatePage({ id, ...input });
    router.push("/pages");
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={page ? `Edit: ${page.title}` : "Edit Page"}
        description="Update the page content and settings."
        actions={
          <Button variant="outline" asChild>
            <Link href="/pages">
              <ArrowLeft className="h-4 w-4" />
              Back to Pages
            </Link>
          </Button>
        }
      />

      <PageForm
        initialData={page}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
