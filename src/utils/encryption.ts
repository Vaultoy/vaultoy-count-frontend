export const encrypt = async (
  data: Uint8Array<ArrayBuffer>,
  key: CryptoKey
): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  // Combine iv and encrypted data for storage/transmission
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  // Convert to base64 for easier handling
  return btoa(String.fromCharCode(...combined));
};

export const decrypt = async (
  encryptedDataBase64: string,
  key: CryptoKey
): Promise<Uint8Array<ArrayBuffer>> => {
  const combined = Uint8Array.from(atob(encryptedDataBase64), (c) =>
    c.charCodeAt(0)
  );

  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedData
  );

  return new Uint8Array(decryptedData);
};

export const decryptGroupEncryptionKey = async (
  encryptedGroupEncryptionKey: string,
  userEncryptionKey: CryptoKey
): Promise<CryptoKey> => {
  const decryptedKeyRaw = await decrypt(
    encryptedGroupEncryptionKey,
    userEncryptionKey
  );

  return crypto.subtle.importKey("raw", decryptedKeyRaw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
};
