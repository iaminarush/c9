"use client";

import { useMediaDevices } from "react-media-devices";
import { useZxing } from "react-zxing";

export default function Barcode() {
  const { devices } = useMediaDevices({
    constraints: { video: true, audio: false },
  });

  console.log(devices);

  const deviceId = devices?.[3]?.deviceId;

  const { ref } = useZxing({ paused: !deviceId, deviceId });

  // return <video ref={ref} height={300} width={300} />;

  return (
    <>
      <video ref={ref} height={300} width={300} />
    </>
  );
}
