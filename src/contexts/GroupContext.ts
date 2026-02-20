import { type GroupExtended, type GroupMember } from "@/api/group";
import { decryptGroup } from "@/utils/encryption";
import React, { createContext, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import {
  computeGroupMembersIndex,
  computeMembersBalanceAndRepayments,
} from "@/utils/balanceComputation";

export interface RepaymentsToMake {
  toUserId: number;
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
 * A mapping of userId to GroupMemberComputed for quick access to member data.
 */
export type GroupMembersComputedIndex = Record<number, GroupMemberComputed>;

export interface GroupContextType {
  group: GroupExtendedComputed | undefined;
  setGroup: React.Dispatch<
    React.SetStateAction<GroupExtendedComputed | undefined>
  >;
  groupMembersIndex: Record<number, GroupMemberComputed> | undefined;
  setGroupMembersIndex: React.Dispatch<
    React.SetStateAction<Record<number, GroupMemberComputed> | undefined>
  >;
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GroupContext = createContext<GroupContextType>({
  group: undefined,
  setGroup: () => {},
  groupMembersIndex: undefined,
  setGroupMembersIndex: () => {},
  isError: false,
  setIsError: () => {},
});

export const useDecryptAndSaveGroupToContext = (
  encryptedGroup: GroupExtended<true> | undefined,
  isQueryError: boolean,
) => {
  const { setGroup, setGroupMembersIndex, setIsError } =
    useContext(GroupContext);
  const user = useContext(UserContext);

  useEffect(() => {
    const doDecryptAndCompute = async () => {
      if (!encryptedGroup) {
        setGroup(undefined);
        setGroupMembersIndex(undefined);
        setIsError(isQueryError);
        return;
      }
      if (!user || !user.user) return;

      const decryptedGroup = await decryptGroup(
        encryptedGroup,
        user.user.userEncryptionKey,
      );

      const decryptedComputedGroup =
        computeMembersBalanceAndRepayments(decryptedGroup);

      const groupMembersIndex = computeGroupMembersIndex(
        decryptedComputedGroup,
      );

      if (!active) return;
      setGroup(decryptedComputedGroup);
      setGroupMembersIndex(groupMembersIndex);
      setIsError(isQueryError);
    };

    let active = true;
    doDecryptAndCompute();
    return () => {
      active = false;
    };
  }, [
    user,
    encryptedGroup,
    setGroup,
    setGroupMembersIndex,
    isQueryError,
    setIsError,
  ]);
};
