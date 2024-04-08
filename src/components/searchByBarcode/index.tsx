"use client";

import { ActionIcon, LoadingOverlay, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBarcode } from "@tabler/icons-react";
import { BarcodeScanner } from "../barcodeScanner";
import { client } from "@/contracts/contract";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const useBarcodeQuery = (barcode: string | null) =>
  client.items.searchItemByBarcode.useQuery(
    ["barcode search"],
    {
      params: { barcode: barcode || "" },
    },
    {
      enabled: !!barcode,
      meta: { errorMessage: "Can't find item" },
    },
  );

export const SearchByBarcode = () => {
  const [opened, handlers] = useDisclosure(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const { data, isFetching, isRefetching, error } = useBarcodeQuery(barcode);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      setBarcode(null);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      router.push(`/items/${data.body.id}`);
      handlers.close();
      setBarcode(null);
    }
  }, [data]);

  return (
    <>
      <ActionIcon onClick={handlers.open}>
        <IconBarcode />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={() => {
          setBarcode(null);
          handlers.close();
        }}
      >
        <>
          <LoadingOverlay
            visible={isFetching || isRefetching}
            overlayProps={{ blur: 1 }}
          />
          {!!opened && <BarcodeScanner handleScan={(b) => setBarcode(b)} />}
        </>
      </Modal>
    </>
  );
};
