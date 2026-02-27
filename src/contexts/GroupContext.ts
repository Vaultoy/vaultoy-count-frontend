import { type GroupExtended, type GroupMember } from "@/api/group";
import { decryptGroup } from "@/encryption/encryption";
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
  isError: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GroupContext = createContext<GroupContextType>({
  group: undefined,
  setGroup: () => {},
  selfMember: undefined,
  setSelfMember: () => {},
  groupMembersIndex: undefined,
  setGroupMembersIndex: () => {},
  isError: false,
  setIsError: () => {},
});

export const useDecryptAndSaveGroupToContext = (
  encryptedGroup: GroupExtended<true> | undefined,
  isQueryError: boolean,
) => {
  const { setGroup, setGroupMembersIndex, setIsError, setSelfMember } =
    useContext(GroupContext);
  const user = useContext(UserContext);

  useEffect(() => {
    const doDecryptAndCompute = async () => {
      if (!encryptedGroup) {
        setGroup(undefined);
        setGroupMembersIndex(undefined);
        setSelfMember(undefined);
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

      const selfMember = decryptedComputedGroup?.members.find(
        (member) => member.userId === user.user?.id,
      );

      if (!active) return;
      setGroup(decryptedComputedGroup);
      setSelfMember(selfMember);
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
    setSelfMember,
  ]);
};
