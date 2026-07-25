"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck, ShieldCheck } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { redirectAfterAuth } from "@/lib/auth/redirect";
import { requestOtp, verifyOtp } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/Card";

const RESEND_SECONDS = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "details" | "verify" | "password";

export default function RegisterPage() {
  const { register } = useAuth();

  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false); // request/resend code
  const [checking, setChecking] = useState(false); // verify code
  const [submitting, setSubmitting] = useState(false); // create account
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function sendCode(): Promise<boolean> {
    setSending(true);
    try {
      await requestOtp(form.email.trim());
      setResendIn(RESEND_SECONDS);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  }

  // Step 1: name + email + phone -> send the code.
  async function handleDetails(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!EMAIL_RE.test(form.email.trim())) return setError("Please enter a valid email address.");
    if (await sendCode()) setStep("verify");
  }

  // Step 2: verify the emailed code (without consuming it) -> password step.
  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (otp.trim().length < 4) return setError("Enter the code from your email.");
    setChecking(true);
    try {
      await verifyOtp(form.email.trim(), otp.trim());
      setStep("password");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify the code. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  // Step 3: set a password -> create the account.
  async function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        otp: otp.trim(),
      });
      redirectAfterAuth(user.role, window.location.search);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create account. Please try again.");
      setSubmitting(false);
    }
  }

  const title =
    step === "details"
      ? "Create your account"
      : step === "verify"
        ? "Verify your email"
        : "Set your password";
  const description =
    step === "details"
      ? "Book appointments and view your visit history."
      : step === "verify"
        ? `Enter the 6-digit code we sent to ${form.email}.`
        : "Almost done — choose a password for your account.";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground"
            >
              {error}
            </p>
          )}

          {step === "details" && (
            <form onSubmit={handleDetails} className="flex flex-col gap-4" noValidate>
              <Input label="Full name" required value={form.name} onChange={update("name")} autoComplete="name" />
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                helperText="We'll send a verification code to this address."
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                autoComplete="tel"
                helperText="Optional — used for appointment updates."
              />
              <Button type="submit" size="lg" isLoading={sending} className="w-full">
                <MailCheck className="h-5 w-5" aria-hidden="true" />
                Send verification code
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-4" noValidate>
              <Input
                label="Verification code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                className="text-center text-lg tracking-[0.4em]"
              />
              <Button type="submit" size="lg" isLoading={checking} className="w-full">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                Verify email
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setOtp("");
                    setError(null);
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  disabled={sending || resendIn > 0}
                  onClick={() => {
                    setError(null);
                    void sendCode();
                  }}
                  className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handlePassword} className="flex flex-col gap-4" noValidate>
              <p className="flex items-center gap-1.5 rounded-md bg-success-surface px-3 py-2 text-sm text-success">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {form.email} verified
              </p>
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
          )}

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
