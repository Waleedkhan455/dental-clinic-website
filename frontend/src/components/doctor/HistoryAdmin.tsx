"use client";

import { useMemo, useState } from "react";
import { NotebookText, Pencil, Trash2, User } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { useAuthedResource } from "@/lib/hooks/useAuthedResource";
import { ApiError } from "@/lib/api/client";
import {
  type HistoryAdminRecord,
  type HistoryInput,
  createHistory,
  deleteHistory,
  getAllHistory,
  updateHistory,
} from "@/lib/api/history";
import { getDoctorsAdmin, getPatients } from "@/lib/api/admin";
import type { Doctor } from "@/lib/api/public";
import type { AuthUser } from "@/lib/api/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState, PanelError, PanelLoading } from "@/components/patient/PanelStates";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatDate } from "@/lib/format";

interface HistoryPageData {
  records: HistoryAdminRecord[];
  patients: AuthUser[];
  doctors: Doctor[];
}

async function fetchHistoryPage(token: string): Promise<HistoryPageData> {
  const [records, patients, doctors] = await Promise.all([
    getAllHistory(token),
    getPatients(token),
    getDoctorsAdmin(token),
  ]);
  return { records, patients, doctors };
}

export function HistoryAdmin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { data, loading, error, reload } = useAuthedResource(fetchHistoryPage);

  const [patientFilter, setPatientFilter] = useState("");
  const [editing, setEditing] = useState<HistoryAdminRecord | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HistoryAdminRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const patientOptions = useMemo(
    () => [
      { value: "", label: "All patients" },
      ...(data?.patients ?? []).map((p) => ({ value: p.id, label: `${p.name} (${p.email})` })),
    ],
    [data?.patients],
  );

  const filtered = useMemo(
    () => (data?.records ?? []).filter((r) => !patientFilter || r.patient_id === patientFilter),
    [data?.records, patientFilter],
  );

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

  const noPatients = !loading && (data?.patients ?? []).length === 0;

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Patient history"
        subtitle="Create and manage treatment records. Patients can view their own records (read-only)."
        actionLabel="New record"
        onAction={() => setEditing("new")}
      />

      {loading ? (
        <PanelLoading />
      ) : error ? (
        <PanelError message={error} onRetry={reload} />
      ) : (
        <>
          <div className="max-w-md">
            <Select label="Filter by patient" options={patientOptions} value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} />
          </div>

          {noPatients ? (
            <EmptyState icon={<User className="h-8 w-8" />} title="No patients registered yet" description="Once a patient registers, you can add treatment records for them." />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<NotebookText className="h-8 w-8" />} title="No records yet" description="Add a treatment record with the button above." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap font-medium text-foreground">{r.patient_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.treatment}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{r.doctor_name ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{r.created_at ? formatDate(r.created_at) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteTarget(r)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {editing && data && (
        <HistoryFormModal
          initial={editing === "new" ? null : editing}
          patients={data.patients}
          doctors={data.doctors}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={(input) =>
            run(
              () => (editing === "new" ? createHistory(input, token!) : updateHistory(editing.id, input, token!)),
              editing === "new" ? "Record created" : "Record updated",
            )
          }
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this record?"
        message={deleteTarget ? `"${deleteTarget.treatment}" for ${deleteTarget.patient_name ?? "this patient"} will be permanently removed.` : ""}
        busy={busy}
        onConfirm={() => deleteTarget && run(() => deleteHistory(deleteTarget.id, token!), "Record deleted")}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function HistoryFormModal({
  initial,
  patients,
  doctors,
  busy,
  onClose,
  onSubmit,
}: {
  initial: HistoryAdminRecord | null;
  patients: AuthUser[];
  doctors: Doctor[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: HistoryInput) => void;
}) {
  const [patientId, setPatientId] = useState(initial?.patient_id ?? "");
  const [doctorId, setDoctorId] = useState(initial?.doctor_id ?? doctors[0]?.id ?? "");
  const [treatment, setTreatment] = useState(initial?.treatment ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [attachments, setAttachments] = useState((initial?.attachments ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.email})` }));
  const doctorOptions = doctors.map((d) => ({ value: d.id, label: `${d.name} — ${d.designation}` }));

  function submit() {
    if (!patientId) return setError("Please select a patient.");
    if (!doctorId) return setError("Please select a dentist.");
    if (!treatment.trim()) return setError("Please describe the treatment.");
    onSubmit({
      patient_id: patientId,
      doctor_id: doctorId,
      treatment: treatment.trim(),
      notes: notes.trim() || null,
      attachments: attachments.split(",").map((a) => a.trim()).filter(Boolean),
    });
  }

  return (
    <Modal
      open
      onClose={() => (busy ? undefined : onClose())}
      title={initial ? "Edit treatment record" : "New treatment record"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} isLoading={busy}>{initial ? "Save changes" : "Create record"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <p role="alert" className="rounded-md border border-destructive bg-destructive-surface px-3 py-2 text-sm text-foreground">{error}</p>}
        {initial ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Patient</span>
            <div className="flex h-11 items-center rounded-md border border-input bg-neutral-100 px-3 text-sm text-muted-foreground">
              {initial.patient_name ?? "—"}
            </div>
          </div>
        ) : (
          <Select label="Patient" required placeholder="Select a patient" options={patientOptions} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        )}
        <Select label="Dentist" required placeholder="Select a dentist" options={doctorOptions} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
        <Input label="Treatment" required value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="e.g. Root canal treatment (RCT)" />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} helperText="Optional clinical notes." />
        <Input label="Attachment URLs" value={attachments} onChange={(e) => setAttachments(e.target.value)} helperText="Optional, comma-separated." placeholder="https://…, https://…" />
      </div>
    </Modal>
  );
}
