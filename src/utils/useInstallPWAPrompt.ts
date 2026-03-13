import { useCallback, useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

// Global variable to capture the event early before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  globalDeferredPrompt = e as BeforeInstallPromptEvent;
});

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
    useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    isStandaloneMode(),
  );
  const [canManualInstallHint, setCanManualInstallHint] =
    useState<boolean>(false);

  const recomputeInstallability = useCallback(() => {
    const installed = isStandaloneMode();
    setIsInstalled(installed);

    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
    const hasServiceWorkerSupport = "serviceWorker" in navigator;
    const isSecureContextForInstall = window.isSecureContext;

    setCanManualInstallHint(
      !installed &&
        hasManifest &&
        hasServiceWorkerSupport &&
        isSecureContextForInstall,
    );
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      recomputeInstallability();
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setCanManualInstallHint(false);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        recomputeInstallability();
      }
    };

    recomputeInstallability();

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("focus", recomputeInstallability);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("focus", recomputeInstallability);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [recomputeInstallability]);

  const hasNativePrompt = deferredPrompt !== null;

  const canInstall = useMemo(
    () => (hasNativePrompt || canManualInstallHint) && !isInstalled,
    [canManualInstallHint, hasNativePrompt, isInstalled],
  );

  const installMode = useMemo<"nativePrompt" | "manualDialog" | "none">(() => {
    if (isInstalled) {
      return "none";
    }

    if (hasNativePrompt) {
      return "nativePrompt";
    }

    if (canManualInstallHint) {
      return "manualDialog";
    }

    return "none";
  }, [canManualInstallHint, hasNativePrompt, isInstalled]);

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
    hasNativePrompt,
    installMode,
    promptInstall,
  };
};
