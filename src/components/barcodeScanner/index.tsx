import { Loader, Select, Stack } from "@mantine/core";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { useState } from "react";
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
    // onDecodeError: (error) => {
    //   console.log(error);
    // },
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
      <video ref={ref} />
    </Stack>
  );
};
