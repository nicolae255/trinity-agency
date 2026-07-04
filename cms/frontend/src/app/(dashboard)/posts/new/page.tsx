"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PostForm } from "@/components/forms/post-form";
import { useCreatePost } from "@/hooks/use-posts";
import type { CreatePostInput } from "@/types/post";

export default function NewPostPage() {
  const router = useRouter();
  const { mutateAsync: createPost, isPending } = useCreatePost();

  const handleSubmit = async (
    data: CreatePostInput & { publish?: boolean; schedule?: boolean }
  ) => {
    const { publish: _publish, schedule: _schedule, ...input } = data;
    await createPost(input);
    router.push("/posts");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Post"
        description="Write and publish a new blog post."
        actions={
          <Button variant="outline" asChild>
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
        }
      />

      <PostForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
}
