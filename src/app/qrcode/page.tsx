"use client";

import BarcodeScanner from "@/components/barcodeScanner";
import TextFormField from "@/components/hook-form/TextFormField";
import { UploadButton } from "@/components/util/uploadthing";
import { createQrcodeSchema } from "@/server/db/schema";
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
import {
  IconPhotoOff,
  IconPlus,
  IconQrcode,
  IconTrash,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { ReactNode, useState } from "react";
import {
  Control,
  SubmitHandler,
  useForm,
  UseFormReset,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  type Qrcode,
  useAddQrcode,
  useQrcodes,
  useUpdateQrcode,
} from "./query";

export default function Qrcodes() {
  const qrcodes = useQrcodes();

  const [qrcodeId, setQrcodeId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutate, isLoading } = useUpdateQrcode();
  const { data } = useSession();

  const { control, setValue, reset, handleSubmit } = useForm<FormSchema>({
    defaultValues: {
      name: "",
      image: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    if (qrcodeId) {
      mutate(
        { params: { id: `${qrcodeId}` }, body: data },
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
            setQrcodeId={setQrcodeId}
            reset={reset}
          />
        ))}
      </Stack>

      <Modal
        opened={!!qrcodeId}
        onClose={() => {
          setQrcodeId(null);
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

type FormSchema = z.infer<typeof createQrcodeSchema>;

const AddQrcode = () => {
  const [opened, handlers] = useDisclosure(false);
  const { control, handleSubmit, setValue, reset } = useForm<FormSchema>();
  const { data } = useSession();
  const { mutate, isLoading } = useAddQrcode();
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
        title="Add Qrcode"
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
  const [opened, handlers] = useDisclosure(false);

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
        rightSection={
          <ActionIcon
            onClick={handlers.toggle}
            variant="subtle"
            color={opened ? "blue" : "white"}
          >
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

const QrcodeButton = ({
  qrcode,
  setQrcodeId,
  reset,
}: {
  qrcode: Qrcode;
  setQrcodeId: (id: number) => void;
  reset: UseFormReset<FormSchema>;
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
      onClick={() => {
        reset({
          name: qrcode.name,
          image: qrcode.image,
          remark: qrcode.remark,
        });
        setQrcodeId(qrcode.id);
      }}
    >
      {qrcode.name}
    </Button>
  );
};
