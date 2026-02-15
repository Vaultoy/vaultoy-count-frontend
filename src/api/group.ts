import type { Encrypted } from "@/types";
import { fetchApi, type ApiResponse } from "./fetch";

export const createGroupMutation = async (data: {
  name: string;
  encryptedGroupEncryptionKey: string;
}) => {
  return fetchApi("POST", "/v1/group", data);
};

export interface Group<isEncrypted extends boolean = true> {
  id: number;
  name: Encrypted<string, isEncrypted>; // encrypted with group encryption key
  encryptionKey: Encrypted<CryptoKey, isEncrypted>; // encrypted with user's encryption key
}

export interface GroupMember {
  userId: number;
  username: string;
  rights: "admin" | "member";
}

export const EXPENSE = "expense";
export const REPAYMENT = "repayment";
export const REVENUE = "revenue";
export const TRANSACTION_TYPES = [EXPENSE, REPAYMENT, REVENUE] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

interface GroupTransactionToUser<isEncrypted extends boolean = true> {
  id: Encrypted<number, isEncrypted>;
  share: Encrypted<number, isEncrypted>;
}

export interface GroupTransaction<isEncrypted extends boolean = true> {
  id: number;
  name: Encrypted<string, isEncrypted>;
  fromUserId: Encrypted<number, isEncrypted>;
  toUsers: GroupTransactionToUser<isEncrypted>[];
  amount: Encrypted<number, isEncrypted>;
  transactionType: Encrypted<TransactionType, isEncrypted>;
  date: Encrypted<number, isEncrypted>;
}

export interface GroupExtended<
  isEncrypted extends boolean = true,
> extends Group<isEncrypted> {
  members: GroupMember[];
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
  groupId: string,
): Promise<ApiResponse<{ group: GroupExtended }>> => {
  const response = await fetchApi("GET", `/v1/group/${groupId}`);
  const bodyJson = await response.json();
  return Object.assign(response, { bodyJson });
};

type NewGroupTransaction = Omit<GroupTransaction, "id">;

export const postAddTransactionMutation = async ({
  groupId,
  transactionData,
}: {
  groupId: string;
  transactionData: NewGroupTransaction;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/transaction`, transactionData);
};

export const createInvitationMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: string;
  invitationData: {
    invitationVerificationToken: string;
    invitationKey: string;
    invitationLinkSecret: string;
  };
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/invitation`, invitationData);
};

export const joinInvitationMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: string;
  invitationData: {
    invitationVerificationToken: string;
    encryptionKey?: string;
  };
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/join`, invitationData);
};

interface GroupInvitation {
  invitationLinkSecret: string;
}

export const getInvitationQuery = async (
  groupId: string,
): Promise<ApiResponse<GroupInvitation | null>> => {
  const response = await fetchApi("GET", `/v1/group/${groupId}/invitation`);
  const bodyJson = await response.json();
  return Object.assign(response, { bodyJson });
};

export const deleteInvitationMutation = async ({
  groupId,
}: {
  groupId: string;
}) => {
  return fetchApi("DELETE", `/v1/group/${groupId}/invitation`);
};
