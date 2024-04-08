"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { createStoreSchema } from "@/server/db/schema";
import {
  ActionIcon,
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
        title=""
      >
        <FormLayout
          control={control}
          setValue={setValue}
          submitButton={
            <Button loading={isLoading} onClick={handleSubmit(onSubmit)}>
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
  const session = useSession();
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
      <ActionIcon disabled={!session.data?.user.admin} onClick={handlers.open}>
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
            <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
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
          <Image
            src={store.image}
            alt="Logo"
            h={40}
            w={40}
            fit="contain"
            radius="sm"
          />
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
