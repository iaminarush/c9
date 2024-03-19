"use client";

import { Image, Skeleton, Stack, Text } from "@mantine/core";
import { Store, useStore } from "../query";
import { isNumber } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { toast } from "react-hot-toast";
import NextImage from "next/image";

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
  return <StoreForm store={store.data.body} />;
}

const StoreForm = ({ store }: { store: Store }) => {
  const { control, setValue } = useForm({
    defaultValues: {
      name: store.name,
      remark: store.remark,
      image: store.image,
    },
  });

  const image = useWatch({ control, name: "image" });

  return (
    <Stack>
      <TextFormField
        control={control}
        name="name"
        rules={{ required: "Required" }}
        label="Name"
      />

      <Image
        src={image}
        alt="Logo"
        h={200}
        mah={200}
        radius="sm"
        fallbackSrc="https://placehold.co/600x400?text=No%20Image"
        fit="cover"
      />

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
    </Stack>
  );
};
