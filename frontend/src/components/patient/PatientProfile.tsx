"use client";

import { useState } from "react";
import { Mail, Save } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { updateProfile } from "@/lib/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PanelLoading } from "@/components/patient/PanelStates";

export function PatientProfile() {
  const { user, token, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !token) return <PanelLoading />;

  const dirty = name.trim() !== user.name || (phone.trim() || "") !== (user.phone ?? "");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateProfile(
        { name: name.trim(), phone: phone.trim() || null },
        token!,
      );
      updateUser(updated);
      toast({ title: "Profile updated", variant: "success" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Keep your contact details up to date so the clinic can reach you.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Your details</CardTitle>
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

            <Input
              label="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="03xx xxxxxxx"
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Email</span>
              <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-neutral-100 px-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {user.email}
              </div>
              <p className="text-sm text-muted-foreground">
                Email is your sign-in identity and can&apos;t be changed here.
              </p>
            </div>

            <Button
              type="submit"
              isLoading={submitting}
              disabled={!dirty}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
