import Link from "next/link";
import { Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-muted px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
        <Home className="h-5 w-5" aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
