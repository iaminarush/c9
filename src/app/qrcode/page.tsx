"use client";

import BarcodeScanner from "@/components/barcodeScanner";
import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { createQrcodeSchema } from "@/server/db/schema";
import { ActionIcon, Box, Button, Group, Image, Modal, Skeleton, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLink, IconPhotoOff, IconPlus, IconQrcode, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { ReactNode, useState } from "react";
import { Control, SubmitHandler, useForm, UseFormSetValue } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { type Qrcode, useAddQrcode, useQrcodes, useUpdateQrcode } from "./query";
import { useMutation } from "@tanstack/react-query";
import { deleteUploadByKey } from "../actions/uploadthing";

export default function Qrcodes() {
  const qrcodes = useQrcodes();

  const [qrcodeId, setQrcodeId] = useState<number | null>(null);
  const [imageState, setImageState] = useState<ImageState>(emptyImage);
  const [isUploading, setIsUploading] = useState(false);
  const { mutate, isLoading } = useUpdateQrcode();
  const { data } = useSession();

  const { control, setValue, reset, handleSubmit } = useForm<FormSchema>({
    defaultValues: {
      name: "",
      data: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = ({ name, remark, data }) => {
    if (qrcodeId) {
      mutate(
        {
          params: { id: `${qrcodeId}` },
          body: { name, remark, data },
        },
        {
          onSuccess: ({ body }) => {
            toast.success(`Updated ${body.name}`);
            setQrcodeId(null);
          },
        },
      );
    }
  };

  if (qrcodes.isLoading) {
    return <Skeleton h={250} />;
  }

  if (qrcodes.isError) {
    return <Text>Error</Text>;
  }

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            Qrcode
          </Text>
          <AddQrcode />
        </Group>
        {qrcodes.data.body.map((q) => (
          <QrcodeButton
            key={q.id}
            qrcode={q}
            onSelect={(qrcode) => {
              reset({
                name: qrcode.name,
                remark: qrcode.remark,
                data: qrcode.data,
              });
              setImageState({
                image: qrcode.image,
                imageKey: qrcode.imageKey,
              });
              setQrcodeId(qrcode.id);
            }}
          />
        ))}
      </Stack>

      <Modal
        opened={!!qrcodeId}
        onClose={() => {
          setQrcodeId(null);
          setImageState(emptyImage);
          setIsUploading(false);
        }}
        centered
        title="Update Store"
      >
        <FormLayout
          control={control}
          setValue={setValue}
          setIsUploading={setIsUploading}
          qrcodeId={qrcodeId}
          image={imageState.image}
          imageKey={imageState.imageKey}
          onImageChange={setImageState}
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

type FormSchema = Pick<
  z.infer<typeof createQrcodeSchema>,
  "name" | "remark" | "data"
>;

type ImageState = {
  image: string | null;
  imageKey: string | null;
};

const emptyImage: ImageState = { image: null, imageKey: null };

const AddQrcode = () => {
  const [opened, handlers] = useDisclosure(false);
  const { control, handleSubmit, setValue, reset } = useForm<FormSchema>();
  const { data } = useSession();
  const { mutate, isLoading } = useAddQrcode();
  const [isUploading, setIsUploading] = useState(false);
  const [imageState, setImageState] = useState<ImageState>(emptyImage);

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    mutate(
      { body: { ...data, image: imageState.image, imageKey: imageState.imageKey } },
      {
        onSuccess: ({ body }) => {
          toast.success(`${body.name} added`);
          reset();
          setImageState(emptyImage);
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
        title="Add Qrcode"
        centered
      >
        <FormLayout
          control={control}
          setValue={setValue}
          setIsUploading={setIsUploading}
          qrcodeId={null}
          image={imageState.image}
          imageKey={imageState.imageKey}
          onImageChange={setImageState}
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
  qrcodeId,
  image,
  imageKey,
  onImageChange,
}: {
  control: Control<FormSchema>;
  setValue: UseFormSetValue<FormSchema>;
  submitButton: ReactNode;
  setIsUploading: (value: boolean) => void;
  qrcodeId: number | null;
  image: string | null;
  imageKey: string | null;
  onImageChange: (image: ImageState) => void;
}) => {
  const id = qrcodeId || 0;
  const { data } = useSession();
  const [opened, handlers] = useDisclosure(false);
  const { mutate, isLoading: updateLoading } = useUpdateQrcode();
  const { mutate: deleteMutate, isLoading: deleteLoading } = useMutation({
    mutationFn: (key: string) => deleteUploadByKey(key),
    onError: () => toast.error("Failed to delete image"),
  });

  const isLoading = updateLoading || deleteLoading;

  // Image changes are persisted on their own, without waiting for the form
  // submit. A qrcode that has not been created yet keeps the image in state so
  // it can be sent along with the "Add" request.
  const saveImage = (nextImage: string | null, nextImageKey: string | null) => {
    const previous: ImageState = { image, imageKey };

    onImageChange({ image: nextImage, imageKey: nextImageKey });

    if (id === 0) {
      if (imageKey && imageKey !== nextImageKey) {
        deleteMutate(imageKey);
      }
      return;
    }

    mutate(
      {
        params: { id: `${id}` },
        body: { image: nextImage, imageKey: nextImageKey },
      },
      {
        onSuccess: () => {
          if (imageKey && imageKey !== nextImageKey) {
            deleteMutate(imageKey);
          }
        },
        onError: () => {
          toast.error("Failed to save image");
          onImageChange(previous);
        },
      },
    );
  };

  const deleteImage = () => saveImage(null, null);

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

      <TextFormField
        control={control}
        name="data"
        label="Qrcode Data"
        rules={{ required: "Required" }}
        required
        rightSection={
          <ActionIcon onClick={handlers.toggle} variant="subtle" color={opened ? "blue" : "white"}>
            <IconQrcode />
          </ActionIcon>
        }
      />

      {opened && (
        <BarcodeScanner
          handleScan={(e) => {
            setValue("data", e);
            handlers.close();
          }}
          formats={["qr_code"]}
        />
      )}

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

const QrcodeButton = ({
  qrcode,
  onSelect,
}: {
  qrcode: Qrcode;
  onSelect: (qrcode: Qrcode) => void;
}) => {
  // TODO: Add optimistic update

  return (
    <Button
      size="lg"
      justify="space-between"
      leftSection={
        qrcode.image ? (
          <Box h={40} w={40}>
            <Image
              component={NextImage}
              src={qrcode.image}
              alt={qrcode.name}
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
      onClick={() => onSelect(qrcode)}
      rightSection={
        <ActionIcon
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            window.open(qrcode.data, "_blank");
          }}
        >
          <IconLink />
        </ActionIcon>
      }
    >
      {qrcode.name}
    </Button>
  );
};
