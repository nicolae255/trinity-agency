"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth.schema";
import { getErrorMessage } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await apiClient.post("/auth/forgot-password", { email: values.email });
      setSentToEmail(values.email);
      setEmailSent(true);
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  };

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 dark:bg-success-700/20">
          <CheckCircle className="h-7 w-7 text-success-600 dark:text-success-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]">
          Check your email
        </h1>

        <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
          We sent a password reset link to{" "}
          <span className="font-medium text-[rgb(var(--foreground))]">
            {sentToEmail}
          </span>
          . The link will expire in 1 hour.
        </p>

        <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
          Did not receive the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="text-primary-600 hover:underline dark:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            try again
          </button>
          .
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
          <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-[rgb(var(--muted-foreground))]">
          Enter the email address associated with your account. We will send
          you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div
            role="alert"
            className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400"
          >
            {errors.root.message}
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Send reset link
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
