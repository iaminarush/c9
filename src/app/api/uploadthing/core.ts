import { createUploadthing } from "uploadthing/next";
import { UploadThingError, type FileRouter } from "uploadthing/server";
import { auth } from "../auth/[...nextauth]/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: {} })
    .middleware(async () => {
      const session = await auth();

      // The UI only exposes uploads to admins; enforce it here too.
      if (!session) throw new UploadThingError("Unauthorized");
      if (!session.user.admin) throw new UploadThingError("No permission");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
