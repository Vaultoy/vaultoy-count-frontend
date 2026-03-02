import { fromBase64Url, toBase64Url } from "@/utils/base64Url";
import {
  HKDF_INFO_INVITATION_AUTHENTICATION_TOKEN,
  HKDF_INFO_INVITATION_KEY,
} from "./derivationParams";

export const encodeInvitationLinkSecret = (
  invitationLinkSecretRaw: Uint8Array<ArrayBuffer>,
): string => {
  return toBase64Url(invitationLinkSecretRaw);
};

const decodeInvitationLinkSecret = (
  invitationLinkSecret: string,
): Uint8Array<ArrayBuffer> => {
  return fromBase64Url(invitationLinkSecret);
};

export const deriveInvitationAuthenticationToken = async (
  invitationLinkSecret: string,
): Promise<string> => {
  const invitationLinkSecretRaw =
    decodeInvitationLinkSecret(invitationLinkSecret);

  const importedInputKeyMaterial = await crypto.subtle.importKey(
    "raw",
    invitationLinkSecretRaw,
    "HKDF",
    false,
    ["deriveBits"],
  );

  const invitationAuthenticationTokenBuffer = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      salt: new Uint8Array(),
      info: new TextEncoder().encode(HKDF_INFO_INVITATION_AUTHENTICATION_TOKEN),
      hash: "SHA-256",
    },
    importedInputKeyMaterial,
    256,
  );

  const invitationAuthenticationToken = btoa(
    String.fromCharCode(...new Uint8Array(invitationAuthenticationTokenBuffer)),
  );

  return invitationAuthenticationToken;
};

export const deriveInvitationEncryptionKey = async (
  invitationLinkSecret: string,
): Promise<CryptoKey> => {
  const invitationLinkSecretRaw =
    decodeInvitationLinkSecret(invitationLinkSecret);

  const importedInputKeyMaterial = await crypto.subtle.importKey(
    "raw",
    invitationLinkSecretRaw,
    "HKDF",
    false,
    ["deriveKey"],
  );

  return await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      salt: new Uint8Array(),
      info: new TextEncoder().encode(HKDF_INFO_INVITATION_KEY),
      hash: "SHA-256",
    },
    importedInputKeyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};
