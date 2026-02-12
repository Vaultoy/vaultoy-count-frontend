import { scrypt } from "scrypt-js";

export interface MasterKeys {
  authentificationKey: string;
  encryptionKey: CryptoKey;
}

// TODO: Choose parameters (I changed N for dev, the default was: 2 ** 16)
const scryptParams = { N: 2 ** 10, r: 8, p: 1, dkLen: 32 };

export const derivateKeys = async (
  username: string,
  password: string,
  onProgress?: (progress: number) => void,
): Promise<MasterKeys> => {
  const passwordString = password;
  const passwordBuffer = new Uint8Array(
    Array.from(passwordString).map((c) => c.charCodeAt(0)),
  );

  const authSaltString = "vaultoy_count_authentification" + username;
  const authSaltBuffer = new Uint8Array(
    Array.from(authSaltString).map((c) => c.charCodeAt(0)),
  );

  const encryptionSaltString = "vaultoy_count_encryption" + username;
  const encryptionSaltBuffer = new Uint8Array(
    Array.from(encryptionSaltString).map((c) => c.charCodeAt(0)),
  );

  // For onProgress, we assume that the two calls have the same approximate speed
  const authentificationKeyPromise = scrypt(
    passwordBuffer,
    authSaltBuffer,
    scryptParams.N,
    scryptParams.r,
    scryptParams.p,
    scryptParams.dkLen,
    onProgress,
  );

  const encryptionKeyPromise = scrypt(
    passwordBuffer,
    encryptionSaltBuffer,
    scryptParams.N,
    scryptParams.r,
    scryptParams.p,
    scryptParams.dkLen,
  );

  const [authentificationKeyRaw, encryptionKeyRaw] = await Promise.all([
    authentificationKeyPromise,
    encryptionKeyPromise,
  ]);

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
