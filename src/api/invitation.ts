import type { Encrypted } from "@/types";
import { fetchApi, type ApiResponse } from "./fetch";
import type { GroupMember } from "./group";

export interface GroupJoinInitiateBody {
  invitationVerificationToken: string;
}

export interface GroupForJoiningInitiate<isEncrypted extends boolean = true> {
  groupId: number;
  name: Encrypted<string, isEncrypted>;
  members: GroupMember<isEncrypted>[];
  invitationKey: string;
}

export const joinInvitationInitiateMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: string;
  invitationData: GroupJoinInitiateBody;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/join/initiate`, invitationData);
};

export interface GroupJoinConcludeBody {
  invitationVerificationToken: string;
  groupEncryptionKey: Encrypted<CryptoKey, true>;
  memberId: number;
}

export const joinInvitationConcludeMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: string;
  invitationData: GroupJoinConcludeBody;
}) => {
  return fetchApi("POST", `/v1/group/${groupId}/join/conclude`, invitationData);
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
