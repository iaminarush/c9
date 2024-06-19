import { useDisclosure } from "@mantine/hooks";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Quagga, {
  QuaggaJSResultObject,
  QuaggaJSResultObject_CodeResult,
} from "@ericblade/quagga2";
import { useMediaDevices } from "react-media-devices";
import { Loader, Select, Stack } from "@mantine/core";
import { on } from "events";

export default function NewBarcodeScanner() {
  // const scannerRef = useRef<HTMLDivElement | null>(null);

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

      <div style={{ width: "15rem", height: "15rem" }}>
        {/* <Scanner scannerRef={scannerRef} /> */}
      </div>
    </Stack>
  );
}

const Scanner = () => {
  return (
    <>
      <></>
    </>
  );
};
