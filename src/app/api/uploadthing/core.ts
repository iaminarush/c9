import { createUploadthing } from "uploadthing/next";
import { UploadThingError, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

const auth = () => ({ id: "fakeId" });

// const auth = (req: Request, res: unknown) => getServerSession(req, res, authOptions)

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "2MB" } })
    .middleware(async ({ req }) => {
      const user = await auth();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
