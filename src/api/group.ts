import type { Encrypted } from "@/types";
import { fetchApi } from "./fetch";

export const createGroupMutation = async (data: {
  name: string;
  encryptedGroupEncryptionKey: string;
}) => {
  return fetchApi("POST", "/v1/group", data);
};

interface Group<isEncrypted extends boolean = true> {
  id: number;
  name: Encrypted<string, isEncrypted>; // encrypted with group encryption key
  groupEncryptionKey: Encrypted<CryptoKey, isEncrypted>; // encrypted with user's encryption key
}

export interface GroupMember {
  userId: number;
  username: string;
}

export interface GroupTransaction<isEncrypted extends boolean = true> {
  id: number;
  name: Encrypted<string, isEncrypted>;
  fromUserId: Encrypted<number, isEncrypted>;
  toUserIds: Encrypted<number, isEncrypted>[];
  amount: Encrypted<number, isEncrypted>;
  date: Encrypted<number, isEncrypted>;
}

export interface GroupExtended<isEncrypted extends boolean = true>
  extends Group<isEncrypted> {
  members: GroupMember[];
  transactions: GroupTransaction<isEncrypted>[];
}

export const getGroupsQuery = async (): Promise<{ groups: Group[] }> => {
  const response = await fetchApi("GET", "/v1/group/all");
  return response.json();
};

export const getGroupQuery = async (
  groupId: string
): Promise<{ group: GroupExtended }> => {
  const response = await fetchApi("GET", `/v1/group/${groupId}`);
  return response.json();
};

export const postAddTransactionMutation = async ({
  groupId,
  name,
  amount,
  fromUserId,
  toUserIds,
  date,
}: {
  groupId: string;
  name: string;
  amount: number;
  fromUserId: number;
  toUserIds: number[];
  date: number;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/transaction`, {
    name,
    amount,
    fromUserId,
    toUserIds,
    date,
  });
};
