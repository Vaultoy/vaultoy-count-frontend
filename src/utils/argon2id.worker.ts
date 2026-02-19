import { argon2id } from "hash-wasm";
import { argon2idParams } from "./argon2idParams";

interface KeyDerivationRequest {
  salt: string;
  password: string;
}

self.onmessage = async (event: MessageEvent<KeyDerivationRequest>) => {
  try {
    const { salt: saltString, password } = event.data;

    const saltBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(saltString),
    );
    const salt = new Uint8Array(saltBuffer);

    const startTime = performance.now();
    const key = await argon2id({
      ...argon2idParams,
      password,
      salt,
      hashLength: 64,
      outputType: "binary",
    });
    const endTime = performance.now();

    console.info(`Key derivation took: ${(endTime - startTime).toFixed(2)} ms`);

    self.postMessage({ key });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
