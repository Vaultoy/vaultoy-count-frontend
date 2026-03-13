import { Button } from "@chakra-ui/react";
import { useInstallPWAPrompt } from "@/utils/useInstallPWAPrompt";
import { LuDownload } from "react-icons/lu";

export const InstallAppButton = () => {
  const { canInstall, promptInstall } = useInstallPWAPrompt();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      variant="outline"
      background="white"
      onClick={() => void promptInstall()}
    >
      Install the app <LuDownload />
    </Button>
  );
};
