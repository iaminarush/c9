import { Loader, Select, Stack, Text } from "@mantine/core";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMediaDevices } from "react-media-devices";
import { useZxing } from "react-zxing";

const hints = new Map();
const formats = [BarcodeFormat.CODABAR];

hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

export const BarcodeScanner = ({
  handleScan,
}: {
  handleScan: (barcode: string) => void;
}) => {
  const { devices, loading } = useMediaDevices({
    constraints: { video: true, audio: false },
  });
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [error, setError] = useState("");

  const videoSources =
    devices
      ?.filter((d) => d.kind === "videoinput")
      .map((v) => ({ label: v.label, value: v.deviceId })) || [];

  const noCamera = !loading && videoSources.length === 0;

  const { ref } = useZxing({
    paused: !selectedDevice,
    deviceId: selectedDevice || "",
    onDecodeResult: (result) => {
      handleScan(result.getText());
    },
    onDecodeError: (error) => {
      // console.log(error);
      // toast.error(error.message);
      setError(error.message);
    },
    // hints,
  });

  return (
    <Stack>
      <Select
        data={videoSources}
        label="Device"
        value={selectedDevice}
        onChange={setSelectedDevice}
        leftSection={loading ? <Loader size="sm" /> : null}
        placeholder={noCamera ? "No cameras found" : undefined}
        disabled={noCamera}
      />
      {!!error && <Text c="red">Error: {error}</Text>}
      <video ref={ref} />
    </Stack>
  );
};
