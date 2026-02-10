import { type GroupExtended } from "@/api/group";
import { Text, Card, VStack, HStack } from "@chakra-ui/react";

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

        if (transaction.fromUserId === member.userId) {
          newBalance += transaction.amount;
        }
        if (transaction.toUserIds.includes(member.userId)) {
          newBalance -= transaction.amount / transaction.toUserIds.length;
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
                {(member.balance / 100) % 1 === 0
                  ? (member.balance / 100).toFixed(0)
                  : (member.balance / 100).toFixed(2)}{" "}
                €
              </Text>
            </HStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
};
