import { argon2id } from "hash-wasm";

interface KeyDerivationRequest {
  salt: string;
  password: string;
}

// `parallelism` doesn't impact security as much, just client derivation time.
// `iterations` increases derivation time linearly and security
// `memorySize` increases memory usage and security
//
// see:
// - https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-04#section-4
// - https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
// - https://bitwarden.com/help/kdf-algorithms/#argon2id
const argon2idParams = {
  parallelism: 1, // Hash WASM doesn't support multi-threading, so this would be inefficient
  iterations: 5,
  memorySize: 64 * 1024, // KB
};

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
