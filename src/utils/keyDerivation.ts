import { argon2id } from "hash-wasm";

export interface MasterKeys {
  authentificationKey: string;
  encryptionKey: CryptoKey;
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

export const derivateKeys = async (
  username: string,
  password: string,
): Promise<MasterKeys> => {
  const saltString = "vaultoy_count_authentification_and_encryption" + username;
  const salt = new Uint8Array(
    await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(saltString),
    ),
  );

  const startTime = performance.now();
  const key = await argon2id({
    ...argon2idParams,
    password,
    salt,
    hashLength: 64, // output size
    outputType: "binary",
  });
  const endTime = performance.now();

  console.info(`Key derivation took: ${(endTime - startTime).toFixed(2)} ms`);

  const authentificationKeyRaw = key.slice(0, 32);
  const encryptionKeyRaw = key.slice(32, 64);

  const encryptionKey = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(encryptionKeyRaw),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"],
  );

  // Transform Uint8Array to base64 string
  const authentificationKey = btoa(
    String.fromCharCode(...authentificationKeyRaw),
  );

  return { authentificationKey, encryptionKey };
};

export const deriveVerificationTokenFromLinkSecret = async (
  invitationLinkSecret: string,
): Promise<string> => {
  const invitationValidationSaltString =
    "vaultoy_count_invitation_validation_salt";

  const invitationVerificationTokenBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      invitationLinkSecret + invitationValidationSaltString,
    ),
  );

  const invitationVerificationToken = btoa(
    String.fromCharCode(...new Uint8Array(invitationVerificationTokenBuffer)),
  );

  return invitationVerificationToken;
};

export const stringToCryptoKey = async (
  keyString: string,
): Promise<CryptoKey> => {
  const keyBuffer = new Uint8Array(
    Array.from(atob(keyString)).map((c) => c.charCodeAt(0)),
  );

  return crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
};

export const cryptoKeyToString = async (key: CryptoKey): Promise<string> => {
  // Check if the key is extractable
  if (!key.extractable) {
    throw new Error("Key is not extractable");
  }

  const keyBuffer = new Uint8Array(
    await window.crypto.subtle.exportKey("raw", key),
  );
  return btoa(String.fromCharCode(...keyBuffer));
};
