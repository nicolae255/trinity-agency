"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth.schema";
import { getErrorMessage } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await apiClient.post("/auth/reset-password", {
        token: values.token,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      toast.success("Password reset successfully.");

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/20">
          <KeyRound className="h-7 w-7 text-error-600 dark:text-error-400" />
        </div>
        <h1 className="text-2xl font-bold">Invalid reset link</h1>
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 dark:bg-success-700/20">
          <CheckCircle className="h-7 w-7 text-success-600 dark:text-success-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]">
          Password reset!
        </h1>

        <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
          Your password has been successfully reset. You will be redirected to
          the sign in page shortly.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
          <KeyRound className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]">
          Create new password
        </h1>
        <p className="mt-1.5 text-sm text-[rgb(var(--muted-foreground))]">
          Your password must be at least 8 characters and contain uppercase,
          lowercase, and number characters.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Hidden token field */}
        <input type="hidden" {...register("token")} />

        {errors.root && (
          <div
            role="alert"
            className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400"
          >
            {errors.root.message}
          </div>
        )}

        <Input
          label="New password"
          type="password"
          placeholder="Enter your new password"
          autoComplete="new-password"
          autoFocus
          required
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Confirm your new password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Reset password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
