"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { createStoreSchema } from "@/server/db/schema";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Group,
  Image,
  Modal,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPhotoOff, IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { ReactNode, useState } from "react";
import {
  Control,
  SubmitHandler,
  UseFormReset,
  UseFormSetValue,
  useForm,
  useWatch,
} from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Store, useAddStore, useStores, useUpdateStore } from "./query";
import NextImage from "next/image";

export default function Stores() {
  const stores = useStores();
  const { control, setValue, reset, handleSubmit } = useForm<FormSchema>({
    defaultValues: {
      name: "",
      image: "",
    },
  });
  const [storeId, setStoreId] = useState<number | null>(null);
  const { mutate, isLoading } = useUpdateStore();
  const { data } = useSession();

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    if (storeId) {
      mutate(
        { params: { id: `${storeId}` }, body: data },
        {
          onSuccess: ({ body }) => {
            toast.success(`Updated ${body.name}`);
            setStoreId(null);
          },
        },
      );
    }
  };

  if (stores.isLoading) {
    return <Skeleton h={250} />;
  }

  if (stores.isError) {
    return <Text>Error</Text>;
  }

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            Stores
          </Text>
          <AddStore />
        </Group>
        {stores.data.body.map((s) => (
          <StoreButton
            key={s.id}
            store={s}
            setStoreId={setStoreId}
            reset={reset}
          />
        ))}
      </Stack>
      <Modal
        opened={!!storeId}
        onClose={() => setStoreId(null)}
        centered
        title="Update Store"
      >
        <FormLayout
          control={control}
          setValue={setValue}
          submitButton={
            <Button
              loading={isLoading}
              onClick={handleSubmit(onSubmit)}
              disabled={!data?.user.admin}
            >
              Update
            </Button>
          }
        />
      </Modal>
    </>
  );
}

type FormSchema = z.infer<typeof createStoreSchema>;

const AddStore = () => {
  const [opened, handlers] = useDisclosure(false);
  const { control, handleSubmit, setValue, reset } = useForm<FormSchema>();
  const { data } = useSession();
  const { mutate, isLoading } = useAddStore();

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    mutate(
      { body: data },
      {
        onSuccess: ({ body }) => {
          toast.success(`${body.name} added`);
          reset();
          handlers.close();
        },
      },
    );
  };

  return (
    <>
      <ActionIcon disabled={!data?.user.admin} onClick={handlers.open}>
        <IconPlus />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={handlers.close}
        title="Add Store"
        centered
      >
        <FormLayout
          control={control}
          setValue={setValue}
          submitButton={
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!data?.user.admin}
            >
              Add
            </Button>
          }
        />
      </Modal>
    </>
  );
};

const FormLayout = ({
  control,
  setValue,
  submitButton,
}: {
  control: Control<FormSchema>;
  setValue: UseFormSetValue<FormSchema>;
  submitButton: ReactNode;
}) => {
  const image = useWatch({ control, name: "image" });
  const { data } = useSession();

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
            component={NextImage}
            style={{ objectFit: "contain" }}
            height={200}
            width={200}
            src={image}
            fallbackSrc="https://placehold.co/600x400?text=No%20Image"
            radius="sm"
            alt="Logo"
          />
        </Stack>
      </Center>
      {!!data?.user.admin && (
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
      )}

      {submitButton}
    </Stack>
  );
};

const StoreButton = ({
  store,
  setStoreId,
  reset,
}: {
  store: Store;
  setStoreId: (id: number) => void;
  reset: UseFormReset<FormSchema>;
}) => {
  return (
    <Button
      size="lg"
      justify="space-between"
      leftSection={
        store.image ? (
          <Box h={40} w={40}>
            <Image
              component={NextImage}
              src={store.image}
              alt={store.name}
              height={40}
              width={40}
              style={{ objectFit: "contain" }}
              radius="sm"
            />
          </Box>
        ) : (
          <IconPhotoOff width={40} />
        )
      }
      rightSection={<span />}
      onClick={() => {
        reset({ name: store.name, image: store.image, remark: store.remark });
        setStoreId(store.id);
      }}
    >
      {store.name}
    </Button>
  );
};
