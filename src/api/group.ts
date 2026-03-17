import type { EmptyObject, Encrypted } from "@/types";
import { fetchJsonApi, type ApiResponse } from "./fetch";

export interface CreateGroupBody {
  name: Encrypted<string, true>;
  encryptedGroupEncryptionKey: Encrypted<CryptoKey, true>;
  currency: Encrypted<string, true>;
  selfMemberNickname: Encrypted<string, true>;
  memberNicknames: Encrypted<string, true>[];
}

export const createGroupMutation = async (
  data: CreateGroupBody,
): Promise<ApiResponse<{ id: number }>> => {
  return fetchJsonApi("POST", "/v1/group", data);
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
  currency: Encrypted<string, isEncrypted>;
  members: GroupMember<isEncrypted>[];
  transactions: GroupTransaction<isEncrypted>[];
}

export const getGroupsQuery = async (): Promise<
  ApiResponse<{ groups: Group[] }>
> => {
  return fetchJsonApi("GET", "/v1/group/all");
};

export const getGroupQuery = async (
  groupId: number,
): Promise<ApiResponse<{ group: GroupExtended }>> => {
  return fetchJsonApi("GET", `/v1/group/${groupId}`);
};

export type NewGroupTransaction<isEncrypted extends boolean> = Omit<
  GroupTransaction<isEncrypted>,
  "id"
>;

export const patchEditGroupName = async ({
  groupId,
  newGroupName,
}: {
  groupId: number;
  newGroupName: string;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi("PATCH", `/v1/group/${groupId}/name`, {
    newGroupName,
  });
};

export const postAddTransactionMutation = async ({
  groupId,
  transactionData,
}: {
  groupId: number;
  transactionData: NewGroupTransaction<true>;
}): Promise<ApiResponse<{ id: number }>> => {
  return fetchJsonApi(
    "POST",
    `/v1/group/${groupId}/transaction`,
    transactionData,
  );
};

export const patchEditTransactionMutation = async ({
  groupId,
  transactionId,
  transactionData,
}: {
  groupId: number;
  transactionId: number;
  transactionData: NewGroupTransaction<true>;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi(
    "PATCH",
    `/v1/group/${groupId}/transaction/${transactionId}`,
    transactionData,
  );
};

export const patchEditGroupMemberNicknameMutation = async ({
  groupId,
  memberId,
  newNickname,
}: {
  groupId: number;
  memberId: number;
  newNickname: string;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi(
    "PATCH",
    `/v1/group/${groupId}/member/${memberId}/nickname`,
    {
      newNickname,
    },
  );
};

export const postKickGroupMemberMutation = async ({
  groupId,
  memberId,
}: {
  groupId: number;
  memberId: number;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi("POST", `/v1/group/${groupId}/member/${memberId}/kick`);
};

export const deleteGroupMemberMutation = async ({
  groupId,
  memberId,
}: {
  groupId: number;
  memberId: number;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi("DELETE", `/v1/group/${groupId}/member/${memberId}`);
};

export const postAddMemberMutation = async ({
  groupId,
  nickname,
}: {
  groupId: number;
  nickname: string;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi("POST", `/v1/group/${groupId}/member`, {
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
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi(
    "PATCH",
    `/v1/group/${groupId}/member/${memberId}/rights`,
    {
      newRights,
    },
  );
};
