"use client";

import { Button, Center, Image, Skeleton, Stack, Text } from "@mantine/core";
import { Store, useStore, useUpdateStore } from "../query";
import { isNumber } from "@/lib/utils";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createStoreSchema } from "@/server/db/schema";

export default function Store({ params: { id } }: { params: { id: string } }) {
  const store = useStore(id);

  if (!isNumber(id)) {
    return <Text>Store Id must be a number</Text>;
  }

  if (store.isLoading) {
    return <Skeleton h={250} />;
  }

  if (store.isError) {
    return <div>Error</div>;
  }
  return <StoreForm store={store.data.body} id={id} />;
}

type FormData = z.infer<typeof createStoreSchema>;

const StoreForm = ({ store, id }: { store: Store; id: string }) => {
  const { control, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: store.name,
      remark: store.remark,
      image: store.image,
    },
  });
  const { mutate, isLoading } = useUpdateStore();

  const image = useWatch({ control, name: "image" });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutate(
      { params: { id }, body: data },
      { onSuccess: () => toast.success("Updated") },
    );
  };

  return (
    <Stack>
      <TextFormField
        control={control}
        name="name"
        rules={{ required: "Required" }}
        label="Name"
        required
      />

      <TextFormField control={control} name="remark" label="Remarks" />

      <Center>
        <Stack>
          <Text>Logo</Text>
          <Image
            src={image}
            alt="Logo"
            h={200}
            mah={200}
            maw={200}
            radius="sm"
            fallbackSrc="https://placehold.co/600x400?text=No%20Image"
            fit="contain"
          />
        </Stack>
      </Center>

      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          if (res[0]?.url) {
            toast.success("Upload Completed");
            setValue("image", res[0].url);
          } else {
            toast.error("Unknown error");
          }
        }}
        onUploadError={(error) => {
          toast.error(`Error: ${error.message}`);
        }}
      />

      <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
        Save
      </Button>
    </Stack>
  );
};
