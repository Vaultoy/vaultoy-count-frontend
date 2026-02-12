import {
  TRANSACTION_TYPES,
  type GroupExtended,
  type GroupTransaction,
  type TransactionType,
} from "@/api/group";
import type { Encrypted } from "@/types";

const encrypt = async (
  data: Uint8Array<ArrayBuffer>,
  key: CryptoKey,
): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data,
  );

  // Combine iv and encrypted data for storage/transmission
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  // Convert to base64 for easier handling
  return btoa(String.fromCharCode(...combined));
};

const decrypt = async (
  encryptedDataBase64: string,
  key: CryptoKey,
): Promise<Uint8Array<ArrayBuffer>> => {
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
};

const encodeAndEncryptGenerator = <T>(
  encoder: (data: T) => Uint8Array<ArrayBuffer>,
): ((data: T, key: CryptoKey) => Promise<Encrypted<T, true>>) => {
  return async (data: T, key: CryptoKey): Promise<Encrypted<T, true>> => {
    const dataBuffer = encoder(data);
    return encrypt(dataBuffer, key);
  };
};

const decryptAndDecodeGenerator = <T>(
  decoder: (data: Uint8Array<ArrayBuffer>) => T,
): ((
  encryptedData: Encrypted<T, true>,
  key: CryptoKey,
) => Promise<Encrypted<T, false>>) => {
  return async (
    encryptedData: Encrypted<T, true>,
    key: CryptoKey,
  ): Promise<Encrypted<T, false>> => {
    const decryptedBuffer = await decrypt(encryptedData, key);
    return decoder(decryptedBuffer);
  };
};

const encryptListGenerator = <T>(
  encryptSingle: (data: T, key: CryptoKey) => Promise<string>,
): ((data: T[], key: CryptoKey) => Promise<Encrypted<T, true>[]>) => {
  return async (data: T[], key: CryptoKey): Promise<Encrypted<T, true>[]> => {
    return Promise.all(data.map((value) => encryptSingle(value, key)));
  };
};

const decryptListGenerator = <T>(
  decryptSingle: (data: Encrypted<T, true>, key: CryptoKey) => Promise<T>,
): ((
  data: Encrypted<T, true>[],
  key: CryptoKey,
) => Promise<Encrypted<T, false>[]>) => {
  return async (
    data: Encrypted<T, true>[],
    key: CryptoKey,
  ): Promise<Encrypted<T, false>[]> => {
    return Promise.all(data.map((value) => decryptSingle(value, key)));
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
  groupEncryptionKey: Uint8Array<ArrayBuffer>,
  userEncryptionKey: CryptoKey,
): Promise<string> => {
  return encrypt(groupEncryptionKey, userEncryptionKey);
};
export const decryptEncryptionKey = async (
  encryptedGroupEncryptionKey: string,
  userEncryptionKey: CryptoKey,
): Promise<CryptoKey> => {
  const decryptedKeyRaw = await decrypt(
    encryptedGroupEncryptionKey,
    userEncryptionKey,
  );

  // Exportable is required to create a shareable link, TODO: Find a better way
  return crypto.subtle.importKey("raw", decryptedKeyRaw, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
};

/**
 * Decrypts an entire group object, including all nested transactions and members, using the provided user encryption key. This is a comprehensive function that handles the decryption of all relevant fields in the group data structure.
 *
 */
export const decryptGroup = async (
  encryptedGroup: GroupExtended<true>,
  userEncryptionKey: CryptoKey,
): Promise<GroupExtended<false>> => {
  const groupEncryptionKey = await decryptEncryptionKey(
    encryptedGroup.groupEncryptionKey,
    userEncryptionKey,
  );

  const decryptedGroup: GroupExtended<false> = {
    ...encryptedGroup,
    name: await decryptString(encryptedGroup.name, groupEncryptionKey),
    groupEncryptionKey,
    members: encryptedGroup.members,
    transactions: await Promise.all(
      encryptedGroup.transactions.map(async (transaction) => {
        let transactionType = (await decryptString(
          transaction.transactionType,
          groupEncryptionKey,
        )) as TransactionType; // Verified after decryption

        if (!TRANSACTION_TYPES.includes(transactionType)) {
          console.error(
            "Invalid transaction type after decryption:",
            transactionType,
          );
          // Default to a valid type to prevent crashes, but this should not happen
          transactionType = TRANSACTION_TYPES[0];
        }

        const decryptedTransaction: GroupTransaction<false> = {
          ...transaction,
          name: await decryptString(transaction.name, groupEncryptionKey),
          amount: await decryptNumber(transaction.amount, groupEncryptionKey),
          fromUserId: await decryptNumber(
            transaction.fromUserId,
            groupEncryptionKey,
          ),
          toUsers: await Promise.all(
            transaction.toUsers.map(async (toUser) => ({
              id: await decryptNumber(toUser.id, groupEncryptionKey),
              share: await decryptNumber(toUser.share, groupEncryptionKey),
            })),
          ),
          transactionType,
          date: await decryptNumber(transaction.date, groupEncryptionKey),
        };

        return decryptedTransaction;
      }),
    ),
  };

  decryptedGroup.transactions.sort((a, b) => b.date - a.date);

  return decryptedGroup;
};
