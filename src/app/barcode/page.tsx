"use client";

import { BarcodeScanner } from "@/components/barcodeScanner";
import { Button, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export default function Barcode() {
  const [opened, handlers] = useDisclosure(false);
  const [barcode, setBarcode] = useState("");

  return (
    <>
      <Button onClick={handlers.open}>Scan</Button>
      {opened && (
        <BarcodeScanner
          opened={opened}
          onClose={handlers.close}
          handleScan={setBarcode}
        />
      )}
      {!!barcode && <Text>Result: {barcode}</Text>}
    </>
  );
}
