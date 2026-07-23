import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Patient Panel" };

export default function PatientDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Book appointments and view your upcoming visits and treatment history.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your panel is being set up</CardTitle>
          <CardDescription>
            Booking, upcoming and past appointments, and read-only treatment history arrive in
            later phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You are signed in as a patient. Your medical history will be view-only and visible only
            to you and the clinic&apos;s doctors.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
