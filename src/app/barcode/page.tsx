"use client";

import { useMediaDevices } from "react-media-devices";
import { useZxing } from "react-zxing";
import Webcam from "react-webcam";
import { Stack } from "@mantine/core";

export default function Barcode() {
  const { devices } = useMediaDevices({
    constraints: { video: true, audio: false },
  });

  const deviceId = devices?.[3]?.deviceId;

  const { ref } = useZxing({
    paused: !deviceId,
    deviceId,
    onDecodeResult: (result) => console.log(result),
  });

  // return <video ref={ref} height={300} width={300} />;

  return (
    <>
      <Stack>
        <video ref={ref} height={300} width={300} />
      </Stack>
    </>
  );
}

// export default function Barcode() {
//   const { ref } = useZxing();

//   return (
//     <>
//       <Webcam videoConstraints={{ facingMode: "environment" }} ref={ref} />
//     </>
//   );
// }
