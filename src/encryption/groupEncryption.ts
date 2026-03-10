import { type Group, type GroupExtended, type GroupMember } from "@/api/group";
import type { GroupForJoiningInitiate } from "@/api/invitation";
import type { Encrypted } from "@/types";
import {
  deriveInvitationAuthenticationToken,
  deriveInvitationEncryptionKey,
} from "./groupInvitationDerivation";
import { decryptEncryptionKey, decryptString } from "./encryption";
import { decryptTransaction } from "./transactionEncryption";

/**
 * Decrypts an entire group object, including all nested transactions and members, using the provided user encryption key.
 */
export const decryptGroup = async (
  encryptedGroup: GroupExtended<true>,
  userEncryptionKey: CryptoKey,
): Promise<GroupExtended<false>> => {
  const groupEncryptionKey = await decryptEncryptionKey(
    encryptedGroup.groupEncryptionKey,
    userEncryptionKey,
    true, // TODO: Required for invitation links, not ideal for security
    `group key for group ${encryptedGroup.id}`,
  );

  const decryptedGroup: GroupExtended<false> = {
    ...encryptedGroup,
    name: await decryptString(
      encryptedGroup.name,
      groupEncryptionKey,
      "group name",
    ),
    groupEncryptionKey,
    members: (
      await Promise.all(
        encryptedGroup.members.map(async (member) => ({
          ...member,
          nickname: await decryptString(
            member.nickname,
            groupEncryptionKey,
            "group member nickname",
          ),
        })),
      )
    ).sort((a, b) => a.memberId - b.memberId),

    transactions: (
      await Promise.all(
        encryptedGroup.transactions.map(async (transaction) =>
          decryptTransaction(transaction, groupEncryptionKey),
        ),
      )
    ).sort((a, b) => b.date - a.date),
  };

  return decryptedGroup;
};

export interface GroupForJoiningWithKey {
  groupId: number;
  name: Encrypted<string, false>;
  members: GroupMember<false>[];
  groupEncryptionKey: CryptoKey;
  invitationAuthenticationToken: string;
}

/**
 * Decrypts agroup object necessary for joining a group via an invitation link.
 */
export const decryptGroupForJoining = async (
  encryptedGroup: GroupForJoiningInitiate<true>,
  invitationLinkSecret: string,
): Promise<GroupForJoiningWithKey> => {
  const invitationAuthenticationToken =
    await deriveInvitationAuthenticationToken(invitationLinkSecret);

  const invitationLinkSecretKey =
    await deriveInvitationEncryptionKey(invitationLinkSecret);

  const groupEncryptionKey = await decryptEncryptionKey(
    encryptedGroup.invitationGroupEncryptionKey,
    invitationLinkSecretKey,
    true, // This key is rapidly dropped so it's extractability is not an issue
    "group key from invitation",
  );

  const decryptedGroup: GroupForJoiningWithKey = {
    groupId: encryptedGroup.groupId,
    name: await decryptString(
      encryptedGroup.name,
      groupEncryptionKey,
      "group name",
    ),
    members: (
      await Promise.all(
        encryptedGroup.members.map(async (member) => ({
          ...member,
          nickname: await decryptString(
            member.nickname,
            groupEncryptionKey,
            "group member nickname",
          ),
        })),
      )
    ).sort((a, b) => a.memberId - b.memberId),
    groupEncryptionKey,
    invitationAuthenticationToken,
  };

  return decryptedGroup;
};

export const decryptGroupForAppHomePage = async (
  encryptedGroup: Group<true>,
  userEncryptionKey: CryptoKey,
): Promise<Group<false>> => {
  const groupEncryptionKey = await decryptEncryptionKey(
    encryptedGroup.groupEncryptionKey,
    userEncryptionKey,
    false,
    `group key for group ${encryptedGroup.id} in group list`,
  );

  const decryptedGroup: Group<false> = {
    id: encryptedGroup.id,
    name: await decryptString(
      encryptedGroup.name,
      groupEncryptionKey,
      "a group name of the group list",
    ),
    groupEncryptionKey,
  };

  return decryptedGroup;
};
