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
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isSafari =
    /safari/.test(userAgent) &&
    !/chrome|crios|edg|edgios|opr|fxios|samsungbrowser/.test(userAgent);
  const isEdge = /edg|edgios/.test(userAgent);
  const isSamsungInternet = /samsungbrowser/.test(userAgent);
  const isFirefox = /firefox|fxios/.test(userAgent);
  const isChrome = /chrome|crios/.test(userAgent) && !isEdge;

  if (isSafari || isIOS) {
    if (isMobile) {
      return {
        browserName: "iOS",
        steps: [
          "Tap the Share button (a square with arrow up)",
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner',
        ],
      };
    }
    return {
      browserName: "Safari",
      steps: [
        "Click the Share button in the toolbar",
        'Choose "Add to Dock"',
        'Click "Add" to confirm',
      ],
    };
  }

  if (isEdge) {
    if (isMobile) {
      // Verified on march 2026
      return {
        browserName: "Edge Mobile",
        steps: [
          "Tap the menu button (⋯) at the bottom",
          "Swipe left to the second page of the menu",
          'Tap "Add to phone"',
        ],
      };
    }
    // Verified on march 2026
    return {
      browserName: "Microsoft Edge",
      steps: [
        "Click on the install button in the right of the address bar (a button with 3 squares and a plus sign)",
        "Or open the menu (⋯) > More tools > Apps > Install Vaultoy Count",
        "Confirm the installation",
      ],
    };
  }

  if (isSamsungInternet) {
    return {
      browserName: "Samsung Internet",
      steps: [
        "Tap the menu icon (☰) in the bottom right",
        'Tap "Add page to"',
        'Select "Home screen"',
        'Tap "Install"',
      ],
    };
  }

  if (isFirefox) {
    if (isMobile) {
      // Verified on march 2026
      return {
        browserName: "Firefox Mobile",
        steps: [
          "Tap the menu button (⋮)",
          'Tap the "More" button (⋯)',
          'Tap "Add app to Home screen" or "Install app"',
        ],
      };
    }
    // Verified on march 2026
    return {
      browserName: "Firefox",
      steps: [
        "Click the install button in the right of the address bar (a screen with a down arrow)",
      ],
    };
  }

  if (isChrome) {
    if (isMobile) {
      // Verified on march 2026
      return {
        browserName: "Chrome on Android",
        steps: [
          "Tap the menu icon (⋮) in the top right corner",
          'Tap "Add to Home screen" or "Install app"',
        ],
      };
    }
    // Verified on march 2026
    return {
      browserName: "Chrome",
      steps: [
        "Click the install button in the right of the address bar (a screen with a down arrow)",
        'Or open the menu (⋮) > "Cast, save and share" > "Install Vaultoy Count"',
      ],
    };
  }

  if (isMobile) {
    return {
      browserName: "your mobile browser",
      steps: [
        "Open the browser menu",
        'Look for "Add to Home Screen" or "Install app"',
      ],
    };
  }

  return {
    browserName: "your browser",
    steps: ["Open the browser menu", 'Look for an "Install" option'],
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
