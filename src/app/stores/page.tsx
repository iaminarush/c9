"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { createStoreSchema } from "@/server/db/schema";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Modal,
  Skeleton,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPhotoOff, IconPlus, IconStar, IconTrash } from "@tabler/icons-react";
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
import { useMutation } from "@tanstack/react-query";
import { deleteUploadByKey, uploadImageByUrl } from "../actions/uploadthing";

export default function Stores() {
  const stores = useStores();
  const { control, setValue, reset, handleSubmit } = useForm<FormSchema>({
    defaultValues: {
      name: "",
      image: "",
      imageKey: "",
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
          <StoreButton key={s.id} store={s} setStoreId={setStoreId} reset={reset} />
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
          storeId={storeId}
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
          storeId={null}
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
  storeId,
}: {
  control: Control<FormSchema>;
  setValue: UseFormSetValue<FormSchema>;
  submitButton: ReactNode;
  setIsUploading: (value: boolean) => void;
  storeId: number | null;
}) => {
  const image = useWatch({ control, name: "image" });
  const imageKey = useWatch({ control, name: "imageKey" }) || "";
  const id = storeId || 0;
  const { data } = useSession();
  const { mutate, isLoading: updateLoading } = useUpdateStore();
  const { mutate: deleteMutate, isLoading: deleteLoading } = useMutation({
    mutationFn: (key: string) => deleteUploadByKey(key),
    onError: () => toast.error("Failed to delete image"),
  });

  const isLoading = updateLoading || deleteLoading;

  const saveImage = (url: string, key: string) => {
    const previousKey = imageKey;
    setValue("image", url);
    setValue("imageKey", key);

    if (!previousKey || previousKey === key) {
      return;
    }

    if (id !== 0) {
      // Save the new image before removing the old file so the record never
      // points at a deleted image.
      mutate(
        {
          params: { id: `${id}` },
          body: { image: url, imageKey: key },
        },
        {
          onSuccess: () => deleteMutate(previousKey),
          onError: () => toast.error("Failed to save image"),
        },
      );
    } else {
      // Unsaved store: nothing references the previous file.
      deleteMutate(previousKey);
    }
  };

  const deleteImage = () => {
    if (id !== 0) {
      mutate({ params: { id: `${id}` }, body: { image: null, imageKey: null } });
    }
    setValue("image", null);
    setValue("imageKey", null);

    if (imageKey) {
      deleteMutate(imageKey);
    }
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

      <Stack>
        <Text>Logo</Text>
        {image ? (
          <Group wrap="nowrap">
            <Box w={28} />
            <Image
              component={NextImage}
              style={{
                objectFit: "contain",
                flexBasis: "auto",
              }}
              height={200}
              width={200}
              src={image}
              radius="sm"
              alt="Logo"
            />
            <ActionIcon
              color="red"
              variant="filled"
              onClick={deleteImage}
              loading={isLoading}
              disabled={!data?.user.admin}
            >
              <IconTrash />
            </ActionIcon>
          </Group>
        ) : (
          <Image
            style={{ objectFit: "contain", width: "100%", height: 200 }}
            height={200}
            width={200}
            src="/noImage.svg"
            radius="sm"
            alt="Logo placeholder"
          />
        )}

        {!!data?.user.admin && <UploadByUrl onUploaded={saveImage} />}
      </Stack>
      {!!data?.user.admin && (
        <UploadButton
          endpoint="imageUploader"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            const uploaded = res[0];

            if (uploaded?.ufsUrl && uploaded.key) {
              toast.success("Upload Completed");
              saveImage(uploaded.ufsUrl, uploaded.key);
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

const UploadByUrl = ({
  onUploaded,
}: {
  onUploaded: (url: string, key: string) => void;
}) => {
  const [url, setUrl] = useState("");
  const mutation = useMutation({
    mutationFn: () => uploadImageByUrl(url),
    onSuccess: (data) => onUploaded(data.data.ufsUrl, data.data.key),
    onError: () => toast.error("Failed to upload image"),
  });
  return (
    <>
      <TextInput value={url} onChange={(e) => setUrl(e.currentTarget.value)} label="Image URL" />
      <Button onClick={() => mutation.mutate()} disabled={!url}>
        <Text>Upload via URL</Text>
      </Button>
    </>
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
  // TODO: Add optimistic update
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
          <IconStar fill={store.favourite ? `${theme.colors.yellow[5]}` : "transparent"} />
        </ActionIcon>
      }
      onClick={() => {
        reset({
          name: store.name,
          image: store.image,
          imageKey: store.imageKey,
          remark: store.remark,
        });
        setStoreId(store.id);
      }}
    >
      {store.name}
    </Button>
  );
};
