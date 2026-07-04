"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import { useAllCategories } from "@/hooks/use-categories";
import type { Category, CreateCategoryInput } from "@/types/category";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => void;
  initialData?: Category;
  isLoading?: boolean;
}

export function CategoryForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CategoryFormProps) {
  const { data: categories = [] } = useAllCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? null,
      parentId: initialData?.parentId ?? null,
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? null,
      parentId: initialData?.parentId ?? null,
    });
  }, [initialData, open, reset]);

  // Auto-generate slug from name (only if slug hasn't been manually set)
  useEffect(() => {
    if (!initialData && nameValue && !slugValue) {
      setValue("slug", slugify(nameValue));
    } else if (!initialData && nameValue) {
      // Auto-update if it appears to still match the auto-generated form
      const autoSlug = slugify(nameValue);
      const prevAutoSlug = slugValue
        ? slugify(nameValue.slice(0, -1))
        : undefined;
      if (slugValue === prevAutoSlug || !slugValue) {
        setValue("slug", autoSlug);
      }
    }
  }, [nameValue, initialData, slugValue, setValue]);

  const handleFormSubmit = (data: CategoryFormValues) => {
    onSubmit({
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description ?? null,
      parentId: data.parentId ?? null,
    });
  };

  // Filter out the current category from parent options to prevent circular refs
  const parentOptions = categories.filter((c) => c.id !== initialData?.id);

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Edit Category" : "New Category"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogBody className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="Category name"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Slug
            </label>
            <Input
              {...register("slug")}
              placeholder="category-slug"
              className="font-mono text-sm"
            />
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Auto-generated from name if left blank.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Description
            </label>
            <Textarea
              {...register("description")}
              placeholder="Optional description..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              Parent Category
            </label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value || null)
                  }
                >
                  <option value="">None (top-level)</option>
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {initialData ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
