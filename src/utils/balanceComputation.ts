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

        const totalShares = transaction.toUsers.reduce(
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

        if (transaction.fromUserId === member.userId) {
          newBalance += transaction.amount;
        }

        const toUserShare =
          transaction.toUsers.find((toUser) => toUser.id === member.userId)
            ?.share ?? 0;

        if (toUserShare > 0) {
          newBalance -= transaction.amount * (toUserShare / totalShares);
        }

        return newBalance;
      }, 0),
    }))
    .sort((a, b) => b.balance - a.balance);

  const equilibriumRepayments = computeEquilibriumRepayments(membersComputed);

  const membersComputedWithRepayments = membersComputed.map((member) => ({
    ...member,
    repaymentsToMake: equilibriumRepayments[member.userId] || [],
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
    index[member.userId] = member;
  }
  return index;
};
