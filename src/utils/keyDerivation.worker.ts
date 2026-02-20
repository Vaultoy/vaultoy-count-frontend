import { argon2id } from "hash-wasm";
import { argon2idParams } from "./passwordParams";

interface KeyDerivationRequest {
  username: string;
  password: string;
}

const VAULTOY_COUNT_DERIVATION_SALT = "vaultoy_count_8QQWm8MZPgVa3WaLv6XS2k";

const HKDF_INFO_PASSWORD_KEY = "vaultoy_count_password_key";
const HKDF_INFO_AUTHENTICATION_TOKEN = "vaultoy_count_authentication_token";

self.onmessage = async (event: MessageEvent<KeyDerivationRequest>) => {
  try {
    const { username, password } = event.data;
    const saltString = VAULTOY_COUNT_DERIVATION_SALT + username;

    const startTime = performance.now();

    const saltBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(saltString),
    );
    const salt = new Uint8Array(saltBuffer);

    const ikm = await argon2id({
      ...argon2idParams,
      password,
      salt,
      hashLength: 32,
      outputType: "binary",
    });

    const ikmKey = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(ikm),
      "HKDF",
      false,
      ["deriveKey", "deriveBits"],
    );

    const passwordEncryptionKey = await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        salt: new Uint8Array(),
        info: new TextEncoder().encode(HKDF_INFO_PASSWORD_KEY),
        hash: "SHA-256",
      },
      ikmKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );

    const authenticationTokenBuffer = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        salt: new Uint8Array(),
        info: new TextEncoder().encode(HKDF_INFO_AUTHENTICATION_TOKEN),
        hash: "SHA-256",
      },
      ikmKey,
      256,
    );

    const authenticationToken = btoa(
      String.fromCharCode(...new Uint8Array(authenticationTokenBuffer)),
    );

    const endTime = performance.now();

    console.info(`Key derivation took: ${(endTime - startTime).toFixed(2)} ms`);

    self.postMessage({ passwordEncryptionKey, authenticationToken });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
