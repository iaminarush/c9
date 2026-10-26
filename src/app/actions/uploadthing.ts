"use server";
import { UTApi } from "uploadthing/server";
import { auth } from "../api/auth/[...nextauth]/auth";

const utapi = new UTApi();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Server actions are public HTTP endpoints and their action IDs ship in the
// client bundle, so authorization has to be enforced here.
async function requireAdmin() {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!session.user.admin) {
    throw new Error("No permission");
  }
}

export async function uploadImageByUrl(imageUrl: string) {
  await requireAdmin();

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("Failed to fetch image");

  const blob = await response.blob();

  if (!ALLOWED_IMAGE_TYPES.includes(blob.type)) {
    throw new Error(`Invalid file type: ${blob.type}. Only images are allowed.`);
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

export async function deleteUploadByKey(key: string) {
  await requireAdmin();

  const { success, deletedCount } = await utapi.deleteFiles(key);

  if (!success) {
    throw new Error("Delete file failed");
  }

  return { success, deletedCount };
}
