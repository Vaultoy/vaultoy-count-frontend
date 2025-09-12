import { fetchApi } from "./fetch";

export const createGroupMutation = async (data: {
  name: string;
  encryptedGroupEncryptionKey: string;
}) => {
  return fetchApi("POST", "/v1/group", data);
};

interface Group {
  id: number;
  name: string; // encrypted
  encryptedGroupEncryptionKey: string; // Base64 encoded and encrypted with user's encryption key
}

export interface GroupMember {
  userId: number;
  username: string;
}

export interface GroupTransaction {
  id: number;
  name: string;
  fromUserId: number;
  toUserIds: number[];
  amount: number;
  date: number;
}

export interface GroupExtended {
  id: number;
  name: string;
  members: GroupMember[];
  transactions: GroupTransaction[];
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
