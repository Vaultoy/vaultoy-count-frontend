import { useCallback, useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const isStandaloneMode = () => {
  const mediaStandalone = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  const navigatorStandalone =
    "standalone" in navigator &&
    typeof (navigator as Navigator & { standalone?: boolean }).standalone ===
      "boolean" &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  return mediaStandalone || navigatorStandalone;
};

export const useInstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    isStandaloneMode(),
  );

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstalled(isStandaloneMode());
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canInstall = useMemo(
    () => deferredPrompt !== null && !isInstalled,
    [deferredPrompt, isInstalled],
  );

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt || isInstalled) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return;
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, isInstalled]);

  return {
    canInstall,
    isInstalled,
    promptInstall,
  };
};
