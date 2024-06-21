import { getToken } from "next-auth/jwt";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError, type FileRouter } from "uploadthing/server";
import { auth } from "../auth/[...nextauth]/auth";

const f = createUploadthing();

// const auth = () => ({ id: "fakeId" });

export const ourFileRouter = {
  imageUploader: f({ image: {} })
    .middleware(async ({ req }) => {
      const token = await getToken({ req });

      // if (!token?.admin) throw new UploadThingError("Unauthorized");

      const session = await auth();

      if (!session) throw new UploadThingError("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
