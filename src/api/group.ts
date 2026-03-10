import type { Encrypted } from "@/types";
import { fetchApi, type ApiResponse } from "./fetch";

interface CreateGroupBody {
  name: string;
  encryptedGroupEncryptionKey: string;
  selfMemberNickname: string;
  memberNicknames: string[];
}

export const createGroupMutation = async (data: CreateGroupBody) => {
  return fetchApi("POST", "/v1/group", data);
};

export interface Group<isEncrypted extends boolean = true> {
  id: number;
  name: Encrypted<string, isEncrypted>; // encrypted with group encryption key
  groupEncryptionKey: Encrypted<CryptoKey, isEncrypted>; // encrypted with user's encryption key
}

type GroupMemberRights = "admin" | "member";

export interface GroupMember<isEncrypted extends boolean = true> {
  memberId: number;
  userId: number | null; // null if the member has not joined yet
  username: string | null; // null if the member has not joined yet
  nickname: Encrypted<string, isEncrypted>;
  rights: GroupMemberRights;
}

export const EXPENSE = "expense";
export const REPAYMENT = "repayment";
export const REVENUE = "revenue";
export const TRANSACTION_TYPES = [EXPENSE, REPAYMENT, REVENUE] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

interface GroupTransactionToMember<isEncrypted extends boolean = true> {
  memberId: Encrypted<number, isEncrypted>;
  share: Encrypted<number, isEncrypted>;
}

export interface GroupTransaction<isEncrypted extends boolean = true> {
  id: number;
  name: Encrypted<string, isEncrypted>;
  fromMemberId: Encrypted<number, isEncrypted>;
  toMembers: GroupTransactionToMember<isEncrypted>[];
  amount: Encrypted<number, isEncrypted>;
  transactionType: Encrypted<TransactionType, isEncrypted>;
  date: Encrypted<number, isEncrypted>;
}

export interface GroupExtended<
  isEncrypted extends boolean = true,
> extends Group<isEncrypted> {
  members: GroupMember<isEncrypted>[];
  transactions: GroupTransaction<isEncrypted>[];
}

export const getGroupsQuery = async (): Promise<
  ApiResponse<{ groups: Group[] }>
> => {
  const response = await fetchApi("GET", "/v1/group/all");
  const bodyJson = await response.json();
  return Object.assign(response, { bodyJson });
};

export const getGroupQuery = async (
  groupId: number,
): Promise<ApiResponse<{ group: GroupExtended }>> => {
  const response = await fetchApi("GET", `/v1/group/${groupId}`);
  const bodyJson = await response.json();
  return Object.assign(response, { bodyJson });
};

export type NewGroupTransaction<isEncrypted extends boolean> = Omit<
  GroupTransaction<isEncrypted>,
  "id"
>;

export const postAddTransactionMutation = async ({
  groupId,
  transactionData,
}: {
  groupId: number;
  transactionData: NewGroupTransaction<true>;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/transaction`, transactionData);
};

export const patchEditGroupMemberNicknameMutation = async ({
  groupId,
  memberId,
  newNickname,
}: {
  groupId: number;
  memberId: number;
  newNickname: string;
}) => {
  return fetchApi("PATCH", `/v1/group/${groupId}/member/${memberId}/nickname`, {
    newNickname,
  });
};

export const postKickGroupMemberMutation = async ({
  groupId,
  memberId,
}: {
  groupId: number;
  memberId: number;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/member/${memberId}/kick`);
};

export const deleteGroupMemberMutation = async ({
  groupId,
  memberId,
}: {
  groupId: number;
  memberId: number;
}) => {
  return fetchApi("DELETE", `/v1/group/${groupId}/member/${memberId}`);
};

export const postAddMemberMutation = async ({
  groupId,
  nickname,
}: {
  groupId: number;
  nickname: string;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/member`, {
    nickname,
  });
};

export const patchMemberRightsMutation = async ({
  groupId,
  memberId,
  newRights,
}: {
  groupId: number;
  memberId: number;
  newRights: GroupMemberRights;
}) => {
  return fetchApi("PATCH", `/v1/group/${groupId}/member/${memberId}/rights`, {
    newRights,
  });
};
