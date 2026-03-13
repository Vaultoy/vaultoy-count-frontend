import type { Encrypted } from "@/types";
import { fetchJsonApi, type ApiResponse } from "./fetch";
import type { GroupMember } from "./group";
import type { EmptyObject } from "react-hook-form";

export interface GroupJoinInitiateBody {
  invitationAuthenticationToken: string;
}

export interface GroupForJoiningInitiate<isEncrypted extends boolean = true> {
  groupId: number;
  name: Encrypted<string, isEncrypted>;
  members: GroupMember<isEncrypted>[];
  invitationGroupEncryptionKey: string;
}

export const joinInvitationInitiateMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: number;
  invitationData: GroupJoinInitiateBody;
}): Promise<ApiResponse<GroupForJoiningInitiate>> => {
  return fetchJsonApi(
    "POST",
    `/v1/group/${groupId}/join/initiate`,
    invitationData,
  );
};

export interface GroupJoinConcludeBody {
  invitationAuthenticationToken: string;
  groupEncryptionKey: Encrypted<CryptoKey, true>;
  memberId: number;
}

export const joinInvitationConcludeMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: number;
  invitationData: GroupJoinConcludeBody;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi(
    "POST",
    `/v1/group/${groupId}/join/conclude`,
    invitationData,
  );
};

export const createInvitationMutation = async ({
  groupId,
  invitationData,
}: {
  groupId: number;
  invitationData: {
    invitationAuthenticationToken: string;
    invitationGroupEncryptionKey: string;
    invitationLinkSecret: string;
  };
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi(
    "POST",
    `/v1/group/${groupId}/invitation`,
    invitationData,
  );
};

interface GroupInvitation {
  invitationLinkSecret: string;
}

export const getInvitationQuery = async (
  groupId: number,
): Promise<ApiResponse<GroupInvitation | null>> => {
  return fetchJsonApi("GET", `/v1/group/${groupId}/invitation`);
};

export const deleteInvitationMutation = async ({
  groupId,
}: {
  groupId: number;
}): Promise<ApiResponse<EmptyObject>> => {
  return fetchJsonApi("DELETE", `/v1/group/${groupId}/invitation`);
};
