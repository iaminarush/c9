import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import Quagga from '@ericblade/quagga2'
import { useMediaDevices } from "react-media-devices";
import { Loader, Select, Stack } from "@mantine/core";

export default function NewBarcodeScanner() {
  const [scanning, scanningHandlers] = useDisclosure(false)
  const [cameras, setCameras] = useState([])
  const [cameraId, setCameraId] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [results, setResults] = useState([])
  const [torch, torchHandlers] = useDisclosure(false)
  const scannerRef = useRef(null)
  
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const { devices, loading } = useMediaDevices({
    constraints: { video: true, audio: false },
  });

  const videoSources =
    devices
      ?.filter((d) => d.kind === "videoinput")
      .map((v) => ({ label: v.label, value: v.deviceId })) || [];

  const noCamera = !loading && videoSources.length === 0;

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
    </Stack>
  );
}
