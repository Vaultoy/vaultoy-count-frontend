import { type GroupExtended, type GroupMember } from "@/api/group";
import { decryptGroup } from "@/encryption/groupEncryption";
import React, { createContext, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import {
  computeGroupMembersIndex,
  computeMembersBalanceAndRepayments,
} from "@/utils/balanceComputation";
import type { QueryErrorResponse } from "@/api/errors";

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

export type GroupContextError =
  | QueryErrorResponse
  | { error: "DECRYPTION_ERROR" }
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
  groupError: GroupContextError;
  setGroupError: React.Dispatch<React.SetStateAction<GroupContextError>>;
}

export const GroupContext = createContext<GroupContextType>({
  group: undefined,
  setGroup: () => {},
  selfMember: undefined,
  setSelfMember: () => {},
  groupMembersIndex: undefined,
  setGroupMembersIndex: () => {},
  groupError: null,
  setGroupError: () => {},
});

type GroupBody = { group: GroupExtended<true> } | null | undefined;

export const useDecryptAndSaveGroupToContext = (
  groupBody: GroupBody,
  queryError: QueryErrorResponse | null,
) => {
  const { setGroup, setGroupMembersIndex, setGroupError, setSelfMember } =
    useContext(GroupContext);
  const user = useContext(UserContext);

  useEffect(() => {
    let active = false;
    const doDecryptAndCompute = async () => {
      if (!groupBody || queryError) {
        setGroup(undefined);
        setGroupMembersIndex(undefined);
        setSelfMember(undefined);
        setGroupError((prev) => {
          // If the error is the same as before,
          // keep the previous state to avoid unnecessary re-renders
          if (JSON.stringify(prev) === JSON.stringify(queryError)) {
            return prev;
          }
          return queryError;
        });
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
        setGroupError(null);
      } catch (error) {
        console.error("Failed to decrypt group:", error);
        if (!active) return;
        setGroup(undefined);
        setGroupMembersIndex(undefined);
        setSelfMember(undefined);
        setGroupError((prev) => {
          // If the error is the same as before,
          // keep the previous state to avoid unnecessary re-renders
          const newError = { error: "DECRYPTION_ERROR" as const };
          if (JSON.stringify(prev) === JSON.stringify(newError)) {
            return prev;
          }
          return newError;
        });
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
    queryError,
    setGroupError,
    setSelfMember,
  ]);
};
