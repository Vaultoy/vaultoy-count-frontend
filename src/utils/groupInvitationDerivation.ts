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
