"use server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImageByUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("Failed to fetch image");

  const blob = await response.blob();

  if (!ALLOWED_IMAGE_TYPES.includes(blob.type)) {
    throw new Error(
      `Invalid file type: ${blob.type}. Only images are allowed.`,
    );
  }

  const file = new File([blob], "image-uploaded-by-link.png", {
    type: blob.type,
  });

  const responseUt = await utapi.uploadFiles(file);

  if (responseUt.error) {
    throw new Error(responseUt.error.message);
  }

  return { success: true, data: responseUt.data };
}
