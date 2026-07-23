"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/Card";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      toast({ title: "Account created", variant: "success" });
      router.replace("/patient");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to create account. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Book appointments and view your visit history.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground"
              >
                {error}
              </p>
            )}
            <Input label="Full name" required value={form.name} onChange={update("name")} autoComplete="name" />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
              helperText="Optional — used for appointment updates."
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              helperText="At least 8 characters."
            />
            <Input
              label="Confirm password"
              type="password"
              required
              value={form.confirm}
              onChange={update("confirm")}
              autoComplete="new-password"
            />
            <Button type="submit" size="lg" isLoading={submitting} className="w-full">
              Create account
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
