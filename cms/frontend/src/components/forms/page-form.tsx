"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SeoFieldsForm } from "@/components/forms/seo-fields-form";
import { slugify } from "@/lib/utils";
import type { Page, CreatePageInput, PageStatus } from "@/types/page";

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.any().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featuredImage: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
});

type PageFormValues = z.infer<typeof pageSchema>;

interface PageFormProps {
  initialData?: Page;
  onSubmit: (data: CreatePageInput & { publish?: boolean }) => void;
  isLoading?: boolean;
}

export function PageForm({ initialData, onSubmit, isLoading }: PageFormProps) {
  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);

  const methods = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      content: initialData?.content ? JSON.parse(initialData.content) : undefined,
      status: (initialData?.status as PageStatus) ?? "DRAFT",
      featuredImage: initialData?.featuredImage ?? null,
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

  // Auto-generate slug from title (only if user hasn't manually edited it)
  useEffect(() => {
    if (!slugEdited && titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, slugEdited, setValue]);

  const handleFormSubmit = (data: PageFormValues, publish?: boolean) => {
    onSubmit({
      title: data.title,
      slug: data.slug || slugify(data.title),
      content: data.content ? JSON.stringify(data.content) : "",
      status: publish ? "PUBLISHED" : data.status,
      featuredImage: data.featuredImage ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      ogTitle: data.ogTitle ?? null,
      ogDescription: data.ogDescription ?? null,
      canonicalUrl: data.canonicalUrl ?? null,
      publish,
    });
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
                placeholder="Page title..."
                className="text-2xl font-semibold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary-500"
                aria-label="Page title"
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
                  /
                </span>
                <Input
                  {...register("slug")}
                  placeholder="page-url-slug"
                  className="font-mono text-sm"
                  onChange={(e) => {
                    setSlugEdited(true);
                    setValue("slug", e.target.value);
                  }}
                />
              </div>
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
                    placeholder="Write your page content..."
                  />
                )}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Status */}
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
                      </Select>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    loading={isLoading}
                    onClick={handleSubmit((data) => handleFormSubmit(data))}
                  >
                    Save Draft
                  </Button>
                  {statusValue !== "PUBLISHED" && (
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      loading={isLoading}
                      onClick={handleSubmit((data) =>
                        handleFormSubmit(data, true)
                      )}
                    >
                      Publish
                    </Button>
                  )}
                  {statusValue === "PUBLISHED" && (
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      loading={isLoading}
                      onClick={handleSubmit((data) => handleFormSubmit(data))}
                    >
                      Update
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

            {/* SEO */}
            <SeoFieldsForm />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
