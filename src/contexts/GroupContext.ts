import { type GroupExtended, type GroupMember } from "@/api/group";
import { decryptGroup } from "@/encryption/groupEncryption";
import React, { createContext, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import {
  computeGroupMembersIndex,
  computeMembersBalanceAndRepayments,
} from "@/utils/balanceComputation";

export interface RepaymentsToMake {
  toMemberId: number;
  amount: number;
}

export interface GroupMemberComputed extends GroupMember {
  balance: number;
  repaymentsToMake: RepaymentsToMake[];
}

/**
 * Holds the group data with some additional properties computed after decryption.
 */
export interface GroupExtendedComputed extends GroupExtended<false> {
  members: GroupMemberComputed[];
}

/**
 * A mapping of member ID to GroupMemberComputed for quick access to member data.
 */
export type GroupMembersComputedIndex = Record<number, GroupMemberComputed>;

export type GroupContextIsError =
  | "DECRYPTION_ERROR"
  | "NOT_AUTHORIZED"
  | "OTHER_ERROR"
  | null;

export interface GroupContextType {
  group: GroupExtendedComputed | undefined;
  setGroup: React.Dispatch<
    React.SetStateAction<GroupExtendedComputed | undefined>
  >;
  selfMember: GroupMemberComputed | undefined;
  setSelfMember: React.Dispatch<
    React.SetStateAction<GroupMemberComputed | undefined>
  >;
  groupMembersIndex: Record<number, GroupMemberComputed> | undefined;
  setGroupMembersIndex: React.Dispatch<
    React.SetStateAction<Record<number, GroupMemberComputed> | undefined>
  >;
  isError: GroupContextIsError;
  setIsError: React.Dispatch<React.SetStateAction<GroupContextIsError>>;
}

export const GroupContext = createContext<GroupContextType>({
  group: undefined,
  setGroup: () => {},
  selfMember: undefined,
  setSelfMember: () => {},
  groupMembersIndex: undefined,
  setGroupMembersIndex: () => {},
  isError: null,
  setIsError: () => {},
});

type GroupBody =
  | { group: GroupExtended<true> }
  | { error: string }
  | null
  | undefined;

const errorCodeFromQuery = (
  isQueryError: boolean,
  groupBody: GroupBody,
): GroupContextIsError => {
  if (isQueryError) return "OTHER_ERROR";
  if (groupBody && "error" in groupBody) {
    if (groupBody.error === "NOT_AUTHORIZED") return "NOT_AUTHORIZED";
    return "OTHER_ERROR";
  }

  return null;
};

export const useDecryptAndSaveGroupToContext = (
  groupBody: GroupBody,
  isQueryError: boolean,
) => {
  const { setGroup, setGroupMembersIndex, setIsError, setSelfMember } =
    useContext(GroupContext);
  const user = useContext(UserContext);

  useEffect(() => {
    let active = false;
    const doDecryptAndCompute = async () => {
      if (!groupBody || "error" in groupBody || isQueryError) {
        setGroup(undefined);
        setGroupMembersIndex(undefined);
        setSelfMember(undefined);
        setIsError(errorCodeFromQuery(isQueryError, groupBody));
        return;
      }
      if (!user || !user.user) return;

      try {
        const decryptedGroup = await decryptGroup(
          groupBody.group,
          user.user.userEncryptionKey,
        );

        const decryptedComputedGroup =
          computeMembersBalanceAndRepayments(decryptedGroup);

        const groupMembersIndex = computeGroupMembersIndex(
          decryptedComputedGroup,
        );

        const selfMember = decryptedComputedGroup?.members.find(
          (member) => member.userId === user.user?.id,
        );

        if (!active) return;
        setGroup(decryptedComputedGroup);
        setSelfMember(selfMember);
        setGroupMembersIndex(groupMembersIndex);
        setIsError(errorCodeFromQuery(isQueryError, groupBody));
      } catch (error) {
        console.error("Failed to decrypt group:", error);
        if (!active) return;
        setGroup(undefined);
        setGroupMembersIndex(undefined);
        setSelfMember(undefined);
        setIsError("DECRYPTION_ERROR");
      }
    };

    active = true;
    doDecryptAndCompute();
    return () => {
      active = false;
    };
  }, [
    user,
    groupBody,
    setGroup,
    setGroupMembersIndex,
    isQueryError,
    setIsError,
    setSelfMember,
  ]);
};
