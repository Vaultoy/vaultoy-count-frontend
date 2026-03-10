import {
  TRANSACTION_TYPES,
  type GroupTransaction,
  type NewGroupTransaction,
  type TransactionType,
} from "@/api/group";
import {
  decryptNumber,
  decryptString,
  encryptNumber,
  encryptString,
} from "./encryption";

export const decryptTransaction = async (
  encryptedTransaction: GroupTransaction<true>,
  groupEncryptionKey: CryptoKey,
): Promise<GroupTransaction<false>> => {
  let transactionType = (await decryptString(
    encryptedTransaction.transactionType,
    groupEncryptionKey,
    "group transaction type",
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
    id: encryptedTransaction.id,
    name: await decryptString(
      encryptedTransaction.name,
      groupEncryptionKey,
      "group transaction name",
    ),
    amount: await decryptNumber(
      encryptedTransaction.amount,
      groupEncryptionKey,
      "group transaction amount",
    ),
    fromMemberId: await decryptNumber(
      encryptedTransaction.fromMemberId,
      groupEncryptionKey,
      "group transaction from member id",
    ),
    toMembers: (
      await Promise.all(
        encryptedTransaction.toMembers.map(async (toMember) => ({
          memberId: await decryptNumber(
            toMember.memberId,
            groupEncryptionKey,
            "group transaction to member id",
          ),
          share: await decryptNumber(
            toMember.share,
            groupEncryptionKey,
            "group transaction to member share",
          ),
        })),
      )
    ).sort((a, b) => a.memberId - b.memberId),
    transactionType,
    date: await decryptNumber(
      encryptedTransaction.date,
      groupEncryptionKey,
      "group transaction date",
    ),
  };

  return decryptedTransaction;
};

export const encryptTransaction = async (
  transaction: NewGroupTransaction<false>,
  groupEncryptionKey: CryptoKey,
): Promise<NewGroupTransaction<true>> => {
  return {
    name: await encryptString(
      transaction.name,
      groupEncryptionKey,
      "group transaction name",
    ),
    amount: await encryptNumber(
      transaction.amount,
      groupEncryptionKey,
      "group transaction amount",
    ),
    fromMemberId: await encryptNumber(
      transaction.fromMemberId,
      groupEncryptionKey,
      "group transaction from member id",
    ),
    toMembers: await Promise.all(
      transaction.toMembers.map(async (toMember) => ({
        memberId: await encryptNumber(
          toMember.memberId,
          groupEncryptionKey,
          "group transaction to member id",
        ),
        share: await encryptNumber(
          toMember.share,
          groupEncryptionKey,
          "group transaction to member share",
        ),
      })),
    ),
    transactionType: await encryptString(
      transaction.transactionType,
      groupEncryptionKey,
      "group transaction type",
    ),
    date: await encryptNumber(
      transaction.date,
      groupEncryptionKey,
      "group transaction date",
    ),
  };
};
