import { createUploadthing } from "uploadthing/next";
import { UploadThingError, type FileRouter } from "uploadthing/server";
import { auth } from "../auth/[...nextauth]/auth";

const f = createUploadthing();

// const auth = () => ({ id: "fakeId" });

export const ourFileRouter = {
  imageUploader: f({ image: {} })
    .middleware(async () => {
      // const user = await auth();

      // if (!user) throw new UploadThingError("Unauthorized");

      // return { userId: user.id };

      const session = await auth();

      if (!session) throw new UploadThingError("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
