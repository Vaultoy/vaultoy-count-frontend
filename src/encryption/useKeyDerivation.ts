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

        const handleMessage = (event: MessageEvent) => {
          const { passwordEncryptionKey, authenticationToken, error } =
            event.data;

          if (error) {
            worker.removeEventListener("message", handleMessage);
            reject(new Error(error));
            return;
          }

          worker.removeEventListener("message", handleMessage);

          resolve({ passwordEncryptionKey, authenticationToken });
        };

        worker.addEventListener("message", handleMessage);
        worker.postMessage({ username, password });
      });
    },
    [],
  );

  return keyDerivation;
};
