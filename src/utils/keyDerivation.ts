import { useArgon2idWorker } from "./useArgon2idWorker";

export interface MasterKeys {
  authenticationToken: string;
  encryptionKey: CryptoKey;
}

export const useDerivateKeys = () => {
  // argon2id is ran in a web worker to avoid blocking the main thread
  // during the key derivation process
  const argon2id = useArgon2idWorker();

  const derivateKeys = async (
    username: string,
    password: string,
  ): Promise<MasterKeys> => {
    const salt = "vaultoy_count_authentification_and_encryption" + username;

    const { key } = await argon2id(salt, password);

    const authenticationTokenRaw = key.slice(0, 32);
    const encryptionKeyRaw = key.slice(32, 64);

    const encryptionKey = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(encryptionKeyRaw),
      "AES-GCM",
      false,
      ["encrypt", "decrypt"],
    );

    // Transform Uint8Array to base64 string
    const authenticationToken = btoa(
      String.fromCharCode(...authenticationTokenRaw),
    );

    return { authenticationToken, encryptionKey };
  };

  return derivateKeys;
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
