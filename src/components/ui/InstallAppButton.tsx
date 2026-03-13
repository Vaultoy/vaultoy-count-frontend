import { useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Heading,
  List,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useInstallPWAPrompt } from "@/utils/useInstallPWAPrompt";
import { LuDownload } from "react-icons/lu";

type ManualInstallTutorial = {
  browserName: string;
  steps: string[];
};

const getManualInstallTutorial = (): ManualInstallTutorial => {
  const userAgent = navigator.userAgent.toLowerCase();

  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isSafari =
    /safari/.test(userAgent) &&
    !/chrome|crios|edg|edgios|opr|fxios|samsungbrowser/.test(userAgent);
  const isEdge = /edg|edgios/.test(userAgent);
  const isSamsungInternet = /samsungbrowser/.test(userAgent);
  const isFirefox = /firefox|fxios/.test(userAgent);
  const isChrome = /chrome|crios/.test(userAgent) && !isEdge;

  if (isSafari || isIOS) {
    return {
      browserName: "Safari",
      steps: [
        "Tap the Share button",
        "Select “Add to Home Screen”",
        "Tap “Add” to confirm",
      ],
    };
  }

  if (isEdge) {
    return {
      browserName: "Microsoft Edge",
      steps: [
        "Open the browser menu (⋯)",
        "Choose “Apps” then “Install this site as an app”",
        "Confirm the installation",
      ],
    };
  }

  if (isSamsungInternet) {
    return {
      browserName: "Samsung Internet",
      steps: [
        "Open the browser menu (☰)",
        "Tap “Add page to” then “Home screen”",
        "Confirm the installation",
      ],
    };
  }

  if (isFirefox) {
    return {
      browserName: "Firefox",
      steps: [
        "Open the browser menu",
        "Choose “Install” or “Add to Home screen” if available",
        "Confirm the installation",
      ],
    };
  }

  if (isChrome) {
    return {
      browserName: "Chrome",
      steps: [
        "Open the browser menu (⋮)",
        "Choose “Install app” or “Add to Home screen”",
        "Confirm the installation",
      ],
    };
  }

  return {
    browserName: "your browser",
    steps: [
      "Open the browser menu",
      "Choose “Install app”, “Add to Home Screen”, or a similar option",
      "Confirm the installation",
    ],
  };
};

export const InstallAppButton = () => {
  const { canInstall, installMode, promptInstall } = useInstallPWAPrompt();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const tutorial = getManualInstallTutorial();

  if (!canInstall) {
    return null;
  }

  const handleInstallClick = () => {
    if (installMode === "nativePrompt") {
      void promptInstall();
      return;
    }

    if (installMode === "manualDialog") {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Button variant="outline" background="white" onClick={handleInstallClick}>
        Install the app <LuDownload />
      </Button>

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(event) => setIsDialogOpen(event.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Install Vaultoy Count</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <VStack align="start" gap={3}>
                  <Heading size="sm">
                    Instructions for {tutorial.browserName}
                  </Heading>
                  <Text>To install the app:</Text>
                  <List.Root style={{ marginLeft: "1.2em" }}>
                    {tutorial.steps.map((step) => (
                      <List.Item key={step}>{step}</List.Item>
                    ))}
                  </List.Root>
                  <Text fontSize="sm" color="gray.500">
                    If you cannot find this option, try updating your browser or
                    opening this page in a different browser
                  </Text>
                </VStack>
              </Dialog.Body>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
