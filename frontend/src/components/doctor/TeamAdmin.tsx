"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type DoctorInput,
  createDoctor,
  deleteDoctor,
  getDoctorsAdmin,
  updateDoctor,
} from "@/lib/api/admin";
import type { Doctor, AvailabilityType } from "@/lib/api/public";
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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // index = Python weekday()

const TYPE_OPTIONS = [
  { value: "regular_hours", label: "Regular clinic hours" },
  { value: "specific_days", label: "Specific days only" },
  { value: "by_appointment", label: "By appointment (needs confirmation)" },
];

export function TeamAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(getDoctorsAdmin);

  const [editing, setEditing] = useState<Doctor | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSave(input: DoctorInput) {
    if (!token) return;
    setBusy(true);
    try {
      if (editing === "new") {
        await createDoctor(input, token);
        toast({ title: "Team member added", variant: "success" });
      } else if (editing) {
        await updateDoctor(editing.id, input, token);
        toast({ title: "Team member updated", variant: "success" });
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast({ title: "Could not save", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;
    setBusy(true);
    try {
      await deleteDoctor(deleteTarget.id, token);
      toast({ title: "Team member removed", variant: "success" });
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast({ title: "Could not delete", description: err instanceof ApiError ? err.message : "Please try again.", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Team"
        subtitle="Manage the dentists shown on Meet Our Dentists. Changes appear on the public site instantly."
        actionLabel="New member"
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
              <TableHead>Designation</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No team members yet.</TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{d.designation}</TableCell>
                  <TableCell className="text-muted-foreground">{d.availability.label}</TableCell>
                  <TableCell>{d.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Hidden</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(d)}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(d)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {editing && (
        <DoctorFormModal initial={editing === "new" ? null : editing} busy={busy} onClose={() => setEditing(null)} onSubmit={handleSave} />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this team member?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed from the public site.` : ""}
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DoctorFormModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial: Doctor | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: DoctorInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [quals, setQuals] = useState((initial?.qualifications ?? []).join(", "));
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? "");
  const [type, setType] = useState<AvailabilityType>(initial?.availability.type ?? "regular_hours");
  const [weekdays, setWeekdays] = useState<number[]>(initial?.availability.weekdays ?? []);
  const [label, setLabel] = useState(initial?.availability.label ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(i: number) {
    setWeekdays((cur) => (cur.includes(i) ? cur.filter((d) => d !== i) : [...cur, i].sort((a, b) => a - b)));
  }

  function submit() {
    if (!name.trim() || !designation.trim() || !label.trim()) {
      setError("Name, designation, and availability label are required.");
      return;
    }
    if (type === "specific_days" && weekdays.length === 0) {
      setError("Choose at least one day for a specific-days dentist.");
      return;
    }
    onSubmit({
      name: name.trim(),
      designation: designation.trim(),
      qualifications: quals.split(",").map((q) => q.trim()).filter(Boolean),
      bio: bio.trim() || null,
      photo_url: photoUrl.trim() || null,
      availability: { type, weekdays: type === "specific_days" ? weekdays : [], label: label.trim() },
      is_active: isActive,
    });
  }

  return (
    <Modal
      open
      onClose={() => (busy ? undefined : onClose())}
      title={initial ? "Edit team member" : "New team member"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} isLoading={busy}>{initial ? "Save changes" : "Add member"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground">{error}</p>
        )}
        <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Designation" required value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Implantologist & Prosthodontist" />
        <Input label="Qualifications" value={quals} onChange={(e) => setQuals(e.target.value)} placeholder="BDS, FCPS" helperText="Comma-separated." />
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <Input label="Photo URL" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" helperText="Optional." />
        <Select label="Availability type" options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value as AvailabilityType)} />
        {type === "specific_days" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Available days</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={
                    "rounded-md border px-3 py-1.5 text-sm transition-colors " +
                    (weekdays.includes(i)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-surface text-foreground hover:bg-neutral-100")
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
        <Input label="Availability label" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Fridays only" helperText="Shown on the public site." />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Visible on the public site
        </label>
      </div>
    </Modal>
  );
}
