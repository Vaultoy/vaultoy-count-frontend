export const encrypt = async (
  data: string,
  key: CryptoKey
): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData
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
): Promise<string> => {
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

  return new TextDecoder().decode(decryptedData);
};
