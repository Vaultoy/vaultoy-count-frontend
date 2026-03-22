import { useCallback, useRef } from "react";

export interface DerivatedFromPasswordSecrets {
  passwordEncryptionKey: CryptoKey;
  authenticationToken: string;
}

export const useKeyDerivation = () => {
  const workerRef = useRef<Worker | null>(null);

  const keyDerivation = useCallback(
    (
      username: string,
      password: string,
    ): Promise<DerivatedFromPasswordSecrets> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL("./keyDerivation.worker.ts", import.meta.url),
            { type: "module" },
          );
        }

        const worker = workerRef.current;

        const cleanup = () => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
        };

        const handleMessage = (event: MessageEvent) => {
          cleanup();
          const { passwordEncryptionKey, authenticationToken, error } =
            event.data;

          if (error) {
            reject(new Error(error));
            return;
          }

          resolve({ passwordEncryptionKey, authenticationToken });
        };

        const handleError = (error: ErrorEvent) => {
          cleanup();
          console.error("Worker failed to load or execute:", error);
          reject(new Error(error.message || "Failed to load Web Worker"));
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);
        worker.postMessage({ username, password });
      });
    },
    [],
  );

  return keyDerivation;
};
