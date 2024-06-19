import Quagga, {
  QuaggaJSConfigObject,
  QuaggaJSResultObject,
} from "@ericblade/quagga2";
import { useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

const getAvgOfErrorCodes = (
  decodedCodes: QuaggaJSResultObject["codeResult"]["decodedCodes"],
) => {
  const errors = decodedCodes
    .filter((x) => x.error != null)
    .map((x) => x.error!);
  const avgOfErrors = errors.reduce((a, b) => a + b) / errors.length;
  return avgOfErrors;
};

const getConfig = (target: string | Element): QuaggaJSConfigObject => ({
  inputStream: {
    type: "LiveStream",
    constraints: {
      width: {
        ideal: 1920,
        min: 640,
      },
      height: {
        ideal: 1080,
        min: 480,
      },
      facingMode: { ideal: "environment" },
    },
    target,
  },
  locator: {
    patchSize: "medium",
    halfSample: true,
  },
  numOfWorkers: 0,
  decoder: { readers: ["ean_reader"] },
  locate: true,
});

export const useScanner = (
  onDetected: (code: string) => void,
  autoStart = false,
) => {
  const isQuaggaInitBlockedRef = useRef(false);

  const scannerRef = useRef<HTMLDivElement | null>(null);

  const handleDetected = useCallback(
    ({ codeResult }: QuaggaJSResultObject) => {
      const err = getAvgOfErrorCodes(codeResult.decodedCodes);

      if ((err < 0.25 || isNaN(err)) && codeResult.code) {
        onDetected(codeResult.code);
      }
    },
    [onDetected],
  );

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) {
      throw new Error("Cannot start scanner without a target");
    } else if (isQuaggaInitBlockedRef.current) {
      throw new Error("Cannot init scanner while it is already running");
    }

    const config = getConfig(scannerRef.current);
    Quagga.init(config, (err: unknown) => {
      if (err) {
        toast.error(`Error starting scanner: ${err}`)
      }
      return;
      
      Quagga.start()
    });
  }, []);
};
