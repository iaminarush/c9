"use client";

import { client } from "@/contracts/contract";
import { ActionIcon, LoadingOverlay, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBarcode } from "@tabler/icons-react";
import { toast } from "react-hot-toast";
import BarcodeScanner from "../barcodeScanner";
import { useRouter } from "next13-progressbar";

const useSearchItemByBarcode = () => {
  return client.items.searchItemByBarcode.useMutation();
};

export const SearchByBarcode = () => {
  const [opened, handlers] = useDisclosure(false);
  const router = useRouter();
  const { isLoading, mutate } = useSearchItemByBarcode();

  return (
    <>
      <ActionIcon onClick={handlers.open}>
        <IconBarcode />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={() => {
          handlers.close();
        }}
        title="Search item with barcode"
      >
        <>
          <LoadingOverlay
            // visible={isFetching || isRefetching}
            visible={isLoading}
            overlayProps={{ blur: 1 }}
          />
          {!!opened && (
            <BarcodeScanner
              handleScan={(barcode) => {
                mutate(
                  { body: { barcode } },
                  {
                    onSuccess: ({ body }) => router.push(`/items/${body.id}`),
                    onError: () =>
                      toast.error(`Barcode ${barcode} not found for any items`),
                  },
                );
              }}
            />
          )}
        </>
      </Modal>
    </>
  );
};
