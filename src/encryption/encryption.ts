import type { Encrypted } from "@/types";

const encrypt = async (
  data: Uint8Array<ArrayBuffer>,
  key: CryptoKey,
  dataName: string, // Only used for error logging
): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  try {
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data,
    );

    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error(`Error while encrypting ${dataName}:`, error);
    throw error;
  }
};

const decrypt = async (
  encryptedDataBase64: string,
  key: CryptoKey,
  dataName: string, // Only used for error logging
): Promise<Uint8Array<ArrayBuffer>> => {
  try {
    const combined = Uint8Array.from(atob(encryptedDataBase64), (c) =>
      c.charCodeAt(0),
    );

    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedData,
    );

    return new Uint8Array(decryptedData);
  } catch (error) {
    console.error(`Error while decrypting ${dataName}:`, error);
    throw error;
  }
};

const encodeAndEncryptGenerator = <T>(
  encoder: (data: T) => Uint8Array<ArrayBuffer>,
): ((
  data: T,
  key: CryptoKey,
  dataName: string, // Only used for error logging
) => Promise<Encrypted<T, true>>) => {
  return async (
    data: T,
    key: CryptoKey,
    dataName: string,
  ): Promise<Encrypted<T, true>> => {
    const dataBuffer = encoder(data);
    return encrypt(dataBuffer, key, dataName);
  };
};

const decryptAndDecodeGenerator = <T>(
  decoder: (data: Uint8Array<ArrayBuffer>) => T,
): ((
  encryptedData: Encrypted<T, true>,
  key: CryptoKey,
  dataName: string, // Only used for error logging
) => Promise<Encrypted<T, false>>) => {
  return async (
    encryptedData: Encrypted<T, true>,
    key: CryptoKey,
    dataName: string,
  ): Promise<Encrypted<T, false>> => {
    const decryptedBuffer = await decrypt(encryptedData, key, dataName);
    return decoder(decryptedBuffer);
  };
};

const encryptListGenerator = <T>(
  encryptSingle: (data: T, key: CryptoKey, dataName: string) => Promise<string>,
): ((
  data: T[],
  key: CryptoKey,
  dataName: string, // Only used for error logging
) => Promise<Encrypted<T, true>[]>) => {
  return async (
    data: T[],
    key: CryptoKey,
    dataName: string,
  ): Promise<Encrypted<T, true>[]> => {
    return Promise.all(
      data.map((value) => encryptSingle(value, key, dataName)),
    );
  };
};

const decryptListGenerator = <T>(
  decryptSingle: (
    data: Encrypted<T, true>,
    key: CryptoKey,
    dataName: string,
  ) => Promise<T>,
): ((
  data: Encrypted<T, true>[],
  key: CryptoKey,
  dataName: string, // Only used for error logging
) => Promise<Encrypted<T, false>[]>) => {
  return async (
    data: Encrypted<T, true>[],
    key: CryptoKey,
    dataName: string,
  ): Promise<Encrypted<T, false>[]> => {
    return Promise.all(
      data.map((value) => decryptSingle(value, key, dataName)),
    );
  };
};

export const encryptString = encodeAndEncryptGenerator<string>((data) =>
  new TextEncoder().encode(data),
);
export const decryptString = decryptAndDecodeGenerator<string>((data) =>
  new TextDecoder().decode(data),
);

export const encryptNumber = encodeAndEncryptGenerator<number>((data) =>
  new TextEncoder().encode(data.toString()),
);
export const decryptNumber = decryptAndDecodeGenerator<number>((data) =>
  parseInt(new TextDecoder().decode(data)),
);

export const encryptNumberList = encryptListGenerator<number>(encryptNumber);
export const decryptNumberList = decryptListGenerator<number>(decryptNumber);

export const encryptStringList = encryptListGenerator<string>(encryptString);
export const decryptStringList = decryptListGenerator<string>(decryptString);

export const encryptEncryptionKey = async (
  keyToEncrypt: Uint8Array<ArrayBuffer>,
  encryptionKey: CryptoKey,
  keyName: string, // Only used for error logging
): Promise<string> => {
  return encrypt(keyToEncrypt, encryptionKey, keyName);
};

export const decryptEncryptionKey = async (
  keyToDecrypt: string,
  encryptionKey: CryptoKey,
  extractable: boolean, // Whether the resulting CryptoKey should be extractable
  keyName: string, // Only used for error logging
): Promise<CryptoKey> => {
  const decryptedKeyRaw = await decrypt(keyToDecrypt, encryptionKey, keyName);

  return crypto.subtle.importKey(
    "raw",
    decryptedKeyRaw,
    "AES-GCM",
    extractable,
    ["encrypt", "decrypt"],
  );
};
