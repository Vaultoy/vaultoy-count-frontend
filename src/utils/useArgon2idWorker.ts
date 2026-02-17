import { useCallback, useRef } from "react";

export const useArgon2idWorker = () => {
  const workerRef = useRef<Worker | null>(null);

  const argon2id = useCallback(
    (
      salt: string,
      password: string,
    ): Promise<{ key: Uint8Array<ArrayBufferLike> }> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL("./argon2id.worker.ts", import.meta.url),
            { type: "module" },
          );
        }

        const worker = workerRef.current;

        const handleMessage = (event: MessageEvent) => {
          const { key, error } = event.data;

          if (error) {
            worker.removeEventListener("message", handleMessage);
            reject(new Error(error));
            return;
          }

          worker.removeEventListener("message", handleMessage);

          resolve({ key });
        };

        worker.addEventListener("message", handleMessage);
        worker.postMessage({ salt, password });
      });
    },
    [],
  );

  return argon2id;
};
