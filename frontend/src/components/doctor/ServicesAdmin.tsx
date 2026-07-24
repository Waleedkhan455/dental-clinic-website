"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type ServiceInput,
  createService,
  deleteService,
  getServicesAdmin,
  updateService,
} from "@/lib/api/admin";
import type { Service } from "@/lib/api/public";
import { serviceCategoryOrder } from "@/config/site";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

const CATEGORY_OPTIONS = serviceCategoryOrder.map((c) => ({ value: c, label: c }));

export function ServicesAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(getServicesAdmin);

  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(input: ServiceInput) {
    if (!token) return;
    setBusy(true);
    try {
      if (editing === "new") {
        await createService(input, token);
        toast({ title: "Service created", variant: "success" });
      } else if (editing) {
        await updateService(editing.id, input, token);
        toast({ title: "Service updated", variant: "success" });
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof ApiError ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;
    setBusy(true);
    try {
      await deleteService(deleteTarget.id, token);
      toast({ title: "Service deleted", variant: "success" });
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast({
        title: "Could not delete",
        description: err instanceof ApiError ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Services"
        subtitle="Add, edit, or remove treatments. Changes appear on the public Services page instantly."
        actionLabel="New service"
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
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No services yet. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.category}</TableCell>
                  <TableCell className="min-w-[14rem] text-muted-foreground">{s.visits_text}</TableCell>
                  <TableCell>
                    {s.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Hidden</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {editing && (
        <ServiceFormModal
          initial={editing === "new" ? null : editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={handleSave}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this service?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed from the public site.` : ""}
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ServiceFormModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: Service | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: ServiceInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? serviceCategoryOrder[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [visits, setVisits] = useState(initial?.visits_text ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!name.trim() || !description.trim() || !visits.trim()) {
      setError("Name, description, and visits are required.");
      return;
    }
    onSubmit({
      name: name.trim(),
      category,
      description: description.trim(),
      visits_text: visits.trim(),
      image_url: imageUrl.trim() || null,
      is_active: isActive,
    });
  }

  return (
    <Modal
      open
      onClose={() => (busy ? undefined : onClose())}
      title={initial ? "Edit service" : "New service"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} isLoading={busy}>{initial ? "Save changes" : "Create service"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground">
            {error}
          </p>
        )}
        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Select label="Category" options={CATEGORY_OPTIONS} value={category} onChange={(e) => setCategory(e.target.value)} />
        <Textarea label="Description" required value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Number of visits" required value={visits} onChange={(e) => setVisits(e.target.value)} placeholder="e.g. 1–3, depending on case" />
        <ImageUpload
          label="Service image"
          value={imageUrl}
          onChange={(url) => setImageUrl(url ?? "")}
          helperText="Optional — shown on the service's detail page."
        />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Visible on the public site
        </label>
      </div>
    </Modal>
  );
}
