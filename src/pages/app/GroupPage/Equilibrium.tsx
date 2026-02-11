import { type GroupExtended } from "@/api/group";
import { Text, Card, VStack, HStack } from "@chakra-ui/react";
import {
  CURRENCY_SYMBOL,
  floatCentsToString,
} from "../../../utils/textGeneration";

export const Equilibrium = ({
  groupData,
}: {
  groupData: GroupExtended<false> | undefined;
}) => {
  const memberComputed = groupData?.members
    .map((member) => ({
      ...member,
      balance: groupData.transactions.reduce((balance, transaction) => {
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

  return (
    <VStack>
      {memberComputed?.map((member) => (
        <Card.Root key={member.userId} width="100%">
          <Card.Body>
            <HStack justifyContent="space-between">
              <Text>{member.username}</Text>
              <Text
                color={
                  member.balance > 0
                    ? "green.600"
                    : member.balance == 0
                      ? "gray.400"
                      : "red.600"
                }
                fontWeight="bold"
              >
                {floatCentsToString(member.balance)} {CURRENCY_SYMBOL}
              </Text>
            </HStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
};
