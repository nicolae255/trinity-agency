"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Role } from "@/types/auth";
import type { User } from "@/types/auth";
import type { CreateUserInput, UpdateUserInput } from "@/hooks/use-users";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role),
  active: z.boolean().default(true),
});

const updateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  role: z.nativeEnum(Role),
  active: z.boolean().default(true),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UserFormProps {
  initialData?: User & { active?: boolean };
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const isEdit = !!initialData;
  const schema = isEdit ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialData?.email ?? "",
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      password: "",
      role: (initialData?.role as Role) ?? Role.AUTHOR,
      active: initialData?.active ?? true,
    },
  });

  const handleFormSubmit = (
    data: CreateUserFormValues | UpdateUserFormValues
  ) => {
    if (isEdit && initialData) {
      const updateData: UpdateUserInput = {
        id: initialData.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      };
      if (data.password) {
        updateData.password = data.password;
      }
      onSubmit(updateData);
    } else {
      onSubmit(data as CreateUserInput);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[rgb(var(--foreground))]">
            First Name
          </label>
          <Input
            {...register("firstName")}
            placeholder="John"
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[rgb(var(--foreground))]">
            Last Name
          </label>
          <Input
            {...register("lastName")}
            placeholder="Doe"
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[rgb(var(--foreground))]">
          Email Address
        </label>
        <Input
          {...register("email")}
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <Separator />

      {/* Role */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[rgb(var(--foreground))]">
          Role
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <option value={Role.SUPER_ADMIN}>Super Admin</option>
              <option value={Role.ADMIN}>Admin</option>
              <option value={Role.EDITOR}>Editor</option>
              <option value={Role.AUTHOR}>Author</option>
            </Select>
          )}
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Authors can create content. Editors can manage all content. Admins
          manage users and settings.
        </p>
      </div>

      {/* Active */}
      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                Active Account
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Inactive users cannot log in.
              </p>
            </div>
            <Switch
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          </div>
        )}
      />

      <Separator />

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[rgb(var(--foreground))]">
          {isEdit ? "New Password" : "Password"}
          {!isEdit && (
            <span className="text-red-500 ml-0.5">*</span>
          )}
        </label>
        <Input
          {...register("password")}
          type="password"
          placeholder={isEdit ? "Leave blank to keep current password" : "Minimum 8 characters"}
          autoComplete={isEdit ? "new-password" : "new-password"}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
        {isEdit && (
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Leave blank to keep the current password.
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isLoading}>
          {isEdit ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
