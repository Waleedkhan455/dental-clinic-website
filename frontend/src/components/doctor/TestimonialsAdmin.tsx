"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type TestimonialInput,
  createTestimonial,
  deleteTestimonial,
  getTestimonialsAdmin,
  updateTestimonial,
} from "@/lib/api/admin";
import type { Testimonial } from "@/lib/api/public";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

const RATING_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? "" : "s"}` }));

export function TestimonialsAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(getTestimonialsAdmin);

  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>, okTitle: string) {
    if (!token) return;
    setBusy(true);
    try {
      await fn();
      toast({ title: okTitle, variant: "success" });
      setEditing(null);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast({ title: "Action failed", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Testimonials"
        subtitle="Publish patient reviews. Only published testimonials show on the public site."
        actionLabel="New testimonial"
        onAction={() => setEditing("new")}
      />

      {loading ? (
        <PanelLoading />
      ) : error ? (
        <PanelError message={error} onRetry={reload} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No testimonials yet.</TableCell></TableRow>
            ) : (
              (data ?? []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap font-medium text-foreground">{t.patient_name}</TableCell>
                  <TableCell className="max-w-xs text-muted-foreground"><span className="line-clamp-2">{t.message}</span></TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-foreground"><Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />{t.rating}</span>
                  </TableCell>
                  <TableCell>{t.is_published ? <Badge tone="success">Published</Badge> : <Badge tone="neutral">Hidden</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => updateTestimonial(t.id, { is_published: !t.is_published }, token!), t.is_published ? "Unpublished" : "Published")}>
                        {t.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditing(t)}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(t)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {editing && (
        <TestimonialFormModal
          initial={editing === "new" ? null : editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={(input) =>
            run(
              () => (editing === "new" ? createTestimonial(input, token!) : updateTestimonial(editing.id, input, token!)),
              editing === "new" ? "Testimonial created" : "Testimonial updated",
            )
          }
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this testimonial?"
        message={deleteTarget ? `The review by "${deleteTarget.patient_name}" will be permanently removed.` : ""}
        busy={busy}
        onConfirm={() => deleteTarget && run(() => deleteTestimonial(deleteTarget.id, token!), "Testimonial deleted")}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function TestimonialFormModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: Testimonial | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: TestimonialInput) => void;
}) {
  const [patientName, setPatientName] = useState(initial?.patient_name ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [rating, setRating] = useState(String(initial?.rating ?? 5));
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!patientName.trim() || !message.trim()) {
      setError("Patient name and message are required.");
      return;
    }
    onSubmit({ patient_name: patientName.trim(), message: message.trim(), rating: Number(rating), is_published: isPublished });
  }

  return (
    <Modal
      open
      onClose={() => (busy ? undefined : onClose())}
      title={initial ? "Edit testimonial" : "New testimonial"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} isLoading={busy}>{initial ? "Save changes" : "Create"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p role="alert" className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground">{error}</p>}
        <Input label="Patient name" required value={patientName} onChange={(e) => setPatientName(e.target.value)} />
        <Textarea label="Message" required value={message} onChange={(e) => setMessage(e.target.value)} />
        <Select label="Rating" options={RATING_OPTIONS} value={rating} onChange={(e) => setRating(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Published (visible on the public site)
        </label>
      </div>
    </Modal>
  );
}
