import type { Encrypted } from "@/types";
import { fetchApi } from "./fetch";
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
