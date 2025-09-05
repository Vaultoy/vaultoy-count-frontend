import { fetchApi } from "./fetch";

export const createGroupMutation = async ({ name }: { name: string }) => {
  return fetchApi("POST", "/v1/group", {
    name,
  });
};

interface Group {
  id: number;
  name: string;
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
}: {
  groupId: string;
  name: string;
  amount: number;
  fromUserId: number;
  toUserIds: number[];
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/transaction`, {
    name,
    amount,
    fromUserId,
    toUserIds,
  });
};
