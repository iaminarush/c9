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
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPhotoOff,
  IconPlus,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
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
  const [isUploading, setIsUploading] = useState(false);

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
        onClose={() => {
          setStoreId(null);
          setIsUploading(false);
        }}
        centered
        title="Update Store"
      >
        <FormLayout
          control={control}
          setValue={setValue}
          setIsUploading={setIsUploading}
          submitButton={
            <Button
              loading={isLoading}
              onClick={handleSubmit(onSubmit)}
              disabled={!data?.user.admin || isUploading}
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
  const [isUploading, setIsUploading] = useState(false);

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
        onClose={() => {
          handlers.close();
          setIsUploading(false);
        }}
        title="Add Store"
        centered
      >
        <FormLayout
          control={control}
          setValue={setValue}
          setIsUploading={setIsUploading}
          submitButton={
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!data?.user.admin || isUploading}
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
  setIsUploading,
}: {
  control: Control<FormSchema>;
  setValue: UseFormSetValue<FormSchema>;
  submitButton: ReactNode;
  setIsUploading: (value: boolean) => void;
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
          {image ? (
            <Group>
              <Image
                component={NextImage}
                style={{ objectFit: "contain" }}
                height={200}
                width={200}
                src={image}
                radius="sm"
                alt="Logo"
              />
              {/* TODO: Delete on cdn */}
              <ActionIcon
                color="red"
                variant="filled"
                onClick={() => setValue("image", null)}
              >
                <IconTrash />
              </ActionIcon>
            </Group>
          ) : (
            <Image
              style={{ objectFit: "contain" }}
              height={200}
              width={200}
              src="/noImage.svg"
              radius="sm"
              alt="Logo placeholder"
            />
          )}
        </Stack>
      </Center>
      {!!data?.user.admin && (
        <UploadButton
          endpoint="imageUploader"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            if (res[0]?.url) {
              toast.success("Upload Completed");
              setValue("image", res[0].url);
            } else {
              toast.error("Unknown error");
            }
            setIsUploading(false);
          }}
          onUploadError={(error) => {
            toast.error(`Error: ${error.message}`);
            setIsUploading(false);
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
  const theme = useMantineTheme();
  const { mutate } = useUpdateStore();

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
      rightSection={
        <ActionIcon
          variant="subtle"
          color="yellow.5"
          onClick={(e) => {
            e.stopPropagation();
            mutate({
              params: { id: `${store.id}` },
              body: { favourite: !store.favourite },
            });
          }}
        >
          <IconStar
            fill={store.favourite ? `${theme.colors.yellow[5]}` : "transparent"}
          />
        </ActionIcon>
      }
      onClick={() => {
        reset({ name: store.name, image: store.image, remark: store.remark });
        setStoreId(store.id);
      }}
    >
      {store.name}
    </Button>
  );
};
