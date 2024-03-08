import { Modal, Select, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useMediaDevices } from "react-media-devices";
import { useZxing } from "react-zxing";

export const BarcodeScanner = ({
  opened,
  onClose,
  handleScan,
}: {
  opened: boolean;
  onClose: () => void;
  handleScan: (barcode: string) => void;
}) => {
  const { devices, loading } = useMediaDevices({
    constraints: { video: true, audio: false },
  });
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [barcode, setBarcode] = useState("");

  const videoSources =
    devices
      ?.filter((d) => d.kind === "videoinput")
      .map((v) => ({ label: v.label, value: v.deviceId })) || [];

  const { ref } = useZxing({
    paused: !selectedDevice,
    deviceId: selectedDevice || "",
    onDecodeResult: (result) => {
      handleScan(result.getText());
      onClose();
    },
    onDecodeError: (error) => {},
  });

  return (
    <Modal opened={opened} onClose={onClose}>
      <Stack>
        <Select
          data={videoSources}
          label="Device"
          value={selectedDevice}
          onChange={setSelectedDevice}
        />
        <video ref={ref} />
      </Stack>
    </Modal>
  );
};
