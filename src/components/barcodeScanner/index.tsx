import dynamic from "next/dynamic";

const BarcodeScannerPolyfilled = dynamic(
  () => {
    //@ts-expect-error Polyfill does not have types module
    import("react-barcode-scanner/polyfill");
    // return import("react-barcode-scanner").then((mod) => mod.BarcodeScanner);
    return import("./custom-barcode-scanner").then((mod) => mod.default);
  },
  { ssr: false },
);

export default function BarcodeScanner({
  handleScan,
  formats = ["ean_13"],
}: {
  handleScan: (code: string) => void;
  formats?: string[];
}) {
  return (
    <BarcodeScannerPolyfilled
      onCapture={({ rawValue }) => handleScan(rawValue)}
      options={{ formats, delay: 1000 }}
    />
  );
}
