"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, User } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { uploadImage } from "@/lib/api/uploads";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label?: string;
  /** Current image URL (or null/undefined for none). */
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  helperText?: string;
  /** "circle" for avatars, "rect" (default) for banners/photos. */
  shape?: "rect" | "circle";
}

/** Upload an image from the device, with a live preview. Replaces URL inputs. */
export function ImageUpload({ label, value, onChange, helperText, shape = "rect" }: ImageUploadProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCircle = shape === "circle";

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!token) {
      setError("Please sign in again to upload.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, token);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden border border-border bg-surface-muted",
            isCircle ? "h-20 w-20 rounded-full" : "h-24 w-32 rounded-md",
          )}
        >
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              {isCircle ? (
                <User className="h-8 w-8" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-8 w-8" aria-hidden="true" />
              )}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFile}
            className="sr-only"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {value ? "Change image" : "Upload image"}
          </Button>
          {value && !uploading && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
