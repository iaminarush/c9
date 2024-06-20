import dynamic from "next/dynamic";

// const hints = new Map();
// const formats = [BarcodeFormat.EAN_13];

// hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

// export const BarcodeScanner = ({
//   handleScan,
// }: {
//   handleScan: (barcode: string) => void;
// }) => {
//   const { devices, loading } = useMediaDevices({
//     constraints: {
//       video: true,
//       audio: false,
//     },
//   });
//   const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
//   const [error, setError] = useState("");

//   const videoSources =
//     devices
//       ?.filter((d) => d.kind === "videoinput")
//       .map((v) => ({ label: v.label, value: v.deviceId })) || [];

//   const noCamera = !loading && videoSources.length === 0;

//   const { ref } = useZxing({
//     paused: !selectedDevice,
//     deviceId: selectedDevice || "",
//     onDecodeResult: (result) => {
//       handleScan(result.getText());
//     },
//     onDecodeError: (error) => {
//       // console.log(error);
//       // toast.error(error.message);
//       setError(error.message);
//     },
//     hints,
//   });

//   return (
//     <Stack>
//       <Select
//         data={videoSources}
//         label="Device"
//         value={selectedDevice}
//         onChange={setSelectedDevice}
//         leftSection={loading ? <Loader size="sm" /> : null}
//         placeholder={noCamera ? "No cameras found" : undefined}
//         disabled={noCamera}
//       />
//       {!!error && <Text c="red">Error: {error}</Text>}
//       <video ref={ref} />
//     </Stack>
//   );
// };

const BarcodeScannerPolyfilled = dynamic(
  () => {
    //@ts-expect-error Polyfill does not have types module
    import("react-barcode-scanner/polyfill");
    return import("react-barcode-scanner").then((mod) => mod.BarcodeScanner);
  },
  { ssr: false },
);

export default function BarcodeScanner({
  handleScan,
}: {
  handleScan: (code: string) => void;
}) {
  return (
    <BarcodeScannerPolyfilled
      onCapture={({ rawValue }) => handleScan(rawValue)}
      options={{ formats: ["ean_13"] }}
    />
  );
}
