"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SeoFieldsForm } from "@/components/forms/seo-fields-form";
import { slugify } from "@/lib/utils";
import { useAllCategories } from "@/hooks/use-categories";
import { useAllTags } from "@/hooks/use-tags";
import type { Post, CreatePostInput, PostStatus } from "@/types/post";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  content: z.any().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]).default("DRAFT"),
  featuredImage: z.string().nullable().optional(),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  scheduledAt: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: CreatePostInput & { publish?: boolean; schedule?: boolean }) => void;
  isLoading?: boolean;
}

export function PostForm({ initialData, onSubmit, isLoading }: PostFormProps) {
  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);

  const { data: categories = [] } = useAllCategories();
  const { data: tags = [] } = useAllTags();

  const methods = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? null,
      content: initialData?.content ? JSON.parse(initialData.content) : undefined,
      status: (initialData?.status as PostStatus) ?? "DRAFT",
      featuredImage: initialData?.featuredImage ?? null,
      categoryIds: initialData?.categories?.map((c) => c.id) ?? [],
      tagIds: initialData?.tags?.map((t) => t.id) ?? [],
      scheduledAt: initialData?.scheduledAt ?? null,
      metaTitle: initialData?.metaTitle ?? null,
      metaDescription: initialData?.metaDescription ?? null,
      ogTitle: initialData?.ogTitle ?? null,
      ogDescription: initialData?.ogDescription ?? null,
      canonicalUrl: initialData?.canonicalUrl ?? null,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const titleValue = watch("title");
  const statusValue = watch("status");
  const featuredImage = watch("featuredImage");
  const categoryIds = watch("categoryIds");
  const tagIds = watch("tagIds");
  const scheduledAt = watch("scheduledAt");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, slugEdited, setValue]);

  const handleFormSubmit = (
    data: PostFormValues,
    opts?: { publish?: boolean; schedule?: boolean }
  ) => {
    onSubmit({
      title: data.title,
      slug: data.slug || slugify(data.title),
      excerpt: data.excerpt ?? null,
      content: data.content ? JSON.stringify(data.content) : "",
      status: opts?.publish
        ? "PUBLISHED"
        : opts?.schedule
        ? "SCHEDULED"
        : data.status,
      featuredImage: data.featuredImage ?? null,
      categoryIds: data.categoryIds,
      tagIds: data.tagIds,
      scheduledAt: data.scheduledAt ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      ogTitle: data.ogTitle ?? null,
      ogDescription: data.ogDescription ?? null,
      canonicalUrl: data.canonicalUrl ?? null,
      ...opts,
    });
  };

  const toggleCategory = (id: string) => {
    const current = categoryIds ?? [];
    if (current.includes(id)) {
      setValue(
        "categoryIds",
        current.filter((c) => c !== id)
      );
    } else {
      setValue("categoryIds", [...current, id]);
    }
  };

  const toggleTag = (id: string) => {
    const current = tagIds ?? [];
    if (current.includes(id)) {
      setValue(
        "tagIds",
        current.filter((t) => t !== id)
      );
    } else {
      setValue("tagIds", [...current, id]);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit((data) => handleFormSubmit(data))}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Input
                {...register("title")}
                placeholder="Post title..."
                className="text-2xl font-semibold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary-500"
                aria-label="Post title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[rgb(var(--muted-foreground))] shrink-0">
                  /posts/
                </span>
                <Input
                  {...register("slug")}
                  placeholder="post-url-slug"
                  className="font-mono text-sm"
                  onChange={(e) => {
                    setSlugEdited(true);
                    setValue("slug", e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                Excerpt
              </label>
              <Textarea
                {...register("excerpt")}
                placeholder="Brief summary of the post..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                Content
              </label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TiptapEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your post content..."
                  />
                )}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Publish Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                    Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field}>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                        <option value="SCHEDULED">Scheduled</option>
                      </Select>
                    )}
                  />
                </div>

                {/* Schedule Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                    Schedule Date
                  </label>
                  <Input
                    {...register("scheduledAt")}
                    type="datetime-local"
                    className="text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={isLoading}
                    onClick={handleSubmit((data) => handleFormSubmit(data))}
                  >
                    Save Draft
                  </Button>

                  {scheduledAt && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      loading={isLoading}
                      onClick={handleSubmit((data) =>
                        handleFormSubmit(data, { schedule: true })
                      )}
                    >
                      Schedule Post
                    </Button>
                  )}

                  {statusValue !== "PUBLISHED" && (
                    <Button
                      type="button"
                      size="sm"
                      loading={isLoading}
                      onClick={handleSubmit((data) =>
                        handleFormSubmit(data, { publish: true })
                      )}
                    >
                      Publish Now
                    </Button>
                  )}

                  {statusValue === "PUBLISHED" && (
                    <Button
                      type="button"
                      size="sm"
                      loading={isLoading}
                      onClick={handleSubmit((data) => handleFormSubmit(data))}
                    >
                      Update Post
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {featuredImage ? (
                  <div className="relative group rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setValue("featuredImage", null)}
                        className="p-1.5 bg-white rounded-full text-gray-900 hover:bg-gray-100"
                        aria-label="Remove featured image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt("Enter image URL:");
                      if (url) setValue("featuredImage", url);
                    }}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-[rgb(var(--border))] flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
                  >
                    <ImageIcon className="h-6 w-6 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      Set featured image
                    </span>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    No categories available.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={categoryIds?.includes(cat.id) ?? false}
                          onChange={() => toggleCategory(cat.id)}
                          className="h-3.5 w-3.5 rounded border-[rgb(var(--border))] text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-[rgb(var(--foreground))] group-hover:text-primary-600 transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {tags.length === 0 ? (
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    No tags available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = tagIds?.includes(tag.id) ?? false;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 ring-1 ring-primary-400"
                              : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/20"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO */}
            <SeoFieldsForm />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
