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
}: {
  handleScan: (code: string) => void;
}) {
  return (
    <BarcodeScannerPolyfilled
      onCapture={({ rawValue }) => handleScan(rawValue)}
      options={{ formats: ["ean_13"], delay: 1000 }}
    />
  );
}
