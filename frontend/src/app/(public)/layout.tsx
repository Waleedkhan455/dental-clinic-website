import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BrandWatermark } from "@/components/BrandWatermark";

/**
 * Layout for the public-facing website. Panels (doctor/patient) live in their
 * own route groups with different chrome, so this header/footer applies only to
 * public pages.
 */
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Fixed brand watermark behind every public page. */}
      <BrandWatermark />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
