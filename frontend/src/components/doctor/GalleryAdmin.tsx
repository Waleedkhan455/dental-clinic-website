"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Images, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type GalleryInput,
  createGalleryImage,
  deleteGalleryImage,
  getGalleryAdmin,
  updateGalleryImage,
} from "@/lib/api/admin";
import type { GalleryImage } from "@/lib/api/public";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState, PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function GalleryAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(getGalleryAdmin);

  const [editing, setEditing] = useState<GalleryImage | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
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
        title="Gallery"
        subtitle="Add or remove clinic photos. Lower sort order shows first on the public Gallery."
        actionLabel="New image"
        onAction={() => setEditing("new")}
      />

      {loading ? (
        <PanelLoading />
      ) : error ? (
        <PanelError message={error} onRetry={reload} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={<Images className="h-8 w-8" />} title="No images yet" description="Add your first clinic photo." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((img) => (
            <Card key={img.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="aspect-video overflow-hidden rounded-md border border-border bg-surface-muted">
                  {/* Admin-entered external URLs — plain img avoids next/image remote config. */}
                  <img src={img.image_url} alt={img.caption ?? "Clinic photo"} className="h-full w-full object-cover" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order: {img.sort_order}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(img)} aria-label="Edit image"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteTarget(img)} aria-label="Delete image"><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <GalleryFormModal
          initial={editing === "new" ? null : editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={(input) =>
            run(
              () => (editing === "new" ? createGalleryImage(input, token!) : updateGalleryImage(editing.id, input, token!)),
              editing === "new" ? "Image added" : "Image updated",
            )
          }
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this image?"
        message={deleteTarget ? "It will be removed from the public Gallery." : ""}
        busy={busy}
        onConfirm={() => deleteTarget && run(() => deleteGalleryImage(deleteTarget.id, token!), "Image deleted")}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function GalleryFormModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: GalleryImage | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: GalleryInput) => void;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!imageUrl.trim()) {
      setError("Please upload an image.");
      return;
    }
    onSubmit({ image_url: imageUrl.trim(), caption: null, sort_order: Number(sortOrder) || 0 });
  }

  return (
    <Modal
      open
      onClose={() => (busy ? undefined : onClose())}
      title={initial ? "Edit image" : "New image"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} isLoading={busy}>{initial ? "Save changes" : "Add image"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p role="alert" className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground">{error}</p>}
        <ImageUpload
          label="Image"
          value={imageUrl}
          onChange={(url) => setImageUrl(url ?? "")}
          helperText="Upload a clinic photo (JPG/PNG, under 5 MB)."
        />
        <Input label="Sort order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} helperText="Lower shows first." />
      </div>
    </Modal>
  );
}
