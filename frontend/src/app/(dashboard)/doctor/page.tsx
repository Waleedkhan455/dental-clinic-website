import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Doctor Panel" };

export default function DoctorDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Panel</h1>
        <p className="mt-1 text-muted-foreground">
          Manage appointments, patient history, services, and the clinic team.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Panel modules coming soon</CardTitle>
          <CardDescription>
            Appointment management, patient history (full CRUD), services, team, testimonials, and
            gallery arrive in later phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You are signed in as a doctor/admin. Access to this panel is enforced by the API, not
            just the interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
