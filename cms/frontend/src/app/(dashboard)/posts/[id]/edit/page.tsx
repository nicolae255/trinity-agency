"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoader } from "@/components/shared/loading-spinner";
import { PostForm } from "@/components/forms/post-form";
import { usePost, useUpdatePost } from "@/hooks/use-posts";
import type { UpdatePostInput } from "@/types/post";

interface EditPostProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: post, isLoading } = usePost(id);
  const { mutateAsync: updatePost, isPending } = useUpdatePost();

  const handleSubmit = async (
    data: Omit<UpdatePostInput, "id"> & {
      publish?: boolean;
      schedule?: boolean;
    }
  ) => {
    const { publish: _publish, schedule: _schedule, ...input } = data;
    await updatePost({ id, ...input });
    router.push("/posts");
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={post ? `Edit: ${post.title}` : "Edit Post"}
        description="Update the post content and settings."
        actions={
          <Button variant="outline" asChild>
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
        }
      />

      <PostForm
        initialData={post}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
