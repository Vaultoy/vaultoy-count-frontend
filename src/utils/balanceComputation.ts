import type { GroupExtended } from "@/api/group";
import type {
  GroupExtendedComputed,
  GroupMemberComputed,
} from "@/contexts/GroupContext";
import { computeEquilibriumRepayments } from "./equilibriumAlgorithm";

export const computeMembersBalanceAndRepayments = (
  decryptedGroup: GroupExtended<false> | undefined,
): GroupExtendedComputed | undefined => {
  if (!decryptedGroup) return undefined;

  const membersComputed = decryptedGroup.members
    .map((member) => ({
      ...member,
      balance: decryptedGroup.transactions.reduce((balance, transaction) => {
        let newBalance = balance;

        const totalShares = transaction.toMembers.reduce(
          (sum, toUser) => sum + toUser.share,
          0,
        );

        if (isNaN(totalShares) || !isFinite(totalShares) || totalShares <= 0) {
          // This shouldn't happen
          console.error(
            "Transaction with incorrect total shares found. Transaction ID:",
            transaction.id,
            "Total Shares:",
            totalShares,
          );
          return balance;
        }

        if (transaction.fromMemberId === member.memberId) {
          newBalance += transaction.amount;
        }

        const toUserShare =
          transaction.toMembers.find(
            (toMember) => toMember.memberId === member.memberId,
          )?.share ?? 0;

        if (toUserShare > 0) {
          newBalance -= transaction.amount * (toUserShare / totalShares);
        }

        return Math.round(newBalance);
      }, 0),
    }))
    .sort((a, b) => b.balance - a.balance);

  const equilibriumRepayments = computeEquilibriumRepayments(membersComputed);

  const membersComputedWithRepayments = membersComputed.map((member) => ({
    ...member,
    repaymentsToMake: equilibriumRepayments[member.memberId] || [],
  }));

  return {
    ...decryptedGroup,
    members: membersComputedWithRepayments,
  };
};

export const computeGroupMembersIndex = (
  group: GroupExtendedComputed | undefined,
): Record<number, GroupMemberComputed> | undefined => {
  if (!group) return undefined;

  const index: Record<number, GroupMemberComputed> = {};

  for (const member of group.members) {
    index[member.memberId] = member;
  }
  return index;
};
