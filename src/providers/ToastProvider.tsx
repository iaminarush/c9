import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  // const colorScheme = useComputedColorScheme();
  return <Toaster toastOptions={{ style: { lineHeight: "26px" } }} />;
}
