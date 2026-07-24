/** Upload an image file from the user's device; returns its hosted URL. */

import { API_BASE_URL, ApiError } from "./client";

export async function uploadImage(file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: "POST",
      // Don't set Content-Type — the browser adds the multipart boundary.
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch (cause) {
    throw new ApiError("Couldn't reach the server to upload the image.", 0, cause);
  }

  const payload = await response.json().catch(() => undefined);
  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : "Image upload failed.";
    throw new ApiError(detail, response.status, payload);
  }
  return (payload as { url: string }).url;
}
